import { buildInvoiceHtml, renderHtmlToPdf, type CompanyProfile } from "./server/services/pdf.service.js";
import fs from "fs";
const company: CompanyProfile = { nameAr: "أفق", nameEn: "OFOQ", taxNumber: "-", commercialReg: "-", address: "-", phone: "+966500000000", email: "a@a.com", website: "https://a.com", logoDataUri: "", bankName: "-", bankIban: "-" };
const invoice = { invoiceNumber: "INV-TEST", type: "invoice", status: "draft", currency: "SAR", createdAt: new Date(), items: [{ description: "Test", quantity: 1, unitPrice: 100, discount: 0, tax: 15, total: 115 }], subtotal: 100, tax: 15, total: 115, paidAmount: 0 };
const customer = { name: "Test Customer", email: "t@t.com" };
const buf = await renderHtmlToPdf(buildInvoiceHtml(invoice, customer, company));
fs.writeFileSync("/tmp/final-test2.pdf", buf);
console.log("OK", buf.length);
process.exit(0);
