import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  contractNumber: string;
  title: string;
  titleAr?: string;
  customerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  type: "service" | "maintenance" | "nda" | "partnership" | "other";
  status: "draft" | "sent" | "signed" | "active" | "expired" | "cancelled";
  value: number;
  currency: string;
  startDate?: Date;
  endDate?: Date;
  signedAt?: Date;
  terms?: string;
  termsAr?: string;
  content?: string;
  sections: {
    title: string;
    content: string;
    order: number;
  }[];
  approvalFields: {
    type: "signature" | "stamp";
    label: string;
    party: "company" | "client" | "witness";
    required: boolean;
  }[];
  pdfUrl?: string;
  signatureUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>({
  contractNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleAr: String,
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
  type: {
    type: String,
    enum: ["service", "maintenance", "nda", "partnership", "other"],
    default: "service",
  },
  status: {
    type: String,
    enum: ["draft", "sent", "signed", "active", "expired", "cancelled"],
    default: "draft",
  },
  value: { type: Number, default: 0 },
  currency: { type: String, default: "SAR" },
  startDate: Date,
  endDate: Date,
  signedAt: Date,
  terms: String,
  termsAr: String,
  content: String,
  sections: [{
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, default: 0 },
  }],
  approvalFields: [{
    type: { type: String, enum: ["signature", "stamp"], required: true },
    label: { type: String, required: true, trim: true },
    party: { type: String, enum: ["company", "client", "witness"], default: "company" },
    required: { type: Boolean, default: false },
  }],
  pdfUrl: String,
  signatureUrl: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

ContractSchema.index({ customerId: 1, status: 1 });

export const ContractModel = mongoose.model<IContract>("Contract", ContractSchema);
