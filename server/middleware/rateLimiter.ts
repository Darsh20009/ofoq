import rateLimit from "express-rate-limit";

// Global limiter — applies to /api/* only
// 3000 req per 15 min per IP — covers heavy admin dashboard polling
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "طلبات كثيرة جداً، يُرجى الانتظار قليلاً" },
  // Skip static assets entirely; skip everything in development —
  // behind the Replit dev proxy all clients share one IP, so the
  // global bucket gets exhausted and every visitor sees 429s.
  skip: (req) =>
    process.env.NODE_ENV !== "production" ||
    req.path.startsWith("/uploads") ||
    req.path.startsWith("/public") ||
    req.path.startsWith("/images") ||
    req.path.startsWith("/icons") ||
    !req.path.startsWith("/api"),
});

// Login limiter — 30 attempts per 15 min (was 10 — too strict)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات دخول كثيرة، حاول مجدداً بعد 15 دقيقة" },
});

// OTP limiter — 20 per hour (was 5 — blocked normal use)
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد الرموز المسموح به، حاول مجدداً بعد ساعة" },
});

// Register limiter — 20 per hour
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد التسجيل المسموح به" },
});

// Contact limiter — 10 per hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "رسائل كثيرة جداً، حاول مجدداً لاحقاً" },
});

// Admin login limiter — stricter: 10 attempts per 15 min
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد محاولات دخول لوحة الإدارة، حاول مجدداً بعد 15 دقيقة" },
});

// 2FA verify limiter — 15 per 15 min per IP
export const twoFALimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد التحقق الثنائي، حاول مجدداً بعد 15 دقيقة" },
});

// Barcode/QR login limiter — 20 per 15 min
export const barcodeLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد محاولات دخول الباركود، حاول مجدداً بعد 15 دقيقة" },
});
