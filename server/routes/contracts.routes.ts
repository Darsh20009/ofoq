import { Router } from "express";
import { requireAuth, requireRole, logAction } from "../auth.js";
import { ContractModel, CustomerModel } from "../models/index.js";
import { fireNotify } from "../notify.js";
import { generateContractPdfBuffer } from "../services/pdf.service.js";
import { sendContractEmail } from "../email.js";

export const contractsRouter = Router();

function normalizeContractBody(body: any) {
  const normalized = { ...body };

  if (Array.isArray(body.sections)) {
    normalized.sections = body.sections
      .map((section: any, order: number) => ({
        title: String(section?.title || "").trim(),
        content: String(section?.content || "").trim(),
        order,
      }))
      .filter((section: any) => section.title && section.content);
  }

  if (Array.isArray(body.approvalFields)) {
    normalized.approvalFields = body.approvalFields
      .map((field: any) => ({
        type: field?.type === "stamp" ? "stamp" : "signature",
        label: String(field?.label || "").trim(),
        party: ["company", "client", "witness"].includes(field?.party) ? field.party : "company",
        required: Boolean(field?.required),
      }))
      .filter((field: any) => field.label);
  }

  if (normalized.startDate && normalized.endDate && new Date(normalized.endDate) < new Date(normalized.startDate)) {
    throw new Error("يجب أن يكون تاريخ انتهاء العقد بعد تاريخ البدء");
  }

  return normalized;
}

async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await ContractModel.countDocuments();
  return `CON-${year}-${String(count + 1).padStart(5, "0")}`;
}

// ── Get All Contracts ────────────────────────────────────────────
contractsRouter.get("/", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const { status, customerId, page = 1, limit = 20, search } = req.query;
    const filter: any = {};

    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id });
      if (customer) filter.customerId = customer._id;
      else { res.json({ contracts: [], total: 0 }); return; }
    } else if (customerId) {
      filter.customerId = customerId;
    }

    if (status) filter.status = status;
    if (search) filter.contractNumber = { $regex: search, $options: "i" };

    const [contracts, total] = await Promise.all([
      ContractModel.find(filter)
        .populate("customerId", "name companyName email")
        .populate("projectId", "name projectNumber")
        .populate("createdBy", "fullName")
        .sort({ createdAt: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit).lean(),
      ContractModel.countDocuments(filter),
    ]);

    res.json({ contracts, total, page: +page });
  } catch {
    res.status(500).json({ error: "خطأ في جلب العقود" });
  }
});

// ── Get Single Contract ───────────────────────────────────────────
contractsRouter.get("/:id", requireAuth, async (req, res) => {
  try {
    const me = (req as any).user;
    const contract = await ContractModel.findById(req.params.id)
      .populate("customerId", "name companyName email phone address country city taxNumber")
      .populate("projectId", "name projectNumber")
      .populate("serviceId", "title titleAr")
      .populate("createdBy", "fullName").lean();
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }
    // Clients can only access their own contracts
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id });
      if (!customer || String((contract as any).customerId?._id ?? (contract as any).customerId) !== String(customer._id)) {
        res.status(403).json({ error: "غير مصرح لك بعرض هذا العقد" });
        return;
      }
    }
    res.json({ contract });
  } catch {
    res.status(500).json({ error: "خطأ في جلب العقد" });
  }
});

// ── Create Contract ────────────────────────────────────────────────
contractsRouter.post("/", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const contractNumber = await generateContractNumber();
    const contract = await ContractModel.create({
      ...normalizeContractBody(req.body),
      contractNumber,
      createdBy: (req as any).user._id,
    });
    await logAction(String((req as any).user._id), "create_contract", "Contract", String(contract._id), req);
    res.status(201).json({ contract });
  } catch (err: any) {
    console.error("[Contracts] Create error:", err.message);
    res.status(400).json({ error: err.message || "خطأ في إنشاء العقد" });
  }
});

// ── Update Contract ────────────────────────────────────────────────
contractsRouter.patch("/:id", requireAuth, requireRole("super_admin", "admin", "manager", "employee"), async (req, res) => {
  try {
    const contract = await ContractModel.findByIdAndUpdate(req.params.id, normalizeContractBody(req.body), { new: true })
      .populate("customerId", "name companyName email").lean();
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }
    await logAction(String((req as any).user._id), "update_contract", "Contract", req.params.id, req);
    res.json({ contract });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "خطأ في تحديث العقد" });
  }
});

// ── Delete Contract (draft only) ────────────────────────────────────
contractsRouter.delete("/:id", requireAuth, requireRole("super_admin", "admin"), async (req, res) => {
  try {
    const contract = await ContractModel.findById(req.params.id).lean();
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }
    if (contract.status !== "draft") {
      res.status(400).json({ error: "لا يمكن حذف عقد غير مسودة" });
      return;
    }
    await ContractModel.findByIdAndDelete(req.params.id);
    await logAction(String((req as any).user._id), "delete_contract", "Contract", req.params.id, req);
    res.json({ message: "تم حذف العقد" });
  } catch {
    res.status(500).json({ error: "خطأ في حذف العقد" });
  }
});

// ── Send Contract to Client ──────────────────────────────────────
contractsRouter.post("/:id/send", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const contract = await ContractModel.findById(req.params.id)
      .populate("customerId", "name companyName email userId").lean() as any;
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }

    await ContractModel.findByIdAndUpdate(contract._id, { status: "sent" });

    if (contract.customerId?.email) {
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await generateContractPdfBuffer(contract, contract.customerId);
      } catch (e: any) {
        console.error("[Contracts] PDF attach generation failed:", e.message);
      }
      await sendContractEmail(
        contract.customerId.email,
        contract.customerId.name,
        contract.contractNumber,
        contract.titleAr || contract.title,
        pdfBuffer
      );
    }

    if (contract.customerId?.userId) {
      await fireNotify(
        String(contract.customerId.userId),
        "عقد جديد",
        `عقد رقم ${contract.contractNumber} يتطلب مراجعتكم`,
        { type: "info", link: `/dashboard/contracts/${contract._id}` }
      );
    }

    res.json({ message: "تم إرسال العقد" });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال العقد" });
  }
});

// ── Mark as Signed ───────────────────────────────────────────────
contractsRouter.post("/:id/sign", requireAuth, requireRole("super_admin", "admin", "manager"), async (req, res) => {
  try {
    const contract = await ContractModel.findByIdAndUpdate(
      req.params.id,
      { status: "signed", signedAt: new Date() },
      { new: true }
    ).lean();
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }
    await logAction(String((req as any).user._id), "sign_contract", "Contract", req.params.id, req);
    res.json({ message: "تم توثيق توقيع العقد", contract });
  } catch {
    res.status(500).json({ error: "خطأ في توثيق التوقيع" });
  }
});

// ── Download Contract PDF ────────────────────────────────────────
contractsRouter.get("/:id/pdf", requireAuth, async (req, res) => {
  try {
    const contract = await ContractModel.findById(req.params.id)
      .populate("customerId")
      .lean() as any;
    if (!contract) {
      res.status(404).json({ error: "العقد غير موجود" });
      return;
    }
    const me = (req as any).user;
    if (me.role === "client") {
      const customer = await CustomerModel.findOne({ userId: me._id }).lean();
      if (!customer || String(customer._id) !== String(contract.customerId?._id)) {
        res.status(403).json({ error: "ليس لديك صلاحية للوصول لهذا العقد" });
        return;
      }
    }
    const pdf = await generateContractPdfBuffer(contract, contract.customerId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${contract.contractNumber}.pdf"`);
    res.send(pdf);
  } catch (err: any) {
    console.error("[Contracts] PDF generation error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء ملف PDF" });
  }
});
