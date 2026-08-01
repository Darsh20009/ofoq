import { WebSocket, WebSocketServer } from "ws";
import type { IncomingMessage } from "http";
import type { Server } from "http";
import jwt from "jsonwebtoken";

const userSockets = new Map<string, Set<WebSocket>>();

// ── Setup ─────────────────────────────────────────────────────────
export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    let userId: string | null = null;

    // Extract token from query string
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "ofoq-secret") as any;
        userId = decoded.userId || decoded.id;
        if (userId) {
          registerSocket(userId, ws);
          ws.send(JSON.stringify({ type: "connected", userId }));
        }
      } catch {
        ws.close(4001, "Invalid token");
        return;
      }
    }

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());
        handleWSMessage(userId, ws, msg);
      } catch {}
    });

    ws.on("close", () => {
      if (userId) unregisterSocket(userId, ws);
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err.message);
      if (userId) unregisterSocket(userId, ws);
    });
  });

  console.log("✅ WebSocket server ready on /ws");
  return wss;
}

function handleWSMessage(userId: string | null, ws: WebSocket, msg: any) {
  switch (msg.type) {
    case "ping":
      ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      break;
    case "typing":
      // Broadcast typing indicator to relevant users
      if (msg.toUserId) pushToUser(msg.toUserId, { type: "typing", fromUserId: userId });
      break;
  }
}

// ── Socket Management ─────────────────────────────────────────────
export function registerSocket(userId: string, ws: WebSocket) {
  const uid = String(userId);
  if (!userSockets.has(uid)) {
    userSockets.set(uid, new Set());
    broadcastToAll({ type: "user_online", userId: uid }, uid);
  }
  userSockets.get(uid)!.add(ws);
}

export function unregisterSocket(userId: string, ws: WebSocket) {
  const uid = String(userId);
  const sockets = userSockets.get(uid);
  if (!sockets) return;
  sockets.delete(ws);
  if (sockets.size === 0) {
    userSockets.delete(uid);
    broadcastToAll({ type: "user_offline", userId: uid }, uid);
  }
}

// ── Sending Utilities ─────────────────────────────────────────────
function sendTo(ws: WebSocket, payload: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

export function pushToUser(userId: string, payload: object) {
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  for (const ws of sockets) sendTo(ws, payload);
}

export function pushNotification(userId: string, payload: object) {
  pushToUser(userId, { type: "notification", ...payload });
}

export function broadcastNotification(payload: object) {
  for (const sockets of userSockets.values()) {
    for (const ws of sockets) sendTo(ws, { type: "notification", ...payload });
  }
}

export function broadcastToAll(payload: object, excludeUserId?: string) {
  for (const [uid, sockets] of userSockets.entries()) {
    if (excludeUserId && uid === excludeUserId) continue;
    for (const ws of sockets) sendTo(ws, payload);
  }
}

export function broadcastToUsers(userIds: string[], payload: object) {
  for (const uid of userIds) pushToUser(uid, payload);
}

export function getOnlineUsers(): string[] {
  return [...userSockets.keys()];
}

export function isUserOnline(userId: string): boolean {
  const sockets = userSockets.get(String(userId));
  return !!(sockets && sockets.size > 0);
}
