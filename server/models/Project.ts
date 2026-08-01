import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  // Identity
  name: string;
  nameAr?: string;
  projectNumber: string;
  description?: string;
  // Relations
  customerId: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  contractId?: mongoose.Types.ObjectId;
  // Team
  manager: mongoose.Types.ObjectId;
  team: mongoose.Types.ObjectId[];
  // Workflow Stage
  // طلب → مراجعة → عرض سعر → عقد → دفع → تنفيذ → إغلاق
  stage: "request" | "review" | "quotation" | "contract" | "payment" | "execution" | "closed";
  stageHistory: {
    stage: string;
    changedAt: Date;
    changedBy: mongoose.Types.ObjectId;
    note?: string;
  }[];
  progress: number; // 0-100
  status: "active" | "paused" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  // Financial
  budget?: number;
  actualCost?: number;
  currency: string;
  // Timeline
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  // Files & Notes
  attachments: {
    name: string;
    url: string;
    type: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  notes?: string;
  // AI Intelligence (hidden)
  _aiRiskScore?: number;       // 0-100 risk of delay
  _aiCompletionEta?: Date;     // AI predicted completion
  _aiBudgetRisk?: number;      // 0-100 budget overrun risk
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  nameAr: String,
  projectNumber: { type: String, required: true, unique: true },
  description: String,
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  contractId: { type: Schema.Types.ObjectId, ref: "Contract" },
  manager: { type: Schema.Types.ObjectId, ref: "User", required: true },
  team: [{ type: Schema.Types.ObjectId, ref: "User" }],
  stage: {
    type: String,
    enum: ["request", "review", "quotation", "contract", "payment", "execution", "closed"],
    default: "request",
  },
  stageHistory: [{
    stage: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
  }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ["active", "paused", "completed", "cancelled"],
    default: "active",
  },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  budget: Number,
  actualCost: Number,
  currency: { type: String, default: "SAR" },
  startDate: Date,
  dueDate: Date,
  completedAt: Date,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  }],
  notes: String,
  _aiRiskScore: { type: Number, select: false },
  _aiCompletionEta: { type: Date, select: false },
  _aiBudgetRisk: { type: Number, select: false },
  tags: [String],
}, { timestamps: true });

ProjectSchema.index({ customerId: 1, status: 1 });
ProjectSchema.index({ manager: 1 });
ProjectSchema.index({ stage: 1, status: 1 });
ProjectSchema.index({ dueDate: 1 });

export const ProjectModel = mongoose.model<IProject>("Project", ProjectSchema);
