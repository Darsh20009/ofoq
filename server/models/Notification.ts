import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "info" | "success" | "warning" | "error" | "message" | "order" | "status" | "project" | "task" | "auth" | "payment";
  title: string;
  body: string;
  link?: string;
  icon?: string;
  image?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: {
    type: String,
    enum: ["info", "success", "warning", "error", "message", "order", "status", "project", "task", "auth", "payment"],
    default: "info",
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, default: "/dashboard" },
  icon: String,
  image: String,
  read: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Auto-delete after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
