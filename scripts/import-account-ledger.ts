/**
 * Dry run: npx tsx scripts/import-account-ledger.ts FILE.xlsx --as-of=YYYY-MM-DD
 * Add --apply after reviewing the validated counts. Uses the app's existing MongoDB.
 * No contact details, projects, quotations, taxes or payment allocations are guessed.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import mongoose from "mongoose";
import { CustomerModel } from "../server/models/Customer.js";
import { InvoiceModel } from "../server/models/Invoice.js";
import { AuditLogModel } from "../server/models/AuditLog.js";
import { UserModel } from "../server/models/User.js";
import type { HistoricalAccountEntry } from "../server/models/HistoricalAccount.js";

type SourceAccount = {
  name: string; accountCode: string; debit: number; credit: number; balance: number;
  entries: HistoricalAccountEntry[];
};
const normalize = (name: string) => name.normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();
const ensure = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const asOfText = args.find((arg) => arg.startsWith("--as-of="))?.split("=")[1];
  ensure(file && asOfText && /^\d{4}-\d{2}-\d{2}$/.test(asOfText), "Provide FILE.xlsx and --as-of=YYYY-MM-DD");
  const asOf = new Date(`${asOfText}T00:00:00.000Z`);
  ensure(Number.isFinite(asOf.getTime()), "Invalid cutoff date");
  const sourceHash = createHash("sha256").update(readFileSync(file!)).digest("hex");
  const source = JSON.parse(execFileSync("python", ["scripts/extract-account-ledger.py", file!], {
    encoding: "utf8", maxBuffer: 5_000_000,
  })) as { accounts: SourceAccount[]; totals: { debit: number; credit: number; balance: number } };
  const entries = source.accounts.flatMap((account) => account.entries);
  ensure(entries.every((entry) => new Date(entry.date) <= asOf), "Entry is later than cutoff date");
  const counts = {
    customers: source.accounts.length,
    invoices: entries.filter((entry) => entry.kind === "invoice").length,
    receipts: entries.filter((entry) => entry.kind === "receipt").length,
    returns: entries.filter((entry) => entry.kind === "credit_note").length,
  };
  console.log(JSON.stringify({ mode: args.includes("--apply") ? "apply" : "dry-run", counts, totals: source.totals }));
  ensure(process.env.MONGODB_URI, "MONGODB_URI must already be configured");
  await mongoose.connect(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 10_000 });
  const admins = await UserModel.find({ role: "super_admin" }).select("_id").lean();
  ensure(admins.length === 1, "An unambiguous super-admin audit actor is required");
  const actor = admins[0]._id;
  const session = await mongoose.startSession();
  let createdCustomers = 0, matchedCustomers = 0, createdInvoices = 0, unchangedInvoices = 0;
  try {
    await session.withTransaction(async () => {
      // Reset counters if MongoDB retries the transaction.
      createdCustomers = matchedCustomers = createdInvoices = unchangedInvoices = 0;
      const customers = await CustomerModel.find().session(session);
      for (const account of source.accounts) {
        const matches = customers.filter((candidate) =>
          candidate.historicalAccount?.accountCode === account.accountCode ||
          [candidate.name, candidate.nameAr, candidate.companyName].some((name) => name && normalize(name) === normalize(account.name)),
        );
        ensure(matches.length <= 1, "Ambiguous existing customer; manual matching required");
        let customer = matches[0];
        if (customer?.historicalAccount) {
          ensure(customer.historicalAccount.sourceHash === sourceHash, "Customer already has a different ledger snapshot");
          ensure(customer.historicalAccount.accountCode === account.accountCode, "Source account collision");
        }
        if (customer) matchedCustomers++;
        else createdCustomers++;
        if (!customer) {
          customer = new CustomerModel({
            name: account.name,
            companyName: account.name,
            currency: "SAR",
            // No invented email, phone, tax number, login, assigned manager, or revenue.
            tags: ["historical-ledger"],
          });
          customers.push(customer);
        }
        if (!customer.historicalAccount) {
          customer.historicalAccount = {
            sourceHash, sourceName: basename(file!), accountCode: account.accountCode,
            asOf, debit: account.debit, credit: account.credit, balance: account.balance,
            entries: account.entries,
          };
          await customer.validate();
          if (args.includes("--apply")) await customer.save({ session });
        }
        for (const entry of account.entries.filter((item) => item.kind === "invoice")) {
          const existing = await InvoiceModel.findOne({ invoiceNumber: entry.reference }).session(session);
          if (existing) {
            ensure(existing.historicalImport?.sourceHash === sourceHash &&
              existing.historicalImport.sourceRow === entry.row &&
              String(existing.customerId) === String(customer._id) &&
              existing.total === entry.debit, "Invoice number collision; existing invoice left untouched");
            unchangedInvoices++;
            continue;
          }
          createdInvoices++;
          const invoice = new InvoiceModel({
            invoiceNumber: entry.reference,
            type: "invoice", customerId: customer._id,
            items: [], subtotal: entry.debit, discount: 0, tax: 0, total: entry.debit,
            // Zero tax here is an unused storage default, NOT a tax-exempt assertion.
            // Immutable metadata prevents this incomplete reference from being issued.
            currency: "SAR", status: "draft", paidAmount: 0,
            historicalImport: {
              sourceHash, sourceRow: entry.row, accountCode: account.accountCode,
              asOf, taxDetailsUnavailable: true,
            },
            notesAr: "سجل تاريخي مستورد من كشف الحساب. الإجمالي والتاريخ والمرجع مطابقون للمصدر. تفاصيل البنود والضريبة غير متوفرة، ولا يصلح هذا السجل كفاتورة ضريبية جديدة. السداد والمرتجعات محفوظة في كشف حساب العميل دون تخمين توزيعها.",
            createdBy: actor, createdAt: new Date(entry.date), updatedAt: new Date(entry.date),
          });
          await invoice.validate();
          if (args.includes("--apply")) await invoice.save({ session, timestamps: false });
        }
      }
      if (args.includes("--apply") && (createdCustomers || createdInvoices)) {
        await AuditLogModel.create([{
          userId: actor, action: "import_historical_account_ledger", entity: "Customer",
          description: "استيراد كشف حساب تاريخي مع مطابقة الأرصدة ودون افتراض تفاصيل ضريبية أو مشاريع",
          metadata: { sourceHash, asOf, counts, totals: source.totals, createdCustomers, createdInvoices },
        }], { session });
      }
    });
    console.log(JSON.stringify({ createdCustomers, matchedCustomers, createdInvoices, unchangedInvoices, applied: args.includes("--apply") }));
    if (args.includes("--apply")) {
      const persisted = await CustomerModel.find({ "historicalAccount.sourceHash": sourceHash }).lean();
      const total = (field: "debit" | "credit" | "balance") =>
        persisted.reduce((sum, customer) => sum + customer.historicalAccount![field], 0);
      ensure(persisted.length === counts.customers, "Persisted customer count mismatch");
      ensure(await InvoiceModel.countDocuments({ "historicalImport.sourceHash": sourceHash }) === counts.invoices,
        "Persisted invoice count mismatch");
      for (const field of ["debit", "credit", "balance"] as const) {
        ensure(total(field) === source.totals[field], "Persisted balance mismatch");
      }
      console.log("VERIFIED: source counts and all account balances match persisted records.");
    }
  } finally {
    await session.endSession();
  }
}

main().catch((error) => {
  // Driver errors can contain connection information: never print secret-bearing error details.
  console.error("Import failed:", error instanceof mongoose.mongo.MongoServerError ? "Database operation rejected" :
    error instanceof mongoose.Error ? "Database validation failed" : error.message?.replace(/mongodb(?:\+srv)?:\/\/\S+/g, "[redacted]"));
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
