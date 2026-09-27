import puppeteer, { Browser } from "puppeteer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SystemSettingsModel } from "../models/SystemSettings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Chromium Executable Resolution ─────────────────────────────────
// Replit's Nix sandbox lacks standard FHS shared libraries, so a generically
// downloaded Chromium binary (like puppeteer's own bundled download) fails to
// launch there with "libglib-2.0.so.0: cannot open shared object file". The
// Nix-provided system `chromium` package is compiled against the sandbox's
// actual libraries and works reliably in Replit dev.
// On a standard Linux host (e.g. Render), there is no Nix `chromium` binary,
// but puppeteer's own bundled download works fine since it's a normal glibc
// environment. So: prefer an explicit override, then system chromium, then
// fall back to puppeteer's bundled Chromium last (for portability to Render
// and other standard hosts).
let cachedChromiumPath: string | null = null;

function resolveChromiumPath(): string {
  if (cachedChromiumPath) return cachedChromiumPath;
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROMIUM_PATH,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      cachedChromiumPath = candidate;
      return candidate;
    }
  }

  try {
    const found = execSync("which chromium || which chromium-browser", { encoding: "utf-8" }).trim().split("\n")[0];
    if (found && fs.existsSync(found)) {
      cachedChromiumPath = found;
      return found;
    }
  } catch {
    // fall through
  }

  try {
    const bundled = puppeteer.executablePath();
    if (bundled && fs.existsSync(bundled)) {
      cachedChromiumPath = bundled;
      return bundled;
    }
  } catch {
    // fall through
  }

  throw new Error("لم يتم العثور على متصفح Chromium لإنشاء ملفات PDF");
}

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      executablePath: resolveChromiumPath(),
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close().catch(() => {});
    browserPromise = null;
  }
}

// ── HTML → PDF Buffer ───────────────────────────────────────────────
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: "load" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
    });
    return Buffer.from(buffer);
  } finally {
    await page.close().catch(() => {});
  }
}

// ── Company Profile (from SystemSettings, with sane defaults) ──────
export interface CompanyProfile {
  nameAr: string;
  nameEn: string;
  taxNumber: string;
  commercialReg: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoDataUri: string;
  bankName: string;
  bankIban: string;
}

let cachedLogoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  try {
    const logoPath = path.join(process.cwd(), "public", "icons", "logo.png");
    const buf = fs.readFileSync(logoPath);
    cachedLogoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    cachedLogoDataUri = "";
  }
  return cachedLogoDataUri;
}

let cachedFontBase64: string | null = null;
function getCairoFontBase64(): string {
  if (cachedFontBase64 !== null) return cachedFontBase64;
  try {
    const fontPath = path.join(__dirname, "..", "assets", "fonts", "Cairo-Regular.ttf");
    cachedFontBase64 = fs.readFileSync(fontPath).toString("base64");
  } catch {
    cachedFontBase64 = "";
  }
  return cachedFontBase64;
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const settings = await SystemSettingsModel.find({
    key: { $in: [
      "app_name", "app_name_en", "company_tax_number", "company_commercial_reg",
      "company_address", "company_phone", "company_email", "app_url",
      "company_bank_name", "company_bank_iban",
    ] },
  }).lean();
  const map: Record<string, any> = {};
  for (const s of settings) map[s.key] = s.value;

  return {
    nameAr: map.app_name || "أفق لحلول الأعمال",
    nameEn: map.app_name_en || "OFOQ Business Solutions",
    taxNumber: map.company_tax_number || "-",
    commercialReg: map.company_commercial_reg || "-",
    address: map.company_address || "المملكة العربية السعودية",
    phone: map.company_phone || "-",
    email: map.company_email || process.env.CPANEL_SMTP_USER || "info@ofoq.sa",
    website: map.app_url || process.env.APP_URL || "https://ofoq.qirox.online",
    logoDataUri: getLogoDataUri(),
    bankName: map.company_bank_name || "-",
    bankIban: map.company_bank_iban || "-",
  };
}

// ── Shared Document Chrome (fonts + base styles) ────────────────────
function docShell(title: string, bodyHtml: string): string {
  const fontBase64 = getCairoFontBase64();
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  ${fontBase64 ? `@font-face {
    font-family: 'Cairo';
    src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
    font-weight: 200 900;
  }` : ""}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    font-family: 'Cairo', 'Amiri', 'Segoe UI', Tahoma, Arial, sans-serif;
    color: #262338;
    font-size: 13px;
    direction: rtl;
  }
  .page { width: 210mm; min-height: 297mm; padding: 14mm 16mm; position: relative; }
  .brand-bar { height: 6px; background: linear-gradient(90deg, #1C2B6E 0%, #C13229 100%); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 0 18px; border-bottom: 2px solid #f0f1f5; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 52px; height: 52px; border-radius: 12px; }
  .brand .names h1 { font-size: 18px; color: #2B273F; font-weight: 800; }
  .brand .names p { font-size: 11px; color: #8b879c; margin-top: 2px; }
  .doc-title { text-align: left; }
  .doc-title h2 { font-size: 24px; color: #2B273F; font-weight: 800; letter-spacing: 0.5px; }
  .doc-title .num { font-size: 13px; color: #1C2B6E; font-weight: 700; margin-top: 4px; direction: ltr; text-align: left; }
  .status-badge { display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .meta-grid { display: flex; justify-content: space-between; gap: 24px; margin: 22px 0; }
  .meta-box { flex: 1; background: #f8f9fb; border-radius: 10px; padding: 14px 16px; }
  .meta-box h3 { font-size: 11px; color: #9691a8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px; }
  .meta-box p { font-size: 13px; color: #2B273F; line-height: 1.9; }
  .meta-box p strong { color: #1C2B6E; }
  table.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
  table.items thead th { background: #2B273F; color: #fff; font-size: 11.5px; padding: 10px 12px; text-align: right; }
  table.items thead th:first-child { border-radius: 8px 0 0 0; }
  table.items thead th:last-child { border-radius: 0 8px 0 0; }
  table.items tbody td { padding: 10px 12px; font-size: 12.5px; border-bottom: 1px solid #eef0f4; }
  table.items tbody tr:nth-child(even) { background: #fafafd; }
  .num-cell { direction: ltr; text-align: left; font-variant-numeric: tabular-nums; }
  .totals { margin-top: 16px; margin-inline-start: auto; width: 280px; }
  .totals .row { display: flex; justify-content: space-between; padding: 7px 4px; font-size: 12.5px; color: #4d4a5e; }
  .totals .row.grand { border-top: 2px solid #2B273F; margin-top: 6px; padding-top: 12px; font-size: 16px; font-weight: 800; color: #2B273F; }
  .totals .row.grand .amt { color: #1C2B6E; }
  .notes { margin-top: 26px; background: #F4F1EC; border-inline-start: 4px solid #C13229; padding: 12px 16px; border-radius: 6px; font-size: 12px; line-height: 1.8; color: #5c5870; }
  .footer { position: absolute; bottom: 12mm; left: 16mm; right: 16mm; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
  .footer p { font-size: 10.5px; color: #a19dae; line-height: 1.7; }
  .footer .brand-name { color: #1C2B6E; font-weight: 700; }
  .parties { display: flex; gap: 20px; margin: 22px 0; }
  .party { flex: 1; border: 1px solid #eef0f4; border-radius: 10px; padding: 16px; }
  .party h4 { font-size: 11px; color: #1C2B6E; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px; }
  .party p { font-size: 13px; line-height: 1.9; color: #2B273F; }
  .contract-body { margin-top: 20px; font-size: 13px; line-height: 2.1; color: #3a3750; white-space: pre-wrap; }
   .contract-section { margin-top: 20px; page-break-inside: avoid; }
   .contract-section h3 { color: #2B273F; font-size: 14px; padding-bottom: 7px; margin-bottom: 9px; border-bottom: 2px solid #1C2B6E; }
   .contract-section .section-content { white-space: pre-wrap; font-size: 13px; line-height: 2.1; color: #3a3750; }
  .sig-grid { display: flex; justify-content: space-between; margin-top: 50px; gap: 30px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-top: 1.5px solid #2B273F; margin-top: 50px; padding-top: 8px; font-size: 12px; color: #6d6a7e; }
   .approval-grid { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 48px; }
   .approval-field { flex: 1 1 40%; min-width: 200px; text-align: center; min-height: 112px; border: 1px dashed #b8b5c6; border-radius: 10px; padding: 13px; }
   .approval-space { height: 48px; }
   .stamp-space { height: 64px; width: 64px; border: 1.5px dashed #a19dae; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #9691a8; font-size: 10px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function statusBadge(status: string, labels: Record<string, string>, colors: Record<string, [string, string]>): string {
  const label = labels[status] || status;
  const [bg, fg] = colors[status] || ["#eee", "#333"];
  return `<span class="status-badge" style="background:${bg};color:${fg}">${label}</span>`;
}

function formatMoney(n: number): string {
  return (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ltr(text: string): string {
  return `<bdi dir="ltr" style="unicode-bidi:isolate">${text}</bdi>`;
}

function formatDate(d?: Date | string): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", sent: "مرسلة", viewed: "تمت المشاهدة", partial: "مدفوعة جزئياً",
  paid: "مدفوعة بالكامل", accepted: "معتمد", overdue: "متأخرة", cancelled: "ملغاة",
};
const INVOICE_STATUS_COLORS: Record<string, [string, string]> = {
  draft: ["#eef0f4", "#6d6a7e"], sent: ["#e8f0ff", "#2563eb"], viewed: ["#eef2ff", "#4f46e5"],
  partial: ["#fff7e0", "#b45309"], paid: ["#e6f9ef", "#0f8f5a"], overdue: ["#fde8e8", "#c0392b"],
  cancelled: ["#f3f3f3", "#888"],
};

// ── Invoice PDF ──────────────────────────────────────────────────────
export function buildInvoiceHtml(
  invoice: any,
  customer: any,
  company: CompanyProfile,
  includeBankDetails = true,
): string {
  const isQuotation = invoice.type === "proforma";
  const arTitle = isQuotation ? "عرض سعر" : "فاتورة ضريبية";
  const enTitle = isQuotation ? "QUOTATION" : "TAX INVOICE";
  const rawItems = Array.isArray(invoice.items) ? invoice.items : [];
  const itemDiscounts = rawItems.reduce((sum: number, item: any) => sum + Number(item.discount || 0), 0);
  const rows = rawItems.map((item: any, index: number) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const itemDiscount = Number(item.discount || 0);
    const taxRate = Number(item.tax || 0);
    const preTax = Math.max(0, quantity * unitPrice - itemDiscount);
    const taxValue = preTax * taxRate / 100;
    return `
      <tr>
        <td class="center">${index + 1}</td>
        <td class="item-name">${escapeHtml(item.description)}${item.descriptionAr ? `<br/><span>${escapeHtml(item.descriptionAr)}</span>` : ""}</td>
        <td class="number">${formatMoney(quantity)}</td>
        <td class="number">${formatMoney(unitPrice)}</td>
        <td class="number">${formatMoney(preTax)}</td>
        <td class="number">${formatMoney(taxRate)}%</td>
        <td class="number">${formatMoney(taxValue)}</td>
        <td class="number strong">${formatMoney(preTax + taxValue)}</td>
      </tr>`;
  }).join("");
  const balanceDue = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));
  const preTaxTotal = Math.max(0, Number(invoice.subtotal || 0) - itemDiscounts - Number(invoice.discount || 0));
  const bankConfigured = company.bankName !== "-" && company.bankIban !== "-";
  const bankBlock = includeBankDetails
    ? `<section class="bank-details">
        <h3>بيانات التحويل البنكي <span>PAYMENT INFORMATION</span></h3>
        ${bankConfigured ? `
          <p><strong>البنك / Bank:</strong> ${escapeHtml(company.bankName)}</p>
          <p><strong>رقم الآيبان / IBAN:</strong> ${ltr(escapeHtml(company.bankIban))}</p>
          <p><strong>المستفيد / Beneficiary:</strong> ${escapeHtml(company.nameEn)}</p>
        ` : `<p class="bank-missing">لم تُضف بيانات البنك بعد؛ أكمل الإعدادات قبل إرسال المستند. Bank details are not configured yet; add them before sending this document.</p>`}
      </section>`
    : "";
  const invoiceDate = formatDate(invoice.createdAt);
  const customerName = customer?.companyName || customer?.name || "-";
  const projectName = invoice.projectId?.name || invoice.projectId?.projectNumber;
  const body = `
  <div class="page invoice-page">
    <header class="document-head">
      <div class="company-side company-en">
        <strong>${escapeHtml(company.nameEn)}</strong>
        <span>${escapeHtml(company.address)}</span>
        <span>${ltr(escapeHtml(company.phone))}</span>
        <span>${escapeHtml(company.email)}</span>
        <span>${escapeHtml(company.website)}</span>
      </div>
      <div class="logo-center">${company.logoDataUri ? `<img src="${company.logoDataUri}" alt="OFOQ" />` : `<strong class="logo-fallback">OFOQ</strong>`}</div>
      <div class="company-side company-ar">
        <strong>${escapeHtml(company.nameAr)}</strong>
        <span>${escapeHtml(company.address)}</span>
        <span>${ltr(escapeHtml(company.phone))}</span>
        <span>${escapeHtml(company.email)}</span>
        <span>${escapeHtml(company.website)}</span>
      </div>
    </header>
    <div class="document-title">
      <h1>${arTitle}</h1>
      <p>${enTitle}</p>
    </div>
    <section class="document-meta">
      <div><span>الرقم · Number</span><strong>${ltr(escapeHtml(invoice.invoiceNumber || "-"))}</strong></div>
      <div><span>التاريخ · Date</span><strong>${escapeHtml(invoiceDate)}</strong></div>
      <div><span>${isQuotation ? "حالة العرض · Status" : "حالة الدفع · Payment status"}</span><strong>${escapeHtml(INVOICE_STATUS_LABELS[invoice.status] || invoice.status || "-")}</strong></div>
      <div><span>العميل · Client</span><strong>${escapeHtml(customerName)}</strong></div>
    </section>
    <section class="customer-details">
      <span>${escapeHtml(customer?.name || customerName)}</span>
      ${customer?.email ? `<span>${escapeHtml(customer.email)}</span>` : ""}
      ${customer?.phone ? `<span>${ltr(escapeHtml(customer.phone))}</span>` : ""}
      ${customer?.taxNumber ? `<span>الرقم الضريبي · VAT: ${ltr(escapeHtml(customer.taxNumber))}</span>` : ""}
      ${projectName ? `<span>المشروع · Project: ${escapeHtml(projectName)}</span>` : ""}
    </section>
    <table class="items document-items">
      <thead><tr>
        <th class="center">م<br/>No.</th>
        <th>البند<br/>Item</th>
        <th>الكمية<br/>Qty</th>
        <th>السعر<br/>Price</th>
        <th>المجموع قبل الضريبة<br/>Pre-Tax Total</th>
        <th>نسبة الضريبة<br/>Tax %</th>
        <th>قيمة الضريبة<br/>Tax Value</th>
        <th>المجموع<br/>Total</th>
      </tr></thead>
      <tbody>${rows || `<tr><td colspan="8" class="center">لا توجد بنود</td></tr>`}</tbody>
    </table>
    <section class="totals">
      <div><span>الإجمالي قبل الضريبة <small>Pre-Tax Total</small></span><strong>${formatMoney(preTaxTotal)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>
      ${invoice.discount ? `<div><span>الخصم <small>Discount</small></span><strong>− ${formatMoney(invoice.discount)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>` : ""}
      <div><span>ضريبة القيمة المضافة <small>VAT</small></span><strong>${formatMoney(invoice.tax)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>
      <div class="total-due"><span>${isQuotation ? "إجمالي العرض" : "الإجمالي المستحق"} <small>${isQuotation ? "Quotation Total" : "Total (SAR)"}</small></span><strong>${formatMoney(invoice.total)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>
      ${!isQuotation && invoice.paidAmount ? `<div><span>المدفوع · Paid</span><strong>${formatMoney(invoice.paidAmount)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>
      <div><span>المتبقي · Due</span><strong>${formatMoney(balanceDue)} ${escapeHtml(invoice.currency || "SAR")}</strong></div>` : ""}
    </section>
    ${(invoice.notesAr || invoice.notes || invoice.termsAr || invoice.terms) ? `
      <section class="document-notes">
        ${invoice.notesAr || invoice.notes ? `<p><strong>ملاحظات · Notes:</strong> ${escapeHtml(invoice.notesAr || invoice.notes)}</p>` : ""}
        ${invoice.termsAr || invoice.terms ? `<p><strong>الشروط · Terms:</strong> ${escapeHtml(invoice.termsAr || invoice.terms)}</p>` : ""}
      </section>` : ""}
    ${bankBlock}
    <footer class="document-footer">
      <span>${escapeHtml(company.nameAr)} · ${escapeHtml(company.nameEn)}</span>
      <span>${ltr(escapeHtml(company.phone))} · ${escapeHtml(company.email)} · ${escapeHtml(company.website)}</span>
      <span>${isQuotation ? "هذا العرض صادر عن نظام أفق." : "صدرت هذه الفاتورة إلكترونياً عبر نظام أفق."}</span>
    </footer>
  </div>`;

  const shell = docShell(`${arTitle} ${invoice.invoiceNumber || ""}`, body);
  return shell.replace(
    "</style>",
    `
      .invoice-page { padding: 9mm 10mm 13mm; color:#111827; font-size:10px; }
      .document-head { display:grid; grid-template-columns:1fr 78px 1fr; gap:12px; align-items:center; min-height:40mm; border-bottom:1px solid #707070; padding-bottom:5mm; }
      .company-side { display:flex; flex-direction:column; gap:2px; font-size:9px; line-height:1.35; color:#333; }
      .company-side strong { font-size:12px; color:#111; }
      .company-en { text-align:left; direction:ltr; }
      .company-ar { text-align:right; direction:rtl; }
      .logo-center { display:flex; justify-content:center; align-items:center; }
      .logo-center img { width:70px; height:70px; object-fit:contain; }
      .logo-fallback { color:#1C2B6E; font-size:19px; }
      .document-title { text-align:center; padding:4mm 0 2mm; color:#111; }
      .document-title h1 { font-size:17px; line-height:1.2; font-weight:800; }
      .document-title p { font-size:13px; font-weight:700; letter-spacing:.4px; }
      .document-meta { display:grid; grid-template-columns:1.1fr 1fr 1.1fr 1.4fr; gap:7px; margin:1mm 0 2mm; align-items:center; }
      .document-meta div { display:flex; flex-direction:column; gap:2px; }
      .document-meta span { font-size:9px; color:#555; }
      .document-meta strong { font-size:10px; font-weight:600; }
      .customer-details { display:flex; flex-wrap:wrap; align-items:center; gap:4px 14px; min-height:8mm; margin:1mm 0 3mm; font-size:9px; }
      table.document-items { margin:0; table-layout:fixed; border-collapse:collapse; }
      table.document-items th, table.document-items td { border:1px solid #777; padding:5px 4px; text-align:right; vertical-align:middle; font-size:8.5px; line-height:1.35; }
      table.document-items th { color:#222; background:#f1f1f1; font-size:8px; font-weight:700; text-align:center; }
      table.document-items th:nth-child(1) { width:5%; }
      table.document-items th:nth-child(2) { width:31%; }
      table.document-items th:nth-child(3) { width:8%; }
      table.document-items th:nth-child(4) { width:10%; }
      table.document-items th:nth-child(5) { width:14%; }
      table.document-items th:nth-child(6) { width:9%; }
      table.document-items th:nth-child(7) { width:11%; }
      table.document-items th:nth-child(8) { width:12%; }
      table.document-items td.center { text-align:center; }
      table.document-items td.number { direction:ltr; text-align:center; font-variant-numeric:tabular-nums; }
      table.document-items td.item-name { text-align:center; overflow-wrap:anywhere; }
      table.document-items td.item-name span { color:#555; font-size:8px; }
      table.document-items td.strong { font-weight:700; }
      .totals { margin:2mm auto 0 0; width:78mm; }
      .totals > div { display:flex; justify-content:space-between; align-items:center; gap:8px; border-bottom:1px solid #999; padding:3px 4px; font-size:9px; }
      .totals > div > span { display:flex; flex-direction:column; }
      .totals small { font-size:8px; color:#555; }
      .totals strong { direction:ltr; white-space:nowrap; text-align:left; font-variant-numeric:tabular-nums; }
      .totals .total-due { border-top:1px solid #777; border-bottom:2px solid #555; font-weight:800; }
      .document-notes { margin-top:5mm; padding:3mm; border:1px solid #ddd; font-size:9px; line-height:1.6; }
      .bank-details { margin-top:8mm; width:64%; border-top:1px solid #333; padding-top:3mm; direction:ltr; text-align:left; font-size:9px; line-height:1.5; }
      .bank-details h3 { margin-bottom:1mm; font-size:10px; }
      .bank-details h3 span { margin-left:4px; font-weight:600; }
      .bank-details p { overflow-wrap:anywhere; }
      .bank-details .bank-missing { color:#9a3412; font-weight:700; }
      .document-footer { margin-top:6mm; padding-top:3mm; border-top:1px solid #bbb; display:flex; flex-direction:column; text-align:center; gap:2px; font-size:8px; color:#555; }
      @media print { .invoice-page { min-height:277mm; } }
    </style>`,
  );
}

export async function generateInvoicePdfBuffer(
  invoice: any,
  customer: any,
  includeBankDetails = true,
): Promise<Buffer> {
  const company = await getCompanyProfile();
  const html = buildInvoiceHtml(invoice, customer, company, includeBankDetails);
  return renderHtmlToPdf(html);
}

// ── Contract PDF ─────────────────────────────────────────────────────
const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", sent: "مرسل للتوقيع", signed: "موقّع", active: "ساري", expired: "منتهي", cancelled: "ملغى",
};
const CONTRACT_STATUS_COLORS: Record<string, [string, string]> = {
  draft: ["#eef0f4", "#6d6a7e"], sent: ["#e8f0ff", "#2563eb"], signed: ["#e6f9ef", "#0f8f5a"],
  active: ["#e6f9ef", "#0f8f5a"], expired: ["#fde8e8", "#c0392b"], cancelled: ["#f3f3f3", "#888"],
};
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  service: "عقد تقديم خدمات", maintenance: "عقد صيانة", nda: "اتفاقية عدم إفصاح",
  partnership: "عقد شراكة", other: "عقد آخر",
};

export function buildContractHtml(contract: any, customer: any, company: CompanyProfile): string {
  const defaultContent = `يقر الطرفان بالموافقة على تنفيذ الأعمال والخدمات الموضحة في هذا العقد وفق النطاق والجدول الزمني والمقابل المالي المتفق عليه أدناه، ويلتزم كل طرف بتنفيذ التزاماته بحسن نية ووفقاً للأنظمة المعمول بها في المملكة العربية السعودية.`;
  const sections = Array.isArray(contract.sections) && contract.sections.length
    ? [...contract.sections].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    : [{ title: "بنود العقد", content: contract.content || contract.termsAr || contract.terms || defaultContent }];
  const sectionsHtml = sections.map((section: any, index: number) => `
    <section class="contract-section">
      <h3>${index + 1}. ${escapeHtml(section.title)}</h3>
      <div class="section-content">${escapeHtml(section.content)}</div>
    </section>`).join("");
  const defaultApprovalFields = [
    { type: "signature", label: `توقيع الطرف الأول — ${company.nameAr}` },
    { type: "signature", label: `توقيع الطرف الثاني — ${customer?.name || ""}` },
  ];
  const approvalFields = Array.isArray(contract.approvalFields) && contract.approvalFields.length
    ? contract.approvalFields
    : defaultApprovalFields;
  const approvalsHtml = approvalFields.map((field: any) => field.type === "stamp"
    ? `<div class="approval-field"><div class="stamp-space">ختم</div><div>${escapeHtml(field.label)}</div></div>`
    : `<div class="approval-field"><div class="approval-space"></div><div class="sig-line">${escapeHtml(field.label)}</div></div>`
  ).join("");

  const body = `
  <div class="page">
    <div class="brand-bar"></div>
    <div class="header">
      <div class="brand">
        ${company.logoDataUri ? `<img src="${company.logoDataUri}" />` : ""}
        <div class="names">
          <h1>${company.nameAr}</h1>
          <p>${company.nameEn}</p>
        </div>
      </div>
      <div class="doc-title">
        <h2>عقد</h2>
        <div class="num">${contract.contractNumber}</div>
        <div>${statusBadge(contract.status, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS)}</div>
      </div>
    </div>

    <div style="margin-top:20px">
      <h2 style="font-size:17px;color:#2B273F;text-align:center">${contract.titleAr || contract.title}</h2>
      <p style="text-align:center;color:#9691a8;font-size:12px;margin-top:4px">${CONTRACT_TYPE_LABELS[contract.type] || contract.type}</p>
    </div>

    <div class="parties">
      <div class="party">
        <h4>الطرف الأول (مقدّم الخدمة)</h4>
        <p><strong>${company.nameAr}</strong></p>
        <p>${company.nameEn}</p>
        <p>السجل التجاري: ${ltr(company.commercialReg)}</p>
        <p>الرقم الضريبي: ${ltr(company.taxNumber)}</p>
        <p>${company.address}</p>
      </div>
      <div class="party">
        <h4>الطرف الثاني (العميل)</h4>
        <p><strong>${customer?.companyName || customer?.name || "-"}</strong></p>
        <p>${customer?.name || ""}</p>
        <p>${customer?.email ? ltr(customer.email) : ""}</p>
        <p>${customer?.phone ? ltr(customer.phone) : ""}</p>
        <p>${customer?.address || ""} ${customer?.city ? " - " + customer.city : ""}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>مدة العقد</h3>
        <p>تاريخ البدء: <strong>${formatDate(contract.startDate)}</strong></p>
        <p>تاريخ الانتهاء: <strong>${formatDate(contract.endDate)}</strong></p>
      </div>
      <div class="meta-box">
        <h3>القيمة المالية</h3>
        <p style="font-size:20px;color:#1C2B6E;font-weight:800" class="num-cell">${formatMoney(contract.value)} ${contract.currency}</p>
      </div>
    </div>

    ${sectionsHtml}

    <div class="approval-grid">${approvalsHtml}</div>

    <div class="footer">
      <p><span class="brand-name">${company.nameAr}</span> · ${ltr(company.phone)} · ${ltr(company.email)} · ${ltr(company.website)}</p>
      <p>وثيقة عقد صادرة إلكترونياً عبر نظام أفق لإدارة الأعمال بتاريخ ${formatDate(new Date())}</p>
    </div>
  </div>`;

  return docShell(`عقد ${contract.contractNumber}`, body);
}

export async function generateContractPdfBuffer(contract: any, customer: any): Promise<Buffer> {
  const company = await getCompanyProfile();
  const html = buildContractHtml(contract, customer, company);
  return renderHtmlToPdf(html);
}
