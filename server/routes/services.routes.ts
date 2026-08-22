import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { optionalAuth } from "../auth.js";
import { ServiceModel } from "../models/index.js";
import slugify from "slugify";

export const servicesRouter = Router();

// ── Public: Get Active Services ───────────────────────────────────
servicesRouter.get("/", optionalAuth, async (req, res) => {
  try {
    const { category, featured, all } = req.query;
    const user = (req as any).user;
    const canViewAll = all === "true" && ["super_admin", "admin", "manager"].includes(user?.role);
    const filter: any = canViewAll ? {} : { isActive: true };
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;

    const services = await ServiceModel.find(filter)
      .sort({ order: 1, createdAt: -1 }).lean();
    res.json({ services });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الخدمات" });
  }
});

// ── Public: Get Service by Slug ───────────────────────────────────
servicesRouter.get("/slug/:slug", optionalAuth, async (req, res) => {
  try {
    const service = await ServiceModel.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!service) {
      res.status(404).json({ error: "الخدمة غير موجودة" });
      return;
    }
    res.json({ service });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الخدمة" });
  }
});

// ── Get Categories ────────────────────────────────────────────────
servicesRouter.get("/categories", async (_req, res) => {
  try {
    const cats = await ServiceModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", nameAr: { $first: "$categoryAr" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ categories: cats });
  } catch {
    res.status(500).json({ error: "خطأ في جلب التصنيفات" });
  }
});

// ── Get Single Service ────────────────────────────────────────────
servicesRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const role = (req as any).user?.role;
    const canManage = ["super_admin", "admin", "manager"].includes(role);
    const service = await ServiceModel.findOne(canManage ? { _id: req.params.id } : { _id: req.params.id, isActive: true }).lean();
    if (!service) {
      res.status(404).json({ error: "الخدمة غير موجودة" });
      return;
    }
    res.json({ service });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الخدمة" });
  }
});

// ── Admin: Create Service ─────────────────────────────────────────
servicesRouter.post("/", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const slug = req.body.slug || slugify(req.body.title || req.body.titleAr, {
      replacement: "-", lower: true, strict: true
    });
    const service = await ServiceModel.create({ ...req.body, slug });
    await logAction(String((req as any).user._id), "create_service", "Service", String(service._id), req);
    res.status(201).json({ service });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "الخدمة موجودة بالفعل بهذا الـ Slug" });
      return;
    }
    res.status(500).json({ error: "خطأ في إنشاء الخدمة" });
  }
});

// ── Admin: Update Service ─────────────────────────────────────────
servicesRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    if (req.body.title && !req.body.slug) {
      req.body.slug = slugify(req.body.title, { replacement: "-", lower: true, strict: true });
    }
    const service = await ServiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!service) {
      res.status(404).json({ error: "الخدمة غير موجودة" });
      return;
    }
    await logAction(String((req as any).user._id), "update_service", "Service", req.params.id, req);
    res.json({ service });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الخدمة" });
  }
});

// ── Admin: Delete Service ─────────────────────────────────────────
servicesRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await ServiceModel.findByIdAndUpdate(req.params.id, { isActive: false });
    await logAction(String((req as any).user._id), "delete_service", "Service", req.params.id, req);
    res.json({ message: "تم حذف الخدمة" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف الخدمة" });
  }
});

// ── Reorder Services ──────────────────────────────────────────────
servicesRouter.post("/reorder", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { order } = req.body; // [{ id, order }]
    await Promise.all(order.map(({ id, order: ord }: any) =>
      ServiceModel.findByIdAndUpdate(id, { order: ord })
    ));
    res.json({ message: "تم ترتيب الخدمات" });
  } catch {
    res.status(500).json({ error: "خطأ في ترتيب الخدمات" });
  }
});
