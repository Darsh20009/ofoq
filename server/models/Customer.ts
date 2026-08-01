import mongoose, { Schema, Document } from "mongoose";

export interface ICustomer extends Document {
  // Identity
  name: string;
  nameAr?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  // Company
  companyName?: string;
  companyLogo?: string;
  industry?: string;
  taxNumber?: string;
  commercialReg?: string;
  // Address
  country: string;
  city?: string;
  address?: string;
  // Linked User
  userId?: mongoose.Types.ObjectId;
  // Assigned Manager
  accountManager?: mongoose.Types.ObjectId;
  // Financial
  totalRevenue: number;
  currency: string;
  creditLimit?: number;
  paymentTerms?: string;
  // Status
  status: "active" | "inactive" | "vip" | "at_risk";
  tier: "standard" | "silver" | "gold" | "platinum";
  // CRM
  leadId?: mongoose.Types.ObjectId;
  notes?: string;
  tags: string[];
  // AI Intelligence (hidden)
  _aiHealthScore?: number;     // 0-100 account health
  _aiChurnRisk?: number;       // 0-1 churn probability
  _aiUpsellScore?: number;     // 0-100 upsell opportunity
  // Dates
  firstProjectDate?: Date;
  lastProjectDate?: Date;
  lastContactDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true, trim: true },
  nameAr: String,
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  phone2: String,
  companyName: String,
  companyLogo: String,
  industry: String,
  taxNumber: String,
  commercialReg: String,
  country: { type: String, default: "SA" },
  city: String,
  address: String,
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  accountManager: { type: Schema.Types.ObjectId, ref: "User" },
  totalRevenue: { type: Number, default: 0 },
  currency: { type: String, default: "SAR" },
  creditLimit: Number,
  paymentTerms: String,
  status: {
    type: String,
    enum: ["active", "inactive", "vip", "at_risk"],
    default: "active",
  },
  tier: {
    type: String,
    enum: ["standard", "silver", "gold", "platinum"],
    default: "standard",
  },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  notes: String,
  tags: [String],
  _aiHealthScore: { type: Number, select: false },
  _aiChurnRisk: { type: Number, select: false },
  _aiUpsellScore: { type: Number, select: false },
  firstProjectDate: Date,
  lastProjectDate: Date,
  lastContactDate: Date,
}, { timestamps: true });

CustomerSchema.index({ email: 1 });
CustomerSchema.index({ status: 1, tier: 1 });
CustomerSchema.index({ accountManager: 1 });
CustomerSchema.index({ createdAt: -1 });

export const CustomerModel = mongoose.model<ICustomer>("Customer", CustomerSchema);
