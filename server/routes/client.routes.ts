import { Router } from "express";
import { requireAuth } from "../auth.js";
import { UserModel } from "../models/index.js";
import {
  ServiceRequestModel,
  SR_STATUS_AR,
  SERVICE_TYPE_AR,
  REQUEST_KIND_AR,
  type RequestKind,
  type ServiceType,
} from "../models/ServiceRequest.js";
import {
  RecruitmentCandidateModel,
  CANDIDATE_PUBLIC_STATUS_AR,
  computeMissingCategories,
  DOCUMENT_CATEGORY_AR,
} from "../models/RecruitmentCandidate.js";
import { SupportMessageModel } from "../models/SupportMessage.js";
import {
  sendServiceRequestAdminNotify,
  sendServiceRequestClientConfirm,
  sendServiceRequestStageUpdate,
  sendSupportReplyNotify,
} from "../email.js";
import { recruitmentRouter } from "./recruitment.routes.js";

export const clientRouter = Router();

// ── Middleware: client-only ──────────────────────────────────────
function requireClient(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    const role = req.user?.role;
    if (role !== "client" && role !== "admin" && role !== "super_admin" && role !== "manager") {
      return res.status(403).json({ error: "غير مصرح" });
    }
    next();
  });
}

function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    const role = req.user?.role;
    if (!["admin", "super_admin", "manager"].includes(role)) {
      return res.status(403).json({ error: "غير مصرح — مسؤولون فقط" });
    }
    next();
  });
}

// ── Mount recruitment sub-routes ──────────────────────────────────
clientRouter.use("/", recruitmentRouter);

// ═══════════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════════

// POST /api/client/requests — create new request
clientRouter.post("/requests", requireClient, async (req: any, res) => {
  try {
    const userId    = req.user._id;
    const userEmail = req.user.email;
    const userRole  = req.user.role;

    const {
      companyName, commercialReg, businessActivity,
      contactEmail, contactPhone,
      serviceType, countryOfRecruitment, packageType, additionalNotes,
      requestKind,
      recruitment,
    } = req.body;

    // ── Required base fields ────────────────────────────────────
    if (!companyName?.trim() || !businessActivity?.trim() || !contactEmail?.trim() ||
        !contactPhone?.trim() || !serviceType) {
      res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة" });
      return;
    }

    // ── Validate serviceType ────────────────────────────────────
    const validServiceTypes = Object.keys(SERVICE_TYPE_AR) as ServiceType[];
    if (!validServiceTypes.includes(serviceType as ServiceType)) {
      res.status(400).json({ error: "نوع الخدمة غير صالح" });
      return;
    }

    // ── Validate requestKind (default: "general") ───────────────
    const kind: RequestKind = (requestKind as RequestKind) || "general";
    const validKinds = Object.keys(REQUEST_KIND_AR) as RequestKind[];
    if (!validKinds.includes(kind)) {
      res.status(400).json({ error: "نوع الطلب غير صالح" });
      return;
    }

    // ── Clients: recruitment sourcing only via recruitment/hr_management ──
    if (
      userRole === "client" &&
      kind === "recruitment" &&
      serviceType !== "recruitment" &&
      serviceType !== "hr_management"
    ) {
      res.status(400).json({
        error: "طلبات الاستقطاب والتوظيف تتطلب خدمة توظيف أو إدارة الموارد البشرية",
      });
      return;
    }

    // ── Recruitment meta: required fields per kind ───────────────
    let recruitmentMeta: Record<string, unknown> | undefined;

    if (kind === "recruitment") {
      // Sourcing/vacancy request — vacancyTitle, vacancyCount, targetCountry are required
      const title   = recruitment?.vacancyTitle?.trim();
      const count   = recruitment?.vacancyCount ? Number(recruitment.vacancyCount) : undefined;
      const country = recruitment?.targetCountry?.trim();

      if (!title) {
        res.status(400).json({ error: "عنوان الوظيفة الشاغرة مطلوب لطلبات التوظيف" });
        return;
      }
      if (!count || count < 1) {
        res.status(400).json({ error: "عدد الشواغر مطلوب وأكبر من صفر لطلبات التوظيف" });
        return;
      }
      if (!country) {
        res.status(400).json({ error: "دولة الاستقطاب مطلوبة لطلبات التوظيف" });
        return;
      }

      // Validate contractType if provided
      const validContractTypes = ["full_time", "part_time", "contract", "temporary"];
      if (recruitment?.contractType && !validContractTypes.includes(recruitment.contractType)) {
        res.status(400).json({ error: "نوع العقد غير صالح" });
        return;
      }

      recruitmentMeta = {
        vacancyTitle:           title,
        vacancyCount:           count,
        requiredNationality:    recruitment?.requiredNationality?.trim() || undefined,
        requiredProfession:     recruitment?.requiredProfession?.trim() || undefined,
        contractType:           recruitment?.contractType || undefined,
        targetCountry:          country,
        salaryRangeMin:         recruitment?.salaryRangeMin != null ? Number(recruitment.salaryRangeMin) : undefined,
        salaryRangeMax:         recruitment?.salaryRangeMax != null ? Number(recruitment.salaryRangeMax) : undefined,
        salaryCurrency:         recruitment?.salaryCurrency?.trim() || "SAR",
        experienceYears:        recruitment?.experienceYears != null ? Number(recruitment.experienceYears) : undefined,
        additionalRequirements: recruitment?.additionalRequirements?.trim() || undefined,
      };

    } else if (kind === "named_candidates") {
      // Named-candidate request — vacancyTitle and vacancyCount required
      const title = recruitment?.vacancyTitle?.trim();
      const count = recruitment?.vacancyCount ? Number(recruitment.vacancyCount) : undefined;

      if (!title) {
        res.status(400).json({ error: "عنوان الوظيفة مطلوب لطلبات المرشحين المحددين" });
        return;
      }
      if (!count || count < 1) {
        res.status(400).json({ error: "عدد الشواغر مطلوب وأكبر من صفر" });
        return;
      }

      const validContractTypes = ["full_time", "part_time", "contract", "temporary"];
      if (recruitment?.contractType && !validContractTypes.includes(recruitment.contractType)) {
        res.status(400).json({ error: "نوع العقد غير صالح" });
        return;
      }

      recruitmentMeta = {
        vacancyTitle:           title,
        vacancyCount:           count,
        requiredNationality:    recruitment?.requiredNationality?.trim() || undefined,
        requiredProfession:     recruitment?.requiredProfession?.trim() || undefined,
        contractType:           recruitment?.contractType || undefined,
        targetCountry:          recruitment?.targetCountry?.trim() || undefined,
        salaryRangeMin:         recruitment?.salaryRangeMin != null ? Number(recruitment.salaryRangeMin) : undefined,
        salaryRangeMax:         recruitment?.salaryRangeMax != null ? Number(recruitment.salaryRangeMax) : undefined,
        salaryCurrency:         recruitment?.salaryCurrency?.trim() || "SAR",
        experienceYears:        recruitment?.experienceYears != null ? Number(recruitment.experienceYears) : undefined,
        additionalRequirements: recruitment?.additionalRequirements?.trim() || undefined,
      };

    }
    // kind === "general" → recruitmentMeta remains undefined (no recruitment block needed)

    const sr = await ServiceRequestModel.create({
      clientId:             userId,
      clientEmail:          userEmail,
      companyName:          companyName.trim(),
      commercialReg:        commercialReg?.trim() || undefined,
      businessActivity:     businessActivity.trim(),
      contactEmail:         contactEmail.trim(),
      contactPhone:         contactPhone.trim(),
      serviceType,
      countryOfRecruitment: countryOfRecruitment?.trim() || undefined,
      packageType:          packageType || undefined,
      additionalNotes:      additionalNotes?.trim() || undefined,
      requestKind:          kind,
      recruitment:          recruitmentMeta,
      status:               "new",
      statusHistory:        [{ status: "new", changedAt: new Date() }],
    });

    const serviceLabel = SERVICE_TYPE_AR[serviceType as ServiceType] || serviceType;
    const kindLabel    = REQUEST_KIND_AR[kind] || kind;

    // Notify admin
    sendServiceRequestAdminNotify({
      requestId:      String(sr._id),
      companyName:    sr.companyName,
      serviceLabel:   `${serviceLabel} — ${kindLabel}`,
      contactEmail:   sr.contactEmail,
      contactPhone:   sr.contactPhone,
      additionalNotes: sr.additionalNotes,
    }).catch(() => {});

    // Confirm to client
    sendServiceRequestClientConfirm({
      toEmail:    sr.contactEmail,
      clientName: req.user.fullName || req.user.name || "العميل",
      requestId:  String(sr._id),
      companyName: sr.companyName,
      serviceLabel,
    }).catch(() => {});

    res.status(201).json({ request: sr });
  } catch (err: any) {
    console.error("[Client] create request error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء الطلب" });
  }
});

// GET /api/client/requests — list current client's requests
clientRouter.get("/requests", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const requests = await ServiceRequestModel.find({ clientId: userId })
      .sort({ createdAt: -1 })
      .select("-notes.isInternal -internalNote")
      .lean();
    res.json({ requests });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الطلبات" });
  }
});

// GET /api/client/requests/:id — single request details (includes recruitment summary)
clientRouter.get("/requests/:id", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const sr = await ServiceRequestModel.findOne({
      _id: req.params.id,
      clientId: userId,
    }).lean() as any;

    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    // Filter out admin-internal notes from client view
    sr.notes = (sr.notes || []).filter((n: any) => !n.isInternal);

    // Attach candidate summary for recruitment/named_candidates requests
    if (sr.requestKind === "named_candidates" || sr.requestKind === "recruitment") {
      const userId = req.user._id;
      const allCandidates = await RecruitmentCandidateModel
        .find({ serviceRequestId: sr._id })
        .sort({ createdAt: -1 })
        .lean() as any[];

      // Apply the same visibility rules as the candidate list endpoint:
      // - Client-submitted: only those submittedBy this client
      // - Admin-sourced: only those with clientVisible=true
      const visible = allCandidates.filter((c) => {
        if (!c.isAdminSourced) return String(c.submittedBy) === String(userId);
        return c.clientVisible === true;
      });

      sr.candidateSummary = {
        total: visible.length,
        byStatus: Object.fromEntries(
          Object.keys(CANDIDATE_PUBLIC_STATUS_AR).map((s) => [
            s,
            visible.filter((c: any) => c.publicStatus === s).length,
          ]),
        ),
        // Safe fields only — no PII, no documents; include doc-completeness for owned candidates
        candidates: visible.map((c: any) => {
          const base: Record<string, unknown> = {
            _id:               c._id,
            fullName:          c.fullName,
            publicStatus:      c.publicStatus,
            currentProfession: c.currentProfession,
            nationality:       c.nationality,
            createdAt:         c.createdAt,
            isAdminSourced:    c.isAdminSourced,
          };
          // For client-owned candidates include document completeness flag
          if (!c.isAdminSourced) {
            const missing = computeMissingCategories(c);
            base.documentsComplete = missing.length === 0;
            base.missingDocumentCount = missing.length;
          }
          return base;
        }),
      };
    }

    res.json({ request: sr });
  } catch {
    res.status(500).json({ error: "خطأ في جلب تفاصيل الطلب" });
  }
});

// POST /api/client/requests/:id/notes — add client note
clientRouter.post("/requests/:id/notes", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const sr = await ServiceRequestModel.findOne({ _id: req.params.id, clientId: userId });
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    sr.notes.push({
      from: "client",
      authorName: req.user.fullName || "العميل",
      text: text.trim(),
      isInternal: false,
      createdAt: new Date(),
    });
    await sr.save();

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في إضافة الملاحظة" });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SUPPORT MESSAGES
// ═══════════════════════════════════════════════════════════════════

// GET /api/client/support — get messages for current client
clientRouter.get("/support", requireClient, async (req: any, res) => {
  try {
    const msgs = await SupportMessageModel.find({ clientId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark admin messages as read
    await SupportMessageModel.updateMany(
      { clientId: req.user._id, from: "admin", read: false },
      { read: true }
    );

    res.json({ messages: msgs });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الرسائل" });
  }
});

// POST /api/client/support — send message
clientRouter.post("/support", requireClient, async (req: any, res) => {
  try {
    const { text, requestId } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const msg = await SupportMessageModel.create({
      clientId:   req.user._id,
      requestId:  requestId || undefined,
      from:       "client",
      senderName: req.user.fullName || "العميل",
      text:       text.trim(),
    });

    res.status(201).json({ message: msg });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الرسالة" });
  }
});

// GET /api/client/support/unread-count
clientRouter.get("/support/unread", requireClient, async (req: any, res) => {
  try {
    const count = await SupportMessageModel.countDocuments({
      clientId: req.user._id,
      from: "admin",
      read: false,
    });
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ADMIN — SERVICE REQUESTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// GET /api/client/admin/requests
clientRouter.get("/admin/requests", requireAdmin, async (req: any, res) => {
  try {
    const { status, requestKind, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (requestKind) filter.requestKind = requestKind;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      ServiceRequestModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ServiceRequestModel.countDocuments(filter),
    ]);

    res.json({ requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الطلبات" });
  }
});

// GET /api/client/admin/requests/:id
clientRouter.get("/admin/requests/:id", requireAdmin, async (_req, res) => {
  try {
    const sr = await ServiceRequestModel.findById(_req.params.id)
      .populate("clientId", "fullName email phone")
      .lean();
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    // Attach candidate summary for recruitment requests
    const srAny = sr as any;
    if (srAny.requestKind === "named_candidates" || srAny.requestKind === "recruitment") {
      const candidates = await RecruitmentCandidateModel
        .find({ serviceRequestId: sr._id })
        .lean();

      // Admin sees internal status too
      const strippedDocs = candidates.map((c) => {
        const obj = { ...c } as any;
        if (Array.isArray(obj.documents)) {
          obj.documents = obj.documents.map((d: any) => {
            const { storedName: _s, ...safe } = d;
            return safe;
          });
        }
        return obj;
      });
      srAny.candidates = strippedDocs;
    }

    res.json({ request: srAny });
  } catch {
    res.status(500).json({ error: "خطأ في جلب تفاصيل الطلب" });
  }
});

// PATCH /api/client/admin/requests/:id/status — update stage
clientRouter.patch("/admin/requests/:id/status", requireAdmin, async (req: any, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = Object.keys(SR_STATUS_AR);
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: "حالة الطلب غير صالحة" });
      return;
    }

    const sr = await ServiceRequestModel.findById(req.params.id);
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    // ── named_candidates completeness guard ──────────────────────
    // Moving beyond "new" requires: at least one client-owned candidate,
    // and every client-owned candidate must have all required documents uploaded.
    // (Does not block staying on "new" or moving to "rejected".)
    const blockedStatuses: string[] = ["reviewing", "approved", "in_progress", "completed"];
    if (sr.requestKind === "named_candidates" && blockedStatuses.includes(status)) {
      const ownedCandidates = await RecruitmentCandidateModel
        .find({ serviceRequestId: sr._id, isAdminSourced: false })
        .lean();

      if (ownedCandidates.length === 0) {
        res.status(400).json({
          error: "لا يمكن تحريك الطلب إلى هذه المرحلة: لم يُضَف أي مرشح من العميل بعد",
        });
        return;
      }

      // Collect candidates with incomplete documents
      const incomplete: Array<{ name: string; missing: string[] }> = [];
      for (const c of ownedCandidates) {
        const missing = computeMissingCategories(c);
        if (missing.length > 0) {
          incomplete.push({
            name:    c.fullName,
            missing: missing.map((cat) => DOCUMENT_CATEGORY_AR[cat]),
          });
        }
      }

      if (incomplete.length > 0) {
        const details = incomplete
          .map((c) => `"${c.name}": ${c.missing.join("، ")}`)
          .join(" | ");
        res.status(400).json({
          error: `لا يمكن تحريك الطلب: وثائق المرشحين التالية غير مكتملة — ${details}`,
          incompleteCount: incomplete.length,
          incomplete,
        });
        return;
      }
    }
    // ─────────────────────────────────────────────────────────────

    const prevStatus = sr.status;
    sr.status = status;
    sr.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user?.fullName || "Admin",
      note,
    });
    await sr.save();

    // Email client about stage change
    sendServiceRequestStageUpdate({
      toEmail:       sr.clientEmail,
      requestId:     String(sr._id),
      companyName:   sr.companyName,
      prevStatusAr:  SR_STATUS_AR[prevStatus] || prevStatus,
      newStatusAr:   SR_STATUS_AR[status as keyof typeof SR_STATUS_AR] || status,
      adminNote:     note,
    }).catch(() => {});

    res.json({ ok: true, status: sr.status });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الحالة" });
  }
});

// POST /api/client/admin/requests/:id/notes — admin adds note
clientRouter.post("/admin/requests/:id/notes", requireAdmin, async (req: any, res) => {
  try {
    const { text, isInternal = false } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const sr = await ServiceRequestModel.findById(req.params.id);
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    sr.notes.push({
      from: "admin",
      authorName: req.user?.fullName || "الإدارة",
      text: text.trim(),
      isInternal,
      createdAt: new Date(),
    });
    await sr.save();

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في إضافة الملاحظة" });
  }
});

// GET /api/client/admin/support — all conversations
clientRouter.get("/admin/support", requireAdmin, async (_req, res) => {
  try {
    // Get unique client IDs with latest message
    const conversations = await SupportMessageModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$clientId",
        lastMessage: { $first: "$text" },
        lastDate: { $first: "$createdAt" },
        unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$from", "client"] }, { $eq: ["$read", false] }] }, 1, 0] } },
      }},
      { $sort: { lastDate: -1 } },
      { $limit: 50 },
    ]);

    // Populate client info
    const clientIds = conversations.map((c) => c._id);
    const clients = await UserModel.find({ _id: { $in: clientIds } }).select("fullName email").lean();
    const clientMap: Record<string, any> = {};
    clients.forEach((c) => { clientMap[String(c._id)] = c; });

    const result = conversations.map((c) => ({
      clientId:    String(c._id),
      client:      clientMap[String(c._id)],
      lastMessage: c.lastMessage,
      lastDate:    c.lastDate,
      unreadCount: c.unreadCount,
    }));

    res.json({ conversations: result });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المحادثات" });
  }
});

// GET /api/client/admin/support/:clientId
clientRouter.get("/admin/support/:clientId", requireAdmin, async (req, res) => {
  try {
    const msgs = await SupportMessageModel.find({ clientId: req.params.clientId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark client messages as read
    await SupportMessageModel.updateMany(
      { clientId: req.params.clientId, from: "client", read: false },
      { read: true }
    );

    res.json({ messages: msgs });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المحادثة" });
  }
});

// POST /api/client/admin/support/:clientId — admin reply
clientRouter.post("/admin/support/:clientId", requireAdmin, async (req: any, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const client = await UserModel.findById(req.params.clientId).select("email fullName").lean() as any;

    const msg = await SupportMessageModel.create({
      clientId:   req.params.clientId,
      from:       "admin",
      senderName: req.user?.fullName || "فريق أفق",
      text:       text.trim(),
    });

    // Notify client by email
    if (client?.email) {
      sendSupportReplyNotify({
        toEmail:    client.email,
        clientName: client.fullName || "العميل",
        adminName:  req.user?.fullName || "فريق أفق",
        replyText:  text.trim(),
      }).catch(() => {});
    }

    res.status(201).json({ message: msg });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الرد" });
  }
});

// GET /api/client/admin/stats
clientRouter.get("/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [total, newCount, inProgress, completed, recruitmentTotal] = await Promise.all([
      ServiceRequestModel.countDocuments(),
      ServiceRequestModel.countDocuments({ status: "new" }),
      ServiceRequestModel.countDocuments({ status: { $in: ["reviewing", "approved", "in_progress"] } }),
      ServiceRequestModel.countDocuments({ status: "completed" }),
      ServiceRequestModel.countDocuments({ requestKind: { $in: ["named_candidates", "recruitment"] } }),
    ]);
    res.json({ total, new: newCount, inProgress, completed, recruitmentTotal });
  } catch {
    res.json({ total: 0, new: 0, inProgress: 0, completed: 0, recruitmentTotal: 0 });
  }
});
