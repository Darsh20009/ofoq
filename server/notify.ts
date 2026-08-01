// ──────────────────────────────────────────────────────────────────
// OFOQ Universal Notification Hub
// Single entry point for every notification across the system.
//
//                       fireNotify()
//                       /    |    \
//                      DB    WS   Push
//
//   Layer 1 — MongoDB           : persists (always)
//   Layer 2 — WebSocket         : instant in-app if user is online
//   Layer 3 — Web Push (VAPID)  : wakes device even if app is closed
// ──────────────────────────────────────────────────────────────────

import { pushToUser } from "./ws.js";
import { sendPushToUser } from "./push.js";

export type NotifyType =
  | "info" | "success" | "warning" | "error"
  | "message" | "order" | "status" | "project"
  | "task" | "auth" | "payment";

export interface NotifyOptions {
  type?: NotifyType;
  link?: string;
  icon?: string;
  tag?: string;
  image?: string;
  highPriority?: boolean;
  requireInteraction?: boolean;
}

const HIGH_PRIORITY_TYPES = new Set<NotifyType>(["message", "auth", "payment", "error"]);
const STICKY_TYPES = new Set<NotifyType>(["auth", "payment"]);

function pickIcon(type: NotifyType, fallback?: string): string {
  if (fallback) return fallback;
  const icons: Record<NotifyType, string> = {
    success: "✅", warning: "⚠️", error: "❌", message: "💬",
    order: "📦", status: "📋", project: "🗂️", task: "✔️",
    auth: "🔐", payment: "💳", info: "🔔",
  };
  return icons[type] || "🔔";
}

/**
 * Fire a notification to a single user — all 3 layers simultaneously.
 * Never throws — failures in any layer are swallowed and logged.
 */
export async function fireNotify(
  userId: string,
  title: string,
  body: string,
  opts: NotifyOptions = {}
): Promise<void> {
  if (!userId || userId === "undefined" || userId === "null") return;

  const type = opts.type || "info";
  const link = opts.link || "/dashboard";
  const icon = pickIcon(type, opts.icon);
  const tag = opts.tag || `notif-${type}-${Date.now()}`;
  const high = opts.highPriority ?? HIGH_PRIORITY_TYPES.has(type);
  const sticky = opts.requireInteraction ?? STICKY_TYPES.has(type);

  // ── Layer 1: persist in MongoDB ───────────────────────────────
  try {
    const { NotificationModel } = await import("./models/index.js");
    await NotificationModel.create({ userId, type, title, body, link, icon });
  } catch (err: any) {
    console.error("[Notify] DB persist failed:", err?.message);
  }

  // ── Layer 2: WebSocket (if app open) ─────────────────────────
  try {
    pushToUser(userId, { type: "notification", title, body, link, icon, notifType: type });
  } catch (err: any) {
    console.error("[Notify] WS push failed:", err?.message);
  }

  // ── Layer 3: Web Push (device wake-up) ───────────────────────
  if (high) {
    try {
      await sendPushToUser(userId, {
        title,
        body,
        icon,
        tag,
        requireInteraction: sticky,
        data: { url: link },
      });
    } catch (err: any) {
      console.error("[Notify] Push failed:", err?.message);
    }
  }
}

/**
 * Fire a notification to all admins and managers simultaneously.
 */
export async function fireNotifyAdmins(
  title: string,
  body: string,
  opts: NotifyOptions = {}
): Promise<void> {
  try {
    const { UserModel } = await import("./models/index.js");
    const admins = await UserModel.find({
      role: { $in: ["super_admin", "admin", "manager"] },
      status: "active",
    }).select("_id").lean();

    await Promise.allSettled(
      admins.map((admin) => fireNotify(String(admin._id), title, body, opts))
    );
  } catch (err: any) {
    console.error("[Notify] fireNotifyAdmins failed:", err?.message);
  }
}

/**
 * Fire a notification to a list of user IDs.
 */
export async function fireNotifyMany(
  userIds: string[],
  title: string,
  body: string,
  opts: NotifyOptions = {}
): Promise<void> {
  await Promise.allSettled(
    userIds.map((uid) => fireNotify(uid, title, body, opts))
  );
}
