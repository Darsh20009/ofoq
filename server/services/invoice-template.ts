import QRCode from "qrcode";
import type { CompanyProfile } from "./pdf.service.js";

interface DocumentAssets {
  logoDataUri: string;
  stampDataUri: string;
  cairoFontBase64: string;
}

// Contact details and print artwork are taken from the supplied invoice and
// quotation examples. Bank details remain editable in Billing settings.
const DOCUMENT_CONTACT = {
  nameAr: "أفق لحلول الأعمال",
  nameEn: "Ofoq for Business Solutions",
  addressAr: ["جدة، المملكة العربية السعودية", "طريق الملك عبدالله - البغدادية"],
  addressEn: ["Jeddah, Kingdom of Saudi Arabia", "King Abdullah Road - Al-Baghdadiyah"],
  phone: "+966 50 085 1177",
  email: "info@ofoqhc.com",
  website: "ofoqhc.com",
};

const PAYMENT_STATUS_AR: Record<string, string> = {
  draft: "مسودة",
  sent: "غير مدفوعة",
  viewed: "غير مدفوعة",
  accepted: "غير مدفوعة",
  partial: "مدفوعة جزئياً",
  paid: "مدفوعة",
  overdue: "متأخرة",
  cancelled: "ملغاة",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function money(value: unknown): string {
  return (Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function shortDate(value: unknown): string {
  const date = new Date(value as string | Date);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function lines(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br/>");
}

function qrPayload(invoice: any, company: CompanyProfile): string {
  const createdAt = new Date(invoice.createdAt || Date.now());
  const timestamp = Number.isNaN(createdAt.getTime()) ? new Date().toISOString() : createdAt.toISOString();
  const taxNumber = String(company.taxNumber || "").trim();
  if (/^\d{15}$/.test(taxNumber)) {
    const fields = [
      DOCUMENT_CONTACT.nameEn,
      taxNumber,
      timestamp,
      Number(invoice.total || 0).toFixed(2),
      Number(invoice.tax || 0).toFixed(2),
    ];
    return Buffer.concat(fields.map((value, index) => {
      const content = Buffer.from(value, "utf8");
      if (content.length > 255) throw new Error("Invoice QR field exceeds the allowed length");
      return Buffer.concat([Buffer.from([index + 1, content.length]), content]);
    })).toString("base64");
  }
  // Without a configured VAT number this QR links the invoice's public facts
  // only; it is not represented as a tax-compliance QR code.
  return [
    DOCUMENT_CONTACT.nameEn,
    invoice.invoiceNumber || "",
    timestamp,
    Number(invoice.total || 0).toFixed(2),
    Number(invoice.tax || 0).toFixed(2),
  ].join(" | ");
}

function invoiceQrSvg(invoice: any, company: CompanyProfile): string {
  const modules = QRCode.create(qrPayload(invoice, company), { errorCorrectionLevel: "M" }).modules;
  const squares: string[] = [];
  for (let y = 0; y < modules.size; y++) {
    for (let x = 0; x < modules.size; x++) {
      if (modules.get(y, x)) squares.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
  }
  return `<svg aria-label="Invoice QR code" xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ${modules.size + 4} ${modules.size + 4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${modules.size + 4}" height="${modules.size + 4}" fill="white"/><g fill="black">${squares.join("")}</g></svg>`;
}

export function buildReferenceInvoiceHtml(
  invoice: any,
  customer: any,
  company: CompanyProfile,
  includeBankDetails: boolean,
  assets: DocumentAssets,
): string {
  const isQuotation = invoice.type === "proforma";
  const currency = escapeHtml(invoice.currency || "SAR");
  const entries = Array.isArray(invoice.items) ? invoice.items : [];
  const itemDiscounts = entries.reduce((sum: number, item: any) => sum + Number(item.discount || 0), 0);
  const preTaxTotal = Math.max(0, Number(invoice.subtotal || 0) - itemDiscounts - Number(invoice.discount || 0));
  const balanceDue = Math.max(0, Number(invoice.total || 0) - Number(invoice.paidAmount || 0));
  const customerName = customer?.companyName || customer?.name || "-";
  const projectName = invoice.projectId?.name || invoice.projectId?.projectNumber;

  const itemRows = entries.map((item: any, index: number) => {
    const beforeTax = Math.max(0, Number(item.quantity || 0) * Number(item.unitPrice || 0) - Number(item.discount || 0));
    const taxValue = beforeTax * Number(item.tax || 0) / 100;
    return `<tr>
      <td class="cell-no">${index + 1}</td>
      <td class="cell-item">${item.descriptionAr ? `<span dir="rtl">${escapeHtml(item.descriptionAr)}</span><br/>` : ""}<span dir="ltr">${escapeHtml(item.description)}</span></td>
      <td class="numeric">${money(item.quantity)}</td>
      <td class="numeric">${money(item.unitPrice)}</td>
      <td class="numeric">${money(beforeTax)}</td>
      <td class="numeric">${money(taxValue)}</td>
      <td class="numeric">${money(beforeTax + taxValue)}</td>
    </tr>`;
  }).join("");

  const quoteNotes = [invoice.notesAr, invoice.notes, invoice.termsAr, invoice.terms].filter(Boolean);
  const bankConfigured = company.bankName !== "-" && company.bankIban !== "-";
  const bankSection = includeBankDetails
    ? `<section class="bank-details" dir="ltr">
        <h3>PAYMENT INFORMATION (Bank Transfer)</h3>
        ${bankConfigured ? `
          <p>Bank Name: <bdi>${escapeHtml(company.bankName)}</bdi></p>
          <p>IBAN: <bdi>${escapeHtml(company.bankIban)}</bdi></p>
          ${company.bankAccount && company.bankAccount !== "-" ? `<p>Account No: <bdi>${escapeHtml(company.bankAccount)}</bdi></p>` : ""}
          <p>Beneficiary: <bdi>${escapeHtml(company.bankBeneficiary && company.bankBeneficiary !== "-" ? company.bankBeneficiary : DOCUMENT_CONTACT.nameEn)}</bdi></p>
          ${company.bankSwift && company.bankSwift !== "-" ? `<p>SWIFT Code: <bdi>${escapeHtml(company.bankSwift)}</bdi></p>` : ""}
        ` : `<p class="bank-warning">لم تُضف بيانات البنك بعد. Bank details are not configured yet.</p>`}
      </section>`
    : "";
  const dueNote = invoice.dueDate
    ? `<span>يرجى سداد الفاتورة بحلول ${escapeHtml(shortDate(invoice.dueDate))}.</span><span>Payment is due by ${escapeHtml(shortDate(invoice.dueDate))}.</span>`
    : "<span>يجب دفع مبلغ الفاتورة خلال يومين من تاريخ إصدار الفاتورة.</span><span>Payment is due within 2 days from the invoice date.</span>";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${isQuotation ? "عرض سعر" : "فاتورة ضريبية"} ${escapeHtml(invoice.invoiceNumber || "")}</title>
  <style>
    ${assets.cairoFontBase64 ? `@font-face { font-family: Cairo; src: url(data:font/ttf;base64,${assets.cairoFontBase64}) format("truetype"); }` : ""}
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; color: #161616; background: #fff; font-family: Arial, Cairo, Tahoma, sans-serif; font-size: 10px; }
    .invoice-page { width: 210mm; min-height: 297mm; padding: 4mm 3.5mm 6mm; }
    .document-head { direction: ltr; display: grid; grid-template-columns: 1fr 32mm 1fr; gap: 3mm; align-items: start; min-height: 41mm; border-bottom: 1px solid #5b5b5b; padding-bottom: 3mm; }
    .company-side { display: flex; flex-direction: column; font-size: 12px; line-height: 1.4; }
    .company-side strong { margin-bottom: 1mm; font-size: 14px; line-height: 1.55; font-weight: 800; }
    .company-en { text-align: left; direction: ltr; }
    .company-ar { text-align: right; direction: rtl; }
    .logo-center { text-align: center; }
    .logo-center img { display: block; width: 31mm; height: auto; margin: 3mm auto 0; }
    .document-title { text-align: center; min-height: 11mm; padding-top: 1mm; line-height: 1.05; }
    .document-title h1 { margin: 0; font-family: Cairo, Arial, sans-serif; font-size: 17px; font-weight: 800; }
    .document-title p { margin: 0; font-size: 14px; font-weight: 800; }
    .document-meta { direction: ltr; display: grid; grid-template-columns: 1fr 1fr; min-height: 15mm; align-items: center; font-size: 11px; }
    .meta-left { text-align: left; line-height: 1.55; }
    .meta-line { display: flex; gap: 3mm; }
    .meta-line .meta-value { width: 27mm; flex: none; }
    .meta-client { direction: rtl; text-align: right; font-size: 11px; }
    .meta-client strong { margin-inline-start: 3mm; font-weight: 700; }
    .meta-client small { display: block; font-size: 8px; color: #444; }
    .items { direction: rtl; width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 1.5mm; }
    .items thead { display: table-header-group; }
    .items tr { break-inside: avoid; }
    .items th, .items td { border: 1px solid #4b4b4b; text-align: center; vertical-align: middle; }
    .items th { background: #f0f0f0; height: 18mm; padding: 1mm; font-size: 11px; font-weight: 700; line-height: 1.08; }
    .items th span { font-weight: 400; }
    .items td { min-height: 11mm; padding: 3mm 1mm; font-size: 11px; line-height: 1.25; }
    .items th:nth-child(1) { width: 5%; }
    .items th:nth-child(2) { width: 40%; }
    .items th:nth-child(3) { width: 8%; }
    .items th:nth-child(4) { width: 11%; }
    .items th:nth-child(5) { width: 17%; }
    .items th:nth-child(6) { width: 10%; }
    .items th:nth-child(7) { width: 9%; }
    .cell-item { overflow-wrap: anywhere; }
    .cell-item span { display: inline-block; }
    .numeric { direction: ltr; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .totals { direction: ltr; width: 40%; margin-right: auto; margin-left: 0; }
    .total-row { display: flex; align-items: center; justify-content: space-between; min-height: 13mm; border-bottom: 1px solid #555; padding: 1mm 0; font-size: 11.5px; }
    .total-row .amount { font-weight: 700; direction: ltr; white-space: nowrap; }
    .total-row .label { text-align: left; width: 64%; line-height: 1.2; }
    .total-row .label span { display: block; }
    .seal-row { direction: ltr; display: flex; align-items: flex-start; justify-content: space-between; min-height: 35mm; margin-top: 0; }
    .stamp { width: 35mm; height: 35mm; margin-left: 12mm; object-fit: contain; transform: translateY(4mm); }
    .quotation-scope { direction: rtl; max-width: 58%; margin-top: 28mm; text-align: right; font-family: Cairo, Arial, sans-serif; font-size: 12px; font-weight: 700; line-height: 1.45; }
    .quotation-scope h3 { font-size: 11px; margin: 0 0 2mm; }
    .quotation-scope p { margin: 0 0 2mm; white-space: normal; }
    .payment-row { direction: ltr; display: flex; justify-content: space-between; align-items: flex-end; margin-top: 10mm; break-inside: avoid; }
    .bank-details { width: 65%; text-align: left; font-size: 13px; line-height: 1.45; }
    .bank-details h3 { margin: 0 0 1mm; font-size: 13px; font-weight: 800; }
    .bank-details p { margin: 0; overflow-wrap: anywhere; }
    .bank-details bdi { direction: ltr; unicode-bidi: isolate; }
    .bank-warning { color: #9a3412; font-weight: 700; }
    .qr-code { width: 32mm; height: 32mm; }
    .qr-code svg { width: 100%; height: 100%; display: block; }
    .due-note { display: flex; flex-direction: column; margin-top: 1mm; text-align: center; font-size: 11px; line-height: 1.3; }
    .invoice-notes { margin-top: 5mm; font-size: 9px; line-height: 1.45; }
    .invoice-notes p { margin: 0 0 2mm; }
  </style>
</head>
<body>
  <main class="invoice-page">
    <header class="document-head">
      <div class="company-side company-en">
        <strong>${DOCUMENT_CONTACT.nameEn}</strong>
        ${DOCUMENT_CONTACT.addressEn.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
        <span>${DOCUMENT_CONTACT.phone}</span>
        <span>${DOCUMENT_CONTACT.email}</span>
        <span>${DOCUMENT_CONTACT.website}</span>
      </div>
      <div class="logo-center"><img src="${assets.logoDataUri}" alt="Ofoq for Business Solutions"/></div>
      <div class="company-side company-ar">
        <strong>${DOCUMENT_CONTACT.nameAr}</strong>
        ${DOCUMENT_CONTACT.addressAr.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
        <span dir="ltr">${DOCUMENT_CONTACT.phone}</span>
        <span dir="ltr">${DOCUMENT_CONTACT.email}</span>
        <span dir="ltr">${DOCUMENT_CONTACT.website}</span>
      </div>
    </header>
    <div class="document-title">
      <h1>${isQuotation ? "عرض سعر" : "فاتورة ضريبية"}</h1>
      <p>${isQuotation ? "QUOTATION" : "TAX INVOICE"}</p>
    </div>
    <section class="document-meta">
      <div class="meta-left">
        <div class="meta-line"><span class="meta-value">${escapeHtml(invoice.invoiceNumber || "-")}</span><span>الرقم - Number</span></div>
        <div class="meta-line"><span class="meta-value">${escapeHtml(shortDate(invoice.createdAt))}</span><span>التاريخ - Date</span></div>
        ${isQuotation ? "" : `<div class="meta-line"><span class="meta-value">${escapeHtml(PAYMENT_STATUS_AR[invoice.status] || invoice.status || "-")}</span><span>حالة الدفع - Payment Status</span></div>`}
      </div>
      <div class="meta-client">
        <span>العميل - Client</span><strong>${escapeHtml(customerName)}</strong>
        ${projectName ? `<small>المشروع - Project: ${escapeHtml(projectName)}</small>` : ""}
      </div>
    </section>
    <table class="items">
      <thead><tr>
        <th>م<br/><span>No.</span></th>
        <th>البند<br/><span>Item</span></th>
        <th>الكمية<br/><span>Quantity</span></th>
        <th>السعر<br/><span>Price</span></th>
        <th>المجموع بدون الضريبة<br/><span>Pre-Tax Total</span></th>
        <th>قيمة الضريبة<br/><span>Tax Value</span></th>
        <th>المجموع<br/><span>Total</span></th>
      </tr></thead>
      <tbody>${itemRows || `<tr><td colspan="7">لا توجد بنود</td></tr>`}</tbody>
    </table>
    <section class="totals">
      <div class="total-row"><strong class="amount">${money(preTaxTotal)}</strong><span class="label"><span>الإجمالي قبل الضريبة</span><span>Pre-Tax Total</span></span></div>
      <div class="total-row"><strong class="amount">${money(invoice.total)}</strong><span class="label"><span>الإجمالي (${currency})</span><span>Total (${currency})</span></span></div>
      <div class="total-row"><strong class="amount">${money(isQuotation ? invoice.total : balanceDue)}</strong><span class="label"><span>المستحق (${currency})</span><span>Due (${currency})</span></span></div>
    </section>
    <div class="seal-row">
      <img class="stamp" src="${assets.stampDataUri}" alt="Ofoq company seal"/>
      ${isQuotation && quoteNotes.length ? `<section class="quotation-scope"><h3>الخدمات المقدمة تشمل:</h3>${quoteNotes.map((note) => `<p>${lines(note)}</p>`).join("")}</section>` : ""}
    </div>
    ${isQuotation
      ? (bankSection ? `<div class="payment-row">${bankSection}</div>` : "")
      : `<div class="payment-row">${bankSection}<div class="qr-code">${invoiceQrSvg(invoice, company)}</div></div>
         <p class="due-note">${dueNote}</p>
         ${quoteNotes.length ? `<section class="invoice-notes">${quoteNotes.map((note) => `<p>${lines(note)}</p>`).join("")}</section>` : ""}`}
  </main>
</body>
</html>`;
}