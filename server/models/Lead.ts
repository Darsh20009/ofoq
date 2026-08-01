import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  // Basic Info
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  country?: string;
  city?: string;
  // Source
  source: "website" | "social" | "referral" | "cold_call" | "email" | "event" | "partner" | "other";
  sourceDetail?: string;
  // Pipeline
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost" | "inactive";
  stage: number; // 1-6
  priority: "low" | "medium" | "high" | "urgent";
  // Assignment
  assignedTo?: mongoose.Types.ObjectId;
  // Financial
  estimatedValue?: number;
  currency: string;
  // Service Interest
  interestedServices: string[];
  // Notes & Activity
  notes?: string;
  // AI Intelligence (hidden)
  _aiScore?: number;          // Lead score 0-100
  _aiPrediction?: string;     // win/lose prediction
  _aiNextAction?: string;     // suggested next action
  // Follow-up
  nextFollowUp?: Date;
  lastContactDate?: Date;
  // Timeline
  convertedToCustomer?: boolean;
  convertedAt?: Date;
  customerId?: mongoose.Types.ObjectId;
  // Tags
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  company: String,
  position: String,
  country: String,
  city: String,
  source: {
    type: String,
    enum: ["website", "social", "referral", "cold_call", "email", "event", "partner", "other"],
    default: "website",
  },
  sourceDetail: String,
  status: {
    type: String,
    enum: ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost", "inactive"],
    default: "new",
  },
  stage: { type: Number, default: 1, min: 1, max: 6 },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  estimatedValue: Number,
  currency: { type: String, default: "SAR" },
  interestedServices: [String],
  notes: String,
  _aiScore: { type: Number, select: false },
  _aiPrediction: { type: String, select: false },
  _aiNextAction: { type: String, select: false },
  nextFollowUp: Date,
  lastContactDate: Date,
  convertedToCustomer: { type: Boolean, default: false },
  convertedAt: Date,
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
  tags: [String],
}, { timestamps: true });

LeadSchema.index({ status: 1, assignedTo: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ nextFollowUp: 1 });

export const LeadModel = mongoose.model<ILead>("Lead", LeadSchema);
