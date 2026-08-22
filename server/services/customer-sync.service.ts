import { CustomerModel } from "../models/index.js";

type CustomerUser = {
  _id: unknown;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

/**
 * Keeps every client account represented in the CRM.
 * Existing manually-created CRM records are linked by email instead of duplicated.
 */
export async function ensureCustomerForUser(user: CustomerUser) {
  const email = user.email.trim().toLowerCase();
  const existing = await CustomerModel.findOne({
    $or: [{ userId: user._id }, { email }],
  }).sort({ userId: -1, createdAt: 1 });

  if (existing) {
    existing.userId = existing.userId || user._id as any;
    existing.name = user.fullName || existing.name;
    existing.email = email;
    if (user.phone) existing.phone = user.phone;
    if (user.avatar && !existing.companyLogo) existing.companyLogo = user.avatar;
    await existing.save();
    return existing;
  }

  return CustomerModel.create({
    name: user.fullName,
    email,
    phone: user.phone,
    userId: user._id,
    status: "active",
    tier: "standard",
    country: "SA",
  });
}