import axios from "axios";

const BASE = "/api/client";

function authHeader() {
  const token = localStorage.getItem("ofoq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function api() {
  return axios.create({ baseURL: BASE, headers: authHeader() });
}

// ── Recruitment types (mirrors server model) ─────────────────────
export type RequestKind = "general" | "named_candidates" | "recruitment";

export type CandidatePublicStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview_scheduled"
  | "offer_extended"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface RecruitmentMeta {
  vacancyTitle?: string;
  vacancyCount?: number;
  requiredNationality?: string;
  requiredProfession?: string;
  contractType?: "full_time" | "part_time" | "contract" | "temporary";
  targetCountry?: string;
  additionalRequirements?: string;
  experienceYears?: number;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  salaryCurrency?: string;
}

export type DocumentCategory =
  | "passport"
  | "education_certificate"
  | "residence_permit"
  | "resignation_acknowledgement"
  | "experience_certificate";

export type EducationLevel =
  | "below_secondary"
  | "secondary"
  | "diploma"
  | "bachelor"
  | "master"
  | "doctorate"
  | "other";

export interface DocRequirement {
  category: DocumentCategory;
  labelAr: string;
  required: boolean;
  uploaded: boolean;
  documentId: string | null;
}

export interface DocumentRequirementsResult {
  required: DocumentCategory[];
  uploaded: DocumentCategory[];
  missing: DocumentCategory[];
  details: DocRequirement[];
  complete: boolean;
}

/** Fields accepted by POST /requests/:id/candidates (client) */
export interface CandidateInput {
  fullName: string;
  contactEmail?: string;
  contactPhone?: string;
  nationality?: string;
  currentProfession?: string;
  desiredProfession?: string;
  workStatus?: "employed" | "unemployed" | "freelance" | "student" | "other";
  country?: string;
  candidateNotes?: string;
  isGulfResident?: boolean;
  educationLevel?: EducationLevel;
}

/** Additional fields for admin PATCH /admin/requests/:id/candidates/:cid */
export interface AdminCandidatePatch extends Partial<CandidateInput> {
  publicStatus?: CandidatePublicStatus;
  internalStatus?: string;
  internalNotes?: string;
  /** When true the candidate row is visible to the client in their request detail view */
  clientVisible?: boolean;
}

export const clientApi = {
  // ── Service Requests ────────────────────────────────────────────
  createRequest: (data: {
    companyName: string;
    commercialReg?: string;
    businessActivity: string;
    contactEmail: string;
    contactPhone: string;
    serviceType: string;
    countryOfRecruitment?: string;
    packageType?: string;
    additionalNotes?: string;
    /** Recruitment extensions */
    requestKind?: RequestKind;
    recruitment?: RecruitmentMeta;
  }) => api().post("/requests", data),

  getRequests: () => api().get("/requests"),

  getRequest: (id: string) => api().get(`/requests/${id}`),

  addNote: (id: string, text: string) => api().post(`/requests/${id}/notes`, { text }),

  // ── Candidates (client) ──────────────────────────────────────────
  addCandidate: (requestId: string, data: CandidateInput) =>
    api().post(`/requests/${requestId}/candidates`, data),

  getCandidates: (requestId: string) =>
    api().get(`/requests/${requestId}/candidates`),

  getCandidateDocumentRequirements: (requestId: string, candidateId: string) =>
    api().get<{ requirements: DocumentRequirementsResult }>(
      `/requests/${requestId}/candidates/${candidateId}/documents/requirements`,
    ),

  uploadCandidateDocument: (requestId: string, candidateId: string, file: File, documentType: DocumentCategory) => {
    const form = new FormData();
    form.append("document", file);
    form.append("documentType", documentType);
    return api().post<{ document: any; requirements: DocumentRequirementsResult }>(
      `/requests/${requestId}/candidates/${candidateId}/documents`,
      form,
    );
  },

  deleteCandidate: (requestId: string, candidateId: string) =>
    api().delete<{ ok: true }>(`/requests/${requestId}/candidates/${candidateId}`),

  // ── Support ─────────────────────────────────────────────────────
  getSupport: () => api().get("/support"),

  sendSupport: (text: string, requestId?: string) =>
    api().post("/support", { text, requestId }),

  supportUnread: () => api().get("/support/unread"),

  // ── Admin ────────────────────────────────────────────────────────
  adminGetRequests: (params?: { status?: string; page?: number }) =>
    api().get("/admin/requests", { params }),

  adminGetRequest: (id: string) => api().get(`/admin/requests/${id}`),

  adminUpdateStatus: (id: string, status: string, note?: string) =>
    api().patch(`/admin/requests/${id}/status`, { status, note }),

  adminAddNote: (id: string, text: string, isInternal = false) =>
    api().post(`/admin/requests/${id}/notes`, { text, isInternal }),

  adminGetConversations: () => api().get("/admin/support"),

  adminGetConversation: (clientId: string) => api().get(`/admin/support/${clientId}`),

  adminReply: (clientId: string, text: string) =>
    api().post(`/admin/support/${clientId}`, { text }),

  adminStats: () => api().get("/admin/stats"),

  // ── Admin Candidates ─────────────────────────────────────────────
  adminGetCandidates: (requestId: string) =>
    api().get(`/admin/requests/${requestId}/candidates`),

  adminAddCandidate: (requestId: string, data: CandidateInput & { internalNotes?: string; publicStatus?: string; internalStatus?: string; clientVisible?: boolean }) =>
    api().post(`/admin/requests/${requestId}/candidates`, data),

  adminUpdateCandidate: (requestId: string, candidateId: string, patch: AdminCandidatePatch) =>
    api().patch(`/admin/requests/${requestId}/candidates/${candidateId}`, patch),
};
