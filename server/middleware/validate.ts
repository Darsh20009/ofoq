import { z, ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      res.status(400).json({ error: "بيانات غير صحيحة", errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

// ── Common Schemas ───────────────────────────────────────────────
export const registerSchema = z.object({
  fullName: z.string().min(2, "الاسم مطلوب").max(100),
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  phone: z.string().optional(),
  lang: z.enum(["ar", "en"]).default("ar"),
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
  newPassword: z.string().min(8, "كلمة المرور الجديدة 8 أحرف على الأقل"),
});

export const leadSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(["website", "social", "referral", "cold_call", "email", "event", "partner", "other"]).default("website"),
  interestedServices: z.array(z.string()).default([]),
  estimatedValue: z.number().optional(),
  currency: z.string().default("SAR"),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export const projectSchema = z.object({
  name: z.string().min(2, "اسم المشروع مطلوب"),
  customerId: z.string().min(1, "العميل مطلوب"),
  serviceId: z.string().optional(),
  manager: z.string().min(1, "المدير مطلوب"),
  team: z.array(z.string()).default([]),
  budget: z.number().optional(),
  currency: z.string().default("SAR"),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  tags: z.array(z.string()).default([]),
});

export const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  company: z.string().optional(),
  serviceInterest: z.string().optional(),
  interest: z.string().optional(),   // alias sent by public contact form
  sector: z.string().optional(),     // sent by public contact form
  message: z.string().min(10, "الرسالة قصيرة جداً").max(2000),
});
