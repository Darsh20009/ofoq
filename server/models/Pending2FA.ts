import mongoose, { Schema, Document } from "mongoose";

export interface IPending2FA extends Document {
  tempToken: string;
  userId: string;
  methods: string[];
  expiresAt: Date;
  pushApproved: boolean;
}

const Pending2FASchema = new Schema<IPending2FA>({
  tempToken: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  methods: [String],
  expiresAt: { type: Date, required: true },
  pushApproved: { type: Boolean, default: false },
}, { timestamps: true });

Pending2FASchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Pending2FAModel = mongoose.model<IPending2FA>("Pending2FA", Pending2FASchema);
