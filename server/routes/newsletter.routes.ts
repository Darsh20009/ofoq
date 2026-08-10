import { Router } from "express";
import { NewsletterSubscriberModel } from "../models/NewsletterSubscriber.js";
import { requireAuth, requireRole } from "../auth.js";
import { sendNewsletterWelcome } from "../email.js";

export const newsletterRouter = Router();

// Public: subscribe
newsletterRouter.post("/subscribe", async (req, res) => {
  try {
    const { email, lang = "ar" } = req.body as { email: string; lang?: string };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "بريد إلكتروني غير صالح" });
      return;
    }

    const existing = await NewsletterSubscriberModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.active) {
        res.status(409).json({ error: "مشترك بالفعل", alreadySubscribed: true });
        return;
      }
      // Re-activate
      existing.active = true;
      existing.subscribedAt = new Date();
      await existing.save();
    } else {
      await NewsletterSubscriberModel.create({ email: email.toLowerCase(), lang });
    }

    // Fire and forget — don't block response on email
    sendNewsletterWelcome(email, lang).catch(() => {});

    res.json({ success: true });
  } catch (err: any) {
    console.error("[Newsletter] Subscribe error:", err.message);
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Admin: list all subscribers
newsletterRouter.get(
  "/subscribers",
  requireAuth, requireRole("admin", "super_admin"),
  async (_req, res) => {
    try {
      const subs = await NewsletterSubscriberModel.find({})
        .sort({ subscribedAt: -1 })
        .lean();
      res.json({ data: { subscribers: subs, total: subs.length } });
    } catch {
      res.status(500).json({ error: "خطأ في جلب المشتركين" });
    }
  }
);

// Admin: unsubscribe (deactivate)
newsletterRouter.delete(
  "/subscribers/:id",
  requireAuth, requireRole("admin", "super_admin"),
  async (req, res) => {
    try {
      await NewsletterSubscriberModel.findByIdAndUpdate(req.params.id, { active: false });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "خطأ في إلغاء الاشتراك" });
    }
  }
);
