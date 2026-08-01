import { Router } from "express";
import { requireAuth, requireRole, optionalAuth } from "../auth.js";
import { ContactRequestModel, LeadModel } from "../models/index.js";
import { contactLimiter } from "../middleware/rateLimiter.js";
import { validate, contactSchema } from "../middleware/validate.js";
import { fireNotifyAdmins } from "../notify.js";
import { sendContactConfirmation } from "../email.js";

export const contactRouter = Router();

// ── Public: Submit Contact Form ───────────────────────────────────
contactRouter.post("/", contactLimiter, validate(contactSchema), async (req, res) => {
  try {
    const { name, email, phone, company, serviceInterest, message } = req.body;

    const request = await ContactRequestModel.create({
      name, email, phone, company, serviceInterest, message,
      ip: req.ip,
      source: req.headers.referer || "direct",
    });

    // Notify admins instantly
    await fireNotifyAdmins(
      "رسالة تواصل جديدة",
      `${name} — ${email}${company ? ` (${company})` : ""}`,
      { type: "message", link: "/admin/contact" }
    );

    // Auto-confirm to sender
    await sendContactConfirmation(email, name);

    res.status(201).json({ message: "تم استلام رسالتك، سنتواصل معك قريباً", id: request._id });
  } catch (err: any) {
    console.error("[Contact]", err.message);
    res.status(500).json({ error: "خطأ في إرسال الرسالة" });
  }
});

// ── Admin: Get All Requests ───────────────────────────────────────
contactRouter.get("/", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    const [requests, total] = await Promise.all([
      ContactRequestModel.find(filter)
        .populate("assignedTo", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      ContactRequestModel.countDocuments(filter),
    ]);

    res.json({ requests, total, page: +page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الرسائل" });
  }
});

// ── Admin: Update Request Status ──────────────────────────────────
contactRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const request = await ContactRequestModel.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    ).lean();
    res.json({ request });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الرسالة" });
  }
});

// ── Admin: Convert to Lead ────────────────────────────────────────
contactRouter.post("/:id/convert-lead", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const cr = await ContactRequestModel.findById(req.params.id);
    if (!cr) {
      res.status(404).json({ error: "الرسالة غير موجودة" });
      return;
    }
    const lead = await LeadModel.create({
      name: cr.name, email: cr.email, phone: cr.phone, company: cr.company,
      source: "website", notes: cr.message,
      interestedServices: cr.serviceInterest ? [cr.serviceInterest] : [],
      assignedTo: (req as any).user._id,
      status: "new",
      priority: "medium",
    });
    await ContactRequestModel.findByIdAndUpdate(cr._id, {
      status: "converted", convertedToLead: true, leadId: lead._id
    });
    res.json({ lead, message: "تم تحويل الرسالة إلى فرصة" });
  } catch {
    res.status(500).json({ error: "خطأ في التحويل" });
  }
});
