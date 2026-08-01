import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface EmailConfig {
  senderName: string;
  siteUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
}

function getConfig(): EmailConfig {
  return {
    senderName: process.env.EMAIL_SENDER_NAME || "أفق لحلول الأعمال",
    siteUrl: process.env.APP_URL || "https://ofoq.qirox.online",
    smtpHost: process.env.CPANEL_SMTP_HOST || "",
    smtpPort: parseInt(process.env.CPANEL_SMTP_PORT || "465"),
    smtpUser: process.env.CPANEL_SMTP_USER || "",
    smtpPass: process.env.CPANEL_SMTP_PASS || "",
    smtpSecure: (process.env.CPANEL_SMTP_PORT || "465") !== "587",
  };
}

// ── Logo (embedded as CID attachment for reliable rendering in Gmail/Outlook) ──
let cachedLogoBuffer: Buffer | null | undefined;
function getLogoBuffer(): Buffer | null {
  if (cachedLogoBuffer !== undefined) return cachedLogoBuffer;
  try {
    cachedLogoBuffer = fs.readFileSync(path.join(process.cwd(), "public", "icons", "logo.png"));
  } catch {
    cachedLogoBuffer = null;
  }
  return cachedLogoBuffer;
}

// ── Core Mailer ──────────────────────────────────────────────────
interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

async function sendMail(
  to: string,
  toName: string,
  subject: string,
  html: string,
  attachments: MailAttachment[] = []
): Promise<boolean> {
  const cfg = getConfig();
  if (process.env.EMAIL_DEBUG_CAPTURE) {
    fs.writeFileSync(`/tmp/email-preview-${Date.now()}.html`, html);
  }
  if (!cfg.smtpHost || !cfg.smtpUser || !cfg.smtpPass) {
    console.warn("[Email] SMTP not configured — skipping email to", to);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
      tls: { rejectUnauthorized: false },
    });

    const logo = getLogoBuffer();
    const mailAttachments: any[] = attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType || "application/pdf",
    }));
    if (logo) {
      mailAttachments.push({
        filename: "ofoq-logo.png",
        content: logo,
        cid: "ofoq-logo",
      });
    }

    await transporter.sendMail({
      from: `"${cfg.senderName}" <${cfg.smtpUser}>`,
      to: `${toName} <${to}>`,
      subject,
      html,
      text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      attachments: mailAttachments,
    });

    console.log(`[Email] ✅ Sent to ${to}: ${subject}`);
    return true;
  } catch (err: any) {
    console.error("[Email] ❌ Send error:", err.message);
    return false;
  }
}

// ── Design System ────────────────────────────────────────────────
const COLORS = {
  navy: "#2B273F",
  navyDark: "#1C1930",
  green: "#33B27C",
  greenDark: "#259964",
  yellow: "#E5FE04",
  text: "#3A3750",
  muted: "#8B879C",
  bgSoft: "#F6F5FA",
  border: "#EDEBF3",
};

function button(label: string, url: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px">
    <tr>
      <td align="center" bgcolor="${COLORS.green}" style="border-radius:10px;">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:15px 40px;font-family:Tahoma,Arial,sans-serif;font-size:15px;
                  font-weight:bold;color:#ffffff;text-decoration:none;border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

function infoBox(rows: { label: string; value: string }[]): string {
  const cells = rows.map((r) => `
    <tr>
      <td style="padding:10px 18px;font-family:Tahoma,Arial,sans-serif;font-size:13px;color:${COLORS.muted};border-bottom:1px solid ${COLORS.border};" align="right">${r.label}</td>
      <td style="padding:10px 18px;font-family:Tahoma,Arial,sans-serif;font-size:13.5px;color:${COLORS.navy};font-weight:bold;border-bottom:1px solid ${COLORS.border};" align="left" dir="ltr">${r.value}</td>
    </tr>`).join("");
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background:${COLORS.bgSoft};border-radius:12px;margin:22px 0;overflow:hidden;">
    ${cells}
  </table>`;
}

// ── Base Wrapper (table-based, inline CSS — Gmail/Outlook safe) ───
function baseTemplate(opts: {
  title: string;
  preheader?: string;
  heading: string;
  bodyHtml: string;
}): string {
  const cfg = getConfig();
  const year = new Date().getFullYear();
  const logo = getLogoBuffer();
  const logoTag = logo
    ? `<img src="cid:ofoq-logo" width="56" height="56" alt="OFOQ" style="display:block;border-radius:14px;" />`
    : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>${opts.title}</title>
<!--[if mso]>
<style type="text/css">
  table { border-collapse: collapse; }
  .fallback-font { font-family: Tahoma, Arial, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#EEECF3;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader || ""}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEECF3;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:600px;max-width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(43,39,63,0.08);">

          <!-- Accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg, ${COLORS.green} 0%, ${COLORS.yellow} 100%);height:6px;line-height:6px;font-size:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${COLORS.navy}" style="background-color:${COLORS.navy};padding:34px 30px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-inline-end:12px;" valign="middle">${logoTag}</td>
                  <td valign="middle" align="right">
                    <div style="font-family:Tahoma,Arial,sans-serif;font-size:19px;font-weight:bold;color:#ffffff;">أفق لحلول الأعمال</div>
                    <div style="font-family:Tahoma,Arial,sans-serif;font-size:11px;color:#B7B2CC;letter-spacing:.5px;margin-top:2px;">OFOQ BUSINESS SOLUTIONS</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Heading -->
          <tr>
            <td align="center" style="padding:34px 40px 0;">
              <h1 style="margin:0;font-family:Tahoma,Arial,sans-serif;font-size:22px;color:${COLORS.navy};font-weight:800;">${opts.heading}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:18px 40px 8px;font-family:Tahoma,Arial,sans-serif;font-size:14.5px;line-height:1.9;color:${COLORS.text};">
              ${opts.bodyHtml}
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:16px;line-height:16px;font-size:0;">&nbsp;</td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 30px;border-top:1px solid ${COLORS.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family:Tahoma,Arial,sans-serif;font-size:12px;color:${COLORS.muted};line-height:1.8;">
                    <span style="color:${COLORS.green};font-weight:bold;">أفق لحلول الأعمال</span> — نساعدك على تحقيق أهدافك بحلول أعمال متكاملة
                    <br />
                    <a href="${cfg.siteUrl}" style="color:${COLORS.muted};text-decoration:underline;" dir="ltr">${cfg.siteUrl.replace(/^https?:\/\//, "")}</a>
                    <br /><br />
                    © ${year} أفق لحلول الأعمال — جميع الحقوق محفوظة<br />
                    إذا لم تطلب هذا البريد، يمكنك تجاهله بأمان.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;">${text}</p>`;
}
function accent(text: string): string {
  return `<span style="color:${COLORS.green};font-weight:bold;">${text}</span>`;
}

// ── Email Functions ──────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  const html = baseTemplate({
    title: "مرحباً بك",
    preheader: "نرحب بانضمامك إلى أفق لحلول الأعمال",
    heading: "مرحباً بك في أفق 👋",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p(`نرحب بك في منظومة <strong>أفق لحلول الأعمال</strong>. نحن سعداء بانضمامك إلينا وحريصون على مرافقتك في كل خطوة من مشوارك معنا.`)}
      ${p(`يمكنك الآن الدخول إلى حسابك ومتابعة مشاريعك وفواتيرك من مكان واحد.`)}
      ${button("الدخول إلى حسابي", `${getConfig().siteUrl}/login`)}
    `,
  });
  return sendMail(to, name, "مرحباً بك في أفق لحلول الأعمال", html);
}

export async function sendOtpEmail(to: string, name: string, otp: string): Promise<boolean> {
  const digits = otp.split("").join(" ");
  const html = baseTemplate({
    title: "رمز التحقق",
    preheader: `رمز التحقق الخاص بك: ${otp}`,
    heading: "رمز التحقق الخاص بك",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p("استخدم الرمز التالي لإتمام عملية تسجيل الدخول:")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;">
        <tr><td align="center" style="background:${COLORS.bgSoft};border-radius:12px;padding:22px;">
          <span style="font-family:'Courier New',monospace;font-size:34px;font-weight:bold;color:${COLORS.navy};letter-spacing:10px;" dir="ltr">${digits}</span>
        </td></tr>
      </table>
      ${p(`هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط ولا يجوز مشاركته مع أي شخص.`)}
      ${p("إذا لم تطلب هذا الرمز، يُرجى تجاهل هذه الرسالة وإخبارنا فوراً.")}
    `,
  });
  return sendMail(to, name, "رمز التحقق - أفق لحلول الأعمال", html);
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<boolean> {
  const html = baseTemplate({
    title: "إعادة تعيين كلمة المرور",
    preheader: "طلب إعادة تعيين كلمة المرور الخاصة بحسابك",
    heading: "إعادة تعيين كلمة المرور",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p("تلقّينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أفق لحلول الأعمال.")}
      ${button("إعادة تعيين كلمة المرور", resetLink)}
      ${p(`هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.`)}
      ${p("إذا لم تطلب إعادة تعيين كلمة المرور، يُرجى تجاهل هذه الرسالة — حسابك في أمان.")}
    `,
  });
  return sendMail(to, name, "إعادة تعيين كلمة المرور - أفق", html);
}

export async function sendNewEmployeeEmail(
  to: string,
  name: string,
  loginEmail: string,
  plainPassword: string
): Promise<boolean> {
  const cfg = getConfig();
  const html = baseTemplate({
    title: "بيانات حسابك في أفق",
    preheader: "تم إنشاء حسابك في نظام أفق لحلول الأعمال",
    heading: `مرحباً ${name} 👋`,
    bodyHtml: `
      ${p(`تم إنشاء حسابك في نظام <strong>أفق لحلول الأعمال</strong> بنجاح. فيما يلي بيانات الدخول الخاصة بك:`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
        <tr>
          <td style="background:#f0f4f8;border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 10px;font-size:14px;color:#555;">📧 البريد الإلكتروني</p>
            <p style="margin:0 0 18px;font-size:16px;font-weight:700;color:#1B3A5C;direction:ltr;">${loginEmail}</p>
            <p style="margin:0 0 10px;font-size:14px;color:#555;">🔑 كلمة المرور المؤقتة</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#E63329;letter-spacing:2px;font-family:monospace;" dir="ltr">${plainPassword}</p>
          </td>
        </tr>
      </table>
      ${button("الدخول إلى حسابي", `${cfg.siteUrl}/admin/login`)}
      ${p(`<strong style="color:#E63329;">⚠️ مهم:</strong> يُرجى تغيير كلمة المرور فور تسجيل دخولك الأول من صفحة الملف الشخصي.`)}
      ${p("إذا كنت لا تعرف شيئاً عن هذا الحساب، يُرجى التواصل مع المسؤول فوراً.")}
    `,
  });
  return sendMail(to, name, "بيانات حسابك في نظام أفق لحلول الأعمال", html);
}

export async function sendEmailVerification(to: string, name: string, verifyLink: string): Promise<boolean> {
  const html = baseTemplate({
    title: "تأكيد البريد الإلكتروني",
    preheader: "أكّد بريدك الإلكتروني لإتمام إعداد حسابك",
    heading: "خطوة أخيرة لتفعيل حسابك",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p("شكراً لتسجيلك في نظام أفق لحلول الأعمال. يُرجى تأكيد بريدك الإلكتروني لإتمام إعداد حسابك:")}
      ${button("تأكيد البريد الإلكتروني", verifyLink)}
      ${p(`هذا الرابط صالح لمدة <strong>24 ساعة</strong>.`)}
    `,
  });
  return sendMail(to, name, "تأكيد البريد الإلكتروني - أفق", html);
}

export async function sendProjectUpdateEmail(
  to: string,
  name: string,
  projectName: string,
  stage: string,
  message?: string
): Promise<boolean> {
  const html = baseTemplate({
    title: "تحديث المشروع",
    preheader: `تم تحديث مشروعك ${projectName}`,
    heading: "تحديث على مشروعك",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p(`تم تحديث حالة مشروعك <strong>${projectName}</strong>.`)}
      ${infoBox([{ label: "المرحلة الحالية", value: stage }])}
      ${message ? p(message) : ""}
      ${button("متابعة المشروع", `${getConfig().siteUrl}/dashboard/projects`)}
    `,
  });
  return sendMail(to, name, `تحديث مشروع: ${projectName}`, html);
}

export async function sendInvoiceEmail(
  to: string,
  name: string,
  invoiceNumber: string,
  total: number,
  currency: string,
  dueDate?: string,
  pdfBuffer?: Buffer
): Promise<boolean> {
  const html = baseTemplate({
    title: "فاتورة جديدة",
    preheader: `فاتورة رقم ${invoiceNumber} بمبلغ ${total.toLocaleString()} ${currency}`,
    heading: "لديك فاتورة جديدة 🧾",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p(`تم إصدار فاتورة جديدة من <strong>أفق لحلول الأعمال</strong>.`)}
      ${infoBox([
        { label: "رقم الفاتورة", value: invoiceNumber },
        { label: "المبلغ الإجمالي", value: `${total.toLocaleString()} ${currency}` },
        ...(dueDate ? [{ label: "تاريخ الاستحقاق", value: dueDate }] : []),
      ])}
      ${pdfBuffer ? p("نسخة الفاتورة (PDF) مرفقة مع هذه الرسالة.") : ""}
      ${button("عرض الفاتورة", `${getConfig().siteUrl}/dashboard/invoices`)}
    `,
  });
  const attachments = pdfBuffer ? [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }] : [];
  return sendMail(to, name, `فاتورة رقم ${invoiceNumber} - أفق`, html, attachments);
}

export async function sendContractEmail(
  to: string,
  name: string,
  contractNumber: string,
  title: string,
  pdfBuffer?: Buffer
): Promise<boolean> {
  const html = baseTemplate({
    title: "عقد جديد",
    preheader: `عقد رقم ${contractNumber} يتطلب مراجعتكم`,
    heading: "عقد جديد يتطلب مراجعتكم 📄",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p(`تم إعداد عقد جديد بعنوان <strong>${title}</strong> ويتطلب مراجعتكم وتوقيعكم.`)}
      ${infoBox([{ label: "رقم العقد", value: contractNumber }])}
      ${pdfBuffer ? p("نسخة العقد (PDF) مرفقة مع هذه الرسالة.") : ""}
      ${button("عرض العقد", `${getConfig().siteUrl}/dashboard/contracts`)}
    `,
  });
  const attachments = pdfBuffer ? [{ filename: `${contractNumber}.pdf`, content: pdfBuffer }] : [];
  return sendMail(to, name, `عقد جديد يتطلب مراجعتكم — ${contractNumber}`, html, attachments);
}

export async function sendContactConfirmation(to: string, name: string): Promise<boolean> {
  const html = baseTemplate({
    title: "تأكيد استلام رسالتك",
    preheader: "شكراً لتواصلك معنا، سيتواصل معك فريقنا قريباً",
    heading: "شكراً لتواصلك معنا 🙌",
    bodyHtml: `
      ${p(`مرحباً ${accent(name)}،`)}
      ${p(`شكراً لتواصلك مع <strong>أفق لحلول الأعمال</strong>.`)}
      ${p("تلقّينا رسالتك وسيتواصل معك فريقنا قريباً خلال 24 ساعة عمل.")}
      ${p("في حالة الاستفسارات العاجلة، يمكنك التواصل معنا مباشرة عبر بيانات التواصل أدناه.")}
    `,
  });
  return sendMail(to, name, "شكراً لتواصلك - أفق لحلول الأعمال", html);
}

export async function sendDirectEmail(
  to: string,
  name: string,
  subject: string,
  htmlBody: string
): Promise<boolean> {
  const html = baseTemplate({
    title: subject,
    heading: subject,
    bodyHtml: htmlBody,
  });
  return sendMail(to, name, subject, html);
}
