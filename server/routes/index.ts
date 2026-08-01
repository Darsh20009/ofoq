import type { Express } from "express";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { crmRouter } from "./crm.routes.js";
import { projectsRouter } from "./projects.routes.js";
import { servicesRouter } from "./services.routes.js";
import { cmsRouter } from "./cms.routes.js";
import { contactRouter } from "./contact.routes.js";
import { pushRouter } from "./push.routes.js";
import { analyticsRouter } from "./analytics.routes.js";
import { invoicesRouter } from "./invoices.routes.js";
import { contractsRouter } from "./contracts.routes.js";
import { oauthRouter } from "./oauth.routes.js";
import { webauthnRouter } from "./webauthn.routes.js";
import { employeeRouter } from "./employee.routes.js";
import { clientRouter } from "./client.routes.js";

export function registerRoutes(app: Express): void {
  const API = "/api";

  // ── Auth ──────────────────────────────────────────────────────
  app.use(`${API}/auth`, authRouter);
  app.use(`${API}/auth`, oauthRouter);
  app.use(`${API}/auth/webauthn`, webauthnRouter);

  // ── Users ─────────────────────────────────────────────────────
  app.use(`${API}/users`, usersRouter);

  // ── CRM (Leads + Customers) ───────────────────────────────────
  app.use(`${API}/crm`, crmRouter);

  // ── Projects + Tasks ──────────────────────────────────────────
  app.use(`${API}/projects`, projectsRouter);

  // ── Services ──────────────────────────────────────────────────
  app.use(`${API}/services`, servicesRouter);

  // ── CMS (Pages, Blog, Testimonials, Settings, Media) ─────────
  app.use(`${API}/cms`, cmsRouter);

  // ── Contact ───────────────────────────────────────────────────
  app.use(`${API}/contact`, contactRouter);

  // ── Web Push ──────────────────────────────────────────────────
  app.use(`${API}/push`, pushRouter);

  // ── Analytics + Dashboard ────────────────────────────────────
  app.use(`${API}/analytics`, analyticsRouter);

  // ── Invoices ──────────────────────────────────────────────────
  app.use(`${API}/invoices`, invoicesRouter);

  // ── Contracts ─────────────────────────────────────────────────
  app.use(`${API}/contracts`, contractsRouter);

  // ── Employee Card & Barcode ────────────────────────────────────
  app.use(`${API}/employee`, employeeRouter);

  // ── Client Portal & Service Requests ─────────────────────────
  app.use(`${API}/client`, clientRouter);

  // ── Health Check ─────────────────────────────────────────────
  app.get(`${API}/health`, (_req, res) => {
    res.json({
      status: "ok",
      app: "OFOQ Business Solutions",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });
}
