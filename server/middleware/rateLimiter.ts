import rateLimit from "express-rate-limit";

// Global limiter — 200 requests per 15 min per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "طلبات كثيرة جداً، يُرجى الانتظار قليلاً" },
  skip: (req) => req.path.startsWith("/uploads") || req.path.startsWith("/public"),
});

// Login limiter — 10 attempts per 15 min
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "محاولات دخول كثيرة، حاول مجدداً بعد 15 دقيقة" },
});

// OTP limiter — 5 per hour
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد الرموز المسموح به، حاول مجدداً بعد ساعة" },
});

// Register limiter — 5 per hour
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تجاوزت حد التسجيل المسموح به" },
});

// Contact limiter — 3 per hour
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "رسائل كثيرة جداً، حاول مجدداً لاحقاً" },
});
