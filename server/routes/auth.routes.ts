import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import {
  hashPassword, verifyPassword, signToken,
  requireAuth, generateOtp, generateSecureToken, logAction
} from "../auth.js";
import { loginLimiter, otpLimiter, registerLimiter, adminLoginLimiter, twoFALimiter, barcodeLoginLimiter } from "../middleware/rateLimiter.js";
import { validate, registerSchema, loginSchema, resetPasswordSchema } from "../middleware/validate.js";
import { fireNotify, fireNotifyAdmins } from "../notify.js";
import { getSiteUrl, isEmailConfigured, sendOtpEmail, sendPasswordResetEmail, sendEmailVerification, sendWelcomeEmail } from "../email.js";
import { isDBConnected } from "../db.js";
import {
  UserModel, Pending2FAModel, WebAuthnCredentialModel,
  AuditLogModel
} from "../models/index.js";

export const authRouter = Router();

function normalizeOtpCode(value: unknown): string {
  return String(value ?? "")
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 8);
}

// ── Register ─────────────────────────────────────────────────────
authRouter.post("/register", registerLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { fullName, password, phone, lang } = req.body;
    const email = String(req.body.email).trim().toLowerCase();

    const existing = await UserModel.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }

    const hashedPass = await hashPassword(password);
    const verifyToken = generateSecureToken();
    const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await UserModel.create({
      fullName,
      email,
      password: hashedPass,
      phone,
      lang: lang || "ar",
      role: "client",
      status: "active", // auto-activate; can require email verification
      emailVerified: false,
      emailVerificationToken: verifyToken,
      emailVerificationExpiry: verifyExpiry,
    });

    const verifyLink = `${getSiteUrl()}/verify-email?token=${encodeURIComponent(verifyToken)}`;
    await sendEmailVerification(email, fullName, verifyLink);
    await sendWelcomeEmail(email, fullName);
    await fireNotifyAdmins(
      "عميل جديد مسجّل",
      `${fullName} سجّل حساباً جديداً`,
      { type: "info", link: "/admin/users" }
    );

    const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
    await logAction(String(user._id), "register", "User", String(user._id), req);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        lang: user.lang,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    console.error("[Auth] Register error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء الحساب" });
  }
});

// ── Login ─────────────────────────────────────────────────────────
authRouter.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  if (!isDBConnected()) {
    res.status(503).json({ error: "قاعدة البيانات غير متاحة حالياً. حاول مرة أخرى بعد قليل." });
    return;
  }

  try {
    const { password } = req.body;
    const email = String(req.body.email).trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select("+password +totpSecret +recoveryPassphrase");
    if (!user || !user.password) {
      res.status(401).json({ error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
      return;
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "بريد إلكتروني أو كلمة مرور غير صحيحة" });
      return;
    }

    if (user.status !== "active") {
      res.status(403).json({ error: "الحساب غير مفعّل، تواصل مع الدعم" });
      return;
    }

    // If 2FA enabled — return temp token
    const twoFactorMethods = user.twoFactorMethods?.length
      ? user.twoFactorMethods
      : user.totpVerified && user.totpSecret
        ? ["totp" as const]
        : [];
    if (user.twoFactorEnabled && twoFactorMethods.length > 0) {
      const tempToken = generateSecureToken();
      await Pending2FAModel.create({
        tempToken,
        userId: String(user._id),
        methods: twoFactorMethods,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        pushApproved: false,
      });

      res.json({
        requires2FA: true,
        tempToken,
        methods: twoFactorMethods,
        userId: user._id,
      });
      return;
    }

    // Normal login
    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date(), lastActivity: new Date() });
    const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
    await logAction(String(user._id), "login", "User", String(user._id), req);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        lang: user.lang,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        permissions: user.permissions,
        position: (user as any).position,
        department: (user as any).department,
      },
    });
  } catch (err: any) {
    console.error("[Auth] Login error:", err.message);
    if (!isDBConnected() || /buffering timed out|topology|connect/i.test(err.message || "")) {
      res.status(503).json({ error: "تعذر الاتصال بقاعدة البيانات. حاول مرة أخرى بعد قليل." });
      return;
    }
    res.status(500).json({ error: "خطأ في تسجيل الدخول" });
  }
});

// ── Verify 2FA ───────────────────────────────────────────────────
authRouter.post("/verify-2fa", twoFALimiter, async (req, res) => {
  try {
    const { tempToken, method, code } = req.body;
    const pending = await Pending2FAModel.findOne({ tempToken }).select("+emailCode");
    if (!pending || pending.expiresAt < new Date()) {
      res.status(400).json({ error: "رمز التحقق منتهي أو غير صالح" });
      return;
    }

    const user = await UserModel.findById(pending.userId).select("+totpSecret");
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    let verified = false;
    const normalizedCode = normalizeOtpCode(code);

    if (method === "totp" && user.totpSecret) {
      verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: normalizedCode,
        window: 3,
      });
    } else if (method === "email") {
      const stored = (pending as any).emailCode;
      verified = stored && normalizedCode === normalizeOtpCode(stored);
    } else if (method === "push") {
      verified = pending.pushApproved;
    }

    if (!verified) {
      res.status(401).json({ error: "رمز التحقق غير صحيح" });
      return;
    }

    await Pending2FAModel.deleteOne({ tempToken });
    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
    await logAction(String(user._id), "login_2fa", "User", String(user._id), req, { method });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        lang: user.lang,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        permissions: user.permissions,
        position: (user as any).position,
        department: (user as any).department,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في التحقق الثنائي" });
  }
});

// ── Send Email OTP (for 2FA) ──────────────────────────────────────
authRouter.post("/send-email-otp", otpLimiter, async (req, res) => {
  try {
    const { tempToken } = req.body;
    const pending = await Pending2FAModel.findOne({ tempToken });
    if (!pending) {
      res.status(400).json({ error: "جلسة غير صالحة" });
      return;
    }

    const user = await UserModel.findById(pending.userId);
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }

    const otp = generateOtp(6);
    await Pending2FAModel.updateOne({ tempToken }, { emailCode: otp });
    await sendOtpEmail(user.email, user.fullName, otp);

    res.json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الرمز" });
  }
});

// ── Verify Email ─────────────────────────────────────────────────
authRouter.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    const user = await UserModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "رابط التحقق غير صالح أو منتهي" });
      return;
    }
    await UserModel.findByIdAndUpdate(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpiry: undefined,
    });
    res.json({ message: "تم تأكيد البريد الإلكتروني بنجاح" });
  } catch {
    res.status(500).json({ error: "خطأ في تأكيد البريد" });
  }
});

// ── Forgot Password ──────────────────────────────────────────────
authRouter.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email ?? "").trim().toLowerCase();
    if (!isEmailConfigured()) {
      res.status(503).json({ error: "خدمة البريد غير مهيأة حاليًا. يرجى المحاولة لاحقًا أو التواصل مع الدعم." });
      return;
    }

    const user = await UserModel.findOne({ email });
    // Always return 200 for security
    if (!user) {
      res.json({ message: "إذا كان البريد مسجّلاً، ستصلك رسالة إعادة التعيين" });
      return;
    }
    const resetToken = generateSecureToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await UserModel.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    });
    const resetPath = user.role === "client" ? "/client/reset-password" : "/admin/reset-password";
    const resetLink = `${getSiteUrl()}${resetPath}?token=${encodeURIComponent(resetToken)}`;
    const sent = await sendPasswordResetEmail(email, user.fullName, resetLink);
    if (!sent) {
      await UserModel.findByIdAndUpdate(user._id, {
        $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
      });
      res.status(503).json({ error: "تعذر إرسال رسالة إعادة التعيين. يرجى المحاولة لاحقًا." });
      return;
    }
    res.json({ message: "إذا كان البريد مسجّلاً، ستصلك رسالة إعادة التعيين" });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال رابط إعادة التعيين" });
  }
});

// ── Reset Password ────────────────────────────────────────────────
authRouter.post("/reset-password", validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "رابط إعادة التعيين غير صالح أو منتهي" });
      return;
    }
    const hashed = await hashPassword(newPassword);
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashed,
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
    });
    await logAction(String(user._id), "password_reset", "User", String(user._id), req);
    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch {
    res.status(500).json({ error: "خطأ في إعادة تعيين كلمة المرور" });
  }
});

// ── Get Current User ─────────────────────────────────────────────
authRouter.get("/me", requireAuth, async (req, res) => {
  const u = (req as any).user;
  // Normalize fullName → name for consistent client-side User type
  res.json({
    user: {
      id: u._id,
      name: u.fullName || u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      department: u.department,
      position: u.position,
      employeeId: u.employeeId,
    },
  });
});

// ── Logout ────────────────────────────────────────────────────────
authRouter.post("/logout", requireAuth, async (req, res) => {
  await logAction(String((req as any).user._id), "logout", "User", String((req as any).user._id), req);
  (req as any).session?.destroy?.();
  res.json({ message: "تم تسجيل الخروج بنجاح" });
});

// ── Revoke all sessions (logout from every device) ───────────────
authRouter.post("/revoke-all-sessions", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    await UserModel.findByIdAndUpdate(userId, { sessionRevokedAt: new Date() });
    await logAction(String(userId), "revoke_all_sessions", "User", String(userId), req);
    res.json({ message: "تم إلغاء جميع الجلسات بنجاح" });
  } catch {
    res.status(500).json({ error: "فشل إلغاء الجلسات" });
  }
});

// ── TOTP Setup ────────────────────────────────────────────────────
authRouter.post("/totp/setup", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const existing = await UserModel.findById(user._id).select("+totpSecret");
    if (existing?.totpVerified && existing.totpSecret) {
      res.status(400).json({ error: "المصادقة الثنائية مفعّلة بالفعل" });
      return;
    }
    const secret = speakeasy.generateSecret({
      name: `OFOQ (${user.email})`,
      length: 32,
    });
    await UserModel.findByIdAndUpdate(user._id, {
      totpSecret: secret.base32,
      totpVerified: false,
    });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    res.json({ secret: secret.base32, qrCode });
  } catch {
    res.status(500).json({ error: "خطأ في إعداد المصادقة الثنائية" });
  }
});

authRouter.post("/totp/verify-setup", requireAuth, async (req, res) => {
  try {
    const code = normalizeOtpCode(req.body?.code);
    const user = await UserModel.findById((req as any).user._id).select("+totpSecret");
    if (!user?.totpSecret) {
      res.status(400).json({ error: "لم يتم إعداد TOTP بعد" });
      return;
    }
    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    if (!valid) {
      res.status(400).json({ error: "الرمز غير صحيح" });
      return;
    }
    await UserModel.findByIdAndUpdate(user._id, {
      totpVerified: true,
      twoFactorEnabled: true,
      $addToSet: { twoFactorMethods: "totp" },
    });
    res.json({ message: "تم تفعيل المصادقة الثنائية بنجاح", twoFactorEnabled: true });
  } catch {
    res.status(500).json({ error: "خطأ في التحقق" });
  }
});

// ── Disable TOTP ──────────────────────────────────────────────────
authRouter.post("/totp/disable", requireAuth, async (req, res) => {
  try {
    const code = normalizeOtpCode(req.body?.code);
    const user = await UserModel.findById((req as any).user._id).select("+totpSecret");
    if (!user?.totpVerified || !user.totpSecret) {
      res.status(400).json({ error: "المصادقة الثنائية غير مفعّلة" });
      return;
    }
    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    if (!valid) {
      res.status(400).json({ error: "الرمز غير صحيح" });
      return;
    }
    const remainingMethods = (user.twoFactorMethods || []).filter((method: string) => method !== "totp");
    await UserModel.findByIdAndUpdate(user._id, {
      totpVerified: false,
      twoFactorEnabled: remainingMethods.length > 0,
      totpSecret: null,
      twoFactorMethods: remainingMethods,
    });
    res.json({
      message: "تم تعطيل المصادقة الثنائية",
      twoFactorEnabled: remainingMethods.length > 0,
    });
  } catch {
    res.status(500).json({ error: "خطأ في تعطيل المصادقة الثنائية" });
  }
});

// ── Barcode / QR Code Login ───────────────────────────────────────
authRouter.post("/barcode-login", barcodeLoginLimiter, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) { res.status(400).json({ error: "يرجى إدخال كود الموظف" }); return; }

    const user = await UserModel.findOne({
      employeeCode: String(code).trim().toUpperCase(),
      status: "active",
    });

    if (!user) {
      res.status(401).json({ error: "كود الموظف غير صحيح أو الحساب غير مفعّل" });
      return;
    }

    await UserModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
      lastActivity: new Date(),
    });

    const token = signToken({
      userId: String(user._id),
      role: user.role,
      email: user.email,
    });

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        _id: user._id,
        name: user.fullName,
        fullNameAr: user.fullNameAr,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        position: user.position,
        twoFactorEnabled: user.twoFactorEnabled,
        employeeCode: user.employeeCode,
      },
    });
  } catch (err: any) {
    console.error("[Auth] barcode-login error:", err.message);
    res.status(500).json({ error: "خطأ في تسجيل الدخول" });
  }
});
