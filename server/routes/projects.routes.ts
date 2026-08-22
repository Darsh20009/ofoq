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
    if (customerId) filter.customerId = customerId;
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
    const project = await ProjectModel.findById(req.params.id)
      .populate("customerId", "name companyName email phone")
      .populate("manager", "fullName avatar email")
      .populate("team", "fullName avatar email")
      .populate("serviceId", "titleAr title workflow")
      .populate("contractId", "contractNumber status value")
      .lean();
    if (!project) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }
    // Get tasks for this project
    const tasks = await TaskModel.find({ projectId: project._id })
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

    const projectNumber = await generateProjectNumber();
    const project = await ProjectModel.create({
      ...req.body,
      name: name.trim(),
      projectNumber,
      stageHistory: [{ stage: "request", changedAt: new Date(), changedBy: (req as any).user._id }],
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

projectsRouter.patch("/:id", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const old = await ProjectModel.findById(req.params.id);
    if (!old) {
      res.status(404).json({ error: "المشروع غير موجود" });
      return;
    }

    const updates: any = { ...req.body };

    // Stage change — add to history
    if (req.body.stage && req.body.stage !== old.stage) {
      updates.$push = {
        stageHistory: {
          stage: req.body.stage,
          changedAt: new Date(),
          changedBy: me._id,
          note: req.body.stageNote,
        },
      };
      delete updates.stageHistory;

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
      .populate("team", "fullName avatar").lean();

    await logAction(String(me._id), "update_project", "Project", req.params.id, req);
    res.json({ project });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث المشروع" });
  }
});

projectsRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    await ProjectModel.findByIdAndUpdate(req.params.id, { status: "cancelled" });
    await logAction(String((req as any).user._id), "cancel_project", "Project", req.params.id, req);
    res.json({ message: "تم إلغاء المشروع" });
  } catch {
    res.status(500).json({ error: "خطأ في إلغاء المشروع" });
  }
});

// ── TASKS ─────────────────────────────────────────────────────────
projectsRouter.get("/:id/tasks", requireAuth, async (req, res) => {
  try {
    const tasks = await TaskModel.find({ projectId: req.params.id })
      .populate("assignedTo", "fullName avatar")
      .populate("createdBy", "fullName avatar")
      .sort({ createdAt: -1 }).lean();
    res.json({ tasks });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المهام" });
  }
});

projectsRouter.post("/:id/tasks", requireAuth, async (req, res) => {
  try {
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

projectsRouter.patch("/tasks/:taskId", requireAuth, async (req, res) => {
  try {
    const updates: any = { ...req.body };
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
