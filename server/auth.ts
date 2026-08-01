import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ JWT_SECRET is required in production. Exiting.");
      process.exit(1);
    }
    console.warn("⚠️  JWT_SECRET not set — using insecure dev fallback. Set it before going to production.");
    return "ofoq-dev-only-jwt-secret-CHANGE-BEFORE-PROD";
  }
  return secret;
})();
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

// ── Password Hashing ─────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT ──────────────────────────────────────────────────────────
export function signToken(payload: { userId: string; role: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES } as any);
}

export function verifyToken(token: string): { userId: string; role: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ── Token from Request ───────────────────────────────────────────
export function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  if (req.query?.token) return String(req.query.token);
  if ((req as any).session?.token) return (req as any).session.token;
  return null;
}

// ── Middleware: requireAuth ──────────────────────────────────────
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "يجب تسجيل الدخول أولاً" });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "جلسة غير صالحة أو منتهية" });
    return;
  }

  try {
    const { UserModel } = await import("./models/index.js");
    const user = await UserModel.findById(decoded.userId).select("-password").lean();
    if (!user) {
      res.status(401).json({ error: "المستخدم غير موجود" });
      return;
    }
    if (user.status !== "active") {
      res.status(403).json({ error: "الحساب غير مفعّل أو موقوف" });
      return;
    }
    (req as any).user = user;
    next();
  } catch {
    res.status(500).json({ error: "خطأ في التحقق من الهوية" });
  }
}

// ── Middleware: requireRole ──────────────────────────────────────
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "يجب تسجيل الدخول" });
      return;
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({ error: "ليس لديك صلاحية للوصول" });
      return;
    }
    next();
  };
}

// ── Optional Auth (doesn't fail if no token) ─────────────────────
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      try {
        const { UserModel } = await import("./models/index.js");
        const user = await UserModel.findById(decoded.userId).select("-password").lean();
        if (user) (req as any).user = user;
      } catch {}
    }
  }
  next();
}

// ── OTP Generation ───────────────────────────────────────────────
export function generateOtp(length = 6): string {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
}

// ── Secure Token Generation ──────────────────────────────────────
export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// ── Audit Logging ────────────────────────────────────────────────
export async function logAction(
  userId: string | undefined,
  action: string,
  entity?: string,
  entityId?: string,
  req?: Request,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const { AuditLogModel } = await import("./models/index.js");
    await AuditLogModel.create({
      userId,
      action,
      entity,
      entityId,
      ip: req?.ip || req?.headers["x-forwarded-for"],
      userAgent: req?.headers["user-agent"],
      metadata,
      severity: ["login", "logout", "register"].includes(action) ? "info" : "info",
    });
  } catch {}
}
