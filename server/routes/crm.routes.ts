import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { LeadModel, CustomerModel, UserModel } from "../models/index.js";
import { fireNotify, fireNotifyAdmins } from "../notify.js";
import { aiService } from "../services/ai.service.js";

export const crmRouter = Router();

// ═══════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════

crmRouter.get("/leads", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const { status, source, assignedTo, priority, page = 1, limit = 20, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [leads, total] = await Promise.all([
      LeadModel.find(filter)
        .populate("assignedTo", "fullName avatar email")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      LeadModel.countDocuments(filter),
    ]);

    res.json({ leads, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الفرص" });
  }
});

// Sales pipeline
crmRouter.get("/leads/pipeline", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const stages = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"];
    const pipeline = await Promise.all(
      stages.map(async (status) => ({
        status,
        count: await LeadModel.countDocuments({ status }),
        total: (await LeadModel.aggregate([
          { $match: { status } },
          { $group: { _id: null, total: { $sum: "$estimatedValue" } } },
        ]))[0]?.total || 0,
        leads: await LeadModel.find({ status })
          .populate("assignedTo", "fullName avatar")
          .sort({ updatedAt: -1 })
          .limit(10).lean(),
      }))
    );
    res.json({ pipeline });
  } catch {
    res.status(500).json({ error: "خطأ في جلب Pipeline" });
  }
});

crmRouter.get("/leads/:id", requireAuth, async (req, res) => {
  try {
    const lead = await LeadModel.findById(req.params.id)
      .populate("assignedTo", "fullName avatar email phone")
      .populate("customerId").lean();
    if (!lead) {
      res.status(404).json({ error: "الفرصة غير موجودة" });
      return;
    }
    res.json({ lead });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الفرصة" });
  }
});

crmRouter.post("/leads", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const lead = await LeadModel.create({
      ...req.body,
      assignedTo: req.body.assignedTo || (req as any).user._id,
    });

    // AI: Score this lead in background (hidden)
    aiService.scoreLead(String(lead._id)).catch(() => {});

    await fireNotifyAdmins("فرصة جديدة", `${lead.name} - ${lead.company || ""}`, {
      type: "info", link: "/admin/crm/leads"
    });

    await logAction(String((req as any).user._id), "create_lead", "Lead", String(lead._id), req);
    res.status(201).json({ lead });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في إنشاء الفرصة" });
  }
});

crmRouter.patch("/leads/:id", requireAuth, async (req, res) => {
  try {
    const oldLead = await LeadModel.findById(req.params.id);
    const lead = await LeadModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assignedTo", "fullName avatar").lean();
    if (!lead) {
      res.status(404).json({ error: "الفرصة غير موجودة" });
      return;
    }

    // Notify if stage changed
    if (oldLead && req.body.status && oldLead.status !== req.body.status) {
      if (lead.assignedTo) {
        await fireNotify(
          String((lead.assignedTo as any)._id),
          "تحديث حالة الفرصة",
          `${lead.name}: ${oldLead.status} → ${req.body.status}`,
          { type: "status", link: `/admin/crm/leads/${lead._id}` }
        );
      }
    }

    // AI: re-score in background
    aiService.scoreLead(req.params.id).catch(() => {});

    await logAction(String((req as any).user._id), "update_lead", "Lead", req.params.id, req);
    res.json({ lead });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الفرصة" });
  }
});

crmRouter.delete("/leads/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await LeadModel.findByIdAndDelete(req.params.id);
    await logAction(String((req as any).user._id), "delete_lead", "Lead", req.params.id, req);
    res.json({ message: "تم حذف الفرصة" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف الفرصة" });
  }
});

// Convert lead to customer
crmRouter.post("/leads/:id/convert", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ error: "الفرصة غير موجودة" });
      return;
    }
    const customer = await CustomerModel.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      companyName: lead.company,
      country: lead.country || "SA",
      city: lead.city,
      leadId: lead._id,
      accountManager: lead.assignedTo,
      ...req.body,
    });
    await LeadModel.findByIdAndUpdate(lead._id, {
      convertedToCustomer: true,
      convertedAt: new Date(),
      customerId: customer._id,
      status: "won",
    });
    await logAction(String((req as any).user._id), "convert_lead", "Lead", req.params.id, req, { customerId: customer._id });
    res.json({ customer, message: "تم تحويل الفرصة إلى عميل" });
  } catch {
    res.status(500).json({ error: "خطأ في تحويل الفرصة" });
  }
});

// ═══════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════

crmRouter.get("/customers", requireAuth, async (req, res) => {
  try {
    const { status, tier, search, page = 1, limit = 20, accountManager } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (tier) filter.tier = tier;
    if (accountManager) filter.accountManager = accountManager;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find(filter)
        .populate("accountManager", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      CustomerModel.countDocuments(filter),
    ]);

    res.json({ customers, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب العملاء" });
  }
});

crmRouter.get("/customers/:id", requireAuth, async (req, res) => {
  try {
    const customer = await CustomerModel.findById(req.params.id)
      .populate("accountManager", "fullName avatar email phone").lean();
    if (!customer) {
      res.status(404).json({ error: "العميل غير موجود" });
      return;
    }
    res.json({ customer });
  } catch {
    res.status(500).json({ error: "خطأ في جلب العميل" });
  }
});

crmRouter.post("/customers", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const customer = await CustomerModel.create(req.body);
    await logAction(String((req as any).user._id), "create_customer", "Customer", String(customer._id), req);
    res.status(201).json({ customer });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء العميل" });
  }
});

crmRouter.patch("/customers/:id", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const customer = await CustomerModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("accountManager", "fullName avatar").lean();
    if (!customer) {
      res.status(404).json({ error: "العميل غير موجود" });
      return;
    }
    await logAction(String((req as any).user._id), "update_customer", "Customer", req.params.id, req);
    res.json({ customer });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث العميل" });
  }
});

crmRouter.delete("/customers/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await CustomerModel.findByIdAndDelete(req.params.id);
    await logAction(String((req as any).user._id), "delete_customer", "Customer", req.params.id, req);
    res.json({ message: "تم حذف العميل" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف العميل" });
  }
});
