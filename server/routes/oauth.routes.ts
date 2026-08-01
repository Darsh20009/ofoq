import { Router } from "express";
import passport, { googleEnabled, appleEnabled } from "../passport.js";
import { signToken, logAction } from "../auth.js";

export const oauthRouter = Router();

const APP_URL = process.env.APP_URL || "http://localhost:5000";

function issueAndRedirect(req: any, res: any) {
  const user = req.user;
  if (!user) {
    res.redirect(`${APP_URL}/admin/login?error=oauth_failed`);
    return;
  }
  const token = signToken({ userId: String(user._id), role: user.role, email: user.email });
  logAction(String(user._id), "login_oauth", "User", String(user._id), req);
  // Hand the token to the SPA via a short redirect — the frontend route
  // /admin/oauth/callback reads it from the query string and stores it, then
  // navigates to the dashboard.
  res.redirect(`${APP_URL}/admin/oauth/callback?token=${token}`);
}

// ── Google ─────────────────────────────────────────────────────────
oauthRouter.get("/google", (req, res, next) => {
  if (!googleEnabled) {
    res.status(503).json({ error: "تسجيل الدخول عبر Google غير مُفعّل حالياً" });
    return;
  }
  passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

oauthRouter.get(
  "/google/callback",
  (req, res, next) => {
    if (!googleEnabled) {
      res.redirect(`${APP_URL}/admin/login?error=oauth_not_configured`);
      return;
    }
    passport.authenticate("google", { session: false, failureRedirect: `${APP_URL}/admin/login?error=oauth_failed` })(req, res, next);
  },
  issueAndRedirect
);

// ── Apple ──────────────────────────────────────────────────────────
oauthRouter.get("/apple", (req, res, next) => {
  if (!appleEnabled) {
    res.status(503).json({ error: "تسجيل الدخول عبر Apple غير مُفعّل حالياً" });
    return;
  }
  passport.authenticate("apple", { session: false })(req, res, next);
});

// Apple posts the result back as x-www-form-urlencoded (form_post response mode)
oauthRouter.post(
  "/apple/callback",
  (req, res, next) => {
    if (!appleEnabled) {
      res.redirect(`${APP_URL}/admin/login?error=oauth_not_configured`);
      return;
    }
    passport.authenticate("apple", { session: false, failureRedirect: `${APP_URL}/admin/login?error=oauth_failed` })(req, res, next);
  },
  issueAndRedirect
);

oauthRouter.get("/status", (_req, res) => {
  res.json({ google: googleEnabled, apple: appleEnabled });
});
