import mongoose, { Schema, Document } from "mongoose";

export interface ISupportMessage extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  requestId?: mongoose.Types.ObjectId;
  from: "client" | "admin";
  senderName: string;
  text: string;
  read: boolean;
  createdAt: Date;
}

const SupportMessageSchema = new Schema<ISupportMessage>({
  clientId:   { type: Schema.Types.ObjectId, ref: "User", required: true },
  requestId:  { type: Schema.Types.ObjectId, ref: "ServiceRequest" },
  from:       { type: String, enum: ["client", "admin"], required: true },
  senderName: { type: String, required: true },
  text:       { type: String, required: true, trim: true },
  read:       { type: Boolean, default: false },
}, { timestamps: true });

SupportMessageSchema.index({ clientId: 1, createdAt: 1 });

export const SupportMessageModel = mongoose.model<ISupportMessage>("SupportMessage", SupportMessageSchema);
