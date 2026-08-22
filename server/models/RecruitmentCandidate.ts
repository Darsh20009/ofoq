import mongoose, { Schema, Document } from "mongoose";

// ── Candidate public-safe status (shown to client) ───────────────
export type CandidatePublicStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview_scheduled"
  | "offer_extended"
  | "hired"
  | "rejected"
  | "withdrawn";

export const CANDIDATE_PUBLIC_STATUS_AR: Record<CandidatePublicStatus, string> = {
  submitted:           "مُقدَّم",
  under_review:        "قيد المراجعة",
  shortlisted:         "في قائمة المختارين",
  interview_scheduled: "مقابلة مجدولة",
  offer_extended:      "تم تقديم عرض",
  hired:               "تم التعيين",
  rejected:            "مرفوض",
  withdrawn:           "انسحب",
};

export const CANDIDATE_PUBLIC_STATUSES = Object.keys(
  CANDIDATE_PUBLIC_STATUS_AR,
) as CandidatePublicStatus[];

// ── Candidate internal status (admin-only) ───────────────────────
export type CandidateInternalStatus =
  | "new"
  | "contacted"
  | "documents_requested"
  | "documents_received"
  | "verified"
  | "presented_to_client"
  | "client_approved"
  | "client_rejected"
  | "offer_negotiation"
  | "placement_complete"
  | "dropped";

export const CANDIDATE_INTERNAL_STATUS_AR: Record<CandidateInternalStatus, string> = {
  new:                  "جديد",
  contacted:            "تم التواصل",
  documents_requested:  "طُلبت الوثائق",
  documents_received:   "تم استلام الوثائق",
  verified:             "تم التحقق",
  presented_to_client:  "مُقدَّم للعميل",
  client_approved:      "وافق عليه العميل",
  client_rejected:      "رفضه العميل",
  offer_negotiation:    "تفاوض على العرض",
  placement_complete:   "تم التوظيف",
  dropped:              "تم الإسقاط",
};

export const CANDIDATE_INTERNAL_STATUSES = Object.keys(
  CANDIDATE_INTERNAL_STATUS_AR,
) as CandidateInternalStatus[];

// ── Document category (validated allowlist) ──────────────────────
export type DocumentCategory =
  | "passport"
  | "education_certificate"
  | "residence_permit"
  | "resignation_acknowledgement"
  | "experience_certificate";

export const DOCUMENT_CATEGORY_AR: Record<DocumentCategory, string> = {
  passport:                   "جواز السفر",
  education_certificate:      "الشهادة التعليمية",
  residence_permit:           "تصريح الإقامة",
  resignation_acknowledgement: "إقرار الاستقالة",
  experience_certificate:     "شهادة الخبرة",
};

export const DOCUMENT_CATEGORIES = Object.keys(
  DOCUMENT_CATEGORY_AR,
) as DocumentCategory[];

// ── Education level ──────────────────────────────────────────────
export type EducationLevel =
  | "below_secondary"
  | "secondary"
  | "diploma"
  | "bachelor"
  | "master"
  | "doctorate"
  | "other";

export const EDUCATION_LEVEL_AR: Record<EducationLevel, string> = {
  below_secondary: "دون الثانوية",
  secondary:       "ثانوية عامة",
  diploma:         "دبلوم",
  bachelor:        "بكالوريوس",
  master:          "ماجستير",
  doctorate:       "دكتوراه",
  other:           "أخرى",
};

export const EDUCATION_LEVELS = Object.keys(
  EDUCATION_LEVEL_AR,
) as EducationLevel[];

/**
 * Compute which document categories are required for a given candidate.
 * Rules (applied to client-submitted/named_candidates candidates only):
 *   - passport                    always required
 *   - education_certificate       always required
 *   - residence_permit            required when isGulfResident === true
 *   - resignation_acknowledgement required when workStatus === "employed"
 *   - experience_certificate      required when workStatus !== "employed"
 *                                 (i.e. unemployed / freelance / student / other / undefined)
 */
export function computeRequiredCategories(candidate: {
  isGulfResident?: boolean;
  workStatus?: string;
}): DocumentCategory[] {
  const required: DocumentCategory[] = ["passport", "education_certificate"];

  if (candidate.isGulfResident === true) {
    required.push("residence_permit");
  }

  if (candidate.workStatus === "employed") {
    required.push("resignation_acknowledgement");
  } else {
    // unemployed, freelance, student, other, or not set
    required.push("experience_certificate");
  }

  return required;
}

/**
 * Given a candidate, return which required categories still have no uploaded doc.
 * Uses documentCategory field on each stored document.
 */
export function computeMissingCategories(candidate: {
  isGulfResident?: boolean;
  workStatus?: string;
  documents: Array<{ documentCategory?: string }>;
}): DocumentCategory[] {
  const required = computeRequiredCategories(candidate);
  const uploaded = new Set(
    candidate.documents
      .map((d) => d.documentCategory)
      .filter((c): c is string => Boolean(c)),
  );
  return required.filter((cat) => !uploaded.has(cat));
}

// ── Document metadata stored in DB ───────────────────────────────
export interface ICandidateDocument {
  _id?: mongoose.Types.ObjectId;
  originalName: string;           // sanitized display name
  storedName: string;             // random on-disk filename — NEVER sent to clients
  mimeType: string;
  sizeBytes: number;
  documentCategory: DocumentCategory; // validated category
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface IRecruitmentCandidate extends Document {
  _id: mongoose.Types.ObjectId;
  // Link to parent request
  serviceRequestId: mongoose.Types.ObjectId;
  /**
   * For client-submitted candidates (named_candidates requests) this is the
   * client user's _id. For admin-sourced candidates this is the admin user's
   * _id who created the record. Distinguished by `isAdminSourced`.
   */
  submittedBy: mongoose.Types.ObjectId;
  /** true → created by admin for sourcing; false → submitted by the request-owner client */
  isAdminSourced: boolean;
  /**
   * Only relevant when isAdminSourced === true.
   * Admin must explicitly flip to true before the client can see the candidate.
   */
  clientVisible: boolean;
  // Personal details
  fullName: string;
  contactEmail?: string;
  contactPhone?: string;
  nationality?: string;
  currentProfession?: string;
  desiredProfession?: string;
  workStatus?: "employed" | "unemployed" | "freelance" | "student" | "other";
  country?: string;
  /** Whether the candidate currently resides in a Gulf (GCC) country */
  isGulfResident?: boolean;
  /** Highest education level attained */
  educationLevel?: EducationLevel;
  // Status
  publicStatus: CandidatePublicStatus;      // safe for clients
  internalStatus: CandidateInternalStatus;  // admin-only
  // Notes
  candidateNotes?: string;   // visible to client
  internalNotes?: string;    // admin-only — never sent to clients
  // Documents (private storage — never served statically)
  documents: ICandidateDocument[];
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

const CandidateDocumentSchema = new Schema<ICandidateDocument>(
  {
    originalName:     { type: String, required: true },
    storedName:       { type: String, required: true },
    mimeType:         { type: String, required: true },
    sizeBytes:        { type: Number, required: true },
    documentCategory: { type: String, enum: DOCUMENT_CATEGORIES, required: true },
    uploadedBy:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt:       { type: Date, default: Date.now },
  },
  { _id: true },
);

const RecruitmentCandidateSchema = new Schema<IRecruitmentCandidate>(
  {
    serviceRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceRequest",
      required: true,
      index: true,
    },
    submittedBy:       { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAdminSourced:    { type: Boolean, default: false },
    clientVisible:     { type: Boolean, default: false },
    fullName:          { type: String, required: true, trim: true },
    contactEmail:      { type: String, trim: true, lowercase: true },
    contactPhone:      { type: String, trim: true },
    nationality:       { type: String, trim: true },
    currentProfession: { type: String, trim: true },
    desiredProfession: { type: String, trim: true },
    workStatus:        {
      type: String,
      enum: ["employed", "unemployed", "freelance", "student", "other"],
    },
    country:           { type: String, trim: true },
    isGulfResident:    { type: Boolean },
    educationLevel:    { type: String, enum: EDUCATION_LEVELS },
    publicStatus:      {
      type: String,
      enum: CANDIDATE_PUBLIC_STATUSES,
      default: "submitted",
    },
    internalStatus:    {
      type: String,
      enum: CANDIDATE_INTERNAL_STATUSES,
      default: "new",
    },
    candidateNotes:    { type: String, trim: true },
    internalNotes:     { type: String, trim: true },
    documents:         [CandidateDocumentSchema],
  },
  { timestamps: true },
);

RecruitmentCandidateSchema.index({ serviceRequestId: 1, createdAt: -1 });
RecruitmentCandidateSchema.index({ serviceRequestId: 1, isAdminSourced: 1, clientVisible: 1 });

export const RecruitmentCandidateModel = mongoose.model<IRecruitmentCandidate>(
  "RecruitmentCandidate",
  RecruitmentCandidateSchema,
);
