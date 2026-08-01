import { Router } from "express";
import { requireAuth, requireRole } from "../auth.js";
import { LeadModel, CustomerModel, ProjectModel, InvoiceModel, UserModel, TaskModel } from "../models/index.js";
import { aiService } from "../services/ai.service.js";

export const analyticsRouter = Router();

// ── Dashboard Overview ───────────────────────────────────────────
analyticsRouter.get("/dashboard", requireAuth, requireRole("super_admin", "admin", "manager"), async (_req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalLeads, newLeadsThisMonth, wonLeadsThisMonth,
      totalCustomers, activeCustomers, newCustomersThisMonth,
      totalProjects, activeProjects, completedProjects,
      totalRevenue, thisMonthRevenue,
      overdueTasks, totalUsers,
      recentLeads, recentProjects,
    ] = await Promise.all([
      LeadModel.countDocuments(),
      LeadModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      LeadModel.countDocuments({ status: "won", updatedAt: { $gte: startOfMonth } }),
      CustomerModel.countDocuments(),
      CustomerModel.countDocuments({ status: "active" }),
      CustomerModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ProjectModel.countDocuments(),
      ProjectModel.countDocuments({ status: "active" }),
      ProjectModel.countDocuments({ status: "completed" }),
      InvoiceModel.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      InvoiceModel.aggregate([
        { $match: { status: "paid", paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      TaskModel.countDocuments({ status: { $ne: "done" }, dueDate: { $lt: now } }),
      UserModel.countDocuments({ role: { $in: ["super_admin", "admin", "manager", "employee"] } }),
      LeadModel.find().sort({ createdAt: -1 }).limit(5)
        .populate("assignedTo", "fullName avatar").lean(),
      ProjectModel.find({ status: "active" }).sort({ updatedAt: -1 }).limit(5)
        .populate("customerId", "name companyName")
        .populate("manager", "fullName avatar").lean(),
    ]);

    // AI insight (hidden — appears as smart system suggestions)
    const insights = await aiService.getDashboardInsights({
      totalLeads, wonLeadsThisMonth, activeProjects, totalRevenue: totalRevenue[0]?.total || 0
    }).catch(() => []);

    res.json({
      leads: { total: totalLeads, thisMonth: newLeadsThisMonth, won: wonLeadsThisMonth },
      customers: { total: totalCustomers, active: activeCustomers, newThisMonth: newCustomersThisMonth },
      projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
      revenue: { total: totalRevenue[0]?.total || 0, thisMonth: thisMonthRevenue[0]?.total || 0 },
      tasks: { overdue: overdueTasks },
      team: { total: totalUsers },
      recentLeads,
      recentProjects,
      insights, // AI-powered insights, shown as system suggestions
    });
  } catch (err: any) {
    console.error("[Analytics]", err.message);
    res.status(500).json({ error: "خطأ في إحصائيات لوحة القيادة" });
  }
});

// ── Revenue Chart ─────────────────────────────────────────────────
analyticsRouter.get("/revenue", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { period = "12" } = req.query; // months
    const months = parseInt(String(period));
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const revenue = await InvoiceModel.aggregate([
      { $match: { status: "paid", paidAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: "$paidAt" }, month: { $month: "$paidAt" } },
          total: { $sum: "$total" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({ revenue });
  } catch {
    res.status(500).json({ error: "خطأ في بيانات الإيرادات" });
  }
});

// ── Leads Funnel ─────────────────────────────────────────────────
analyticsRouter.get("/leads-funnel", requireAuth, requireRole("super_admin", "admin", "manager"), async (_req, res) => {
  try {
    const funnel = await LeadModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$estimatedValue" } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ funnel });
  } catch {
    res.status(500).json({ error: "خطأ في بيانات قمع المبيعات" });
  }
});

// ── Projects by Stage ────────────────────────────────────────────
analyticsRouter.get("/projects-stages", requireAuth, requireRole("super_admin", "admin", "manager"), async (_req, res) => {
  try {
    const stages = await ProjectModel.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ stages });
  } catch {
    res.status(500).json({ error: "خطأ في بيانات مراحل المشاريع" });
  }
});
