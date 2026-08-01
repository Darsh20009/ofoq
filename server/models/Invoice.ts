import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  invoiceNumber: string;
  type: "invoice" | "proforma" | "receipt" | "credit_note";
  customerId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  items: {
    description: string;
    descriptionAr?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    tax: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "cancelled";
  dueDate?: Date;
  paidAt?: Date;
  paidAmount: number;
  notes?: string;
  notesAr?: string;
  terms?: string;
  termsAr?: string;
  createdBy: mongoose.Types.ObjectId;
  // PDF
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ["invoice", "proforma", "receipt", "credit_note"],
    default: "invoice",
  },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  items: [{
    description: { type: String, required: true },
    descriptionAr: String,
    quantity: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 15 }, // 15% VAT default
    total: { type: Number, required: true },
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: "SAR" },
  status: {
    type: String,
    enum: ["draft", "sent", "viewed", "partial", "paid", "overdue", "cancelled"],
    default: "draft",
  },
  dueDate: Date,
  paidAt: Date,
  paidAmount: { type: Number, default: 0 },
  notes: String,
  notesAr: String,
  terms: String,
  termsAr: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  pdfUrl: String,
}, { timestamps: true });

InvoiceSchema.index({ customerId: 1, status: 1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", InvoiceSchema);
