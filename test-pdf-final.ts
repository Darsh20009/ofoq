import { generateInvoicePdfBuffer } from "./server/services/pdf.service.js";
import fs from "fs";
const invoice = { invoiceNumber: "INV-TEST", type: "invoice", status: "draft", currency: "SAR", createdAt: new Date(), items: [{ description: "Test", quantity: 1, unitPrice: 100, discount: 0, tax: 15, total: 115 }], subtotal: 100, tax: 15, total: 115, paidAmount: 0 };
const customer = { name: "Test Customer", email: "t@t.com" };
const buf = await generateInvoicePdfBuffer(invoice, customer);
fs.writeFileSync("/tmp/final-test.pdf", buf);
console.log("OK", buf.length);
process.exit(0);
