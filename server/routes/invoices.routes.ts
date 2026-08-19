import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { InvoiceModel, CustomerModel } from "../models/index.js";
import { fireNotify } from "../notify.js";
import { sendInvoiceEmail } from "../email.js";
import { generateInvoicePdfBuffer } from "../services/pdf.service.js";

export const invoicesRouter = Router();

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await InvoiceModel.countDocuments();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

// ── Get All Invoices ──────────────────────────────────────────────
invoicesRouter.get("/", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const { status, customerId, page = 1, limit = 20, search } = req.query;
    const filter: any = {};

    // Clients see their own invoices only
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id });
      if (customer) filter.customerId = customer._id;
      else { res.json({ invoices: [], total: 0 }); return; }
    } else if (customerId) {
      filter.customerId = customerId;
    }

    if (status) filter.status = status;
    if (search) filter.invoiceNumber = { $regex: search, $options: "i" };

    const [invoices, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate("customerId", "name companyName email")
        .populate("projectId", "name projectNumber")
        .populate("createdBy", "fullName")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    res.json({ invoices, total, page: +page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الفواتير" });
  }
});

// ── Get Single Invoice ────────────────────────────────────────────
invoicesRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("customerId", "name companyName email phone address country city taxNumber")
      .populate("projectId", "name projectNumber")
      .populate("createdBy", "fullName").lean();
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    // Mark as viewed if client
    if ((req as any).user.role === "client" && invoice.status === "sent") {
      await InvoiceModel.findByIdAndUpdate(invoice._id, { status: "viewed" });
    }
    res.json({ invoice });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الفاتورة" });
  }
});

// ── Create Invoice ────────────────────────────────────────────────
invoicesRouter.post("/", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await InvoiceModel.create({
      ...req.body,
      invoiceNumber,
      createdBy: (req as any).user._id,
    });
    await logAction(String((req as any).user._id), "create_invoice", "Invoice", String(invoice._id), req);
    res.status(201).json({ invoice });
  } catch {
    res.status(500).json({ error: "خطأ في إنشاء الفاتورة" });
  }
});

// ── Update Invoice ────────────────────────────────────────────────
invoicesRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("customerId", "name companyName email").lean();
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    await logAction(String((req as any).user._id), "update_invoice", "Invoice", req.params.id, req);
    res.json({ invoice });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الفاتورة" });
  }
});

// ── Send Invoice to Client ────────────────────────────────────────
invoicesRouter.post("/:id/send", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("customerId", "name companyName email").lean() as any;
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }

    await InvoiceModel.findByIdAndUpdate(invoice._id, { status: "sent" });

    // Email customer with attached PDF
    if (invoice.customerId?.email) {
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateInvoicePdfBuffer(invoice, invoice.customerId);
      } catch (e: any) {
        console.error("[Invoices] PDF attach generation failed:", e.message);
      }
      await sendInvoiceEmail(
        invoice.customerId.email,
        invoice.customerId.name,
        invoice.invoiceNumber,
        invoice.total,
        invoice.currency,
        invoice.dueDate?.toLocaleDateString("ar-SA"),
        pdfBuffer
      );
    }

    // Notify customer if linked user
    const { CustomerModel: CM } = await import("../models/index.js");
    const customer = await CM.findById(invoice.customerId._id).lean() as any;
    if (customer?.userId) {
      await fireNotify(
        String(customer.userId),
        "فاتورة جديدة",
        `فاتورة رقم ${invoice.invoiceNumber} بمبلغ ${invoice.total} ${invoice.currency}`,
        { type: "payment", link: `/dashboard/invoices/${invoice._id}` }
      );
    }

    res.json({ message: "تم إرسال الفاتورة" });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الفاتورة" });
  }
});

// ── Download Invoice PDF ──────────────────────────────────────────
invoicesRouter.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("customerId")
      .lean() as any;
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    const me = (req as any).user;
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id }).lean();
      if (!customer || String(customer._id) !== String(invoice.customerId?._id)) {
        res.status(403).json({ error: "ليس لديك صلاحية للوصول لهذه الفاتورة" });
        return;
      }
    }
    const pdf = await generateInvoicePdfBuffer(invoice, invoice.customerId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdf);
  } catch (err: any) {
    console.error("[Invoices] PDF generation error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء ملف PDF" });
  }
});

// ── Mark as Paid ──────────────────────────────────────────────────
invoicesRouter.post("/:id/mark-paid", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const { paidAmount, note } = req.body;
    const invoice = await InvoiceModel.findById(req.params.id).lean();
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    const newPaid = (invoice.paidAmount || 0) + (paidAmount || invoice.total);
    const status = newPaid >= invoice.total ? "paid" : "partial";
    await InvoiceModel.findByIdAndUpdate(invoice._id, {
      status, paidAmount: newPaid, paidAt: status === "paid" ? new Date() : undefined
    });
    await logAction(String((req as any).user._id), "mark_invoice_paid", "Invoice", req.params.id, req, { paidAmount });
    res.json({ message: status === "paid" ? "تم تحديد الفاتورة كمدفوعة" : "تم تسجيل دفعة جزئية" });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث حالة الدفع" });
  }
});

// ── Delete Invoice ─────────────────────────────────────────────────
invoicesRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findByIdAndDelete(req.params.id);
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    await logAction(String((req as any).user._id), "delete_invoice", "Invoice", req.params.id, req);
    res.json({ message: "تم حذف الفاتورة" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف الفاتورة" });
  }
});
