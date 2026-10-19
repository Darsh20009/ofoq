import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import mongoose from "mongoose";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuditLogModel, SystemSettingsModel, UserModel } from "../models/index.js";
import { invalidatePlatformMaintenanceCache } from "../middleware/platformMaintenance.js";
import { closeAllSocketsForMaintenance } from "../ws.js";

export const qiroxOwnerRouter = Router();

const staffRoles = ["super_admin", "admin", "manager", "employee"] as const;
const defaultMaintenance = {
  enabled: false,
  messageAr: "الموقع موقوف مؤقتاً لانتهاء الاشتراك أو لعدم سداد الرسوم. يرجى التواصل مع الإدارة.",
  messageEn: "The website is temporarily unavailable because the subscription has ended or fees are overdue. Please contact the administrator.",
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات كثيرة. حاول بعد 15 دقيقة." },
  skip: () => process.env.NODE_ENV !== "production",
});

function csrfToken(req: any): string {
  if (!req.session.qiroxCsrf) req.session.qiroxCsrf = randomBytes(32).toString("hex");
  return req.session.qiroxCsrf;
}

function requireCsrf(req: any, res: any, next: any): void {
  const expected = req.session?.qiroxCsrf;
  const provided = req.get("x-qirox-csrf");
  if (!expected || typeof provided !== "string") {
    res.status(403).json({ error: "انتهت صلاحية الطلب. حدّث الصفحة وحاول مجدداً." });
    return;
  }
  const left = createHash("sha256").update(expected).digest();
  const right = createHash("sha256").update(provided).digest();
  if (!timingSafeEqual(left, right)) {
    res.status(403).json({ error: "تعذر التحقق من الطلب." });
    return;
  }
  next();
}

function requireOwner(req: any, res: any, next: any): void {
  if (req.session?.qiroxOwnerAuthenticated === true) {
    next();
    return;
  }
  res.status(401).json({ error: "يلزم تسجيل دخول مالك المنصة." });
}

function audit(req: any, action: string, entity?: string, entityId?: string, metadata?: Record<string, unknown>) {
  return AuditLogModel.create({
    action: `qirox_owner_${action}`,
    entity,
    entityId,
    description: `إجراء من لوحة مالك المنصة: ${action}`,
    ip: req.ip || req.headers["x-forwarded-for"],
    userAgent: req.headers["user-agent"],
    metadata,
    severity: action === "maintenance_enabled" || action === "user_suspended" ? "critical" : "warning",
  }).catch((error) => console.error("[qirox-owner] audit log failed:", error?.message || error));
}

qiroxOwnerRouter.get("/public-status", async (_req, res) => {
  try {
    const row = await SystemSettingsModel.findOne({ key: "platformMaintenance" }).lean();
    const value = row?.value || defaultMaintenance;
    res.setHeader("Cache-Control", "no-store");
    res.json({
      enabled: value.enabled === true,
      messageAr: typeof value.messageAr === "string" ? value.messageAr : defaultMaintenance.messageAr,
      messageEn: typeof value.messageEn === "string" ? value.messageEn : defaultMaintenance.messageEn,
      updatedAt: row?.updatedAt || null,
    });
  } catch {
    res.status(503).json({ error: "تعذر قراءة حالة الموقع." });
  }
});

qiroxOwnerRouter.get("/session", (req: any, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ authenticated: req.session?.qiroxOwnerAuthenticated === true, csrfToken: csrfToken(req) });
});

qiroxOwnerRouter.post("/login", loginLimiter, requireCsrf, async (req: any, res) => {
  const configuredPassword = process.env.QIROXSTUDIO_OWNER_PASSWORD;
  if (!configuredPassword || configuredPassword.length < 20) {
    res.status(503).json({ error: "لم يتم إعداد كلمة مرور مالك المنصة الآمنة في أسرار المشروع." });
    return;
  }
  const supplied = typeof req.body?.password === "string" ? req.body.password : "";
  const expectedDigest = createHash("sha256").update(configuredPassword).digest();
  const suppliedDigest = createHash("sha256").update(supplied).digest();
  if (!supplied || !timingSafeEqual(expectedDigest, suppliedDigest)) {
    await audit(req, "login_failed");
    res.status(401).json({ error: "بيانات الدخول غير صحيحة." });
    return;
  }

  req.session.regenerate(async (error: Error | null) => {
    if (error) {
      res.status(500).json({ error: "تعذر إنشاء جلسة آمنة." });
      return;
    }
    req.session.qiroxOwnerAuthenticated = true;
    req.session.qiroxCsrf = randomBytes(32).toString("hex");
    req.session.cookie.maxAge = 4 * 60 * 60 * 1000;
    await audit(req, "login");
    res.json({ authenticated: true, csrfToken: req.session.qiroxCsrf });
  });
});

qiroxOwnerRouter.post("/logout", requireCsrf, requireOwner, async (req: any, res) => {
  await audit(req, "logout");
  req.session.destroy((error: Error | null) => {
    if (error) {
      res.status(500).json({ error: "تعذر إنهاء الجلسة." });
      return;
    }
    res.clearCookie("qirox_owner.sid", {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ authenticated: false });
  });
});

qiroxOwnerRouter.get("/overview", requireOwner, async (_req, res) => {
  try {
    const [counts, recentActivity, settings] = await Promise.all([
      UserModel.aggregate([
        { $match: { role: { $in: [...staffRoles] } } },
        { $group: { _id: { role: "$role", status: "$status" }, count: { $sum: 1 } } },
      ]),
      AuditLogModel.find().sort({ createdAt: -1 }).limit(8).select("action entity description severity createdAt").lean(),
      SystemSettingsModel.findOne({ key: "platformMaintenance" }).lean(),
    ]);
    const roles = Object.fromEntries(staffRoles.map((role) => [role, { active: 0, suspended: 0, inactive: 0, pending: 0 }]));
    for (const row of counts) {
      if (roles[row._id.role]) roles[row._id.role][row._id.status as keyof typeof roles.admin] = row.count;
    }
    res.json({
      roles,
      totalStaff: Object.values(roles).reduce((sum, status) => sum + Object.values(status).reduce((a, b) => a + b, 0), 0),
      recentActivity,
      maintenance: { ...defaultMaintenance, ...(settings?.value || {}) },
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || "development",
    });
  } catch {
    res.status(500).json({ error: "تعذر تحميل ملخص المنصة." });
  }
});

qiroxOwnerRouter.get("/users", requireOwner, async (req, res) => {
  try {
    const page = Math.max(1, Math.min(10000, Number(req.query.page) || 1));
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const filter: Record<string, unknown> = { role: { $in: [...staffRoles] } };
    if (staffRoles.includes(req.query.role as any)) filter.role = req.query.role;
    if (["active", "inactive", "suspended", "pending"].includes(String(req.query.status))) filter.status = req.query.status;
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    if (search) {
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: safeSearch, $options: "i" } },
        { fullNameAr: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
      ];
    }
    const [items, total] = await Promise.all([
      UserModel.find(filter).select("fullName fullNameAr email role status lastLogin createdAt").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      UserModel.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch {
    res.status(500).json({ error: "تعذر تحميل الحسابات." });
  }
});

qiroxOwnerRouter.patch("/users/:id/status", requireCsrf, requireOwner, async (req: any, res) => {
  const { status } = req.body || {};
  if (!["active", "suspended"].includes(status)) {
    res.status(400).json({ error: "الحالة المطلوبة غير مسموحة." });
    return;
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "معرّف الحساب غير صالح." });
    return;
  }
  try {
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id, role: { $in: [...staffRoles] } },
      { $set: { status, sessionRevokedAt: new Date() } },
      { new: true, runValidators: true },
    ).select("fullName fullNameAr email role status lastLogin createdAt").lean();
    if (!user) {
      res.status(404).json({ error: "الحساب غير موجود أو لا يمكن التحكم به من هذه اللوحة." });
      return;
    }
    await audit(req, status === "suspended" ? "user_suspended" : "user_activated", "User", String(user._id), { role: user.role });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "تعذر تحديث حالة الحساب." });
  }
});

qiroxOwnerRouter.get("/activity", requireOwner, async (req, res) => {
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
  try {
    const items = await AuditLogModel.find().sort({ createdAt: -1 }).limit(limit)
      .select("action entity entityId description ip severity createdAt metadata").lean();
    res.json({ items });
  } catch {
    res.status(500).json({ error: "تعذر تحميل سجل النشاط." });
  }
});

qiroxOwnerRouter.patch("/maintenance", requireCsrf, requireOwner, async (req: any, res) => {
  const enabled = req.body?.enabled;
  if (typeof enabled !== "boolean") {
    res.status(400).json({ error: "قيمة حالة الصيانة غير صالحة." });
    return;
  }
  const messageAr = typeof req.body?.messageAr === "string" ? req.body.messageAr.trim().slice(0, 500) : "";
  const messageEn = typeof req.body?.messageEn === "string" ? req.body.messageEn.trim().slice(0, 500) : "";
  if (!messageAr || !messageEn) {
    res.status(400).json({ error: "أدخل رسالة الصيانة بالعربية والإنجليزية." });
    return;
  }
  try {
    const value = { enabled, messageAr, messageEn };
    const setting = await SystemSettingsModel.findOneAndUpdate(
      { key: "platformMaintenance" },
      { $set: { value, group: "platform", label: "Platform maintenance" } },
      { upsert: true, new: true, runValidators: true },
    ).lean();
    invalidatePlatformMaintenanceCache();
    if (enabled) closeAllSocketsForMaintenance();
    await audit(req, enabled ? "maintenance_enabled" : "maintenance_disabled", "SystemSettings", "platformMaintenance");
    res.json({ maintenance: { ...value, updatedAt: setting?.updatedAt || new Date() } });
  } catch {
    res.status(500).json({ error: "تعذر حفظ إعداد الصيانة." });
  }
});

qiroxOwnerRouter.get("/qirox-health", requireOwner, async (_req, res) => {
  try {
    const response = await fetch("https://qiroxstudio.online/api/health", {
      signal: AbortSignal.timeout(4000),
      headers: { Accept: "application/json" },
    });
    const payload: { service?: string; status?: string } | null = await response.json().catch(() => null);
    res.json({ reachable: response.ok, statusCode: response.status, service: payload?.service || null, status: payload?.status || "unknown", checkedAt: new Date().toISOString(), apiDocsAvailable: false });
  } catch {
    res.json({ reachable: false, status: "unreachable", checkedAt: new Date().toISOString(), apiDocsAvailable: false });
  }
});
