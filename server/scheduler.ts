/**
 * OFOQ Background Scheduler
 * Runs periodic background tasks: cleanup, AI analysis, health checks.
 */

import schedule from "node-schedule";
import { aiService } from "./services/ai.service.js";

export function startScheduler(): void {
  console.log("⏰ Background scheduler started");

  // ── Every day at 8am: AI re-score active leads ─────────────
  schedule.scheduleJob("0 8 * * *", async () => {
    try {
      const { LeadModel } = await import("./models/index.js");
      const leads = await LeadModel.find({
        status: { $nin: ["won", "lost", "inactive"] }
      }).select("_id").lean();

      for (const lead of leads) {
        await aiService.scoreLead(String(lead._id));
        await new Promise((r) => setTimeout(r, 200)); // throttle
      }
      console.log(`[Scheduler] AI scored ${leads.length} leads`);
    } catch (err: any) {
      console.error("[Scheduler] Lead scoring error:", err.message);
    }
  });

  // ── Every day at 9am: Mark overdue invoices ──────────────────
  schedule.scheduleJob("0 9 * * *", async () => {
    try {
      const { InvoiceModel } = await import("./models/index.js");
      const { fireNotifyAdmins } = await import("./notify.js");

      const overdue = await InvoiceModel.updateMany(
        { status: { $in: ["sent", "viewed", "partial"] }, dueDate: { $lt: new Date() } },
        { status: "overdue" }
      );

      if (overdue.modifiedCount > 0) {
        await fireNotifyAdmins(
          "فواتير متأخرة",
          `${overdue.modifiedCount} فاتورة متأخرة تحتاج متابعة`,
          { type: "payment", link: "/admin/invoices?status=overdue" }
        );
      }
    } catch (err: any) {
      console.error("[Scheduler] Invoice overdue error:", err.message);
    }
  });

  // ── Every day at 10am: Follow-up reminders ───────────────────
  schedule.scheduleJob("0 10 * * *", async () => {
    try {
      const { LeadModel, UserModel } = await import("./models/index.js");
      const { fireNotify } = await import("./notify.js");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const leads = await LeadModel.find({
        nextFollowUp: { $gte: today, $lt: tomorrow },
        status: { $nin: ["won", "lost"] },
      }).populate("assignedTo", "email").lean();

      for (const lead of leads) {
        if (lead.assignedTo) {
          await fireNotify(
            String((lead.assignedTo as any)._id),
            "تذكير متابعة",
            `موعد المتابعة مع ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
            { type: "task", link: `/admin/crm/leads/${lead._id}` }
          );
        }
      }
    } catch (err: any) {
      console.error("[Scheduler] Follow-up reminder error:", err.message);
    }
  });

  // ── Every week Sunday: Update customer health scores ─────────
  schedule.scheduleJob("0 0 * * 0", async () => {
    try {
      const { CustomerModel } = await import("./models/index.js");
      const customers = await CustomerModel.find({ status: "active" }).select("_id").lean();
      for (const customer of customers) {
        await aiService.updateCustomerHealth(String(customer._id));
        await new Promise((r) => setTimeout(r, 100));
      }
      console.log(`[Scheduler] Updated health for ${customers.length} customers`);
    } catch (err: any) {
      console.error("[Scheduler] Customer health error:", err.message);
    }
  });

  // ── Every hour: Analyze active project risks ──────────────────
  schedule.scheduleJob("0 * * * *", async () => {
    try {
      const { ProjectModel } = await import("./models/index.js");
      const projects = await ProjectModel.find({
        status: "active",
        dueDate: { $exists: true },
      }).select("_id").lean();

      for (const project of projects) {
        await aiService.analyzeProjectRisk(String(project._id));
        await new Promise((r) => setTimeout(r, 100));
      }
    } catch {}
  });
}
