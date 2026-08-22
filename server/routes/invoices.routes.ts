import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { InvoiceModel, CustomerModel, ProjectModel } from "../models/index.js";
import { fireNotify } from "../notify.js";
import { sendInvoiceEmail } from "../email.js";
import { generateInvoicePdfBuffer } from "../services/pdf.service.js";
import mongoose from "mongoose";

export const invoicesRouter = Router();

const financeRoles = ["super_admin", "admin", "manager"];
const hasFinanceAccess = (role: string | undefined) => financeRoles.includes(role || "");

function validationError(message: string) {
  const error: any = new Error(message);
  error.statusCode = 400;
  return error;
}

function calculateDocumentTotals(rawItems: unknown, rawDiscount: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw validationError("أدخل بند فاتورة صحيحًا واحدًا على الأقل");
  }
  const items = rawItems.map((raw: any) => {
    const quantity = Number(raw?.quantity);
    const unitPrice = Number(raw?.unitPrice);
    const discount = Number(raw?.discount || 0);
    const tax = Number(raw?.tax || 0);
    if (!raw?.description?.trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw validationError("أدخل وصفًا وكمية وسعرًا صحيحًا لكل بند");
    }
    const lineSubtotal = quantity * unitPrice;
    if (!Number.isFinite(discount) || discount < 0 || discount > lineSubtotal || !Number.isFinite(tax) || tax < 0 || tax > 100) {
      throw validationError("تحقق من قيم الخصم والضريبة في البنود");
    }
    const lineTax = (lineSubtotal - discount) * tax / 100;
    return {
      description: String(raw.description).trim(),
      ...(raw.descriptionAr ? { descriptionAr: String(raw.descriptionAr).trim() } : {}),
      quantity,
      unitPrice,
      discount,
      tax,
      total: lineSubtotal - discount + lineTax,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const itemDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const discount = Number(rawDiscount || 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal - itemDiscount) {
    throw validationError("قيمة الخصم الإجمالي غير صالحة");
  }
  const tax = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discount) * item.tax / 100, 0);
  return { items, subtotal, discount, tax, total: subtotal - itemDiscount - discount + tax };
}

async function validateProjectForCustomer(projectId: unknown, customerId: unknown) {
  if (projectId === undefined || projectId === null || projectId === "") return;
  const project = await ProjectModel.exists({ _id: projectId, customerId });
  if (!project) throw validationError("المشروع المختار غير موجود أو لا يتبع للعميل المحدد");
}

async function generateInvoiceNumber(prefix = "INV", session?: mongoose.ClientSession): Promise<string> {
  const year = new Date().getFullYear();
  const expression = new RegExp(`^${prefix}-${year}-\\d+$`);
  const latest = await InvoiceModel.findOne({ invoiceNumber: expression })
    .sort({ invoiceNumber: -1 })
    .select("invoiceNumber")
    .session(session || null)
    .lean() as any;
  const initialSequence = Number(String(latest?.invoiceNumber || "").split("-").pop() || 0);
  const result: any = await mongoose.connection.collection<{ _id: string; sequence: number }>("document_counters").findOneAndUpdate(
    { _id: `${prefix}:${year}` },
    { $setOnInsert: { sequence: initialSequence }, $inc: { sequence: 1 } },
    { upsert: true, returnDocument: "after", session },
  );
  const sequence = Number(result?.value?.sequence ?? result?.sequence);
  if (!Number.isFinite(sequence) || sequence < 1) throw new Error("تعذر إنشاء رقم المستند");
  return `${prefix}-${year}-${String(sequence).padStart(5, "0")}`;
}

// ── Get All Invoices ──────────────────────────────────────────────
invoicesRouter.get("/", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const { status, customerId, type, page = 1, limit = 20, search } = req.query;
    const filter: any = {};

    // Clients see their own invoices only
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id });
      if (customer) filter.customerId = customer._id;
      else { res.json({ invoices: [], total: 0 }); return; }
    } else if (!hasFinanceAccess(me.role)) {
      res.status(403).json({ error: "ليس لديك صلاحية للوصول إلى المستندات المالية" });
      return;
    } else if (customerId) {
      filter.customerId = customerId;
    }

    if (status) filter.status = status;
    if (type && ["invoice", "proforma", "receipt", "credit_note"].includes(String(type))) filter.type = type;
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
    const me = (req as any).user;
    if (me.role !== "client" && !hasFinanceAccess(me.role)) {
      res.status(403).json({ error: "ليس لديك صلاحية للوصول إلى المستندات المالية" });
      return;
    }
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("customerId", "name companyName email phone address country city taxNumber")
      .populate("projectId", "name projectNumber")
      .populate("createdBy", "fullName").lean();
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id }).select("_id").lean();
      if (!customer || String(customer._id) !== String((invoice as any).customerId?._id ?? (invoice as any).customerId)) {
        res.status(403).json({ error: "ليس لديك صلاحية للوصول لهذا المستند" });
        return;
      }
    }
    // Mark as viewed if client
    if (me.role === "client" && invoice.status === "sent") {
      await InvoiceModel.updateOne({ _id: invoice._id, status: "sent" }, { status: "viewed" });
    }
    res.json({ invoice });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الفاتورة" });
  }
});

// ── Create Invoice ────────────────────────────────────────────────
invoicesRouter.post("/", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const { customerId, items } = req.body;
    if (!customerId) {
      res.status(400).json({ error: "يرجى اختيار العميل أولاً" });
      return;
    }
    const customerExists = await CustomerModel.exists({ _id: customerId });
    if (!customerExists) {
      res.status(400).json({ error: "العميل المختار غير موجود" });
      return;
    }
    await validateProjectForCustomer(req.body.projectId, customerId);
    const totals = calculateDocumentTotals(items, req.body.discount);
    const type = req.body.type === "proforma" ? "proforma" : "invoice";
    const createFields = [
      "customerId", "projectId", "items", "subtotal", "discount", "tax", "total",
      "currency", "dueDate", "notes", "notesAr", "terms", "termsAr",
    ] as const;
    const documentData = Object.fromEntries(
      createFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );
    const invoiceNumber = await generateInvoiceNumber(type === "proforma" ? "QTE" : "INV");
    const invoice = await InvoiceModel.create({
      ...documentData,
      ...totals,
      invoiceNumber,
      type,
      status: "draft",
      paidAmount: 0,
      createdBy: (req as any).user._id,
    });
    await logAction(String((req as any).user._id), "create_invoice", "Invoice", String(invoice._id), req);
    res.status(201).json({ invoice });
  } catch (error) {
    res.status((error as any)?.statusCode || 500).json({ error: (error as any)?.statusCode ? (error as Error).message : "خطأ في إنشاء الفاتورة" });
  }
});

// ── Update Invoice ────────────────────────────────────────────────
invoicesRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const editableFields = [
      "customerId", "projectId", "items", "discount",
      "currency", "dueDate", "notes", "notesAr", "terms", "termsAr",
    ] as const;
    const updates = Object.fromEntries(
      editableFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "لا توجد حقول مسموح بتعديلها" });
      return;
    }
    const currentInvoice = await InvoiceModel.findOne({ _id: req.params.id, status: "draft" }).lean();
    if (!currentInvoice) {
      res.status(400).json({ error: "لا يمكن تعديل إلا المستندات الموجودة بحالة مسودة" });
      return;
    }
    const effectiveCustomerId = updates.customerId ?? currentInvoice.customerId;
    const customerExists = await CustomerModel.exists({ _id: effectiveCustomerId });
    if (!customerExists) throw validationError("العميل المختار غير موجود");
    await validateProjectForCustomer(updates.projectId ?? currentInvoice.projectId, effectiveCustomerId);
    if (Object.prototype.hasOwnProperty.call(updates, "items") || Object.prototype.hasOwnProperty.call(updates, "discount")) {
      Object.assign(updates, calculateDocumentTotals(updates.items ?? currentInvoice.items, updates.discount ?? currentInvoice.discount));
    }
    const snapshotFilter: any = {
      _id: req.params.id,
      status: "draft",
      customerId: currentInvoice.customerId,
      projectId: currentInvoice.projectId || null,
    };
    const invoice = await InvoiceModel.findOneAndUpdate(snapshotFilter, { $set: updates }, { new: true })
      .populate("customerId", "name companyName email").lean();
    if (!invoice) {
      res.status(409).json({ error: "تغيرت بيانات المسودة، أعد تحميلها ثم حاول مجددًا" });
      return;
    }
    await logAction(String((req as any).user._id), "update_invoice", "Invoice", req.params.id, req);
    res.json({ invoice });
  } catch (error) {
    res.status((error as any)?.statusCode || 500).json({ error: (error as any)?.statusCode ? (error as Error).message : "خطأ في تحديث الفاتورة" });
  }
});

// ── Send Invoice to Client ────────────────────────────────────────
invoicesRouter.post("/:id/send", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOneAndUpdate(
      { _id: req.params.id, status: "draft", convertedToInvoiceId: { $exists: false } },
      { status: "sent" },
      { new: true },
    ).populate("customerId", "name companyName email").lean() as any;
    if (!invoice) {
      res.status(400).json({ error: "لا يمكن إرسال هذا المستند في حالته الحالية" });
      return;
    }

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
    const me = (req as any).user;
    if (me.role !== "client" && !hasFinanceAccess(me.role)) {
      res.status(403).json({ error: "ليس لديك صلاحية للوصول إلى المستندات المالية" });
      return;
    }
    const invoice = await InvoiceModel.findById(req.params.id)
      .populate("customerId")
      .lean() as any;
    if (!invoice) {
      res.status(404).json({ error: "الفاتورة غير موجودة" });
      return;
    }
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
    const payableStatuses = ["sent", "viewed", "overdue", "partial"];
    const invoice = await InvoiceModel.findOne({
      _id: req.params.id,
      type: "invoice",
      status: { $in: payableStatuses },
    }).lean();
    if (!invoice) {
      res.status(400).json({ error: "لا يمكن تسجيل دفعة لهذا المستند في حالته الحالية" });
      return;
    }
    const remaining = Math.max(0, invoice.total - (invoice.paidAmount || 0));
    const payment = paidAmount === undefined ? remaining : Number(paidAmount);
    if (!Number.isFinite(payment) || payment <= 0) {
      res.status(400).json({ error: "أدخل مبلغ دفعة صحيحًا أكبر من صفر" });
      return;
    }
    if (payment > remaining) {
      res.status(400).json({ error: "لا يمكن أن تتجاوز الدفعة المبلغ المتبقي" });
      return;
    }
    const newPaid = (invoice.paidAmount || 0) + payment;
    const status = newPaid >= invoice.total ? "paid" : "partial";
    const updatedInvoice = await InvoiceModel.findOneAndUpdate(
      { _id: invoice._id, status: { $in: payableStatuses }, paidAmount: invoice.paidAmount || 0 },
      { $set: { status, paidAmount: newPaid, paidAt: status === "paid" ? new Date() : undefined } },
      { new: true },
    ).lean();
    if (!updatedInvoice) {
      res.status(409).json({ error: "تغيرت حالة الفاتورة، أعد المحاولة" });
      return;
    }
    await logAction(String((req as any).user._id), "mark_invoice_paid", "Invoice", req.params.id, req, { paidAmount: payment, note });
    res.json({ message: status === "paid" ? "تم تحديد الفاتورة كمدفوعة" : "تم تسجيل دفعة جزئية" });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث حالة الدفع" });
  }
});

// ── Record Quotation Acceptance ────────────────────────────────────
invoicesRouter.post("/:id/accept-quotation", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const quotation = await InvoiceModel.findOneAndUpdate(
      { _id: req.params.id, type: "proforma", status: { $in: ["sent", "viewed"] }, convertedToInvoiceId: { $exists: false } },
      { status: "accepted" },
      { new: true },
    ).lean();
    if (!quotation) {
      res.status(400).json({ error: "لا يمكن اعتماد عرض السعر قبل إرساله أو بعد تحويله" });
      return;
    }
    await logAction(String((req as any).user._id), "accept_quotation", "Invoice", req.params.id, req);
    res.json({ message: "تم اعتماد عرض السعر", quotation });
  } catch {
    res.status(500).json({ error: "تعذر اعتماد عرض السعر" });
  }
});

// ── Convert Approved Quotation to Invoice ───────────────────────────
invoicesRouter.post("/:id/convert-to-invoice", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const existingInvoice = await InvoiceModel.findOne({ sourceQuotationId: req.params.id })
      .populate("customerId", "name companyName email").lean();
    if (existingInvoice) {
      res.json({ message: "تم تحويل عرض السعر مسبقًا", invoice: existingInvoice });
      return;
    }

    let invoice: any;
    let quotationNumber = "";
    await session.withTransaction(async () => {
      const quotation = await InvoiceModel.findOne({
        _id: req.params.id,
        type: "proforma",
        status: "accepted",
        convertedToInvoiceId: { $exists: false },
      }).session(session).lean() as any;
      if (!quotation) {
        const error: any = new Error("يجب اعتماد عرض السعر قبل تحويله أو أنه حُوّل مسبقًا");
        error.statusCode = 400;
        throw error;
      }

      const invoiceNumber = await generateInvoiceNumber("INV", session);
      const [createdInvoice] = await InvoiceModel.create([{
        customerId: quotation.customerId,
        projectId: quotation.projectId,
        sourceQuotationId: quotation._id,
        invoiceNumber,
        type: "invoice",
        items: quotation.items,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        tax: quotation.tax,
        total: quotation.total,
        currency: quotation.currency,
        dueDate: quotation.dueDate,
        notes: quotation.notes,
        notesAr: quotation.notesAr,
        terms: quotation.terms,
        termsAr: quotation.termsAr,
        status: "draft",
        paidAmount: 0,
        createdBy: (req as any).user._id,
      }], { session });

      const linkResult = await InvoiceModel.updateOne(
        { _id: quotation._id, status: "accepted", convertedToInvoiceId: { $exists: false } },
        { convertedToInvoiceId: createdInvoice._id },
        { session },
      );
      if (linkResult.modifiedCount !== 1) throw new Error("تعذر ربط الفاتورة بعرض السعر");

      quotationNumber = quotation.invoiceNumber;
      invoice = createdInvoice.toObject();
    });

    await logAction(String((req as any).user._id), "convert_quotation_to_invoice", "Invoice", req.params.id, req, {
      quotationNumber,
      invoiceNumber: invoice.invoiceNumber,
    });
    res.json({ message: "تم إنشاء فاتورة مسودة من عرض السعر", invoice });
  } catch (error) {
    res.status((error as any)?.statusCode || 500).json({
      error: (error as any)?.statusCode ? (error as Error).message : "تعذر تحويل عرض السعر إلى فاتورة",
    });
  } finally {
    await session.endSession();
  }
});

// ── Delete Invoice ─────────────────────────────────────────────────
invoicesRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findOneAndDelete({
      _id: req.params.id,
      status: "draft",
      sourceQuotationId: { $exists: false },
      convertedToInvoiceId: { $exists: false },
    });
    if (!invoice) {
      res.status(400).json({ error: "لا يمكن حذف إلا المسودات غير المرتبطة" });
      return;
    }
    await logAction(String((req as any).user._id), "delete_invoice", "Invoice", req.params.id, req);
    res.json({ message: "تم حذف الفاتورة" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف الفاتورة" });
  }
});
