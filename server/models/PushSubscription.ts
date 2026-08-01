import mongoose, { Schema, Document } from "mongoose";

export interface IPushSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceName?: string;
  userAgent?: string;
  createdAt: Date;
}

const PushSubscriptionSchema = new Schema<IPushSubscription>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  deviceName: String,
  userAgent: String,
}, { timestamps: true });

export const PushSubscriptionModel = mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
