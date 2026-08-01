import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  key: string;
  value: any;
  group: string;
  label?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, required: true, default: "general" },
  label: String,
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

SystemSettingsSchema.index({ group: 1 });

export const SystemSettingsModel = mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
