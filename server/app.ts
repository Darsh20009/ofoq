import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import passport from "./passport.js";
import { loginLimiter, globalLimiter } from "./middleware/rateLimiter.js";
import { registerRoutes } from "./routes/index.js";
import { isDBConnected } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

// ── Trust Proxy (required for Replit + rate limiting) ─────────────
app.set("trust proxy", 1);

// ── Security Headers ─────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "ws:"],
      frameSrc: ["'self'", "https://accounts.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ─────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.APP_URL,                       // e.g. https://ofoqhc.com
  process.env.EMPLOYEE_URL,                  // e.g. https://employee.ofoqhc.com
  "https://employee.ofoqhc.com",             // hardcoded fallback
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null,
].filter((o): o is string => Boolean(o));

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    // Explicit allowlist
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Allow all *.ofoqhc.com subdomains in production
    const originHost = origin.replace(/:\d+$/, "").replace(/^https?:\/\//, "");
    if (originHost.endsWith(".ofoqhc.com")) return cb(null, true);
    // Allow all *.replit.dev origins in development
    if (process.env.NODE_ENV !== "production" && originHost.endsWith(".replit.dev")) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ── Compression ──────────────────────────────────────────────────
app.use(compression());

// ── Body Parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Logging ──────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ── Sessions ─────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || "";
const SESSION_SECRET = (() => {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      console.error("❌ SESSION_SECRET is required in production. Exiting.");
      process.exit(1);
    }
    console.warn("⚠️  SESSION_SECRET not set — using dev fallback. Set it before production.");
    return "ofoq-dev-only-session-secret-CHANGE-BEFORE-PROD";
  }
  return s;
})();
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MONGO_URI
    ? MongoStore.create({ mongoUrl: MONGO_URI, ttl: 7 * 24 * 60 * 60 })
    : undefined,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}) as any);

// ── Passport (OAuth handshake only — JWTs are used for actual sessions) ──
app.use(passport.initialize() as any);

// ── Rate Limiting ────────────────────────────────────────────────
app.use(globalLimiter as any);

// ── Static Files ─────────────────────────────────────────────────
// uploads: no-cache (user content changes)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"), {
  maxAge: 0,
  setHeaders: (res) => res.setHeader("Cache-Control", "no-cache"),
}));
// The approved About-section portrait is kept as the original uploaded asset.
app.get("/images/about-person.png", (_req, res) => {
  res.sendFile(path.join(
    process.cwd(),
    "attached_assets",
    "Screenshot_1448-03-08_at_7.46.23_PM_1787330808736.png",
  ));
});
// public (icons, images, manifest): long-lived cache — 30 days
const publicDir = path.join(process.cwd(), "public");
const PUBLIC_CACHE = { maxAge: "30d", immutable: false } as const;
app.use(express.static(publicDir, PUBLIC_CACHE));
app.use("/public", express.static(publicDir, PUBLIC_CACHE));

// Vite hashed assets (dist/assets/*.js, *.css) — 1 year, immutable
app.use(
  "/dist/assets",
  express.static(path.join(process.cwd(), "public", "dist", "assets"), {
    maxAge: "1y",
    immutable: true,
  })
);

// ── Routes ───────────────────────────────────────────────────────
// Fail fast and consistently when MongoDB is not ready. This prevents every
// authenticated/data request from reaching Mongoose's buffering queue.
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/auth/status") return next();
  if (!isDBConnected()) {
    res.status(503).json({ error: "قاعدة البيانات غير متاحة حالياً. حاول مرة أخرى بعد قليل." });
    return;
  }
  next();
});
registerRoutes(app);

// ── Serve Frontend ────────────────────────────────────────────────
const clientDist = path.join(process.cwd(), "public", "dist");

if (process.env.NODE_ENV !== "production") {
  // Development: proxy everything (except /api, /uploads, /public, /ws)
  // to the Vite dev server running on port 5000.
  // IMPORTANT: never proxy /api here — unmatched API paths must 404,
  // otherwise they bounce between Vite and this server in an infinite loop.
  const { createProxyMiddleware } = await import("http-proxy-middleware");
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  app.use(
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
      ws: false, // WebSocket handled separately on /ws
      on: {
        error: (_err, _req, res) => {
          (res as express.Response).status(502).send("Frontend dev server not ready — ensure OFOQ Frontend workflow is running.");
        },
      },
    })
  );
} else {
  // Production: serve built files
  app.use(express.static(clientDist));

  // ── OG Meta Tag Injection by Subdomain ───────────────────────
  const indexHtmlPath = path.join(clientDist, "index.html");

  function buildOgMeta(opts: {
    title: string; description: string; url: string;
    image?: string; siteName?: string;
  }): string {
    const img = opts.image || "https://www.ofoqhc.com/icons/og-image.png";
    return [
      `<meta property="og:title" content="${opts.title}" />`,
      `<meta property="og:description" content="${opts.description}" />`,
      `<meta property="og:url" content="${opts.url}" />`,
      `<meta property="og:image" content="${img}" />`,
      `<meta property="og:image:width" content="1024" />`,
      `<meta property="og:image:height" content="1024" />`,
      `<meta property="og:site_name" content="${opts.siteName || "أفق لحلول الأعمال"}" />`,
      `<meta name="twitter:title" content="${opts.title}" />`,
      `<meta name="twitter:description" content="${opts.description}" />`,
      `<meta name="twitter:image" content="${img}" />`,
    ].join("\n    ");
  }

  const OG_BY_SUBDOMAIN: Record<string, ReturnType<typeof buildOgMeta>> = {
    employee: buildOgMeta({
      title: "بوابة موظفي أفق | OFOQ Employee Portal",
      description: "بوابة الموظفين الرسمية لشركة أفق لحلول الأعمال — عرض بطاقة الموظف وبياناتك.",
      url: "https://employee.ofoqhc.com/",
      image: "https://www.ofoqhc.com/icons/og-image.png",
      siteName: "أفق — بوابة الموظفين",
    }),
    client: buildOgMeta({
      title: "بوابة عملاء أفق | OFOQ Client Portal",
      description: "تابع طلبات خدماتك، راسل الفريق، وتابع مستجدات مشاريعك مع أفق لحلول الأعمال.",
      url: "https://www.ofoqhc.com/client/",
      image: "https://www.ofoqhc.com/icons/og-image.png",
      siteName: "أفق — بوابة العملاء",
    }),
  };

  // Pattern to replace OG block in index.html
  const OG_PATTERN = /<meta property="og:title[\s\S]*?(?=<\/head>)/;

  app.get("*", (req: express.Request, res: express.Response) => {
    if (!fs.existsSync(indexHtmlPath)) {
      res.status(200).json({
        status: "online", app: "OFOQ Business Solutions", version: "1.0.0",
        message: "Frontend not built yet. API is ready.",
      });
      return;
    }

    let html = fs.readFileSync(indexHtmlPath, "utf-8");

    // Detect subdomain from Host header
    const host = req.headers.host || "";
    const subdomain = host.split(".")[0].toLowerCase();
    const ogBlock = OG_BY_SUBDOMAIN[subdomain];

    if (ogBlock) {
      // Replace all og: and twitter: meta tags with subdomain-specific ones
      html = html
        .replace(/<meta property="og:[^"]*"[^>]*\/>/g, "")
        .replace(/<meta name="twitter:[^"]*"[^>]*\/>/g, "")
        .replace("<!-- ══ Open Graph / Facebook ═", `<!-- ══ Open Graph / Facebook ═\n    ${ogBlock}\n    <!--`)
        .replace("<!-- ══ Twitter / X Card", "<!--");
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(html);
  });
}

// ── Error Handler ────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err?.message || err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "خطأ في الخادم";
  res.status(status).json({ error: message, code: status });
});
