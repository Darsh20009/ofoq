import mongoose, { Document, Schema } from "mongoose";

export interface IPartner extends Document {
  seedKey?: string;
  nameAr: string;
  nameEn: string;
  logo: string;
  descriptionAr: string;
  descriptionEn: string;
  partnershipAr: string;
  partnershipEn: string;
  servicesAr: string;
  servicesEn: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>({
  seedKey: { type: String, unique: true, sparse: true },
  nameAr: { type: String, required: true, trim: true, maxlength: 160 },
  nameEn: { type: String, required: true, trim: true, maxlength: 160 },
  logo: { type: String, required: true, trim: true },
  descriptionAr: { type: String, required: true, trim: true, maxlength: 2000 },
  descriptionEn: { type: String, required: true, trim: true, maxlength: 2000 },
  partnershipAr: { type: String, required: true, trim: true, maxlength: 1200 },
  partnershipEn: { type: String, required: true, trim: true, maxlength: 1200 },
  servicesAr: { type: String, required: true, trim: true, maxlength: 1200 },
  servicesEn: { type: String, required: true, trim: true, maxlength: 1200 },
  order: { type: Number, default: 0, min: 0, max: 9999 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

PartnerSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

export const PartnerModel = mongoose.model<IPartner>("Partner", PartnerSchema);