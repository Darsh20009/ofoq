import mongoose, { Schema, Document } from "mongoose";

// CMS Page — full employee control over all website content
export interface IPage extends Document {
  key: string;          // unique page identifier e.g. "home", "about", "services"
  title: string;
  titleAr: string;
  slug: string;
  // Dynamic content sections (employees control every detail)
  sections: {
    key: string;
    type: "hero" | "text" | "image" | "gallery" | "team" | "stats" | "testimonial" | "faq" | "cta" | "custom";
    title?: string;
    titleAr?: string;
    content?: string;
    contentAr?: string;
    image?: string;
    images?: string[];
    data?: Record<string, any>;   // Flexible JSON for any content
    isVisible: boolean;
    order: number;
  }[];
  // SEO
  metaTitle?: string;
  metaTitleAr?: string;
  metaDesc?: string;
  metaDescAr?: string;
  metaKeywords?: string;
  ogImage?: string;
  // Status
  isPublished: boolean;
  publishedAt?: Date;
  lastEditedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>({
  key: { type: String, required: true, unique: true, lowercase: true },
  title: { type: String, required: true },
  titleAr: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sections: [{
    key: { type: String, required: true },
    type: {
      type: String,
      enum: ["hero", "text", "image", "gallery", "team", "stats", "testimonial", "faq", "cta", "custom"],
      default: "text",
    },
    title: String,
    titleAr: String,
    content: String,
    contentAr: String,
    image: String,
    images: [String],
    data: Schema.Types.Mixed,
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  }],
  metaTitle: String,
  metaTitleAr: String,
  metaDesc: String,
  metaDescAr: String,
  metaKeywords: String,
  ogImage: String,
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  lastEditedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

PageSchema.index({ isPublished: 1 });

export const PageModel = mongoose.model<IPage>("Page", PageSchema);
