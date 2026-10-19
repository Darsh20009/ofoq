import type { Request, Response, NextFunction } from "express";
import { isDBConnected } from "../db.js";

export interface PlatformMaintenanceState {
  enabled: boolean;
  messageAr: string;
  messageEn: string;
  updatedAt?: string;
}

const DEFAULT_STATE: PlatformMaintenanceState = {
  enabled: false,
  messageAr: "الموقع موقوف مؤقتاً لانتهاء الاشتراك أو لعدم سداد الرسوم. يرجى التواصل مع الإدارة.",
  messageEn: "The website is temporarily unavailable because the subscription has ended or fees are overdue. Please contact the administrator.",
};

let cachedState = DEFAULT_STATE;
let cacheExpiresAt = 0;
const CACHE_MS = 1500;

export async function getPlatformMaintenanceState(force = false): Promise<PlatformMaintenanceState> {
  if (!isDBConnected()) return cachedState;
  if (!force && Date.now() < cacheExpiresAt) return cachedState;

  try {
    const { SystemSettingsModel } = await import("../models/index.js");
    const row = await SystemSettingsModel.findOne({ key: "platformMaintenance" }).lean();
    const value = row?.value;
    cachedState = {
      ...DEFAULT_STATE,
      ...(value && typeof value === "object" ? value : {}),
      enabled: value?.enabled === true,
      updatedAt: row?.updatedAt ? new Date(row.updatedAt).toISOString() : undefined,
    };
    cacheExpiresAt = Date.now() + CACHE_MS;
  } catch {
    // Keep the last confirmed state if a transient database error occurs.
  }
  return cachedState;
}

export function invalidatePlatformMaintenanceCache(): void {
  cacheExpiresAt = 0;
}

function isOwnerPath(path: string): boolean {
  return path === "/qiroxstudio" || path.startsWith("/qiroxstudio/") ||
    path === "/api/qirox-owner" || path.startsWith("/api/qirox-owner/");
}

function isStaticAsset(path: string): boolean {
  if (path.startsWith("/uploads/")) return false;
  if (path.startsWith("/assets/") || path.startsWith("/dist/assets/") ||
      path.startsWith("/icons/") || path.startsWith("/fonts/")) return true;
  return /\.(?:js|css|map|woff2?|ttf|otf|svg|png|jpe?g|webp|ico)$/i.test(path);
}

export async function enforcePlatformMaintenance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (isOwnerPath(req.path)) {
    next();
    return;
  }

  const state = await getPlatformMaintenanceState();
  if (!state.enabled) {
    next();
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  if (req.path.startsWith("/api/")) {
    res.status(503).json({
      error: state.messageAr,
      code: "PLATFORM_MAINTENANCE",
      maintenance: true,
      messageAr: state.messageAr,
      messageEn: state.messageEn,
    });
    return;
  }

  if (req.path === "/api/health" || isStaticAsset(req.path)) {
    next();
    return;
  }

  const language = (req.acceptsLanguages("ar", "en") || "ar") === "en" ? "en" : "ar";
  const message = language === "en" ? state.messageEn : state.messageAr;
  res.status(503).type("html").send(`<!doctype html>
<html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>الموقع تحت الصيانة</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f8;color:#182132;font-family:Arial,sans-serif;padding:24px;box-sizing:border-box}.box{max-width:620px;text-align:center;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:40px 30px}h1{font-size:24px;margin:0 0 14px}p{line-height:1.9;color:#525b68;margin:0}</style></head>
<body><main class="box"><h1>${language === "ar" ? "الموقع تحت الصيانة" : "Website under maintenance"}</h1><p>${escapeHtml(message)}</p></main></body></html>`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char] || char);
}
