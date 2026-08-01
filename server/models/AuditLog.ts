import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  entity?: string;
  entityId?: string;
  description?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  entity: String,
  entityId: String,
  description: String,
  ip: String,
  userAgent: String,
  metadata: Schema.Types.Mixed,
  severity: { type: String, enum: ["info", "warning", "critical"], default: "info" },
}, { timestamps: true });

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ severity: 1 });
// Auto-delete after 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
