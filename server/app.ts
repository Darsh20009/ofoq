import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import MongoStore from "connect-mongo";
import passport from "./passport.js";
import { loginLimiter, globalLimiter } from "./middleware/rateLimiter.js";
import { registerRoutes } from "./routes/index.js";

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
}));

// ── Passport (OAuth handshake only — JWTs are used for actual sessions) ──
app.use(passport.initialize());

// ── Rate Limiting ────────────────────────────────────────────────
app.use(globalLimiter);

// ── Static Files ─────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Serve public/ at both /public/ prefix AND root so robots.txt, sitemap.xml,
// manifest.json, icons etc. are accessible at their canonical paths.
const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir));
app.use("/public", express.static(publicDir));

// ── Routes ───────────────────────────────────────────────────────
registerRoutes(app);

// ── Serve Frontend ────────────────────────────────────────────────
const clientDist = path.join(process.cwd(), "public", "dist");

if (process.env.NODE_ENV !== "production") {
  // Development: proxy everything (except /api, /uploads, /public, /ws)
  // to the Vite dev server running on port 3000
  const { createProxyMiddleware } = await import("http-proxy-middleware");
  app.use(
    createProxyMiddleware({
      target: "http://127.0.0.1:3000",
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
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) {
        res.status(200).json({
          status: "online",
          app: "OFOQ Business Solutions",
          version: "1.0.0",
          message: "Frontend not built yet. API is ready.",
        });
      }
    });
  });
}

// ── Error Handler ────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err?.message || err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "خطأ في الخادم";
  res.status(status).json({ error: message, code: status });
});
