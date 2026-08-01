/**
 * OFOQ Service Worker
 * Handles Web Push notifications and PWA caching
 */

const CACHE_NAME = "ofoq-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ── Install ───────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS.filter(Boolean)))
  );
  self.skipWaiting();
});

// ── Activate ──────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch (Network first, fallback cache) ─────────────────────────
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Don't cache API calls or WebSocket
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/ws")) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok && event.request.method === "GET") {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Push Notification ─────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "أفق", body: event.data.text() };
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: data.tag || `ofoq-${Date.now()}`,
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    data: data.data || { url: "/dashboard" },
    actions: [
      { action: "open", title: "فتح" },
      { action: "dismiss", title: "رفض" },
    ],
    dir: "rtl",
    lang: "ar",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "أفق لحلول الأعمال", options)
  );
});

// ── Notification Click ────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ── Background Sync ───────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-notifications") {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  try {
    const response = await fetch("/api/users/me/notifications?unread=true");
    if (response.ok) {
      const data = await response.json();
      if (data.unreadCount > 0) {
        self.registration.showNotification("أفق", {
          body: `لديك ${data.unreadCount} إشعار غير مقروء`,
          icon: "/icons/icon-192x192.png",
          tag: "sync-notif",
        });
      }
    }
  } catch {}
}
