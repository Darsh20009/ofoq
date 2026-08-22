import mongoose, { Schema, Document } from "mongoose";

export type ServiceRequestStatus =
  | "new"
  | "reviewing"
  | "approved"
  | "in_progress"
  | "completed"
  | "rejected";

export const SR_STATUS_AR: Record<ServiceRequestStatus, string> = {
  new:         "جديد",
  reviewing:   "قيد المراجعة",
  approved:    "موافق عليه",
  in_progress: "قيد التنفيذ",
  completed:   "مُنجز",
  rejected:    "مرفوض",
};

export const SR_STATUS_ORDER: ServiceRequestStatus[] = [
  "new", "reviewing", "approved", "in_progress", "completed",
];

// ── Request Kind ─────────────────────────────────────────────────
export type RequestKind =
  | "general"          // default — standard service request
  | "named_candidates" // client submits specific candidate names
  | "recruitment";     // OFOQ sources/recruits candidates (vacancy)

export const REQUEST_KIND_AR: Record<RequestKind, string> = {
  general:          "طلب عام",
  named_candidates: "مرشحون محددون",
  recruitment:      "توظيف",
};

export type ServiceType =
  | "company_formation"
  | "legal_services"
  | "trademark"
  | "government_services"
  | "hr_management"
  | "gov_platforms"
  | "investor_services"
  | "ipo_preparation"
  | "recruitment";     // ← new: dedicated recruitment service type

export const SERVICE_TYPE_AR: Record<ServiceType, string> = {
  company_formation:  "تأسيس الشركات",
  legal_services:     "الخدمات القانونية",
  trademark:          "تسجيل العلامات التجارية",
  government_services:"الخدمات الحكومية",
  hr_management:      "إدارة الموارد البشرية",
  gov_platforms:      "إدارة المنصات الحكومية",
  investor_services:  "خدمات المستثمرين",
  ipo_preparation:    "تأهيل الشركات للإدراج في سوق الأسهم",
  recruitment:        "استقطاب وتوظيف",
};

// ── Recruitment object embedded in ServiceRequest ────────────────
export interface IRecruitmentMeta {
  // Fields relevant for named_candidates / recruitment kinds
  vacancyTitle?: string;
  vacancyCount?: number;
  requiredNationality?: string;
  requiredProfession?: string;
  contractType?: "full_time" | "part_time" | "contract" | "temporary";
  targetCountry?: string;          // country to recruit from
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  salaryCurrency?: string;
  experienceYears?: number;
  additionalRequirements?: string;
}

export interface IServiceRequestNote {
  _id?: mongoose.Types.ObjectId;
  from: "client" | "admin";
  authorName: string;
  text: string;
  isInternal: boolean; // admin-only note (not shown to client)
  createdAt: Date;
}

export interface IServiceRequestHistory {
  status: ServiceRequestStatus;
  changedAt: Date;
  changedBy?: string;
  note?: string;
}

export interface IServiceRequest extends Document {
  _id: mongoose.Types.ObjectId;
  // Requester info
  clientId: mongoose.Types.ObjectId;
  clientEmail: string;
  // Company info
  companyName: string;
  commercialReg?: string;
  businessActivity: string;
  contactEmail: string;
  contactPhone: string;
  // Service details
  serviceType: ServiceType;
  countryOfRecruitment?: string; // for gov_services / hr_management (kept for compat)
  packageType?: "silver" | "gold" | "platinum";
  additionalNotes?: string;
  // ── Recruitment extensions ──────────────────────────────────────
  requestKind: RequestKind;          // default: "general"
  recruitment?: IRecruitmentMeta;    // present for named_candidates / recruitment kinds
  // Workflow
  status: ServiceRequestStatus;
  assignedTo?: mongoose.Types.ObjectId;
  statusHistory: IServiceRequestHistory[];
  notes: IServiceRequestNote[];
  // Admin internal
  internalNote?: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<IServiceRequestNote>({
  from:       { type: String, enum: ["client", "admin"], required: true },
  authorName: { type: String, required: true },
  text:       { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
}, { _id: true });

const HistorySchema = new Schema<IServiceRequestHistory>({
  status:    { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: String,
  note:      String,
}, { _id: false });

const RecruitmentMetaSchema = new Schema<IRecruitmentMeta>({
  vacancyTitle:           { type: String, trim: true },
  vacancyCount:           { type: Number, min: 1 },
  requiredNationality:    { type: String, trim: true },
  requiredProfession:     { type: String, trim: true },
  contractType:           { type: String, enum: ["full_time", "part_time", "contract", "temporary"] },
  targetCountry:          { type: String, trim: true },
  salaryRangeMin:         { type: Number, min: 0 },
  salaryRangeMax:         { type: Number, min: 0 },
  salaryCurrency:         { type: String, trim: true, default: "SAR" },
  experienceYears:        { type: Number, min: 0 },
  additionalRequirements: { type: String, trim: true },
}, { _id: false });

const ServiceRequestSchema = new Schema<IServiceRequest>({
  clientId:               { type: Schema.Types.ObjectId, ref: "User", required: true },
  clientEmail:            { type: String, required: true },
  companyName:            { type: String, required: true, trim: true },
  commercialReg:          { type: String, trim: true },
  businessActivity:       { type: String, required: true, trim: true },
  contactEmail:           { type: String, required: true },
  contactPhone:           { type: String, required: true },
  serviceType:            { type: String, required: true },
  countryOfRecruitment:   { type: String, trim: true },
  packageType:            { type: String, enum: ["silver", "gold", "platinum"] },
  additionalNotes:        { type: String, trim: true },
  // ── Recruitment extensions (backward-compatible defaults) ───────
  requestKind:            {
    type: String,
    enum: Object.keys(REQUEST_KIND_AR),
    default: "general",
  },
  recruitment:            { type: RecruitmentMetaSchema },
  // Workflow
  status:                 { type: String, enum: Object.keys(SR_STATUS_AR), default: "new" },
  assignedTo:             { type: Schema.Types.ObjectId, ref: "User" },
  statusHistory:          [HistorySchema],
  notes:                  [NoteSchema],
  internalNote:           String,
}, { timestamps: true });

ServiceRequestSchema.index({ clientId: 1 });
ServiceRequestSchema.index({ status: 1 });
ServiceRequestSchema.index({ requestKind: 1 });
ServiceRequestSchema.index({ createdAt: -1 });

export const ServiceRequestModel = mongoose.model<IServiceRequest>("ServiceRequest", ServiceRequestSchema);
