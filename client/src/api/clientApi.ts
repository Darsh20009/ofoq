import axios from "axios";

const BASE = "/api/client";

function authHeader() {
  const token = localStorage.getItem("ofoq_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function api() {
  return axios.create({ baseURL: BASE, headers: authHeader() });
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
  }) => api().post("/requests", data),

  getRequests: () => api().get("/requests"),

  getRequest: (id: string) => api().get(`/requests/${id}`),

  addNote: (id: string, text: string) => api().post(`/requests/${id}/notes`, { text }),

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
};
