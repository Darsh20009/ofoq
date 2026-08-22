/**
 * Recruitment workflow routes — mounted under /api/client.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Authorization matrix
 * ═══════════════════════════════════════════════════════════════════
 *
 * Client-submitted candidates (isAdminSourced=false):
 *   • Client routes (no /admin/ prefix) require role === "client" EXACTLY.
 *     admin/super_admin/manager/employee receive 403 and must use the /admin/ routes.
 *   • SR ownership (clientId === userId) is enforced unconditionally — no conditional
 *     bypass for privileged roles exists inside any client route handler.
 *   • submittedBy must equal req.user._id for all document operations.
 *   • May only be created on named_candidates requests.
 *
 * Admin-sourced candidates (isAdminSourced=true):
 *   • May only be created on requestKind === "recruitment" requests.
 *     Attempting to create them on "named_candidates" or "general" requests → 400.
 *   • Hidden from clients unless clientVisible=true.
 *   • When visible, clients see only a safe subset (no PII, no docs, no internal fields).
 *   • Clients may NEVER upload or download documents from admin-sourced candidates.
 *   • isAdminSourced is immutable after creation; PATCH rejects any attempt to change it.
 *
 * Admin routes (/admin/…):
 *   • Full access to all candidates on any request.
 *   • storedName is NEVER returned in any response.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Document requirement rules (client-owned named_candidates only)
 * ═══════════════════════════════════════════════════════════════════
 *
 *   passport                    — always required
 *   education_certificate       — always required
 *   residence_permit            — required when isGulfResident === true
 *   resignation_acknowledgement — required when workStatus === "employed"
 *   experience_certificate      — required when workStatus !== "employed"
 *                                 (unemployed / freelance / student / other / unset)
 *
 * Each upload must include a documentType multipart field matching one of
 * the five DocumentCategory values. A category may only have one document;
 * re-uploading the same category replaces the previous file.
 *
 * ═══════════════════════════════════════════════════════════════════
 * Endpoint reference
 * ═══════════════════════════════════════════════════════════════════
 *
 * CLIENT
 *   POST   /requests/:id/candidates
 *   GET    /requests/:id/candidates
 *   GET    /requests/:id/candidates/:cid
 *   DELETE /requests/:id/candidates/:cid          (client-owned only; deletes files from disk)
 *   GET    /requests/:id/candidates/:cid/documents/requirements
 *   POST   /requests/:id/candidates/:cid/documents
 *           multipart/form-data  fields: document (file), documentType (string)
 *   GET    /requests/:id/candidates/:cid/documents/:did
 *
 * ADMIN
 *   GET   /admin/requests/:id/candidates
 *   POST  /admin/requests/:id/candidates
 *   PATCH /admin/requests/:id/candidates/:cid
 *   POST  /admin/requests/:id/candidates/:cid/documents
 *          multipart/form-data  fields: document (file), documentType (string)
 *   GET   /admin/requests/:id/candidates/:cid/documents/:did
 */

import { Router } from "express";
import path from "path";
import fs from "fs";
import { requireAuth } from "../auth.js";
import { ServiceRequestModel } from "../models/ServiceRequest.js";
import {
  RecruitmentCandidateModel,
  CANDIDATE_PUBLIC_STATUS_AR,
  CANDIDATE_PUBLIC_STATUSES,
  CANDIDATE_INTERNAL_STATUS_AR,
  CANDIDATE_INTERNAL_STATUSES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_AR,
  EDUCATION_LEVELS,
  computeRequiredCategories,
  computeMissingCategories,
  type DocumentCategory,
} from "../models/RecruitmentCandidate.js";
import {
  candidateUpload,
  CANDIDATE_DOCS_DIR,
  sanitizeOriginalName,
} from "../middleware/candidateUpload.js";

export const recruitmentRouter = Router();

// ── Auth guards ───────────────────────────────────────────────────

/**
 * requireExactClient — permits role === "client" ONLY.
 * Admin/manager/super_admin/employee must use the /admin/… routes.
 * This deliberately closes the privileged-bypass hole: no conditional
 * `if (role !== "client")` branching inside the handler is needed or
 * permitted — the middleware ensures only real clients ever reach the
 * client-facing route handlers.
 */
function requireExactClient(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (req.user?.role !== "client") {
      return res.status(403).json({
        error: "هذا المسار مخصص للعملاء فقط — يرجى استخدام مسارات الإدارة",
      });
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

// ── Response-shape helpers ────────────────────────────────────────

/** Full admin view: every field except storedName on documents. */
function toAdminView(candidate: any): any {
  const c: any =
    typeof candidate.toObject === "function" ? candidate.toObject() : { ...candidate };
  if (Array.isArray(c.documents)) {
    c.documents = c.documents.map(({ storedName: _s, ...rest }: any) => rest);
  }
  return c;
}

/**
 * Client view for a candidate the client submitted themselves.
 * Strips internal fields and storedName; keeps PII and documents
 * (client owns them) plus the computed document-requirement status.
 */
function toClientOwnedView(candidate: any): any {
  const c: any =
    typeof candidate.toObject === "function" ? candidate.toObject() : { ...candidate };
  delete c.internalNotes;
  delete c.internalStatus;
  delete c.isAdminSourced;
  delete c.clientVisible;
  if (Array.isArray(c.documents)) {
    c.documents = c.documents.map(({ storedName: _s, ...rest }: any) => rest);
  }
  // Attach document requirements inline
  c.documentRequirements = buildDocumentRequirements(c);
  return c;
}

/**
 * Client view for an admin-sourced candidate marked clientVisible=true.
 * Safe subset only: no PII, no documents, no internal fields.
 */
function toClientVisibleAdminView(candidate: any): any {
  const c: any =
    typeof candidate.toObject === "function" ? candidate.toObject() : { ...candidate };
  return {
    _id:               c._id,
    serviceRequestId:  c.serviceRequestId,
    fullName:          c.fullName,
    nationality:       c.nationality,
    currentProfession: c.currentProfession,
    desiredProfession: c.desiredProfession,
    publicStatus:      c.publicStatus,
    candidateNotes:    c.candidateNotes,
    createdAt:         c.createdAt,
    updatedAt:         c.updatedAt,
    isAdminSourced:    true,
  };
}

// ── Document-requirement helpers ──────────────────────────────────

interface DocRequirement {
  category: DocumentCategory;
  labelAr: string;
  required: boolean;
  uploaded: boolean;
  documentId: string | null; // _id of uploaded doc, null if not yet uploaded
}

interface DocumentRequirementsResult {
  required: DocumentCategory[];
  uploaded: DocumentCategory[];
  missing: DocumentCategory[];
  details: DocRequirement[];
  complete: boolean;
}

function buildDocumentRequirements(candidate: {
  isGulfResident?: boolean;
  workStatus?: string;
  documents: Array<{ _id?: any; documentCategory?: string }>;
}): DocumentRequirementsResult {
  const required = computeRequiredCategories(candidate);
  const missing  = computeMissingCategories(candidate);
  const uploaded = required.filter((c) => !missing.includes(c));

  const details: DocRequirement[] = required.map((cat) => {
    const doc = candidate.documents.find((d) => d.documentCategory === cat);
    return {
      category:   cat,
      labelAr:    DOCUMENT_CATEGORY_AR[cat],
      required:   true,
      uploaded:   Boolean(doc),
      documentId: doc?._id ? String(doc._id) : null,
    };
  });

  return {
    required,
    uploaded,
    missing,
    details,
    complete: missing.length === 0,
  };
}

// ════════════════════════════════════════════════════════════════
// CLIENT CANDIDATE ROUTES
// ════════════════════════════════════════════════════════════════

// POST /requests/:id/candidates
// Client self-submission: role must be exactly "client" (enforced by requireExactClient).
// The SR must be owned by this client AND have requestKind === "named_candidates".
// No role-conditional branching inside the handler — ownership is always enforced.
recruitmentRouter.post(
  "/requests/:id/candidates",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      // Ownership is unconditional: SR must belong to this client
      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      });
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      // Kind guard: client self-submission is only valid on named_candidates requests
      if (sr.requestKind !== "named_candidates") {
        res.status(403).json({
          error: "لا يمكن إضافة مرشحين مباشرة إلا في طلبات المرشحين المحددين",
        });
        return;
      }

      const {
        fullName, contactEmail, contactPhone,
        nationality, currentProfession, desiredProfession,
        workStatus, country, candidateNotes,
        isGulfResident, educationLevel,
      } = req.body;

      if (!fullName?.trim()) {
        res.status(400).json({ error: "اسم المرشح مطلوب" });
        return;
      }

      if (workStatus !== undefined) {
        const validWorkStatuses = ["employed", "unemployed", "freelance", "student", "other"];
        if (!validWorkStatuses.includes(workStatus)) {
          res.status(400).json({ error: "حالة العمل غير صالحة" });
          return;
        }
      }

      if (educationLevel !== undefined && !EDUCATION_LEVELS.includes(educationLevel)) {
        res.status(400).json({ error: "المستوى التعليمي غير صالح" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.create({
        serviceRequestId:  sr._id,
        submittedBy:       userId,
        isAdminSourced:    false,
        clientVisible:     true,
        fullName:          fullName.trim(),
        contactEmail:      contactEmail?.trim() || undefined,
        contactPhone:      contactPhone?.trim() || undefined,
        nationality:       nationality?.trim() || undefined,
        currentProfession: currentProfession?.trim() || undefined,
        desiredProfession: desiredProfession?.trim() || undefined,
        workStatus:        workStatus || undefined,
        country:           country?.trim() || undefined,
        isGulfResident:    typeof isGulfResident === "boolean" ? isGulfResident : undefined,
        educationLevel:    educationLevel || undefined,
        candidateNotes:    candidateNotes?.trim() || undefined,
        publicStatus:      "submitted",
        internalStatus:    "new",
      });

      res.status(201).json({ candidate: toClientOwnedView(candidate) });
    } catch (err: any) {
      console.error("[Recruitment] create candidate error:", err.message);
      res.status(500).json({ error: "خطأ في إضافة المرشح" });
    }
  },
);

// GET /requests/:id/candidates
// Lists candidates visible to the owning client:
//   - client-submitted candidates where submittedBy === userId
//   - admin-sourced candidates where clientVisible === true (safe subset only)
// Ownership is always enforced — no privileged bypass.
recruitmentRouter.get(
  "/requests/:id/candidates",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const allCandidates = await RecruitmentCandidateModel
        .find({ serviceRequestId: sr._id })
        .sort({ createdAt: -1 })
        .lean();

      const shaped = allCandidates
        .filter((c: any) => {
          if (!c.isAdminSourced) return String(c.submittedBy) === String(userId);
          return c.clientVisible === true;
        })
        .map((c: any) =>
          c.isAdminSourced ? toClientVisibleAdminView(c) : toClientOwnedView(c),
        );

      res.json({ candidates: shaped });
    } catch {
      res.status(500).json({ error: "خطأ في جلب المرشحين" });
    }
  },
);

// GET /requests/:id/candidates/:cid
// Client may view:
//   - candidates they submitted (submittedBy === userId) → full client-owned shape
//   - admin-sourced candidates where clientVisible === true → safe subset only
// SR ownership is always enforced; no privileged bypass.
recruitmentRouter.get(
  "/requests/:id/candidates/:cid",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel
        .findOne({ _id: req.params.cid, serviceRequestId: sr._id })
        .lean() as any;
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      if (candidate.isAdminSourced) {
        if (!candidate.clientVisible) {
          res.status(404).json({ error: "المرشح غير موجود" });
          return;
        }
        res.json({ candidate: toClientVisibleAdminView(candidate) });
        return;
      }

      if (String(candidate.submittedBy) !== String(userId)) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      res.json({ candidate: toClientOwnedView(candidate) });
    } catch {
      res.status(500).json({ error: "خطأ في جلب بيانات المرشح" });
    }
  },
);

// DELETE /requests/:id/candidates/:cid
// Client deletes one of their own named-candidate submissions.
// Conditions (all unconditional — no privileged bypass):
//   • SR must be owned by this client (clientId === userId).
//   • Candidate must be client-submitted (isAdminSourced=false).
//   • submittedBy must equal this client's userId.
// All private files on disk are removed before the DB record is deleted.
// Returns { ok: true } — no private metadata, no file paths.
recruitmentRouter.delete(
  "/requests/:id/candidates/:cid",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      // Ownership is unconditional
      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      });
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // Admin-sourced candidates may never be deleted through the client route
      if ((candidate as any).isAdminSourced) {
        res.status(403).json({
          error: "لا يمكن حذف مرشح مصدره الإدارة",
        });
        return;
      }

      // Only the submitter may delete
      if (String(candidate.submittedBy) !== String(userId)) {
        res.status(403).json({ error: "غير مصرح بحذف هذا المرشح" });
        return;
      }

      // Delete all private files from disk before removing the DB record
      for (const doc of candidate.documents as any[]) {
        if (doc.storedName) {
          const filePath = path.join(CANDIDATE_DOCS_DIR, doc.storedName);
          fs.unlink(filePath, () => {}); // best-effort; ignore ENOENT
        }
      }

      await RecruitmentCandidateModel.deleteOne({ _id: candidate._id });

      res.json({ ok: true });
    } catch (err: any) {
      console.error("[Recruitment] delete candidate error:", err.message);
      res.status(500).json({ error: "خطأ في حذف المرشح" });
    }
  },
);

// GET /requests/:id/candidates/:cid/documents/requirements
// Returns which document categories are required, uploaded, and still missing.
// No file paths are exposed. Only the owning client may call this.
// Note: registered BEFORE /:did to prevent "requirements" being matched as a document ID.
recruitmentRouter.get(
  "/requests/:id/candidates/:cid/documents/requirements",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel
        .findOne({ _id: req.params.cid, serviceRequestId: sr._id })
        .lean() as any;
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // Document requirements are only meaningful for client-submitted candidates
      if (candidate.isAdminSourced) {
        res.status(403).json({
          error: "متطلبات الوثائق متاحة فقط للمرشحين المُقدَّمين من العميل",
        });
        return;
      }

      if (String(candidate.submittedBy) !== String(userId)) {
        res.status(403).json({ error: "غير مصرح بالوصول إلى هذا المرشح" });
        return;
      }

      res.json({ requirements: buildDocumentRequirements(candidate) });
    } catch {
      res.status(500).json({ error: "خطأ في جلب متطلبات الوثائق" });
    }
  },
);

// POST /requests/:id/candidates/:cid/documents
// multipart/form-data: document (file), documentType (DocumentCategory string)
// Owning client may only upload to candidates they submitted themselves.
// Re-uploading a category replaces the previous file for that category.
// Ownership and all business rules are enforced unconditionally — no privileged bypass.
recruitmentRouter.post(
  "/requests/:id/candidates/:cid/documents",
  requireExactClient,
  (req: any, res, next) => {
    candidateUpload.single("document")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "خطأ في رفع الملف" });
      }
      next();
    });
  },
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      if (!req.file) {
        res.status(400).json({ error: "لم يتم اختيار ملف" });
        return;
      }

      // Validate documentType before touching DB
      const documentType: string = String(req.body.documentType || "").trim();
      if (!documentType) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: "حقل documentType مطلوب",
          allowedValues: DOCUMENT_CATEGORIES,
        });
        return;
      }
      if (!DOCUMENT_CATEGORIES.includes(documentType as DocumentCategory)) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: `نوع الوثيقة "${documentType}" غير صالح`,
          allowedValues: DOCUMENT_CATEGORIES,
        });
        return;
      }
      const category = documentType as DocumentCategory;

      // Ownership is unconditional
      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        fs.unlink(req.file.path, () => {});
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      });
      if (!candidate) {
        fs.unlink(req.file.path, () => {});
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // Admin-sourced candidates may never be modified through the client route
      if ((candidate as any).isAdminSourced) {
        fs.unlink(req.file.path, () => {});
        res.status(403).json({ error: "لا يمكن رفع وثائق لمرشح مصدره الإدارة" });
        return;
      }

      // Only the submitter may upload documents
      if (String(candidate.submittedBy) !== String(userId)) {
        fs.unlink(req.file.path, () => {});
        res.status(403).json({ error: "غير مصرح بتعديل هذا المرشح" });
        return;
      }

      // Category must be one of the required categories for this candidate
      const required = computeRequiredCategories(candidate);
      if (!required.includes(category)) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: `الفئة "${DOCUMENT_CATEGORY_AR[category]}" غير مطلوبة لهذا المرشح`,
          requiredCategories: required,
        });
        return;
      }

      // Replace existing doc for this category (delete old file from disk)
      const existingIdx = (candidate.documents as any[]).findIndex(
        (d: any) => d.documentCategory === category,
      );
      if (existingIdx !== -1) {
        const oldDoc = (candidate.documents as any[])[existingIdx];
        const oldPath = path.join(CANDIDATE_DOCS_DIR, oldDoc.storedName);
        fs.unlink(oldPath, () => {}); // best-effort cleanup
        candidate.documents.splice(existingIdx, 1);
      }

      candidate.documents.push({
        originalName:     sanitizeOriginalName(req.file.originalname),
        storedName:       path.basename(req.file.path),
        mimeType:         req.file.mimetype,
        sizeBytes:        req.file.size,
        documentCategory: category,
        uploadedBy:       userId,
        uploadedAt:       new Date(),
      } as any);

      await candidate.save();

      const saved = candidate.documents[candidate.documents.length - 1] as any;
      const updatedRequirements = buildDocumentRequirements(candidate as any);

      res.status(201).json({
        document: {
          _id:              saved._id,
          originalName:     saved.originalName,
          mimeType:         saved.mimeType,
          sizeBytes:        saved.sizeBytes,
          documentCategory: saved.documentCategory,
          uploadedAt:       saved.uploadedAt,
        },
        requirements: updatedRequirements,
      });
    } catch (err: any) {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
      console.error("[Recruitment] upload doc error:", err.message);
      res.status(500).json({ error: "خطأ في رفع الملف" });
    }
  },
);

// GET /requests/:id/candidates/:cid/documents/:did
// Only the owning client may download documents from their own candidates.
// Ownership and all access rules are enforced unconditionally — no privileged bypass.
recruitmentRouter.get(
  "/requests/:id/candidates/:cid/documents/:did",
  requireExactClient,
  async (req: any, res) => {
    try {
      const userId = req.user._id;

      // Ownership is unconditional
      const sr = await ServiceRequestModel.findOne({
        _id: req.params.id,
        clientId: userId,
      }).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      }).lean() as any;
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // Admin-sourced candidate documents are never accessible through the client route
      if (candidate.isAdminSourced) {
        res.status(403).json({ error: "لا يمكن تحميل وثائق مرشح مصدره الإدارة" });
        return;
      }

      // Only the submitter may download
      if (String(candidate.submittedBy) !== String(userId)) {
        res.status(403).json({ error: "غير مصرح بالوصول إلى هذا المرشح" });
        return;
      }

      const doc = (candidate.documents as any[]).find(
        (d: any) => String(d._id) === req.params.did,
      );
      if (!doc) {
        res.status(404).json({ error: "الوثيقة غير موجودة" });
        return;
      }

      const filePath = path.join(CANDIDATE_DOCS_DIR, doc.storedName);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "الملف غير متاح" });
        return;
      }

      res.setHeader("Content-Type", doc.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
      );
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(filePath);
    } catch {
      res.status(500).json({ error: "خطأ في تحميل الوثيقة" });
    }
  },
);

// ════════════════════════════════════════════════════════════════
// ADMIN CANDIDATE ROUTES
// ════════════════════════════════════════════════════════════════

// GET /admin/requests/:id/candidates
recruitmentRouter.get(
  "/admin/requests/:id/candidates",
  requireAdmin,
  async (req: any, res) => {
    try {
      const sr = await ServiceRequestModel.findById(req.params.id).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }
      const candidates = await RecruitmentCandidateModel
        .find({ serviceRequestId: sr._id })
        .sort({ createdAt: -1 })
        .lean();
      res.json({ candidates: candidates.map(toAdminView) });
    } catch {
      res.status(500).json({ error: "خطأ في جلب المرشحين" });
    }
  },
);

// POST /admin/requests/:id/candidates
// Creates a sourcing candidate: isAdminSourced=true, clientVisible defaults false.
// RESTRICTION: admin-sourced candidates may only be added to requestKind === "recruitment"
// requests. Attempting to add them to "named_candidates" or "general" requests is refused
// with a 400 error, because those kinds are structurally incompatible with admin-sourced
// pipeline candidates.
recruitmentRouter.post(
  "/admin/requests/:id/candidates",
  requireAdmin,
  async (req: any, res) => {
    try {
      const sr = await ServiceRequestModel.findById(req.params.id);
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      // ── Kind guard: admin-sourced candidates belong to recruitment requests only ──
      if (sr.requestKind !== "recruitment") {
        res.status(400).json({
          error: "لا يمكن إضافة مرشحين مصدرهم الإدارة إلا في طلبات الاستقطاب والتوظيف (recruitment)",
          requestKind: sr.requestKind,
        });
        return;
      }

      const {
        fullName, contactEmail, contactPhone,
        nationality, currentProfession, desiredProfession,
        workStatus, country, candidateNotes, internalNotes,
        publicStatus, internalStatus, clientVisible,
        isGulfResident, educationLevel,
      } = req.body;

      if (!fullName?.trim()) {
        res.status(400).json({ error: "اسم المرشح مطلوب" });
        return;
      }

      if (workStatus !== undefined) {
        const validWorkStatuses = ["employed", "unemployed", "freelance", "student", "other"];
        if (!validWorkStatuses.includes(workStatus)) {
          res.status(400).json({ error: "حالة العمل غير صالحة" });
          return;
        }
      }

      if (educationLevel !== undefined && !EDUCATION_LEVELS.includes(educationLevel)) {
        res.status(400).json({ error: "المستوى التعليمي غير صالح" });
        return;
      }

      const resolvedPublicStatus   = publicStatus   || "submitted";
      const resolvedInternalStatus = internalStatus || "new";

      if (!CANDIDATE_PUBLIC_STATUSES.includes(resolvedPublicStatus)) {
        res.status(400).json({ error: "حالة المرشح العلنية غير صالحة" });
        return;
      }
      if (!CANDIDATE_INTERNAL_STATUSES.includes(resolvedInternalStatus)) {
        res.status(400).json({ error: "الحالة الداخلية للمرشح غير صالحة" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.create({
        serviceRequestId:  sr._id,
        submittedBy:       req.user._id,
        isAdminSourced:    true,
        clientVisible:     clientVisible === true,
        fullName:          fullName.trim(),
        contactEmail:      contactEmail?.trim() || undefined,
        contactPhone:      contactPhone?.trim() || undefined,
        nationality:       nationality?.trim() || undefined,
        currentProfession: currentProfession?.trim() || undefined,
        desiredProfession: desiredProfession?.trim() || undefined,
        workStatus:        workStatus || undefined,
        country:           country?.trim() || undefined,
        isGulfResident:    typeof isGulfResident === "boolean" ? isGulfResident : undefined,
        educationLevel:    educationLevel || undefined,
        candidateNotes:    candidateNotes?.trim() || undefined,
        internalNotes:     internalNotes?.trim() || undefined,
        publicStatus:      resolvedPublicStatus,
        internalStatus:    resolvedInternalStatus,
      });

      res.status(201).json({ candidate: toAdminView(candidate) });
    } catch (err: any) {
      console.error("[Recruitment] admin create candidate error:", err.message);
      res.status(500).json({ error: "خطأ في إضافة المرشح" });
    }
  },
);

// PATCH /admin/requests/:id/candidates/:cid
// Notes on immutable fields:
//   • isAdminSourced is NEVER patchable — it is set at creation and locked.
//     Attempting to pass it in the body is silently ignored (field not in the patchable set).
//   • An admin-sourced candidate must only ever exist on a "recruitment" request;
//     the creation guard ensures this. The patch guard here enforces that
//     a candidate on a non-recruitment request cannot have isAdminSourced flipped.
recruitmentRouter.patch(
  "/admin/requests/:id/candidates/:cid",
  requireAdmin,
  async (req: any, res) => {
    try {
      const sr = await ServiceRequestModel.findById(req.params.id).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      });
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // isAdminSourced is immutable — reject any attempt to change it
      if (req.body.isAdminSourced !== undefined) {
        res.status(400).json({
          error: "حقل isAdminSourced لا يمكن تغييره بعد إنشاء المرشح",
        });
        return;
      }

      // Patchable string fields
      const stringFields = [
        "fullName", "contactEmail", "contactPhone",
        "nationality", "currentProfession", "desiredProfession",
        "country", "candidateNotes", "internalNotes",
      ] as const;

      for (const field of stringFields) {
        if (req.body[field] !== undefined) {
          (candidate as any)[field] = String(req.body[field]).trim() || undefined;
        }
      }

      if (req.body.workStatus !== undefined) {
        const allowed = ["employed", "unemployed", "freelance", "student", "other"];
        if (!allowed.includes(req.body.workStatus)) {
          res.status(400).json({ error: "حالة العمل غير صالحة" });
          return;
        }
        candidate.workStatus = req.body.workStatus;
      }

      if (req.body.isGulfResident !== undefined) {
        candidate.isGulfResident = req.body.isGulfResident === true;
      }

      if (req.body.educationLevel !== undefined) {
        if (!EDUCATION_LEVELS.includes(req.body.educationLevel)) {
          res.status(400).json({ error: "المستوى التعليمي غير صالح" });
          return;
        }
        candidate.educationLevel = req.body.educationLevel;
      }

      if (req.body.publicStatus !== undefined) {
        if (!CANDIDATE_PUBLIC_STATUSES.includes(req.body.publicStatus)) {
          res.status(400).json({ error: "حالة المرشح العلنية غير صالحة" });
          return;
        }
        candidate.publicStatus = req.body.publicStatus;
      }

      if (req.body.internalStatus !== undefined) {
        if (!CANDIDATE_INTERNAL_STATUSES.includes(req.body.internalStatus)) {
          res.status(400).json({ error: "الحالة الداخلية للمرشح غير صالحة" });
          return;
        }
        candidate.internalStatus = req.body.internalStatus;
      }

      if (req.body.clientVisible !== undefined) {
        candidate.clientVisible = req.body.clientVisible === true;
      }

      await candidate.save();
      res.json({ candidate: toAdminView(candidate) });
    } catch (err: any) {
      console.error("[Recruitment] admin update candidate error:", err.message);
      res.status(500).json({ error: "خطأ في تحديث بيانات المرشح" });
    }
  },
);

// POST /admin/requests/:id/candidates/:cid/documents
// multipart/form-data: document (file), documentType (DocumentCategory string)
// Admin uploads also validate documentType and replace existing category docs.
recruitmentRouter.post(
  "/admin/requests/:id/candidates/:cid/documents",
  requireAdmin,
  (req: any, res, next) => {
    candidateUpload.single("document")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "خطأ في رفع الملف" });
      }
      next();
    });
  },
  async (req: any, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "لم يتم اختيار ملف" });
        return;
      }

      const documentType: string = String(req.body.documentType || "").trim();
      if (!documentType) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: "حقل documentType مطلوب",
          allowedValues: DOCUMENT_CATEGORIES,
        });
        return;
      }
      if (!DOCUMENT_CATEGORIES.includes(documentType as DocumentCategory)) {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: `نوع الوثيقة "${documentType}" غير صالح`,
          allowedValues: DOCUMENT_CATEGORIES,
        });
        return;
      }
      const category = documentType as DocumentCategory;

      const sr = await ServiceRequestModel.findById(req.params.id).lean();
      if (!sr) {
        fs.unlink(req.file.path, () => {});
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      });
      if (!candidate) {
        fs.unlink(req.file.path, () => {});
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      // ── Defense-in-depth: admin-sourced candidate docs must stay on recruitment requests ──
      // This should never be reachable given the creation guard, but protects data integrity.
      if ((candidate as any).isAdminSourced && sr.requestKind !== "recruitment") {
        fs.unlink(req.file.path, () => {});
        res.status(400).json({
          error: "لا يمكن رفع وثائق لمرشح مصدره الإدارة على طلب من نوع غير recruitment",
          requestKind: sr.requestKind,
        });
        return;
      }

      // Replace existing doc for this category
      const existingIdx = (candidate.documents as any[]).findIndex(
        (d: any) => d.documentCategory === category,
      );
      if (existingIdx !== -1) {
        const oldDoc = (candidate.documents as any[])[existingIdx];
        const oldPath = path.join(CANDIDATE_DOCS_DIR, oldDoc.storedName);
        fs.unlink(oldPath, () => {});
        candidate.documents.splice(existingIdx, 1);
      }

      candidate.documents.push({
        originalName:     sanitizeOriginalName(req.file.originalname),
        storedName:       path.basename(req.file.path),
        mimeType:         req.file.mimetype,
        sizeBytes:        req.file.size,
        documentCategory: category,
        uploadedBy:       req.user._id,
        uploadedAt:       new Date(),
      } as any);

      await candidate.save();

      const saved = candidate.documents[candidate.documents.length - 1] as any;
      res.status(201).json({
        document: {
          _id:              saved._id,
          originalName:     saved.originalName,
          mimeType:         saved.mimeType,
          sizeBytes:        saved.sizeBytes,
          documentCategory: saved.documentCategory,
          uploadedAt:       saved.uploadedAt,
        },
      });
    } catch (err: any) {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
      console.error("[Recruitment] admin upload doc error:", err.message);
      res.status(500).json({ error: "خطأ في رفع الملف" });
    }
  },
);

// GET /admin/requests/:id/candidates/:cid/documents/:did
recruitmentRouter.get(
  "/admin/requests/:id/candidates/:cid/documents/:did",
  requireAdmin,
  async (req: any, res) => {
    try {
      const sr = await ServiceRequestModel.findById(req.params.id).lean();
      if (!sr) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
      }

      const candidate = await RecruitmentCandidateModel.findOne({
        _id: req.params.cid,
        serviceRequestId: sr._id,
      }).lean() as any;
      if (!candidate) {
        res.status(404).json({ error: "المرشح غير موجود" });
        return;
      }

      const doc = (candidate.documents as any[]).find(
        (d: any) => String(d._id) === req.params.did,
      );
      if (!doc) {
        res.status(404).json({ error: "الوثيقة غير موجودة" });
        return;
      }

      const filePath = path.join(CANDIDATE_DOCS_DIR, doc.storedName);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "الملف غير متاح" });
        return;
      }

      res.setHeader("Content-Type", doc.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
      );
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(filePath);
    } catch {
      res.status(500).json({ error: "خطأ في تحميل الوثيقة" });
    }
  },
);
