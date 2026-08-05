import webpush from "web-push";
import { PushSubscriptionModel } from "./models/index.js";

let vapidConfigured = false;

// ── VAPID Key Generation ─────────────────────────────────────────
export async function generateVapidKeys(): Promise<void> {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      `mailto:${process.env.CPANEL_SMTP_USER || "info@ofoq.sa"}`,
      publicKey,
      privateKey
    );
    vapidConfigured = true;
    console.log("✅ Web Push (VAPID) configured");
    return;
  }

  // Auto-generate keys if not set
  console.log("⚠️  VAPID keys not found. Generating new keys...");
  const keys = webpush.generateVAPIDKeys();
  // Do not print either generated key: the private key must never appear in
  // workflow logs. Persist both values in Replit/Render secrets for stable
  // subscriptions in production.
  console.log("→ Configure VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY as secrets for persistent push notifications");

  // Use generated keys for this session
  webpush.setVapidDetails(
    `mailto:${process.env.CPANEL_SMTP_USER || "info@ofoq.sa"}`,
    keys.publicKey,
    keys.privateKey
  );
  vapidConfigured = true;
}

export const VAPID_PUBLIC = () => process.env.VAPID_PUBLIC_KEY || "";

// ── Send Push to User ────────────────────────────────────────────
export async function sendPushToUser(
  userId: string,
  payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, any>;
    requireInteraction?: boolean;
  }
): Promise<void> {
  if (!vapidConfigured) return;

  try {
    const subscriptions = await PushSubscriptionModel.find({ userId }).lean();
    if (!subscriptions.length) return;

    const notification = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      tag: payload.tag || `notif-${Date.now()}`,
      requireInteraction: payload.requireInteraction || false,
      data: payload.data || { url: "/dashboard" },
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          notification
        )
      )
    );

    // Clean up expired subscriptions
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "rejected") {
        const err = result.reason as any;
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await PushSubscriptionModel.deleteOne({ endpoint: subscriptions[i].endpoint });
          console.log("[Push] Removed expired subscription");
        }
      }
    }
  } catch (err: any) {
    console.error("[Push] sendPushToUser error:", err.message);
  }
}

// ── Subscribe / Unsubscribe ──────────────────────────────────────
export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  deviceName?: string,
  userAgent?: string
): Promise<void> {
  await PushSubscriptionModel.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { userId, ...subscription, deviceName, userAgent },
    { upsert: true }
  );
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  await PushSubscriptionModel.deleteOne({ endpoint });
}
