import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { ProjectModel, TaskModel, CustomerModel, UserModel } from "../models/index.js";
import { fireNotify, fireNotifyAdmins, fireNotifyMany } from "../notify.js";
import { sendProjectUpdateEmail } from "../email.js";
import { aiService } from "../services/ai.service.js";
import crypto from "crypto";

export const projectsRouter = Router();

// ── Generate Project Number ───────────────────────────────────────
async function generateProjectNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await ProjectModel.countDocuments();
  return `OFQ-${year}-${String(count + 1).padStart(4, "0")}`;
}

// ── PROJECTS ─────────────────────────────────────────────────────
projectsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const { status, stage, customerId, manager, page = 1, limit = 20, search } = req.query;
    const filter: any = {};

    // Clients only see their own projects
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id });
      if (customer) filter.customerId = customer._id;
      else { res.json({ projects: [], total: 0 }); return; }
    }
    // Employees see assigned or managed projects
    else if (me.role === "employee") {
      filter.$or = [{ manager: me._id }, { team: me._id }];
    }

    if (status) filter.status = status;
    if (stage) filter.stage = stage;
    if (customerId && me.role !== "client") filter.customerId = customerId;
    if (manager) filter.manager = manager;
    if (search) {
      filter.$or = [
        ...(filter.$or || []),
        { name: { $regex: search, $options: "i" } },
        { projectNumber: { $regex: search, $options: "i" } },
      ];
    }

    const [projects, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate("customerId", "name companyName")
        .populate("manager", "fullName avatar")
        .populate("team", "fullName avatar")
        .populate("stageHistory.changedBy", "fullName")
        .populate("stageHistory.customerFeedback.createdBy", "fullName")
        .populate("serviceId", "titleAr title")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      ProjectModel.countDocuments(filter),
    ]);

    res.json({ projects, total, page: +page, pages: Math.ceil(total / +limit) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المشاريع" });
  }
});

projectsRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const project = await ProjectModel.findById(req.params.id)
      .populate("customerId", "name companyName email phone")
      .populate("manager", "fullName avatar email")
      .populate("team", "fullName avatar email")
      .populate("stageHistory.changedBy", "fullName")
      .populate("stageHistory.customerFeedback.createdBy", "fullName")
      .populate("serviceId", "titleAr title workflow")
      .populate("contractId", "contractNumber status value")
      .lean();
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id }).select("_id").lean();
      if (!customer || String(customer._id) !== String((project as any).customerId?._id ?? (project as any).customerId)) {
        res.status(403).json({ error: "ليس لديك صلاحية للوصول لهذا المشروع" });
        return;
      }
    } else if (me.role === "employee" &&
      String((project as any).manager?._id ?? (project as any).manager) !== String(me._id) &&
      !(project as any).team?.some((member: any) => String(member?._id ?? member) === String(me._id))) {
      res.status(403).json({ error: "هذا المشروع غير مسند إليك" });
      return;
    }
    // Get tasks for this project
    const tasks = me.role === "client" ? [] : await TaskModel.find({ projectId: project._id })
      .populate("assignedTo", "fullName avatar").lean();
    res.json({ project, tasks });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المشروع" });
  }
});

projectsRouter.post("/", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const { name, customerId, manager } = req.body;
    if (typeof name !== "string" || !name.trim() || !customerId || !manager) {
      res.status(400).json({ error: "اسم المشروع والعميل ومدير المشروع حقول مطلوبة" });
      return;
    }

    const [customerExists, managerExists] = await Promise.all([
      CustomerModel.exists({ _id: customerId }),
      UserModel.exists({ _id: manager, status: "active" }),
    ]);
    if (!customerExists) {
      res.status(400).json({ error: "العميل المختار غير موجود أو غير نشط" });
      return;
    }
    if (!managerExists) {
      res.status(400).json({ error: "مدير المشروع المختار غير موجود أو غير نشط" });
      return;
    }

    const initialStage = req.body.stage || "request";
    const validStages = ["request", "review", "quotation", "contract", "payment", "execution", "closed"];
    if (!validStages.includes(initialStage)) {
      res.status(400).json({ error: "مرحلة المشروع غير صالحة" });
      return;
    }

    const projectNumber = await generateProjectNumber();
    const project = await ProjectModel.create({
      ...req.body,
      name: name.trim(),
      projectNumber,
      stageHistory: [{
        stage: initialStage,
        changedAt: new Date(),
        changedBy: (req as any).user._id,
        ...(typeof req.body.stageNote === "string" && req.body.stageNote.trim()
          ? { note: req.body.stageNote.trim().slice(0, 1000) } : {}),
      }],
    });

    // Notify manager
    if (req.body.manager && String(req.body.manager) !== String((req as any).user._id)) {
      await fireNotify(
        req.body.manager,
        "تم تعيينك مديراً لمشروع جديد",
        `مشروع: ${req.body.name} (${projectNumber})`,
        { type: "project", link: `/admin/projects/${project._id}` }
      );
    }

    // Notify team members
    if (req.body.team?.length) {
      await fireNotifyMany(
        req.body.team.filter((id: string) => id !== String(req.body.manager)),
        "تم إضافتك لمشروع جديد",
        `مشروع: ${req.body.name}`,
        { type: "project", link: `/admin/projects/${project._id}` }
      );
    }

    // AI: Analyze project risk in background
    aiService.analyzeProjectRisk(String(project._id)).catch(() => {});

    await logAction(String((req as any).user._id), "create_project", "Project", String(project._id), req);
    res.status(201).json({ project });
  } catch (err: any) {
    console.error("[Projects]", err.message);
    res.status(500).json({ error: "خطأ في إنشاء المشروع" });
  }
});

projectsRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const me = (req as any).user;
    const old = await ProjectModel.findById(req.params.id);
    if (!old) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }

    if (me.role === "employee" &&
      String(old.manager) !== String(me._id) &&
      !old.team.some((member: any) => String(member) === String(me._id))) {
      res.status(403).json({ error: "هذا المشروع غير مسند إليك" });
      return;
    }

    const editableFields = [
      "name", "nameAr", "description", "manager", "team", "stage", "progress", "status",
      "priority", "budget", "actualCost", "currency", "startDate", "dueDate", "completedAt",
      "attachments", "notes", "tags", "serviceId", "contractId",
    ];
    const updates: any = Object.fromEntries(
      editableFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );

    // Stage change — add to history
    if (req.body.stage && req.body.stage !== old.stage) {
      const validStages = ["request", "review", "quotation", "contract", "payment", "execution", "closed"];
      if (!validStages.includes(req.body.stage)) {
        res.status(400).json({ error: "مرحلة المشروع غير صالحة" });
        return;
      }
      const stageNote = typeof req.body.stageNote === "string" ? req.body.stageNote.trim().slice(0, 1000) : "";
      updates.$push = {
        stageHistory: {
          stage: req.body.stage,
          changedAt: new Date(),
          changedBy: me._id,
          ...(stageNote ? { note: stageNote } : {}),
        },
      };

      // Notify customer via email
      try {
        const customer = await CustomerModel.findById(old.customerId).lean() as any;
        if (customer?.email) {
          const stageLabels: Record<string, string> = {
            request: "طلب", review: "مراجعة", quotation: "عرض سعر",
            contract: "عقد", payment: "دفع", execution: "تنفيذ", closed: "إغلاق",
          };
          await sendProjectUpdateEmail(
            customer.email, customer.name,
            old.name, stageLabels[req.body.stage] || req.body.stage,
            req.body.stageNote
          );
        }
      } catch {}
    }

    const project = await ProjectModel.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate("manager", "fullName avatar")
      .populate("team", "fullName avatar")
      .populate("stageHistory.changedBy", "fullName")
      .populate("stageHistory.customerFeedback.createdBy", "fullName").lean();

    await logAction(String(me._id), "update_project", "Project", req.params.id, req);
    res.json({ project });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث المشروع" });
  }
});

// Clients can comment on or approve a recorded project stage. They cannot change project stages.
projectsRouter.post("/:id/stage-feedback", requireAuth, requireRole("client"), async (req, res) => {
  try {
    const me = (req as any).user;
    const decision = req.body?.decision;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!["comment", "approved"].includes(decision) || (decision === "comment" && !message)) {
      res.status(400).json({ error: "اختر تعليقًا أو اعتمادًا، وأضف نص التعليق" });
      return;
    }
    if (message.length > 1500) {
      res.status(400).json({ error: "التعليق يتجاوز الحد المسموح" });
      return;
    }
    const project = await ProjectModel.findById(req.params.id);
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    const customer = await CustomerModel.findOne({ userId: me._id }).select("_id").lean();
    if (!customer || String(customer._id) !== String(project.customerId)) {
      res.status(403).json({ error: "ليس لديك صلاحية للتفاعل مع هذا المشروع" });
      return;
    }
    const historyEntry = project.stageHistory.find((entry: any) => String(entry._id) === String(req.body?.stageHistoryId));
    if (!historyEntry) {
      res.status(404).json({ error: "مرحلة المشروع غير موجودة في السجل" });
      return;
    }
    if (decision === "approved" && historyEntry.customerFeedback?.some(
      (feedback: any) => feedback.decision === "approved" && String(feedback.createdBy) === String(me._id),
    )) {
      res.status(409).json({ error: "سبق اعتماد هذه المرحلة" });
      return;
    }
    historyEntry.customerFeedback = historyEntry.customerFeedback || [];
    historyEntry.customerFeedback.push({
      decision,
      ...(message ? { message } : {}),
      createdBy: me._id,
      createdAt: new Date(),
    });
    await project.save();

    const notice = decision === "approved" ? "اعتمد العميل مرحلة من المشروع" : "أرسل العميل تعليقًا على المشروع";
    const recipients = [String(project.manager), ...project.team.map(String)]
      .filter((id) => id !== String(me._id));
    if (recipients.length) {
      await fireNotifyMany(recipients, notice, `المشروع: ${project.name}`, {
        type: "project",
        link: `/admin/projects`,
      }).catch(() => {});
    }
    res.status(201).json({ message: decision === "approved" ? "تم اعتماد المرحلة" : "تم إرسال التعليق" });
  } catch (error: any) {
    console.error("[Projects] stage feedback error:", error?.message || error);
    res.status(500).json({ error: "تعذر إرسال التفاعل على المرحلة" });
  }
});

projectsRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const project = await ProjectModel.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود أو تم حذفه مسبقًا" });
      return;
    }

    // A task without its project cannot be managed from the portal.
    await TaskModel.deleteMany({ projectId: project._id });
    await logAction(String((req as any).user._id), "delete_project", "Project", req.params.id, req);
    res.json({ deleted: true, id: req.params.id, message: "تم حذف المشروع نهائيًا" });
  } catch (error) {
    console.error("[Projects] delete error:", error);
    res.status(500).json({ error: "خطأ في إلغاء المشروع" });
  }
});

// ── TASKS ─────────────────────────────────────────────────────────
projectsRouter.get("/:id/tasks", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    if (me.role === "client") {
      res.status(403).json({ error: "مهام المشروع غير متاحة في بوابة العميل" });
      return;
    }
    const project = await ProjectModel.findById(req.params.id).select("manager team").lean() as any;
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    if (me.role === "employee" &&
      String(project.manager) !== String(me._id) &&
      !project.team.some((member: any) => String(member) === String(me._id))) {
      res.status(403).json({ error: "هذا المشروع غير مسند إليك" });
      return;
    }
    const tasks = await TaskModel.find({ projectId: req.params.id })
      .populate("assignedTo", "fullName avatar")
      .populate("createdBy", "fullName avatar")
      .sort({ createdAt: -1 }).lean();
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المهام" });
  }
});

projectsRouter.post("/:id/tasks", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const me = (req as any).user;
    const project = await ProjectModel.findById(req.params.id).select("manager team").lean() as any;
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    if (me.role === "employee" &&
      String(project.manager) !== String(me._id) &&
      !project.team.some((member: any) => String(member) === String(me._id))) {
      res.status(403).json({ error: "هذا المشروع غير مسند إليك" });
      return;
    }
    const task = await TaskModel.create({
      ...req.body,
      projectId: req.params.id,
      createdBy: (req as any).user._id,
    });

    // Notify assignees
    if (req.body.assignedTo?.length) {
      await fireNotifyMany(
        req.body.assignedTo,
        "تم تعيين مهمة لك",
        task.title,
        { type: "task", link: `/admin/projects/${req.params.id}` }
      );
    }

    res.status(201).json({ task });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء المهمة" });
  }
});

projectsRouter.patch("/tasks/:taskId", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const me = (req as any).user;
    const oldTask = await TaskModel.findById(req.params.taskId).select("projectId");
    if (!oldTask) {
      res.status(404).json({ error: "المهمة غير موجودة" });
      return;
    }
    const project = await ProjectModel.findById(oldTask.projectId).select("manager team").lean() as any;
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    if (me.role === "employee" &&
      String(project.manager) !== String(me._id) &&
      !project.team.some((member: any) => String(member) === String(me._id))) {
      res.status(403).json({ error: "هذا المشروع غير مسند إليك" });
      return;
    }
    const allowedFields = ["title", "description", "assignedTo", "status", "priority", "dueDate", "tags"];
    const updates: any = Object.fromEntries(
      allowedFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );
    if (req.body.status === "done") updates.completedAt = new Date();
    const task = await TaskModel.findByIdAndUpdate(req.params.taskId, updates, { new: true })
      .populate("assignedTo", "fullName avatar").lean();
    res.json({ task });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث المهمة" });
  }
});

// ── STATS ─────────────────────────────────────────────────────────
projectsRouter.get("/stats/overview", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const [total, active, completed, overdue, byStage] = await Promise.all([
      ProjectModel.countDocuments(),
      ProjectModel.countDocuments({ status: "active" }),
      ProjectModel.countDocuments({ status: "completed" }),
      ProjectModel.countDocuments({ status: "active", dueDate: { $lt: new Date() } }),
      ProjectModel.aggregate([{ $group: { _id: "$stage", count: { $sum: 1 } } }]),
    ]);
    res.json({ total, active, completed, overdue, byStage });
  } catch {
    res.status(500).json({ error: "خطأ في إحصائيات المشاريع" });
  }
});
