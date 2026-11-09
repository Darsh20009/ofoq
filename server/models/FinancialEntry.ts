import mongoose, { Schema } from "mongoose";

/** Actual cash/credit only. Allocations consume a credit; they never create cash. */
const AllocationSchema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
  amount: { type: Number, required: true, min: 0.01 },
  allocatedAt: { type: Date, required: true },
  allocatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { _id: false });

const FinancialEntrySchema = new Schema({
  sourceKey: { type: String, required: true, unique: true, immutable: true },
  payloadHash: { type: String, immutable: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, immutable: true },
  kind: { type: String, enum: ["payment", "credit_note"], required: true, immutable: true },
  amount: { type: Number, min: 0.01, required: true, immutable: true },
  date: { type: Date, required: true, immutable: true },
  reference: { type: String, required: true, immutable: true },
  note: { type: String, immutable: true },
  sourceHash: { type: String, immutable: true },
  sourceRow: { type: Number, immutable: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true, immutable: true },
  allocations: { type: [AllocationSchema], default: [] },
}, { timestamps: true, optimisticConcurrency: true });

FinancialEntrySchema.index({ customerId: 1, date: -1 });
FinancialEntrySchema.pre("validate", function () {
  const allocated = this.allocations.reduce((sum, allocation) => sum + Math.round(allocation.amount * 100), 0);
  if (allocated > Math.round(this.amount * 100)) {
    this.invalidate("allocations", "Allocated amount exceeds the original credit");
  }
});

export const FinancialEntryModel = mongoose.model("FinancialEntry", FinancialEntrySchema);
