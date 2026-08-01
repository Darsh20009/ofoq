import { Router } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoUint8Array, isoBase64URL } from "@simplewebauthn/server/helpers";
import { requireAuth, signToken, logAction } from "../auth.js";
import { UserModel, WebAuthnCredentialModel, WebAuthnChallengeModel } from "../models/index.js";

export const webauthnRouter = Router();

const RP_NAME = "أفق لحلول الأعمال";
// WebAuthn ties credentials to the exact domain that served the page
// (the Relying Party ID). This app runs on different domains depending on
// environment — the Replit dev preview subdomain, a custom production
// domain, or a Render domain — so the RP ID/origin must be derived from the
// actual incoming request rather than a single static APP_URL, or passkeys
// registered in one environment would be rejected in another.
function getRpID(req: any): string {
  return req.hostname || "localhost";
}
function getOrigin(req: any): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  return `${proto}://${req.get("host")}`;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

// ── Registration (must be logged in — add a passkey to your own account) ──
webauthnRouter.post("/register-options", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const existing = await WebAuthnCredentialModel.find({ userId: user._id });

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: getRpID(req),
      userID: isoUint8Array.fromUTF8String(String(user._id)),
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: "none",
      excludeCredentials: existing.map((c) => ({
        id: c.credentialId,
        transports: c.transports as any,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await WebAuthnChallengeModel.deleteMany({ userId: user._id, type: "register" });
    await WebAuthnChallengeModel.create({
      userId: user._id,
      challenge: options.challenge,
      type: "register",
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    });

    res.json(options);
  } catch (err: any) {
    console.error("[WebAuthn] register-options error:", err.message);
    res.status(500).json({ error: "خطأ في إعداد تسجيل مفتاح المرور" });
  }
});

webauthnRouter.post("/register-verify", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    const { response, deviceName } = req.body;

    const pending = await WebAuthnChallengeModel.findOne({ userId: user._id, type: "register" }).sort({ createdAt: -1 });
    if (!pending) {
      res.status(400).json({ error: "انتهت صلاحية عملية التسجيل، حاول مرة أخرى" });
      return;
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpID(req),
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: "فشل التحقق من مفتاح المرور" });
      return;
    }

    const { credential } = verification.registrationInfo;
    await WebAuthnCredentialModel.create({
      userId: user._id,
      credentialId: credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      transports: credential.transports,
      deviceName: deviceName || "جهاز غير معروف",
      lastUsed: new Date(),
    });

    await WebAuthnChallengeModel.deleteOne({ _id: pending._id });
    await logAction(String(user._id), "webauthn_register", "User", String(user._id), req);

    res.json({ message: "تم تسجيل مفتاح المرور بنجاح" });
  } catch (err: any) {
    console.error("[WebAuthn] register-verify error:", err.message);
    res.status(500).json({ error: "خطأ في التحقق من مفتاح المرور" });
  }
});

// ── List / remove passkeys ──────────────────────────────────────
webauthnRouter.get("/credentials", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const creds = await WebAuthnCredentialModel.find({ userId: user._id })
    .select("deviceName createdAt lastUsed")
    .sort({ createdAt: -1 });
  res.json({ credentials: creds });
});

webauthnRouter.delete("/credentials/:id", requireAuth, async (req, res) => {
  const user = (req as any).user;
  await WebAuthnCredentialModel.deleteOne({ _id: req.params.id, userId: user._id });
  res.json({ message: "تم حذف مفتاح المرور" });
});

// ── Authentication (public — login with a passkey) ───────────────
webauthnRouter.post("/login-options", async (req, res) => {
  try {
    const { email } = req.body;
    let allowCredentials: { id: string; transports?: any }[] | undefined;
    let userId: any;

    if (email) {
      const user = await UserModel.findOne({ email: String(email).toLowerCase() });
      if (user) {
        userId = user._id;
        const creds = await WebAuthnCredentialModel.find({ userId: user._id });
        allowCredentials = creds.map((c) => ({ id: c.credentialId, transports: c.transports }));
        if (allowCredentials.length === 0) {
          res.status(404).json({ error: "لا يوجد مفتاح مرور مسجّل لهذا الحساب" });
          return;
        }
      } else {
        res.status(404).json({ error: "لا يوجد حساب بهذا البريد الإلكتروني" });
        return;
      }
    }

    const options = await generateAuthenticationOptions({
      rpID: getRpID(req),
      userVerification: "preferred",
      allowCredentials,
    });

    await WebAuthnChallengeModel.create({
      userId,
      challenge: options.challenge,
      type: "authenticate",
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    });

    res.json(options);
  } catch (err: any) {
    console.error("[WebAuthn] login-options error:", err.message);
    res.status(500).json({ error: "خطأ في إعداد الدخول بمفتاح المرور" });
  }
});

webauthnRouter.post("/login-verify", async (req, res) => {
  try {
    const { response } = req.body;
    const credentialId: string = response?.id;
    if (!credentialId) {
      res.status(400).json({ error: "استجابة غير صالحة" });
      return;
    }

    const stored = await WebAuthnCredentialModel.findOne({ credentialId });
    if (!stored) {
      res.status(400).json({ error: "مفتاح المرور غير مسجّل" });
      return;
    }

    const pending = await WebAuthnChallengeModel.findOne({ type: "authenticate" }).sort({ createdAt: -1 });
    if (!pending) {
      res.status(400).json({ error: "انتهت صلاحية العملية، حاول مرة أخرى" });
      return;
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: getOrigin(req),
      expectedRPID: getRpID(req),
      credential: {
        id: stored.credentialId,
        publicKey: new Uint8Array(stored.credentialPublicKey),
        counter: stored.counter,
        transports: stored.transports as any,
      },
    });

    if (!verification.verified) {
      res.status(401).json({ error: "فشل التحقق من مفتاح المرور" });
      return;
    }

    await WebAuthnCredentialModel.updateOne(
      { _id: stored._id },
      { counter: verification.authenticationInfo.newCounter, lastUsed: new Date() }
    );
    await WebAuthnChallengeModel.deleteOne({ _id: pending._id });

    const user = await UserModel.findById(stored.userId);
    if (!user || user.status !== "active") {
      res.status(403).json({ error: "الحساب غير مفعّل" });
      return;
    }

    await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date(), lastActivity: new Date() });
    const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
    await logAction(String(user._id), "login_webauthn", "User", String(user._id), req);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lang: user.lang,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    console.error("[WebAuthn] login-verify error:", err.message);
    res.status(500).json({ error: "خطأ في التحقق من الدخول" });
  }
});

// isoBase64URL currently unused directly but kept for future extension needs
void isoBase64URL;
