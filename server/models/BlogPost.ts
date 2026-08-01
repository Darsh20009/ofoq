import mongoose, { Schema, Document } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  titleAr: string;
  slug: string;
  excerpt?: string;
  excerptAr?: string;
  content: string;
  contentAr: string;
  coverImage?: string;
  author: mongoose.Types.ObjectId;
  category: string;
  categoryAr: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  // SEO
  metaTitle?: string;
  metaTitleAr?: string;
  metaDesc?: string;
  metaDescAr?: string;
  // AI Intelligence (hidden)
  _aiSeoScore?: number;
  _aiEngagementScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  titleAr: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  excerptAr: String,
  content: { type: String, default: "" },
  contentAr: { type: String, default: "" },
  coverImage: String,
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  categoryAr: { type: String, required: true },
  tags: [String],
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
  viewCount: { type: Number, default: 0 },
  metaTitle: String,
  metaTitleAr: String,
  metaDesc: String,
  metaDescAr: String,
  _aiSeoScore: { type: Number, select: false },
  _aiEngagementScore: { type: Number, select: false },
}, { timestamps: true });

BlogPostSchema.index({ isPublished: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1 });

export const BlogPostModel = mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);
