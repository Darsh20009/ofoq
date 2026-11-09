/**
 * Owner-approved activation: invoice amounts INCLUDE 15% VAT; one project per invoice.
 * Dry run by default. --apply commits once. Original account snapshots stay immutable.
 */
import mongoose from "mongoose";
import { CustomerModel } from "../server/models/Customer.js";
import { InvoiceModel } from "../server/models/Invoice.js";
import { ProjectModel } from "../server/models/Project.js";
import { UserModel } from "../server/models/User.js";
import { FinancialEntryModel } from "../server/models/FinancialEntry.js";
import { AuditLogModel } from "../server/models/AuditLog.js";
import { cents, money, settlementStatus } from "../server/services/operational-finance.js";

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI must already be configured");
  await mongoose.connect(process.env.MONGODB_URI);
  // Ensure uniqueness is enforced before the transaction creates financial entries.
  await FinancialEntryModel.init();
  const admins = await UserModel.find({ role: "super_admin", status: "active" }).select("_id").lean();
  if (admins.length !== 1) throw new Error("An unambiguous audit actor is required");
  const actor = admins[0]._id;
  const apply = process.argv.includes("--apply");
  const session = await mongoose.startSession();
  let activated = 0, skipped = 0, projects = 0, receipts = 0, returns = 0;
  try {
    await session.withTransaction(async () => {
      activated = skipped = projects = receipts = returns = 0;
      const customers = await CustomerModel.find({ historicalAccount: { $exists: true } }).session(session);
      if (!customers.length) throw new Error("No historical account snapshots found");
      for (const customer of customers) {
        const source = customer.historicalAccount!;
        const invoices = await InvoiceModel.find({
          customerId: customer._id, "historicalImport.sourceHash": source.sourceHash,
        }).session(session);
        const expected = source.entries.filter((entry) => entry.kind === "invoice");
        if (invoices.length !== expected.length) throw new Error("Source invoices are incomplete");
        let cash = 0;
        for (const entry of source.entries.filter((entry) => entry.kind !== "invoice")) {
          const kind = entry.kind === "receipt" ? "payment" : "credit_note";
          const key = `ledger:${source.sourceHash}:${entry.row}`;
          const existing = await FinancialEntryModel.findOne({ sourceKey: key }).session(session);
          if (kind === "payment") { receipts++; cash += entry.credit; } else returns++;
          if (existing) continue;
          const related = entry.relatedInvoiceNumber
            ? invoices.find((invoice) => invoice.invoiceNumber === entry.relatedInvoiceNumber) : undefined;
          if (entry.relatedInvoiceNumber && !related) throw new Error("An explicit source invoice reference was not found");
          const record = new FinancialEntryModel({
            sourceKey: key, customerId: customer._id, kind, amount: entry.credit,
            date: entry.date, reference: entry.reference, note: entry.description,
            sourceHash: source.sourceHash, sourceRow: entry.row, createdBy: actor,
            allocations: related ? [{
              invoiceId: related._id, amount: entry.credit, allocatedAt: new Date(), allocatedBy: actor,
            }] : [],
          });
          await record.validate();
          if (apply) await record.save({ session });
        }
        let anyActivation = false;
        for (const invoice of invoices) {
          if (invoice.operationalImport) { skipped++; continue; }
          const entry = expected.find((row) => row.row === invoice.historicalImport!.sourceRow);
          if (!entry || invoice.total !== entry.debit || invoice.status !== "draft" || invoice.items.length) {
            throw new Error("Historical record differs from the original source");
          }
          const related = source.entries.filter((row) => row.relatedInvoiceNumber === invoice.invoiceNumber);
          const paidAmount = money(related.filter((row) => row.kind === "receipt").reduce((sum, row) => sum + row.credit, 0));
          const creditedAmount = money(related.filter((row) => row.kind === "credit_note").reduce((sum, row) => sum + row.credit, 0));
          if (cents(paidAmount + creditedAmount) > cents(invoice.total)) throw new Error("Source allocations exceed invoice total");
          // Preserve inclusive totals exactly. Rounding the net unit price to two
          // decimals before computing VAT can otherwise lose a halala.
          const unitPrice = Math.round(invoice.total / 1.15 * 1_000_000) / 1_000_000;
          const subtotal = money(unitPrice);
          const tax = money(unitPrice * .15);
          if (cents(subtotal + tax) !== cents(invoice.total)) throw new Error("Inclusive tax rounding requires review");
          const projectNumber = `PRJ-IMPORT-${invoice.invoiceNumber}`;
          const collision = await ProjectModel.exists({ projectNumber }).session(session);
          if (collision) throw new Error("Project reference already exists without an activated invoice");
          const project = new ProjectModel({
            projectNumber, name: `متابعة ${invoice.invoiceNumber} - ${customer.name}`,
            nameAr: `متابعة ${invoice.invoiceNumber} - ${customer.name}`,
            description: "ملف متابعة إداري أنشئ بطلب المالك لكل فاتورة. نوع الخدمة وتواريخ التنفيذ بحاجة لاستكمال، ولا يدل السداد على اكتمال المشروع.",
            customerId: customer._id, manager: actor, stage: "review",
            stageHistory: [{ stage: "review", changedAt: new Date(), changedBy: actor, note: "إنشاء ملف متابعة مستقل لفاتورة مستوردة" }],
            progress: 0, status: "active", budget: invoice.total, currency: "SAR",
            tags: ["ledger-activation", invoice.invoiceNumber],
          });
          await project.validate();
          projects++; activated++; anyActivation = true;
          const status = settlementStatus({ total: invoice.total, paidAmount, creditedAmount });
          const paidDate = related.filter((row) => row.kind === "receipt").map((row) => new Date(row.date))
            .sort((a, b) => b.getTime() - a.getTime())[0];
          const updates = {
            operationalImport: {
              activatedAt: new Date(), activatedBy: actor, confirmedTaxRate: 15,
              sourceInvoiceTotal: entry.debit, sourceItemsUnavailable: true,
            },
            projectId: project._id,
            items: [{
              description: `Imported service balance — ${invoice.invoiceNumber} (scope to be completed)`,
              descriptionAr: `رصيد خدمات حسب الفاتورة ${invoice.invoiceNumber} — تفاصيل الخدمة للاستكمال`,
              quantity: 1, unitPrice, discount: 0, tax: 15, total: invoice.total,
            }],
            subtotal, tax, discount: 0, paidAmount, creditedAmount, status,
            ...(status === "paid" && paidDate ? { paidAt: paidDate } : {}),
            notesAr: "أعيد تكوين هذه النسخة من كشف الحساب بالرقم والتاريخ الأصليين. أكد المالك أن الإجمالي شامل ضريبة ١٥٪. وصف الخدمة تجميعي ويحتاج استكمالًا من المستند الأصلي. السداد المسجل على الفاتورة مرتبط فقط بالمراجع الصريحة في الكشف؛ الأرصدة غير المرتبطة محفوظة على حساب العميل.",
          };
          if (apply) {
            await project.save({ session });
            // Metadata is set exactly once by this audited migration, not an HTTP update.
            await InvoiceModel.collection.updateOne(
              { _id: invoice._id, operationalImport: { $exists: false }, __v: invoice.__v },
              { $set: { ...updates, updatedAt: new Date() }, $inc: { __v: 1 } }, { session },
            );
          }
        }
        if (apply && anyActivation) {
          // Imported customers previously had no live revenue. Cash excludes returns.
          await CustomerModel.updateOne({ _id: customer._id }, { $inc: { totalRevenue: money(cash) } }, { session });
        }
      }
      if (apply && activated) await AuditLogModel.create([{
        userId: actor, action: "activate_ledger_invoices", entity: "Invoice",
        description: "اعتماد المالك لمبالغ شاملة ضريبة ١٥٪ ومشروع متابعة مستقل لكل فاتورة، دون تخمين توزيع الأرصدة",
        metadata: { activated, projects, receipts, returns, taxIncluded: true, taxRate: 15 },
      }], { session });
    });
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", activated, skipped, projects, receipts, returns }));
  } finally { await session.endSession(); }
}
main().catch((error) => {
  console.error("Activation failed:", error instanceof mongoose.mongo.MongoServerError ? "Database operation rejected" :
    error.message?.replace(/mongodb(?:\+srv)?:\/\/\S+/g, "[redacted]"));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
