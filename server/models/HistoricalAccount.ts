import { Schema } from "mongoose";

/** An immutable source snapshot, not a live receivables balance or tax document. */
export interface HistoricalAccountEntry {
  row: number;
  journalNumber: string;
  date: Date;
  kind: "invoice" | "receipt" | "credit_note";
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  relatedInvoiceNumber?: string;
}

export interface HistoricalAccount {
  sourceHash: string;
  sourceName: string;
  accountCode: string;
  asOf: Date;
  debit: number;
  credit: number;
  balance: number;
  entries: HistoricalAccountEntry[];
}

export const HistoricalAccountSchema = new Schema<HistoricalAccount>({
  sourceHash: { type: String, required: true },
  sourceName: { type: String, required: true },
  accountCode: { type: String, required: true },
  asOf: { type: Date, required: true },
  debit: { type: Number, required: true },
  credit: { type: Number, required: true },
  balance: { type: Number, required: true },
  entries: [{
    _id: false,
    row: { type: Number, required: true },
    journalNumber: { type: String, required: true },
    date: { type: Date, required: true },
    kind: { type: String, enum: ["invoice", "receipt", "credit_note"], required: true },
    reference: { type: String, required: true },
    description: String,
    debit: { type: Number, required: true },
    credit: { type: Number, required: true },
    balance: { type: Number, required: true },
    relatedInvoiceNumber: String,
  }],
}, { _id: false });
