import { Router } from "express";
import { requireAuth, requireRole, optionalAuth } from "../auth.js";
import { PageModel, BlogPostModel, TestimonialModel, SystemSettingsModel, PartnerModel } from "../models/index.js";
import { uploadMultiple, uploadSingle, uploadPartnerLogo } from "../middleware/upload.js";
import { removePartnerLogoFile, processPartnerLogo } from "../services/logo-processing.js";
import slugify from "slugify";
import path from "path";

export const cmsRouter = Router();

const PARTNER_EDIT_ROLES = ["super_admin", "admin", "manager", "employee"];
const PARTNER_DELETE_ROLES = ["super_admin", "admin"];
const partnerFields = [
  "nameAr", "nameEn", "logo", "descriptionAr", "descriptionEn",
  "partnershipAr", "partnershipEn", "servicesAr", "servicesEn",
] as const;

function partnerPayload(body: Record<string, any>, partial = false): { payload?: Record<string, unknown>; error?: string } {
  const payload: Record<string, unknown> = {};
  for (const field of partnerFields) {
    if (!partial || Object.prototype.hasOwnProperty.call(body, field)) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return { error: `الحقل ${field} مطلوب` };
      }
      payload[field] = body[field].trim();
    }
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, "order")) {
    const order = Number(body.order);
    if (!Number.isInteger(order) || order < 0 || order > 9999) return { error: "الترتيب يجب أن يكون رقمًا صحيحًا من 0 إلى 9999" };
    payload.order = order;
  }
  if (!partial || Object.prototype.hasOwnProperty.call(body, "isPublished")) {
    payload.isPublished = body.isPublished === true || body.isPublished === "true";
  }
  return { payload };
}

// ═══════════════════════════════════════════════════
// BLOG
// ═══════════════════════════════════════════════════

// Public: list posts (admins see unpublished when isPublished not forced)
cmsRouter.get("/blog", optionalAuth, async (req, res) => {
  try {
    const { isPublished, limit = "20", category } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (isPublished === "true" || !(req as any).user) filter.isPublished = true;
    if (category) filter.category = category;
    const posts = await BlogPostModel.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(Math.min(parseInt(limit) || 20, 100))
      .populate("author", "name")
      .lean();
    res.json({ data: { posts } });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المقالات" });
  }
});

// Public: single post by id or slug
cmsRouter.get("/blog/:id", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const byId = /^[0-9a-fA-F]{24}$/.test(id);
    const post = await BlogPostModel.findOne(byId ? { _id: id } : { slug: id })
      .populate("author", "name")
      .lean();
    if (!post || (!post.isPublished && !(req as any).user)) {
      res.status(404).json({ error: "المقال غير موجود" });
      return;
    }
    BlogPostModel.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } }).catch(() => {});
    res.json({ data: { post } });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المقال" });
  }
});

// Admin: create post
cmsRouter.post("/blog", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const body = req.body || {};
    const slug = body.slug || slugify(body.titleAr || body.title || "", { lower: true, strict: true }) || `post-${Date.now()}`;
    const post = await BlogPostModel.create({
      ...body,
      slug,
      author: (req as any).user._id,
      publishedAt: body.isPublished ? new Date() : undefined,
    });
    res.status(201).json({ data: { post } });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء المقال" });
  }
});

// Admin: update post
cmsRouter.put("/blog/:id", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const body = req.body || {};
    const existing = await BlogPostModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "المقال غير موجود" });
      return;
    }
    if (body.isPublished && !existing.publishedAt) body.publishedAt = new Date();
    Object.assign(existing, body);
    await existing.save();
    res.json({ data: { post: existing } });
  } catch {
    res.status(500).json({ error: "خطأ في تعديل المقال" });
  }
});

// Admin: delete post
cmsRouter.delete("/blog/:id", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    await BlogPostModel.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "خطأ في حذف المقال" });
  }
});

// ═══════════════════════════════════════════════════
// PARTNERS
// ═══════════════════════════════════════════════════

// Public: only published partners are exposed to the marketing site.
cmsRouter.get("/partners", async (_req, res) => {
  try {
    const completeString = { $type: "string", $ne: "" };
    const partners = await PartnerModel.find({
      isPublished: true,
      nameAr: completeString,
      nameEn: completeString,
      logo: completeString,
    })
      .sort({ order: 1, createdAt: -1 }).lean();
    res.json({ partners });
  } catch {
    res.status(500).json({ error: "تعذر جلب الشركاء" });
  }
});

// Admin: staff can view and edit; deletion is restricted below.
cmsRouter.get("/admin/partners", requireAuth, requireRole(...PARTNER_EDIT_ROLES), async (_req, res) => {
  try {
    const partners = await PartnerModel.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ partners });
  } catch {
    res.status(500).json({ error: "تعذر جلب الشركاء" });
  }
});

cmsRouter.post("/admin/partners/upload-logo", requireAuth, requireRole(...PARTNER_EDIT_ROLES), (req, res, next) => {
  uploadPartnerLogo(req, res, (error) => {
    if (error) {
      res.status(400).json({ error: error.message || "تعذر رفع الشعار" });
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "لم يتم رفع أي شعار" });
      return;
    }
    const { filename } = await processPartnerLogo(req.file.buffer);
    res.status(201).json({ url: `/uploads/partners/${filename}`, filename });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || "تعذر معالجة الشعار" });
  }
});

cmsRouter.post("/admin/partners", requireAuth, requireRole(...PARTNER_EDIT_ROLES), async (req, res) => {
  try {
    const { payload, error } = partnerPayload(req.body || {});
    if (error) {
      res.status(400).json({ error });
      return;
    }
    const partner = await PartnerModel.create(payload);
    res.status(201).json({ partner });
  } catch {
    res.status(500).json({ error: "تعذر إنشاء الشريك" });
  }
});

cmsRouter.patch("/admin/partners/:id", requireAuth, requireRole(...PARTNER_EDIT_ROLES), async (req, res) => {
  try {
    const existing = await PartnerModel.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: "الشريك غير موجود" });
      return;
    }
    const { payload, error } = partnerPayload(req.body || {}, true);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    const oldLogo = existing.logo;
    Object.assign(existing, payload);
    await existing.save();
    if (payload.logo && payload.logo !== oldLogo) await removePartnerLogoFile(oldLogo);
    res.json({ partner: existing });
  } catch {
    res.status(500).json({ error: "تعذر تعديل الشريك" });
  }
});

cmsRouter.delete("/admin/partners/:id", requireAuth, requireRole(...PARTNER_DELETE_ROLES), async (req, res) => {
  try {
    const partner = await PartnerModel.findByIdAndDelete(req.params.id);
    if (!partner) {
      res.status(404).json({ error: "الشريك غير موجود" });
      return;
    }
    await removePartnerLogoFile(partner.logo);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "تعذر حذف الشريك" });
  }
});

// ═══════════════════════════════════════════════════
// PAGES (Full employee control of website content)
// ═══════════════════════════════════════════════════

// Public: Get published page by key
cmsRouter.get("/pages/:key", optionalAuth, async (req, res) => {
  try {
    const page = await PageModel.findOne({ key: req.params.key, isPublished: true }).lean();
    if (!page) {
      res.status(404).json({ error: "الصفحة غير موجودة" });
      return;
    }
    res.json({ page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الصفحة" });
  }
});

// Admin: Get all pages
cmsRouter.get("/admin/pages", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (_req, res) => {
  try {
    const pages = await PageModel.find().sort({ key: 1 }).lean();
    res.json({ pages });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الصفحات" });
  }
});

// Admin: Get single page (draft or published)
cmsRouter.get("/admin/pages/:key", requireAuth, async (req, res) => {
  try {
    const page = await PageModel.findOne({ key: req.params.key }).lean();
    if (!page) {
      res.status(404).json({ error: "الصفحة غير موجودة" });
      return;
    }
    res.json({ page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الصفحة" });
  }
});

// Admin: Create page
cmsRouter.post("/admin/pages", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const slug = req.body.slug || slugify(req.body.titleAr || req.body.title, { replacement: "-", lower: true, strict: true });
    const page = await PageModel.create({
      ...req.body,
      slug,
      lastEditedBy: (req as any).user._id,
    });
    res.status(201).json({ page });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: "الصفحة موجودة بالفعل" });
      return;
    }
    res.status(500).json({ error: "خطأ في إنشاء الصفحة" });
  }
});

// Admin: Update page (including sections — full employee control)
cmsRouter.patch("/admin/pages/:key", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const page = await PageModel.findOneAndUpdate(
      { key: req.params.key },
      { ...req.body, lastEditedBy: (req as any).user._id },
      { new: true, upsert: false }
    ).lean();
    if (!page) {
      res.status(404).json({ error: "الصفحة غير موجودة" });
      return;
    }
    res.json({ page });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الصفحة" });
  }
});

// Admin: Update a specific section
cmsRouter.patch("/admin/pages/:key/sections/:sectionKey", requireAuth, async (req, res) => {
  try {
    const page = await PageModel.findOne({ key: req.params.key });
    if (!page) {
      res.status(404).json({ error: "الصفحة غير موجودة" });
      return;
    }
    const sectionIdx = page.sections.findIndex((s) => s.key === req.params.sectionKey);
    if (sectionIdx === -1) {
      // Add new section
      page.sections.push({ key: req.params.sectionKey, type: "custom", isVisible: true, order: page.sections.length, ...req.body });
    } else {
      Object.assign(page.sections[sectionIdx], req.body);
    }
    page.lastEditedBy = (req as any).user._id;
    await page.save();
    res.json({ page });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث القسم" });
  }
});

// Admin: Publish/Unpublish page
cmsRouter.post("/admin/pages/:key/publish", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const { publish } = req.body;
    const page = await PageModel.findOneAndUpdate(
      { key: req.params.key },
      { isPublished: !!publish, publishedAt: publish ? new Date() : undefined },
      { new: true }
    ).lean();
    res.json({ page, message: publish ? "تم نشر الصفحة" : "تم إلغاء نشر الصفحة" });
  } catch {
    res.status(500).json({ error: "خطأ في نشر الصفحة" });
  }
});

// ═══════════════════════════════════════════════════
// BLOG POSTS
// ═══════════════════════════════════════════════════

// Public: Get published posts
cmsRouter.get("/posts", optionalAuth, async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 12 } = req.query;
    const filter: any = { isPublished: true };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    const [posts, total] = await Promise.all([
      BlogPostModel.find(filter)
        .populate("author", "fullName avatar")
        .select("-content -contentAr")
        .sort({ publishedAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      BlogPostModel.countDocuments(filter),
    ]);
    res.json({ posts, total, page: +page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المقالات" });
  }
});

// Public: Get post by slug
cmsRouter.get("/posts/:slug", optionalAuth, async (req, res) => {
  try {
    const post = await BlogPostModel.findOne({ slug: req.params.slug, isPublished: true })
      .populate("author", "fullName avatar bio").lean();
    if (!post) {
      res.status(404).json({ error: "المقال غير موجود" });
      return;
    }
    await BlogPostModel.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } });
    res.json({ post });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المقال" });
  }
});

// Admin: All posts
cmsRouter.get("/admin/posts", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [posts, total] = await Promise.all([
      BlogPostModel.find()
        .populate("author", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      BlogPostModel.countDocuments(),
    ]);
    res.json({ posts, total });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المقالات" });
  }
});

// Admin: Create post
cmsRouter.post("/admin/posts", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const slug = req.body.slug || slugify(req.body.titleAr || req.body.title, {
      replacement: "-", lower: true, strict: true
    }) + `-${Date.now()}`;
    const post = await BlogPostModel.create({
      ...req.body, slug,
      author: (req as any).user._id,
      publishedAt: req.body.isPublished ? new Date() : undefined,
    });
    res.status(201).json({ post });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء المقال" });
  }
});

// Admin: Update post
cmsRouter.patch("/admin/posts/:id", requireAuth, async (req, res) => {
  try {
    if (req.body.isPublished && !req.body.publishedAt) req.body.publishedAt = new Date();
    const post = await BlogPostModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.json({ post });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث المقال" });
  }
});

// Admin: Delete post
cmsRouter.delete("/admin/posts/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await BlogPostModel.findByIdAndDelete(req.params.id);
    res.json({ message: "تم حذف المقال" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف المقال" });
  }
});

// ═══════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════

cmsRouter.get("/testimonials", async (_req, res) => {
  try {
    const testimonials = await TestimonialModel.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 }).lean();
    res.json({ testimonials });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الآراء" });
  }
});

cmsRouter.post("/admin/testimonials", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const t = await TestimonialModel.create(req.body);
    res.status(201).json({ testimonial: t });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء الرأي" });
  }
});

cmsRouter.patch("/admin/testimonials/:id", requireAuth, async (req, res) => {
  try {
    const t = await TestimonialModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    res.json({ testimonial: t });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الرأي" });
  }
});

cmsRouter.delete("/admin/testimonials/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await TestimonialModel.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف" });
  } catch {
    res.status(500).json({ error: "خطأ في الحذف" });
  }
});

// ═══════════════════════════════════════════════════
// SYSTEM SETTINGS
// ═══════════════════════════════════════════════════

cmsRouter.get("/settings", optionalAuth, async (req, res) => {
  try {
    // Public settings only
    const settings = await SystemSettingsModel.find({ group: { $in: ["general", "contact", "social"] } }).lean();
    const result: Record<string, any> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json({ settings: result });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الإعدادات" });
  }
});

cmsRouter.get("/admin/settings", requireAuth, requireRole("super_admin", "admin"), async (_req, res) => {
  try {
    const settings = await SystemSettingsModel.find().lean();
    const result: Record<string, any> = {};
    settings.forEach((s) => { result[s.key] = s.value; });
    res.json({ settings: result });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الإعدادات" });
  }
});

cmsRouter.post("/admin/settings", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { settings } = req.body; // { key: value }
    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        SystemSettingsModel.findOneAndUpdate(
          { key },
          { key, value, group: req.body.group || "general", updatedBy: (req as any).user._id },
          { upsert: true }
        )
      )
    );
    res.json({ message: "تم حفظ الإعدادات" });
  } catch {
    res.status(500).json({ error: "خطأ في حفظ الإعدادات" });
  }
});

// ═══════════════════════════════════════════════════
// MEDIA / FILE UPLOAD (employees control all media)
// ═══════════════════════════════════════════════════

cmsRouter.post("/media/upload", requireAuth, uploadSingle as any, async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "لم يتم رفع أي ملف" });
      return;
    }
    const url = `/uploads/${req.query.type || "documents"}/${file.filename}`;
    res.json({ url, filename: file.filename, size: file.size, mimetype: file.mimetype });
  } catch {
    res.status(500).json({ error: "خطأ في رفع الملف" });
  }
});

cmsRouter.post("/media/upload-multiple", requireAuth, uploadMultiple as any, async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const urls = files.map((f) => ({
      url: `/uploads/${req.query.type || "documents"}/${f.filename}`,
      filename: f.filename,
      size: f.size,
      mimetype: f.mimetype,
    }));
    res.json({ files: urls });
  } catch {
    res.status(500).json({ error: "خطأ في رفع الملفات" });
  }
});

// ═══════════════════════════════════════════════════
// SITE CONTENT — Multilingual editable page content
// ═══════════════════════════════════════════════════

cmsRouter.get("/site-content", async (req, res) => {
  try {
    const setting = await SystemSettingsModel.findOne({ key: "siteContent" }).lean();
    const content = (setting as any)?.value || {};
    res.json({ data: { content } });
  } catch {
    res.status(500).json({ error: "Failed to load site content" });
  }
});

cmsRouter.put("/site-content", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { lang, data } = req.body as { lang: string; data: Record<string, any> };
    if (!lang || !data || typeof data !== "object") {
      res.status(400).json({ error: "Missing lang or data" });
      return;
    }
    let setting = await SystemSettingsModel.findOne({ key: "siteContent" });
    if (!setting) {
      setting = new SystemSettingsModel({
        key: "siteContent", value: {}, group: "cms",
        label: "Site Content (Multilingual)", updatedBy: (req as any).user._id,
      });
    }
    const existing = { ...(setting.value as Record<string, any> || {}) };
    existing[lang] = data;
    setting.value = existing;
    (setting as any).updatedBy = (req as any).user._id;
    setting.markModified("value");
    await setting.save();
    res.json({ data: { content: existing } });
  } catch {
    res.status(500).json({ error: "Failed to save site content" });
  }
});
