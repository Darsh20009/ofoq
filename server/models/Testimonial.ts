import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  clientName: string;
  clientNameAr?: string;
  clientPosition?: string;
  clientPositionAr?: string;
  clientCompany?: string;
  clientAvatar?: string;
  text: string;
  textAr: string;
  rating: number;
  serviceId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  clientName: { type: String, required: true },
  clientNameAr: String,
  clientPosition: String,
  clientPositionAr: String,
  clientCompany: String,
  clientAvatar: String,
  text: { type: String, required: true },
  textAr: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  isPublished: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

TestimonialSchema.index({ isPublished: 1, order: 1 });

export const TestimonialModel = mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
