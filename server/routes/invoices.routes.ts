import { Router, type Request, type Response, type NextFunction } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { InvoiceModel, CustomerModel, ProjectModel, ServiceModel } from "../models/index.js";
import { fireNotify } from "../notify.js";
import { sendInvoiceEmail } from "../email.js";
import { generateInvoicePdfBuffer } from "../services/pdf.service.js";
import mongoose from "mongoose";
import { accountCredits, allocateCredit, cents, financeError, money, operationalSummary, recordOperationalPayment, settlementStatus } from "../services/operational-finance.js";
import { AuditLogModel } from "../models/AuditLog.js";
import { FinancialEntryModel } from "../models/FinancialEntry.js";

export const invoicesRouter = Router();

const financeRoles = ["super_admin", "admin", "manager"];
const hasFinanceAccess = (role: string | undefined) => financeRoles.includes(role || "");
const CLIENT_VISIBLE_STATUSES = ["sent", "viewed", "accepted", "partial", "paid", "overdue"];

async function preserveHistoricalRecord(req: Request, res: Response, next: NextFunction) {
  try {
    if (mongoose.isValidObjectId(req.params.id) && await InvoiceModel.exists({
      _id: req.params.id, "historicalImport.sourceHash": { $exists: true }, operationalImport: { $exists: false },
    })) {
      res.status(409).json({
        error: "هذا سجل تاريخي محفوظ من كشف الحساب، وليس فاتورة جديدة قابلة للتعديل أو الإصدار. يلزم الرجوع إلى المستند الأصلي لتفاصيل البنود والضريبة.",
      });
      return;
    }
    next();
  } catch {
    res.status(500).json({ error: "تعذر التحقق من السجل التاريخي" });
  }
}

function validationError(message: string) {
  const error: any = new Error(message);
  error.statusCode = 400;
  return error;
}

async function calculateDocumentTotals(rawItems: unknown, rawDiscount: unknown) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw validationError("أدخل بند فاتورة صحيحًا واحدًا على الأقل");
  }
  const serviceIds = rawItems
    .map((raw: any) => raw?.serviceId?._id ?? raw?.serviceId)
    .filter(Boolean)
    .map((id: unknown) => String(id));
  if (serviceIds.some((id: string) => !mongoose.Types.ObjectId.isValid(id))) {
    throw validationError("الخدمة المرتبطة بأحد البنود غير صالحة");
  }
  if (serviceIds.length) {
    const foundServices = await ServiceModel.countDocuments({ _id: { $in: [...new Set(serviceIds)] } });
    if (foundServices !== new Set(serviceIds).size) {
      throw validationError("إحدى الخدمات المرتبطة بالفاتورة لم تعد موجودة");
    }
  }
  const items = rawItems.map((raw: any) => {
    const quantity = Number(raw?.quantity);
    const unitPrice = Number(raw?.unitPrice);
    const discount = Number(raw?.discount || 0);
    const tax = Number(raw?.tax || 0);
    if (!raw?.description?.trim() || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw validationError("أدخل وصفًا وكمية وسعرًا صحيحًا لكل بند");
    }
    const lineSubtotal = money(quantity * unitPrice);
    if (!Number.isFinite(discount) || discount < 0 || discount > lineSubtotal || !Number.isFinite(tax) || tax < 0 || tax > 100) {
      throw validationError("تحقق من قيم الخصم والضريبة في البنود");
    }
    const lineTax = money((quantity * unitPrice - discount) * tax / 100);
    return {
      description: String(raw.description).trim(),
      ...(raw.descriptionAr ? { descriptionAr: String(raw.descriptionAr).trim() } : {}),
      ...(raw.serviceId ? { serviceId: String(raw.serviceId?._id ?? raw.serviceId) } : {}),
      quantity,
      unitPrice,
      discount,
      tax,
      total: money(lineSubtotal - discount + lineTax),
    };
  });
  const subtotal = money(items.reduce((sum, item) => sum + money(item.quantity * item.unitPrice), 0));
  const itemDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const discount = Number(rawDiscount || 0);
  if (!Number.isFinite(discount) || discount < 0 || discount > subtotal - itemDiscount) {
    throw validationError("قيمة الخصم الإجمالي غير صالحة");
  }
  const tax = money(items.reduce((sum, item) => sum + money((item.quantity * item.unitPrice - item.discount) * item.tax / 100), 0));
  return { items, subtotal, discount, tax, total: money(subtotal - itemDiscount - discount + tax) };
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
    // Do not combine $setOnInsert and $inc on the same path. MongoDB rejects
    // that combination as a conflicting update operator during upsert.
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: "after", session },
  );
  const sequence = Number(result?.value?.sequence ?? result?.sequence);
  if (!Number.isFinite(sequence) || sequence < 1) throw new Error("تعذر إنشاء رقم المستند");
  return `${prefix}-${year}-${String(sequence).padStart(5, "0")}`;
}

// ── Get All Invoices ──────────────────────────────────────────────
invoicesRouter.get("/finance-summary", requireAuth, requireRole("super_admin", "admin", "manager"), async (_req, res) => {
  try {
    res.json({ scope: "operational-import", summary: await operationalSummary() });
  } catch {
    res.status(500).json({ error: "تعذر تحميل الأرصدة التشغيلية" });
  }
});

invoicesRouter.get("/:id/account-credits", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const invoice = await InvoiceModel.findById(req.params.id).lean();
    if (!invoice?.operationalImport) { res.status(404).json({ error: "الفاتورة التشغيلية غير موجودة" }); return; }
    const credits = await accountCredits(invoice.customerId);
    const applied = await FinancialEntryModel.find({
      customerId: invoice.customerId, "allocations.invoiceId": invoice._id,
    }).select("kind reference date allocations note").sort({ date: -1 }).lean();
    res.json({
      entries: credits.map(({ _id, kind, reference, date, amount, remaining }) => ({ _id, kind, reference, date, amount, remaining })),
      unallocatedTotal: money(credits.reduce((sum, entry) => sum + entry.remaining, 0)),
      history: applied.map((entry) => ({
        _id: entry._id, kind: entry.kind, reference: entry.reference, date: entry.date, note: entry.note,
        amount: money(entry.allocations.filter((allocation) => String(allocation.invoiceId) === String(invoice._id))
          .reduce((sum, allocation) => sum + allocation.amount, 0)),
      })),
    });
  } catch {
    res.status(500).json({ error: "تعذر تحميل أرصدة العميل" });
  }
});

invoicesRouter.post("/:id/allocate-credit", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const invoice = await allocateCredit(req.params.id, req.body, String((req as any).user._id));
    res.json({ invoice });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : "تعذر توزيع الرصيد. حدّث البيانات وأعد المحاولة." });
  }
});

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

    if (me.role === "client") {
      filter.status = status && CLIENT_VISIBLE_STATUSES.includes(String(status))
        ? status
        : { $in: CLIENT_VISIBLE_STATUSES };
    } else if (status) {
      filter.status = status;
    }
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
      if (!CLIENT_VISIBLE_STATUSES.includes((invoice as any).status)) {
        res.status(404).json({ error: "المستند غير متاح للعميل" });
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
    const totals = await calculateDocumentTotals(items, req.body.discount);
    const type = req.body.type === "proforma" ? "proforma" : "invoice";
    const createFields = [
      "customerId", "projectId", "items", "subtotal", "discount", "tax", "total",
      "currency", "dueDate", "notes", "notesAr", "terms", "termsAr",
    ] as const;
    const documentData = Object.fromEntries(
      createFields.filter((field) => Object.prototype.hasOwnProperty.call(req.body, field))
        .map((field) => [field, req.body[field]]),
    );
    const prefix = type === "proforma" ? "QTE" : "INV";
    const invoiceData = {
      ...documentData,
      ...totals,
      type,
      status: "draft",
      paidAmount: 0,
      createdBy: (req as any).user._id,
    };

    // The counter may predate documents imported into the database. If its
    // first number collides with the unique invoiceNumber index, advance the
    // counter and retry instead of returning a misleading generic 500.
    let invoice;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const invoiceNumber = await generateInvoiceNumber(prefix);
        invoice = await InvoiceModel.create({ ...invoiceData, invoiceNumber });
        break;
      } catch (error: any) {
        const isDuplicateNumber =
          error?.code === 11000 && Boolean(error?.keyPattern?.invoiceNumber);
        if (!isDuplicateNumber || attempt === 2) throw error;
      }
    }
    if (!invoice) throw new Error("تعذر إنشاء رقم فريد للمستند");
    await logAction(String((req as any).user._id), "create_invoice", "Invoice", String(invoice._id), req);
    res.status(201).json({ invoice });
  } catch (error: any) {
    console.error("[Invoices] create error:", error);
    if (error?.statusCode) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    if (error?.name === "ValidationError") {
      res.status(400).json({ error: "تحقق من بيانات الفاتورة: " + Object.values(error.errors || {}).map((item: any) => item.message).join("، ") });
      return;
    }
    if (error?.code === 11000) {
      res.status(409).json({ error: "تعذر إنشاء رقم فريد للمستند، أعد المحاولة" });
      return;
    }
    res.status(500).json({ error: "تعذر إنشاء الفاتورة حاليًا، تحقق من البيانات وحاول مرة أخرى" });
  }
});

// ── Update Invoice ────────────────────────────────────────────────
invoicesRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager"), preserveHistoricalRecord, async (req, res) => {
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
    const currentInvoice = await InvoiceModel.findById(req.params.id).lean();
    if (currentInvoice?.operationalImport) {
      if (!Number.isInteger(req.body.expectedVersion) || req.body.expectedVersion !== currentInvoice.__v) {
        financeError("تغيرت الفاتورة. حدّث البيانات وأعد المحاولة.", 409);
      }
      if (currentInvoice.status === "cancelled") financeError("لا يمكن تعديل فاتورة ملغاة");
      if ((updates.customerId && String(updates.customerId) !== String(currentInvoice.customerId)) ||
        (Object.hasOwn(updates, "projectId") && String(updates.projectId) !== String(currentInvoice.projectId)) ||
        (updates.currency && updates.currency !== currentInvoice.currency)) {
        financeError("لا يمكن تغيير العميل أو المشروع أو عملة الفاتورة المرتبطة بكشف الحساب");
      }
      delete updates.customerId;
      delete updates.projectId;
      if (Object.hasOwn(updates, "dueDate")) {
        if (!updates.dueDate) updates.dueDate = null;
        else if (!Number.isFinite(new Date(String(updates.dueDate)).getTime())) financeError("تاريخ الاستحقاق غير صالح");
      }
      if (Object.hasOwn(updates, "items") || Object.hasOwn(updates, "discount")) {
        Object.assign(updates, await calculateDocumentTotals(updates.items ?? currentInvoice.items, updates.discount ?? currentInvoice.discount));
      }
      const total = Number(updates.total ?? currentInvoice.total);
      if (cents(total) < cents((currentInvoice.paidAmount || 0) + (currentInvoice.creditedAmount || 0))) {
        financeError("الإجمالي الجديد أقل من السداد والتسويات المسجلة. لا يمكن حذف أثرها بتعديل الفاتورة.");
      }
      const nextStatus = settlementStatus({ ...currentInvoice, ...updates, total } as any);
      const session = await mongoose.startSession();
      let invoice: any;
      try {
        await session.withTransaction(async () => {
          invoice = await InvoiceModel.findOneAndUpdate(
            { _id: currentInvoice._id, __v: req.body.expectedVersion },
            {
              $set: { ...updates, status: nextStatus },
              $inc: { __v: 1 },
              ...(nextStatus !== "paid" ? { $unset: { paidAt: "" } } : {}),
            }, { new: true, session },
          ).lean();
          if (!invoice) financeError("تغيرت الفاتورة أثناء الحفظ. حدّث البيانات وأعد المحاولة.", 409);
          if (currentInvoice.projectId) await ProjectModel.updateOne(
            { _id: currentInvoice.projectId, customerId: currentInvoice.customerId },
            { $set: { budget: total } }, { session },
          );
          await AuditLogModel.create([{
            userId: (req as any).user._id, action: "update_operational_invoice", entity: "Invoice", entityId: req.params.id,
            metadata: { before: currentInvoice, after: invoice },
          }], { session });
        });
      } finally { await session.endSession(); }
      res.json({ invoice });
      return;
    }
    if (!currentInvoice || currentInvoice.status !== "draft") {
      res.status(400).json({ error: "لا يمكن تعديل إلا المستندات الموجودة بحالة مسودة" });
      return;
    }
    const effectiveCustomerId = updates.customerId ?? currentInvoice.customerId;
    const customerExists = await CustomerModel.exists({ _id: effectiveCustomerId });
    if (!customerExists) throw validationError("العميل المختار غير موجود");
    await validateProjectForCustomer(updates.projectId ?? currentInvoice.projectId, effectiveCustomerId);
    if (Object.prototype.hasOwnProperty.call(updates, "items") || Object.prototype.hasOwnProperty.call(updates, "discount")) {
      Object.assign(updates, await calculateDocumentTotals(updates.items ?? currentInvoice.items, updates.discount ?? currentInvoice.discount));
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
invoicesRouter.post("/:id/send", requireAuth, requireRole("super_admin", "admin", "manager"), preserveHistoricalRecord, async (req, res) => {
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

    if (!invoice.customerId) {
      await InvoiceModel.updateOne({ _id: invoice._id, status: "sent" }, { status: "draft" });
      res.status(400).json({ error: "لا يوجد عميل مرتبط بهذا المستند" });
      return;
    }

    // Email customer with attached PDF. PDF generation is best effort so
    // an email can still be delivered when Chromium is temporarily unavailable.
    if (invoice.customerId?.email) {
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateInvoicePdfBuffer(invoice, invoice.customerId);
      } catch (e: any) {
        console.error("[Invoices] PDF attach generation failed:", e.message);
      }
      try {
        await sendInvoiceEmail(
          invoice.customerId.email,
          invoice.customerId.name,
          invoice.invoiceNumber,
          invoice.total,
          invoice.currency,
          invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("ar-SA") : undefined,
          pdfBuffer
        );
      } catch (emailError: any) {
        await InvoiceModel.updateOne({ _id: invoice._id, status: "sent" }, { status: "draft" });
        console.error("[Invoices] email delivery failed:", emailError?.message || emailError);
        res.status(502).json({ error: "تعذر إرسال البريد إلى العميل، ولم يتم تغيير حالة المستند" });
        return;
      }
    } else {
      await InvoiceModel.updateOne({ _id: invoice._id, status: "sent" }, { status: "draft" });
      res.status(400).json({ error: "أضف بريد العميل قبل إرسال المستند" });
      return;
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
      .populate("projectId", "name projectNumber")
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
      if (!CLIENT_VISIBLE_STATUSES.includes(invoice.status)) {
        res.status(404).json({ error: "المستند غير متاح للعميل" });
        return;
      }
    }
    const includeBankDetails = !["0", "false", "no"].includes(String(req.query.bankDetails || "").toLowerCase());
    if (invoice.historicalImport && !invoice.operationalImport) {
      res.status(409).json({ error: "هذا سجل تاريخي لا يتضمن تفاصيل البنود والضريبة. لا يمكن إصداره كفاتورة ضريبية من كشف الحساب وحده." });
      return;
    }
    const pdf = await generateInvoicePdfBuffer(invoice, invoice.customerId, includeBankDetails);
    res.setHeader("Content-Type", "application/pdf");
    const safeNumber = String(invoice.invoiceNumber || "document").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader("Content-Disposition", `attachment; filename="${safeNumber}${includeBankDetails ? "-bank" : ""}.pdf"`);
    res.send(pdf);
  } catch (err: any) {
    console.error("[Invoices] PDF generation error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء ملف PDF" });
  }
});

// ── Mark as Paid ──────────────────────────────────────────────────
invoicesRouter.post("/:id/mark-paid", requireAuth, requireRole("super_admin", "admin"), preserveHistoricalRecord, async (req, res) => {
  try {
    const operational = await InvoiceModel.exists({ _id: req.params.id, operationalImport: { $exists: true } });
    if (operational) {
      const invoice = await recordOperationalPayment(req.params.id, req.body, String((req as any).user._id));
      res.json({ invoice, message: "تم تسجيل الدفعة وحفظ أثرها المالي" });
      return;
    }
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
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : "خطأ في تحديث حالة الدفع" });
  }
});

// ── Record Quotation Acceptance ────────────────────────────────────
invoicesRouter.post("/:id/accept-quotation", requireAuth, requireRole("super_admin", "admin", "manager"), preserveHistoricalRecord, async (req, res) => {
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
invoicesRouter.post("/:id/convert-to-invoice", requireAuth, requireRole("super_admin", "admin", "manager"), preserveHistoricalRecord, async (req, res) => {
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
invoicesRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), preserveHistoricalRecord, async (req, res) => {
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
