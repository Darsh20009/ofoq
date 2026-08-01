import { Router } from "express";
import crypto from "crypto";
import QRCode from "qrcode";
import { requireAuth } from "../auth.js";
import { UserModel } from "../models/index.js";
import { generateWalletPass } from "../services/walletpass.service.js";

export const employeeRouter = Router();

function generateEmployeeCode(): string {
  const hex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `OFOQ-${hex}`;
}

// ── GET /api/employee/me/card ─────────────────────────────────────
// Returns full user data + QR code data URL for the employee card
employeeRouter.get("/me/card", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    let user = await UserModel.findById(userId).lean() as any;
    if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }

    // Auto-generate employee code on first access
    if (!user.employeeCode) {
      const code = generateEmployeeCode();
      await UserModel.findByIdAndUpdate(userId, { employeeCode: code });
      user.employeeCode = code;
    }

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(user.employeeCode, {
      width: 320,
      margin: 2,
      color: { dark: "#2B273F", light: "#FFFFFF" },
      errorCorrectionLevel: "H",
    });

    res.json({ card: { ...user, qrCode } });
  } catch (err: any) {
    console.error("[Employee] card error:", err.message);
    res.status(500).json({ error: "خطأ في جلب بيانات البطاقة" });
  }
});

// ── POST /api/employee/me/regenerate-code ────────────────────────
// Regenerate a fresh employee code (old QR becomes invalid)
employeeRouter.post("/me/regenerate-code", requireAuth, async (req, res) => {
  try {
    const code = generateEmployeeCode();
    await UserModel.findByIdAndUpdate((req as any).user._id, { employeeCode: code });
    const qrCode = await QRCode.toDataURL(code, {
      width: 320,
      margin: 2,
      color: { dark: "#2B273F", light: "#FFFFFF" },
    });
    res.json({ employeeCode: code, qrCode });
  } catch {
    res.status(500).json({ error: "خطأ في إعادة توليد الكود" });
  }
});

// ── GET /api/employee/me/wallet-pass ─────────────────────────────
// Generates and streams a signed Apple Wallet .pkpass file
employeeRouter.get("/me/wallet-pass", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    let user = await UserModel.findById(userId).lean() as any;
    if (!user) { res.status(404).json({ error: "المستخدم غير موجود" }); return; }

    // Auto-generate employee code if missing
    if (!user.employeeCode) {
      const code = generateEmployeeCode();
      await UserModel.findByIdAndUpdate(userId, { employeeCode: code });
      user.employeeCode = code;
    }

    const passBuffer = await generateWalletPass({
      fullName:     user.fullName,
      fullNameAr:   user.fullNameAr,
      position:     user.position,
      department:   user.department,
      employeeCode: user.employeeCode,
      email:        user.email,
    });

    res.set({
      "Content-Type":        "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="ofoq-${user.employeeCode}.pkpass"`,
      "Content-Length":      String(passBuffer.length),
    });
    res.send(passBuffer);
  } catch (err: any) {
    console.error("[Employee] wallet-pass error:", err.message);
    res.status(500).json({ error: "خطأ في توليد البطاقة", detail: err.message });
  }
});
