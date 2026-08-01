import mongoose, { Schema, Document } from "mongoose";

export interface IContactRequest extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  serviceInterest?: string;
  message: string;
  status: "new" | "read" | "replied" | "converted" | "spam";
  assignedTo?: mongoose.Types.ObjectId;
  convertedToLead?: boolean;
  leadId?: mongoose.Types.ObjectId;
  ip?: string;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactRequestSchema = new Schema<IContactRequest>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  company: String,
  serviceInterest: String,
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ["new", "read", "replied", "converted", "spam"],
    default: "new",
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  convertedToLead: { type: Boolean, default: false },
  leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
  ip: String,
  source: String,
}, { timestamps: true });

ContactRequestSchema.index({ status: 1, createdAt: -1 });
ContactRequestSchema.index({ email: 1 });

export const ContactRequestModel = mongoose.model<IContactRequest>("ContactRequest", ContactRequestSchema);
