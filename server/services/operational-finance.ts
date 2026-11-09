import { createHash } from "node:crypto";
import mongoose from "mongoose";
import { InvoiceModel } from "../models/Invoice.js";
import { CustomerModel } from "../models/Customer.js";
import { AuditLogModel } from "../models/AuditLog.js";
import { FinancialEntryModel } from "../models/FinancialEntry.js";

export const cents = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100);
export const money = (value: number) => cents(value) / 100;
export function financeError(message: string, statusCode = 400): never {
  throw Object.assign(new Error(message), { statusCode });
}
export function remaining(invoice: { total: number; paidAmount?: number; creditedAmount?: number }) {
  return Math.max(0, money(invoice.total - (invoice.paidAmount || 0) - (invoice.creditedAmount || 0)));
}
export function settlementStatus(invoice: { total: number; paidAmount?: number; creditedAmount?: number; dueDate?: Date | string }) {
  const funded = cents(invoice.paidAmount || 0) + cents(invoice.creditedAmount || 0);
  if (funded >= cents(invoice.total)) return "paid";
  if (funded > 0) return "partial";
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return "overdue";
  return "sent";
}
export async function accountCredits(customerId: mongoose.Types.ObjectId | string) {
  const entries = await FinancialEntryModel.find({ customerId }).sort({ date: 1, _id: 1 }).lean();
  return entries.map((entry) => ({
    ...entry,
    remaining: money(entry.amount - entry.allocations.reduce((sum, allocation) => sum + allocation.amount, 0)),
  })).filter((entry) => entry.remaining > 0);
}
export async function operationalSummary() {
  const invoices = await InvoiceModel.find({ operationalImport: { $exists: true }, status: { $ne: "cancelled" } })
    .select("total paidAmount creditedAmount customerId").lean();
  const customerIds = [...new Set(invoices.map((invoice) => String(invoice.customerId)))];
  const entries = await FinancialEntryModel.find({ customerId: { $in: customerIds } }).lean();
  const summary = {
    invoiceTotal: 0, allocatedPayments: 0, allocatedCredits: 0,
    unallocatedPayments: 0, unallocatedCredits: 0,
    cashReceived: 0, invoiceOutstanding: 0, netOutstanding: 0,
  };
  for (const invoice of invoices) {
    summary.invoiceTotal += invoice.total;
    summary.allocatedPayments += invoice.paidAmount || 0;
    summary.allocatedCredits += invoice.creditedAmount || 0;
    summary.invoiceOutstanding += remaining(invoice);
  }
  for (const entry of entries) {
    const available = money(entry.amount - entry.allocations.reduce((sum, allocation) => sum + allocation.amount, 0));
    if (entry.kind === "payment") {
      summary.cashReceived += entry.amount;
      summary.unallocatedPayments += available;
    } else summary.unallocatedCredits += available;
  }
  summary.netOutstanding = summary.invoiceOutstanding - summary.unallocatedPayments - summary.unallocatedCredits;
  return Object.fromEntries(Object.entries(summary).map(([key, value]) => [key, money(value)])) as typeof summary;
}

/** Cash basis: source receipts count once, including partial and unapplied cash. */
export async function receivedRevenue(since?: Date) {
  const [legacy, ledger] = await Promise.all([
    InvoiceModel.aggregate([
      { $match: {
        type: "invoice", operationalImport: { $exists: false }, status: { $in: ["paid", "partial"] },
        ...(since ? { paidAt: { $gte: since } } : {}),
      } },
      { $group: { _id: null, total: { $sum: { $cond: [
        { $gt: [{ $ifNull: ["$paidAmount", 0] }, 0] }, "$paidAmount",
        { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] },
      ] } } } },
    ]),
    FinancialEntryModel.aggregate([
      { $match: { kind: "payment", ...(since ? { date: { $gte: since } } : {}) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);
  return [{ total: money((legacy[0]?.total || 0) + (ledger[0]?.total || 0)) }];
}

export async function receivedRevenueByMonth(since: Date) {
  const [legacy, ledger] = await Promise.all([
    InvoiceModel.aggregate([
      { $match: { type: "invoice", operationalImport: { $exists: false }, status: { $in: ["paid", "partial"] }, paidAt: { $gte: since } } },
      { $group: {
        _id: { year: { $year: { date: "$paidAt", timezone: "Asia/Riyadh" } }, month: { $month: { date: "$paidAt", timezone: "Asia/Riyadh" } } },
        total: { $sum: { $cond: [{ $gt: [{ $ifNull: ["$paidAmount", 0] }, 0] }, "$paidAmount", { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] }] } },
        count: { $sum: 1 },
      } },
    ]),
    FinancialEntryModel.aggregate([
      { $match: { kind: "payment", date: { $gte: since } } },
      { $group: {
        _id: { year: { $year: { date: "$date", timezone: "Asia/Riyadh" } }, month: { $month: { date: "$date", timezone: "Asia/Riyadh" } } },
        total: { $sum: "$amount" }, count: { $sum: 1 },
      } },
    ]),
  ]);
  const months = new Map<string, any>();
  for (const row of [...legacy, ...ledger]) {
    const key = `${row._id.year}-${row._id.month}`;
    const previous = months.get(key) || { _id: row._id, total: 0, count: 0 };
    previous.total = money(previous.total + row.total);
    previous.count += row.count;
    months.set(key, previous);
  }
  return [...months.values()].sort((a, b) => a._id.year - b._id.year || a._id.month - b._id.month);
}

async function requireOperationalInvoice(id: string, expectedVersion: unknown, session: mongoose.ClientSession) {
  if (!mongoose.isValidObjectId(id)) financeError("رقم الفاتورة غير صالح");
  const invoice = await InvoiceModel.findOne({ _id: id, operationalImport: { $exists: true }, type: "invoice" }).session(session);
  if (!invoice) financeError("الفاتورة التشغيلية غير موجودة", 404);
  if (invoice.status === "cancelled") financeError("لا يمكن تسوية فاتورة ملغاة");
  if (!Number.isInteger(expectedVersion) || expectedVersion !== invoice.__v) {
    financeError("تغيرت الفاتورة أثناء العمل. حدّث الصفحة وأعد المحاولة.", 409);
  }
  return invoice;
}

async function applyAmount(invoice: any, kind: string, amount: number, date: Date, session: mongoose.ClientSession) {
  if (cents(amount) > cents(remaining(invoice))) financeError("المبلغ يتجاوز المتبقي على الفاتورة");
  const paidAmount = money((invoice.paidAmount || 0) + (kind === "payment" ? amount : 0));
  const creditedAmount = money((invoice.creditedAmount || 0) + (kind === "credit_note" ? amount : 0));
  const status = settlementStatus({ ...invoice.toObject(), paidAmount, creditedAmount });
  const updated = await InvoiceModel.findOneAndUpdate(
    { _id: invoice._id, __v: invoice.__v },
    { $set: { paidAmount, creditedAmount, status, ...(status === "paid" ? { paidAt: date } : {}) }, $inc: { __v: 1 } },
    { new: true, session },
  );
  if (!updated) financeError("تم تسجيل تعديل آخر. حدّث الفاتورة وأعد المحاولة.", 409);
  return updated;
}

export async function recordOperationalPayment(id: string, body: any, actorId: string) {
  const amount = Number(body.paidAmount);
  if (!Number.isFinite(amount) || amount <= 0 || cents(amount) !== amount * 100 && Math.abs(cents(amount) - amount * 100) > 1e-7) {
    financeError("أدخل مبلغًا موجبًا بدقة منزلتين عشريتين");
  }
  if (typeof body.requestId !== "string" || !/^[\w-]{12,100}$/.test(body.requestId)) {
    financeError("معرّف تسجيل الدفعة مطلوب لمنع التكرار");
  }
  const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
  if (!Number.isFinite(paidAt.getTime()) || paidAt.getTime() > Date.now() + 86_400_000) financeError("تاريخ السداد غير صالح");
  const reference = String(body.reference || "").trim().slice(0, 150);
  const note = String(body.note || "").trim().slice(0, 2000);
  const sourceKey = `payment:${actorId}:${body.requestId}`;
  const payloadHash = createHash("sha256").update(JSON.stringify([id, amount, body.paidAt || null, reference, note])).digest("hex");
  const previous = await FinancialEntryModel.findOne({ sourceKey }).lean();
  if (previous) {
    if (previous.payloadHash !== payloadHash) financeError("استُخدم معرّف الدفعة لمحتوى مختلف", 409);
    return InvoiceModel.findById(id).lean();
  }
  const session = await mongoose.startSession();
  let result: any;
  try {
    await session.withTransaction(async () => {
      // A transaction retry may observe the first successfully committed submission.
      const existing = await FinancialEntryModel.findOne({ sourceKey }).session(session).lean();
      if (existing) {
        if (existing.payloadHash !== payloadHash) financeError("معرّف الدفعة مكرر لمحتوى مختلف", 409);
        result = await InvoiceModel.findById(id).session(session).lean();
        return;
      }
      const invoice = await requireOperationalInvoice(id, body.expectedVersion, session);
      const updated = await applyAmount(invoice, "payment", money(amount), paidAt, session);
      await FinancialEntryModel.create([{
        sourceKey, payloadHash, customerId: invoice.customerId, kind: "payment", amount: money(amount),
        date: paidAt, reference: reference || `PAY-${body.requestId}`, note, createdBy: actorId,
        allocations: [{ invoiceId: invoice._id, amount: money(amount), allocatedAt: new Date(), allocatedBy: actorId }],
      }], { session });
      await CustomerModel.updateOne({ _id: invoice.customerId }, { $inc: { totalRevenue: money(amount) } }, { session });
      await AuditLogModel.create([{
        userId: actorId, action: "record_invoice_payment", entity: "Invoice", entityId: id,
        metadata: { amount, paidAt, reference, previousPaid: invoice.paidAmount, newPaid: updated.paidAmount },
      }], { session });
      result = updated.toObject();
    });
    return result;
  } catch (error: any) {
    if (error.code === 11000) {
      const existing = await FinancialEntryModel.findOne({ sourceKey }).lean();
      if (existing?.payloadHash === payloadHash) return InvoiceModel.findById(id).lean();
      financeError("معرّف الدفعة مكرر لمحتوى مختلف", 409);
    }
    throw error;
  } finally { await session.endSession(); }
}

export async function allocateCredit(id: string, body: any, actorId: string) {
  const amount = Number(body.amount);
  if (!mongoose.isValidObjectId(body.entryId) || !Number.isFinite(amount) || amount <= 0 ||
    Math.abs(cents(amount) - amount * 100) > 1e-7) financeError("اختر رصيدًا ومبلغًا صحيحين");
  const session = await mongoose.startSession();
  let result: any;
  try {
    await session.withTransaction(async () => {
      const invoice = await requireOperationalInvoice(id, body.expectedVersion, session);
      const entry = await FinancialEntryModel.findOne({ _id: body.entryId, customerId: invoice.customerId }).session(session);
      if (!entry) financeError("الرصيد غير موجود أو لا يخص عميل الفاتورة", 404);
      const available = money(entry.amount - entry.allocations.reduce((sum, allocation) => sum + allocation.amount, 0));
      if (cents(amount) > cents(available)) financeError("المبلغ يتجاوز الرصيد غير الموزّع");
      result = await applyAmount(invoice, entry.kind, money(amount), entry.date, session);
      entry.allocations.push({ invoiceId: invoice._id, amount: money(amount), allocatedAt: new Date(), allocatedBy: new mongoose.Types.ObjectId(actorId) });
      await entry.save({ session });
      await AuditLogModel.create([{
        userId: actorId, action: "allocate_customer_credit", entity: "Invoice", entityId: id,
        metadata: { entryId: entry._id, amount, kind: entry.kind, reference: entry.reference },
      }], { session });
      // No increment of revenue: cash was recorded when the credit was created.
      result = result.toObject();
    });
    return result;
  } finally { await session.endSession(); }
}
