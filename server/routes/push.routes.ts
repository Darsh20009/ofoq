import { Router } from "express";
import { requireAuth } from "../auth.js";
import { savePushSubscription, removePushSubscription, VAPID_PUBLIC } from "../push.js";
import { PushSubscriptionModel, UserModel } from "../models/index.js";

export const pushRouter = Router();

// ── Get VAPID Public Key ──────────────────────────────────────────
pushRouter.get("/vapid-key", (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC() });
});

// ── Subscribe ─────────────────────────────────────────────────────
pushRouter.post("/subscribe", requireAuth, async (req, res) => {
  try {
    const { endpoint, keys, deviceName } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: "بيانات الاشتراك غير مكتملة" });
      return;
    }
    const userId = String((req as any).user._id);
    await savePushSubscription(userId, { endpoint, keys }, deviceName, req.headers["user-agent"]);
    await UserModel.findByIdAndUpdate(userId, { pushEnabled: true });
    res.json({ message: "تم تفعيل الإشعارات" });
  } catch {
    res.status(500).json({ error: "خطأ في الاشتراك" });
  }
});

// ── Unsubscribe ───────────────────────────────────────────────────
pushRouter.post("/unsubscribe", requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await removePushSubscription(endpoint);
    } else {
      // Remove all subscriptions for user
      await PushSubscriptionModel.deleteMany({ userId: (req as any).user._id });
    }
    await UserModel.findByIdAndUpdate((req as any).user._id, { pushEnabled: false });
    res.json({ message: "تم إلغاء تفعيل الإشعارات" });
  } catch {
    res.status(500).json({ error: "خطأ في إلغاء الاشتراك" });
  }
});

// ── List User's Subscribed Devices ───────────────────────────────
pushRouter.get("/devices", requireAuth, async (req, res) => {
  try {
    const subs = await PushSubscriptionModel.find({ userId: (req as any).user._id })
      .select("deviceName userAgent createdAt").lean();
    res.json({ devices: subs });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الأجهزة" });
  }
});
