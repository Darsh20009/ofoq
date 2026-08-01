import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  projectId?: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  status: "todo" | "in_progress" | "review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: Date;
  completedAt?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: string[];
  comments: {
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: String,
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["todo", "in_progress", "review", "done", "cancelled"],
    default: "todo",
  },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  dueDate: Date,
  completedAt: Date,
  estimatedHours: Number,
  actualHours: Number,
  tags: [String],
  attachments: [String],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

export const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
