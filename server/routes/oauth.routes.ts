import { Router } from "express";
import passport, { googleEnabled, appleEnabled } from "../passport.js";
import { signToken, logAction } from "../auth.js";

export const oauthRouter = Router();

// OAuth callbacks and their final redirects must stay on the deployed API
// service. APP_URL may point to a separate marketing domain. The production
// API is currently served from www.ofoqhc.com.
const OAUTH_BASE_URL = (
  process.env.OAUTH_BASE_URL ||
  "https://www.ofoqhc.com"
).replace(/\/$/, "");

function safeClientRedirect(value: unknown): string {
  const redirect = typeof value === "string" ? value : "";
  return redirect.startsWith("/client/") && !redirect.startsWith("//")
    ? redirect
    : "/client/dashboard";
}

function buildOAuthState(audience: "admin" | "client", redirect?: string): string {
  return audience === "client"
    ? `client:${encodeURIComponent(safeClientRedirect(redirect))}`
    : "admin";
}

function getOAuthContext(req: any): { audience: "admin" | "client"; redirect: string } {
  const rawState = String(req.query?.state || req.body?.state || "");
  if (!rawState.startsWith("client:")) {
    return { audience: "admin", redirect: "/admin" };
  }
  return {
    audience: "client",
    redirect: safeClientRedirect(decodeURIComponent(rawState.slice("client:".length))),
  };
}

function oauthFailureRedirect(req: any): string {
  const context = getOAuthContext(req);
  return context.audience === "client"
    ? `${OAUTH_BASE_URL}/client/login?error=oauth_failed`
    : `${OAUTH_BASE_URL}/admin/login?error=oauth_failed`;
}

function issueAndRedirect(req: any, res: any) {
  const user = req.user;
  const context = getOAuthContext(req);
  if (!user) {
    res.redirect(oauthFailureRedirect(req));
    return;
  }
  const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
  logAction(String(user._id), "login_oauth", "User", String(user._id), req);
  const callbackPath = context.audience === "client"
    ? `/client/oauth/callback?token=${encodeURIComponent(token)}&redirect=${encodeURIComponent(context.redirect)}`
    : `/admin/oauth/callback?token=${encodeURIComponent(token)}`;
  res.redirect(`${OAUTH_BASE_URL}${callbackPath}`);
}

// ── Google ─────────────────────────────────────────────────────────
oauthRouter.get("/google", (req, res, next) => {
  if (!googleEnabled) {
    res.redirect(`${OAUTH_BASE_URL}/admin/login?error=oauth_not_configured`);
    return;
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: buildOAuthState("admin"),
    session: false,
  })(req, res, next);
});

oauthRouter.get(
  "/google/callback",
  (req, res, next) => {
    if (!googleEnabled) {
      res.redirect(oauthFailureRedirect(req));
      return;
    }
    passport.authenticate("google", { session: false, failureRedirect: oauthFailureRedirect(req) })(req, res, next);
  },
  issueAndRedirect
);

oauthRouter.get("/client/google", (req, res, next) => {
  if (!googleEnabled) {
    res.redirect(`${OAUTH_BASE_URL}/client/login?error=oauth_not_configured`);
    return;
  }
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: buildOAuthState("client", typeof req.query.redirect === "string" ? req.query.redirect : undefined),
    session: false,
  })(req, res, next);
});

// ── Apple ──────────────────────────────────────────────────────────
oauthRouter.get("/apple", (req, res, next) => {
  if (!appleEnabled) {
    res.redirect(`${OAUTH_BASE_URL}/admin/login?error=oauth_not_configured`);
    return;
  }
  passport.authenticate("apple", { state: buildOAuthState("admin"), session: false })(req, res, next);
});

// Apple posts the result back as x-www-form-urlencoded (form_post response mode)
oauthRouter.post(
  "/apple/callback",
  (req, res, next) => {
    if (!appleEnabled) {
      res.redirect(oauthFailureRedirect(req));
      return;
    }
    passport.authenticate("apple", { session: false, failureRedirect: oauthFailureRedirect(req) })(req, res, next);
  },
  issueAndRedirect
);

oauthRouter.get("/client/apple", (req, res, next) => {
  if (!appleEnabled) {
    res.redirect(`${OAUTH_BASE_URL}/client/login?error=oauth_not_configured`);
    return;
  }
  passport.authenticate("apple", {
    state: buildOAuthState("client", typeof req.query.redirect === "string" ? req.query.redirect : undefined),
    session: false,
  })(req, res, next);
});

oauthRouter.get("/status", (_req, res) => {
  res.json({ google: googleEnabled, apple: appleEnabled });
});
