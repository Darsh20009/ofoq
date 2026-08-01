import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  // Identity
  fullName: string;
  fullNameAr?: string;
  email: string;
  phone?: string;
  password?: string;
  // Role & Status
  role: "super_admin" | "admin" | "manager" | "employee" | "client" | "lead";
  status: "active" | "inactive" | "suspended" | "pending";
  // Profile
  avatar?: string;
  bio?: string;
  department?: string;
  position?: string;
  // Auth
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  // 2FA
  twoFactorEnabled: boolean;
  twoFactorMethods: ("totp" | "email" | "push" | "recovery")[];
  totpSecret?: string;
  totpVerified: boolean;
  recoveryPassphrase?: string;
  quickPin?: string;
  // Google / Apple OAuth
  googleId?: string;
  appleId?: string;
  // Permissions
  permissions: string[];
  // Preferences
  lang: "ar" | "en";
  timezone: string;
  theme: "light" | "dark" | "auto";
  // Push subscriptions ref
  pushEnabled: boolean;
  // AI Intelligence (invisible)
  _aiScore?: number;
  _aiTags?: string[];
  _aiLastAnalyzed?: Date;
  // Employee card
  employeeCode?: string;
  // Timestamps
  lastLogin?: Date;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  fullNameAr: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ["super_admin", "admin", "manager", "employee", "client", "lead"],
    default: "client",
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended", "pending"],
    default: "pending",
  },
  avatar: String,
  bio: String,
  department: String,
  position: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpiry: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpiry: { type: Date, select: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorMethods: [{ type: String, enum: ["totp", "email", "push", "recovery"] }],
  totpSecret: { type: String, select: false },
  totpVerified: { type: Boolean, default: false },
  recoveryPassphrase: { type: String, select: false },
  quickPin: { type: String, select: false },
  googleId: { type: String, sparse: true },
  appleId: { type: String, sparse: true },
  permissions: [String],
  lang: { type: String, enum: ["ar", "en"], default: "ar" },
  timezone: { type: String, default: "Asia/Riyadh" },
  theme: { type: String, enum: ["light", "dark", "auto"], default: "auto" },
  pushEnabled: { type: Boolean, default: false },
  _aiScore: { type: Number, select: false },
  _aiTags: { type: [String], select: false },
  _aiLastAnalyzed: { type: Date, select: false },
  employeeCode: { type: String, sparse: true, unique: true },
  lastLogin: Date,
  lastActivity: Date,
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      // Never expose sensitive fields
      delete ret.password;
      delete ret.totpSecret;
      delete ret.recoveryPassphrase;
      delete ret.quickPin;
      delete ret._aiScore;
      delete ret._aiTags;
      return ret;
    },
  },
});

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model<IUser>("User", UserSchema);
