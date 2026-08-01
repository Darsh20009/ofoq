import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  // Identity
  title: string;
  titleAr: string;
  slug: string;
  shortDesc: string;
  shortDescAr: string;
  description: string;
  descriptionAr: string;
  // Category
  category: string;
  categoryAr: string;
  icon?: string;
  coverImage?: string;
  images: string[];
  // Pricing
  pricingType: "fixed" | "hourly" | "custom" | "package";
  basePrice?: number;
  currency: string;
  // Workflow stages for this service
  workflow: {
    stage: number;
    name: string;
    nameAr: string;
    description?: string;
  }[];
  // SEO
  metaTitle?: string;
  metaTitleAr?: string;
  metaDesc?: string;
  metaDescAr?: string;
  // Status
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  // Industries served
  industries: string[];
  // Tags
  tags: string[];
  // AI Intelligence (hidden)
  _aiDemandScore?: number;
  _aiKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true, trim: true },
  titleAr: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  shortDesc: { type: String, required: true },
  shortDescAr: { type: String, required: true },
  description: { type: String, default: "" },
  descriptionAr: { type: String, default: "" },
  category: { type: String, required: true },
  categoryAr: { type: String, required: true },
  icon: String,
  coverImage: String,
  images: [String],
  pricingType: { type: String, enum: ["fixed", "hourly", "custom", "package"], default: "custom" },
  basePrice: Number,
  currency: { type: String, default: "SAR" },
  workflow: [{
    stage: { type: Number, required: true },
    name: { type: String, required: true },
    nameAr: { type: String, required: true },
    description: String,
  }],
  metaTitle: String,
  metaTitleAr: String,
  metaDesc: String,
  metaDescAr: String,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  industries: [String],
  tags: [String],
  _aiDemandScore: { type: Number, select: false },
  _aiKeywords: { type: [String], select: false },
}, { timestamps: true });

ServiceSchema.index({ isActive: 1, order: 1 });
ServiceSchema.index({ category: 1 });

export const ServiceModel = mongoose.model<IService>("Service", ServiceSchema);
