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
  .brand-bar { height: 6px; background: linear-gradient(90deg, #33B27C 0%, #E5FE04 100%); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 0 18px; border-bottom: 2px solid #f0f1f5; }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand img { width: 52px; height: 52px; border-radius: 12px; }
  .brand .names h1 { font-size: 18px; color: #2B273F; font-weight: 800; }
  .brand .names p { font-size: 11px; color: #8b879c; margin-top: 2px; }
  .doc-title { text-align: left; }
  .doc-title h2 { font-size: 24px; color: #2B273F; font-weight: 800; letter-spacing: 0.5px; }
  .doc-title .num { font-size: 13px; color: #33B27C; font-weight: 700; margin-top: 4px; direction: ltr; text-align: left; }
  .status-badge { display: inline-block; margin-top: 8px; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 700; }
  .meta-grid { display: flex; justify-content: space-between; gap: 24px; margin: 22px 0; }
  .meta-box { flex: 1; background: #f8f9fb; border-radius: 10px; padding: 14px 16px; }
  .meta-box h3 { font-size: 11px; color: #9691a8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .5px; }
  .meta-box p { font-size: 13px; color: #2B273F; line-height: 1.9; }
  .meta-box p strong { color: #33B27C; }
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
  .totals .row.grand .amt { color: #33B27C; }
  .notes { margin-top: 26px; background: #fbfaf0; border-inline-start: 4px solid #E5FE04; padding: 12px 16px; border-radius: 6px; font-size: 12px; line-height: 1.8; color: #5c5870; }
  .footer { position: absolute; bottom: 12mm; left: 16mm; right: 16mm; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
  .footer p { font-size: 10.5px; color: #a19dae; line-height: 1.7; }
  .footer .brand-name { color: #33B27C; font-weight: 700; }
  .parties { display: flex; gap: 20px; margin: 22px 0; }
  .party { flex: 1; border: 1px solid #eef0f4; border-radius: 10px; padding: 16px; }
  .party h4 { font-size: 11px; color: #33B27C; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 10px; }
  .party p { font-size: 13px; line-height: 1.9; color: #2B273F; }
  .contract-body { margin-top: 20px; font-size: 13px; line-height: 2.1; color: #3a3750; white-space: pre-wrap; }
  .sig-grid { display: flex; justify-content: space-between; margin-top: 50px; gap: 30px; }
  .sig-box { flex: 1; text-align: center; }
  .sig-line { border-top: 1.5px solid #2B273F; margin-top: 50px; padding-top: 8px; font-size: 12px; color: #6d6a7e; }
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

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "مسودة", sent: "مرسلة", viewed: "تمت المشاهدة", partial: "مدفوعة جزئياً",
  paid: "مدفوعة بالكامل", overdue: "متأخرة", cancelled: "ملغاة",
};
const INVOICE_STATUS_COLORS: Record<string, [string, string]> = {
  draft: ["#eef0f4", "#6d6a7e"], sent: ["#e8f0ff", "#2563eb"], viewed: ["#eef2ff", "#4f46e5"],
  partial: ["#fff7e0", "#b45309"], paid: ["#e6f9ef", "#0f8f5a"], overdue: ["#fde8e8", "#c0392b"],
  cancelled: ["#f3f3f3", "#888"],
};

// ── Invoice PDF ──────────────────────────────────────────────────────
export function buildInvoiceHtml(invoice: any, customer: any, company: CompanyProfile): string {
  const typeLabels: Record<string, string> = { invoice: "فاتورة ضريبية", proforma: "فاتورة مبدئية", receipt: "إيصال استلام", credit_note: "إشعار دائن" };
  const rows = (invoice.items || []).map((item: any) => `
    <tr>
      <td>${item.description}${item.descriptionAr ? `<br/><span style="color:#9691a8;font-size:11px">${item.descriptionAr}</span>` : ""}</td>
      <td class="num-cell">${item.quantity}</td>
      <td class="num-cell">${formatMoney(item.unitPrice)}</td>
      <td class="num-cell">${item.discount || 0}%</td>
      <td class="num-cell">${item.tax || 0}%</td>
      <td class="num-cell"><strong>${formatMoney(item.total)}</strong></td>
    </tr>`).join("");

  const balanceDue = Math.max(0, (invoice.total || 0) - (invoice.paidAmount || 0));

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
        <h2>${typeLabels[invoice.type] || "فاتورة"}</h2>
        <div class="num">${invoice.invoiceNumber}</div>
        <div>${statusBadge(invoice.status, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS)}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>فاتورة إلى</h3>
        <p><strong>${customer?.companyName || customer?.name || "-"}</strong></p>
        <p>${customer?.name || ""}</p>
        <p>${customer?.email || ""} ${customer?.phone ? " · " + ltr(customer.phone) : ""}</p>
        <p>${customer?.address || ""} ${customer?.city ? " - " + customer.city : ""}</p>
        ${customer?.taxNumber ? `<p>الرقم الضريبي: ${ltr(customer.taxNumber)}</p>` : ""}
      </div>
      <div class="meta-box">
        <h3>تفاصيل الفاتورة</h3>
        <p>تاريخ الإصدار: <strong>${formatDate(invoice.createdAt)}</strong></p>
        <p>تاريخ الاستحقاق: <strong>${formatDate(invoice.dueDate)}</strong></p>
        <p>العملة: <strong>${invoice.currency}</strong></p>
        ${company.taxNumber !== "-" ? `<p>الرقم الضريبي للمنشأة: ${ltr(company.taxNumber)}</p>` : ""}
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th style="width:36%">الوصف</th>
          <th>الكمية</th>
          <th>سعر الوحدة</th>
          <th>الخصم</th>
          <th>الضريبة</th>
          <th>الإجمالي</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="row"><span>المجموع الفرعي</span><span class="num-cell">${formatMoney(invoice.subtotal)} ${invoice.currency}</span></div>
      ${invoice.discount ? `<div class="row"><span>الخصم</span><span class="num-cell">- ${formatMoney(invoice.discount)} ${invoice.currency}</span></div>` : ""}
      ${invoice.tax ? `<div class="row"><span>ضريبة القيمة المضافة</span><span class="num-cell">${formatMoney(invoice.tax)} ${invoice.currency}</span></div>` : ""}
      <div class="row grand"><span>الإجمالي المستحق</span><span class="num-cell amt">${formatMoney(invoice.total)} ${invoice.currency}</span></div>
      ${invoice.paidAmount ? `<div class="row"><span>المبلغ المدفوع</span><span class="num-cell">${formatMoney(invoice.paidAmount)} ${invoice.currency}</span></div>
      <div class="row"><span>المتبقي</span><span class="num-cell">${formatMoney(balanceDue)} ${invoice.currency}</span></div>` : ""}
    </div>

    ${(invoice.notesAr || invoice.notes || invoice.termsAr || invoice.terms) ? `
    <div class="notes">
      ${invoice.notesAr || invoice.notes ? `<p><strong>ملاحظات:</strong> ${invoice.notesAr || invoice.notes}</p>` : ""}
      ${invoice.termsAr || invoice.terms ? `<p style="margin-top:6px"><strong>الشروط:</strong> ${invoice.termsAr || invoice.terms}</p>` : ""}
    </div>` : ""}

    ${company.bankIban !== "-" ? `
    <div class="notes" style="background:#f4f9ff;border-inline-start-color:#2563eb;margin-top:12px">
      <p><strong>بيانات التحويل البنكي:</strong> ${company.bankName} — ${ltr(company.bankIban)}</p>
    </div>` : ""}

    <div class="footer">
      <p><span class="brand-name">${company.nameAr}</span> · ${ltr(company.phone)} · ${ltr(company.email)} · ${ltr(company.website)}</p>
      <p>هذه الفاتورة تم إصدارها إلكترونياً عبر نظام أفق ولا تتطلب توقيعاً أو ختماً لتكون سارية المفعول.</p>
    </div>
  </div>`;

  return docShell(`فاتورة ${invoice.invoiceNumber}`, body);
}

export async function generateInvoicePdfBuffer(invoice: any, customer: any): Promise<Buffer> {
  const company = await getCompanyProfile();
  const html = buildInvoiceHtml(invoice, customer, company);
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
        <p style="font-size:20px;color:#33B27C;font-weight:800" class="num-cell">${formatMoney(contract.value)} ${contract.currency}</p>
      </div>
    </div>

    <div class="contract-body">${(contract.content || contract.termsAr || contract.terms || defaultContent)}</div>

    <div class="sig-grid">
      <div class="sig-box">
        <div class="sig-line">توقيع الطرف الأول — ${company.nameAr}</div>
      </div>
      <div class="sig-box">
        <div class="sig-line">توقيع الطرف الثاني — ${customer?.name || ""}</div>
      </div>
    </div>

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
