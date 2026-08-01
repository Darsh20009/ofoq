import { Router } from "express";
import { requireAuth, requireRole, hashPassword, verifyPassword, logAction } from "../auth.js";
import { uploadAvatar } from "../middleware/upload.js";
import { UserModel, NotificationModel } from "../models/index.js";
import { fireNotify } from "../notify.js";
import { sendNewEmployeeEmail } from "../email.js";
import path from "path";
import fs from "fs";

export const usersRouter = Router();

// ── Get All Users (Admin) ─────────────────────────────────────────
usersRouter.get("/", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserModel.countDocuments(filter);
    const users = await UserModel.find(filter)
      .select("-password -totpSecret -recoveryPassphrase -quickPin")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .lean();

    res.json({ users, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المستخدمين" });
  }
});

// ── Get Single User ──────────────────────────────────────────────
usersRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const isAdmin = ["super_admin", "admin", "manager"].includes(me.role);
    if (!isAdmin && String(me._id) !== req.params.id) {
      res.status(403).json({ error: "غير مصرح" });
      return;
    }
    const user = await UserModel.findById(req.params.id)
      .select("-password -totpSecret -recoveryPassphrase -quickPin").lean();
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المستخدم" });
  }
});

// ── Update Profile ───────────────────────────────────────────────
usersRouter.patch("/profile", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const allowed = ["fullName", "fullNameAr", "phone", "bio", "lang", "timezone", "theme"];
    const updates: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const updated = await UserModel.findByIdAndUpdate(userId, updates, { new: true })
      .select("-password -totpSecret").lean();
    res.json({ user: updated });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الملف الشخصي" });
  }
});

// ── Upload Avatar ────────────────────────────────────────────────
usersRouter.post("/avatar", requireAuth, uploadAvatar, async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "لم يتم رفع أي صورة" });
      return;
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const userId = (req as any).user._id;

    // Delete old avatar
    const user = await UserModel.findById(userId);
    if (user?.avatar && user.avatar.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await UserModel.findByIdAndUpdate(userId, { avatar: avatarUrl });
    res.json({ avatarUrl });
  } catch {
    res.status(500).json({ error: "خطأ في رفع الصورة" });
  }
});

// ── Change Password ──────────────────────────────────────────────
usersRouter.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById((req as any).user._id).select("+password");
    if (!user?.password) {
      res.status(400).json({ error: "لا توجد كلمة مرور مضبوطة للحساب" });
      return;
    }
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: "كلمة المرور الجديدة 8 أحرف على الأقل" });
      return;
    }
    await UserModel.findByIdAndUpdate(user._id, { password: await hashPassword(newPassword) });
    await logAction(String(user._id), "change_password", "User", String(user._id), req);
    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch {
    res.status(500).json({ error: "خطأ في تغيير كلمة المرور" });
  }
});

// ── Admin: Create User ───────────────────────────────────────────
usersRouter.post("/", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { fullName, email, password, role, phone, department, position } = req.body;
    const existing = await UserModel.findOne({ email });
    if (existing) {
      res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }
    const hashed = password ? await hashPassword(password) : undefined;
    const user = await UserModel.create({
      fullName, email, phone, role: role || "employee",
      department, position, password: hashed,
      status: "active", emailVerified: true,
    });
    await logAction(String((req as any).user._id), "create_user", "User", String(user._id), req);
    // إرسال بريد الترحيب مع بيانات الدخول (بشكل غير متزامن — لا يوقف الاستجابة)
    if (email && password) {
      sendNewEmployeeEmail(email, fullName, email, password).catch((e) =>
        console.warn("[Email] welcome email failed:", e?.message)
      );
    }
    res.status(201).json({ user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في إنشاء المستخدم" });
  }
});

// ── Admin: Update User ───────────────────────────────────────────
usersRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const allowed = ["fullName", "fullNameAr", "phone", "role", "status", "department", "position", "permissions"];
    const updates: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await UserModel.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select("-password -totpSecret").lean();
    if (!user) {
      res.status(404).json({ error: "المستخدم غير موجود" });
      return;
    }
    await logAction(String((req as any).user._id), "update_user", "User", req.params.id, req, { changes: Object.keys(updates) });
    res.json({ user });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث المستخدم" });
  }
});

// ── Admin: Delete User ───────────────────────────────────────────
usersRouter.delete("/:id", requireAuth, requireRole("super_admin"), async (req, res) => {
  try {
    const me = (req as any).user;
    if (String(me._id) === req.params.id) {
      res.status(400).json({ error: "لا يمكنك حذف حسابك الخاص" });
      return;
    }
    await UserModel.findByIdAndUpdate(req.params.id, { status: "inactive" });
    await logAction(String(me._id), "delete_user", "User", req.params.id, req);
    res.json({ message: "تم إلغاء تفعيل الحساب" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف المستخدم" });
  }
});

// ── Notifications ─────────────────────────────────────────────────
usersRouter.get("/me/notifications", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user._id;
    const { page = 1, limit = 20, unread } = req.query;
    const filter: any = { userId };
    if (unread === "true") filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      NotificationModel.countDocuments(filter),
      NotificationModel.countDocuments({ userId, read: false }),
    ]);

    res.json({ notifications, total, unreadCount, page: +page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الإشعارات" });
  }
});

usersRouter.post("/me/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { userId: (req as any).user._id, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ message: "تم تحديد جميع الإشعارات كمقروءة" });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الإشعارات" });
  }
});

usersRouter.patch("/me/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).user._id },
      { read: true, readAt: new Date() }
    );
    res.json({ message: "تم تحديد الإشعار كمقروء" });
  } catch {
    res.status(500).json({ error: "خطأ" });
  }
});
