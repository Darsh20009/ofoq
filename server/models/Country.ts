import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  code: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  flag: string;
  mapX: number;
  mapY: number;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  nameAr: { type: String, required: true, trim: true },
  nameEn: { type: String, required: true, trim: true },
  descriptionAr: { type: String, required: true, trim: true },
  descriptionEn: { type: String, required: true, trim: true },
  flag: { type: String, default: "🌍" },
  mapX: { type: Number, required: true, min: 0, max: 1000 },
  mapY: { type: Number, required: true, min: 0, max: 500 },
  order: { type: Number, default: 0, min: 0, max: 9999 },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

CountrySchema.index({ isPublished: 1, order: 1 });

export const CountryModel = mongoose.model<ICountry>("Country", CountrySchema);