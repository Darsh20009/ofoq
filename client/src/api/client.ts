import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ofoq_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ofoq_token");
      localStorage.removeItem("ofoq_user");
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    // All non-401 errors are handled silently; individual pages show feedback as needed
    return Promise.reject(err);
  }
);

export default api;

/* ── Auth ──────────────────────────────────── */
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: object) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, newPassword: password }),
  verify2FA: (data: object) => api.post("/auth/verify-2fa", data),
  sendEmailOtp: (tempToken: string) => api.post("/auth/send-email-otp", { tempToken }),
  oauthStatus: () => api.get("/auth/status"),
  totpSetup: () => api.post("/auth/totp/setup"),
  totpVerify: (code: string) => api.post("/auth/totp/verify-setup", { code }),
  totpDisable: (code: string) => api.post("/auth/totp/disable", { code }),
  barcodeLogin: (code: string) => api.post("/auth/barcode-login", { code }),
  revokeAllSessions: () => api.post("/auth/revoke-all-sessions"),
};

/* ── WebAuthn / Passkeys ──────────────────────── */
export const webauthnApi = {
  registerOptions: () => api.post("/auth/webauthn/register-options"),
  registerVerify: (response: object, deviceName?: string) =>
    api.post("/auth/webauthn/register-verify", { response, deviceName }),
  loginOptions: (email?: string) => api.post("/auth/webauthn/login-options", { email }),
  loginVerify: (response: object) => api.post("/auth/webauthn/login-verify", { response }),
  credentials: () => api.get("/auth/webauthn/credentials"),
  deleteCredential: (id: string) => api.delete(`/auth/webauthn/credentials/${id}`),
};

/* ── Users ─────────────────────────────────── */
export const usersApi = {
  sidebarCounts: () => api.get("/users/me/sidebar-counts"),
  list: (params?: object) => api.get("/users", { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: object) => api.post("/users", data),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/users/change-password", data),
  notifications: (params?: object) => api.get("/users/me/notifications", { params }),  // was: /notifications/list — wrong path
  markNotifRead: (id: string) => api.patch(`/users/me/notifications/${id}/read`),        // was: /users/notifications/:id/read
};

/* ── CRM ──────────────────────────────────── */
export const crmApi = {
  leads: {
    list: (params?: object) => api.get("/crm/leads", { params }),
    pipeline: () => api.get("/crm/leads/pipeline"),
    get: (id: string) => api.get(`/crm/leads/${id}`),
    create: (data: object) => api.post("/crm/leads", data),
    update: (id: string, data: object) => api.patch(`/crm/leads/${id}`, data),
    delete: (id: string) => api.delete(`/crm/leads/${id}`),
    convert: (id: string) => api.post(`/crm/leads/${id}/convert`),
  },
  customers: {
    list: (params?: object) => api.get("/crm/customers", { params }),
    get: (id: string) => api.get(`/crm/customers/${id}`),
    create: (data: object) => api.post("/crm/customers", data),
    update: (id: string, data: object) => api.patch(`/crm/customers/${id}`, data),
    delete: (id: string) => api.delete(`/crm/customers/${id}`),
  },
};

/* ── Projects ─────────────────────────────── */
export const projectsApi = {
  list: (params?: object) => api.get("/projects", { params }),
  stats: () => api.get("/projects/stats/overview"),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: object) => api.post("/projects", data),
  update: (id: string, data: object) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  tasks: (projectId: string, params?: object) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  createTask: (projectId: string, data: object) =>
    api.post(`/projects/${projectId}/tasks`, data),
  updateTask: (_projectId: string, taskId: string, data: object) =>
    api.patch(`/projects/tasks/${taskId}`, data),
};

/* ── Invoices ─────────────────────────────── */
export const invoicesApi = {
  list: (params?: object) => api.get("/invoices", { params }),
  get: (id: string) => api.get(`/invoices/${id}`),
  create: (data: object) => api.post("/invoices", data),
  update: (id: string, data: object) => api.patch(`/invoices/${id}`, data),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  send: (id: string) => api.post(`/invoices/${id}/send`),
  markPaid: (id: string, data?: object) => api.post(`/invoices/${id}/mark-paid`, data),
  acceptQuotation: (id: string) => api.post(`/invoices/${id}/accept-quotation`),
  convertToInvoice: (id: string) => api.post(`/invoices/${id}/convert-to-invoice`),
};

/* ── Analytics ─────────────────────────────── */
export const analyticsApi = {
  overview: () => api.get("/analytics/dashboard"),          // fixed: was /overview
  revenue: (params?: object) => api.get("/analytics/revenue", { params }),
  leadsFunnel: () => api.get("/analytics/leads-funnel"),
  projectsByStage: () => api.get("/analytics/projects-stages"), // fixed: was projects-by-stage
};

/* ── CMS ───────────────────────────────────── */
export const cmsApi = {
  pages: {
    list: () => api.get("/cms/admin/pages"),
    get: (key: string) => api.get(`/cms/admin/pages/${key}`),
    update: (key: string, data: object) => api.patch(`/cms/admin/pages/${key}`, data),
  },
  blog: {
    list: (params?: object) => api.get("/cms/blog", { params }),
    get: (id: string) => api.get(`/cms/blog/${id}`),
    create: (data: object) => api.post("/cms/blog", data),
    update: (id: string, data: object) => api.put(`/cms/blog/${id}`, data),
    delete: (id: string) => api.delete(`/cms/blog/${id}`),
  },
  testimonials: {
    list: () => api.get("/cms/testimonials"),
    create: (data: object) => api.post("/cms/testimonials", data),
    update: (id: string, data: object) => api.put(`/cms/testimonials/${id}`, data),
    delete: (id: string) => api.delete(`/cms/testimonials/${id}`),
  },
  settings: {
    list: (group?: string) => api.get("/cms/settings", { params: { group } }),
    update: (data: object) => api.put("/cms/settings", data),
  },
  upload: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/cms/media", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

/* ── Contracts ────────────────────────────── */
export const contractsApi = {
  list: (params?: object) => api.get("/contracts", { params }),
  get: (id: string) => api.get(`/contracts/${id}`),
  create: (data: object) => api.post("/contracts", data),
  update: (id: string, data: object) => api.patch(`/contracts/${id}`, data),
  delete: (id: string) => api.delete(`/contracts/${id}`),
  send: (id: string) => api.post(`/contracts/${id}/send`),
  sign: (id: string) => api.post(`/contracts/${id}/sign`),
  pdfUrl: (id: string) => `/api/contracts/${id}/pdf`,
};

/* ── Employee card & barcode ──────────────── */
export const employeeApi = {
  card: () => api.get("/employee/me/card"),
  regenerateCode: () => api.post("/employee/me/regenerate-code"),
  walletPass: () => api.get("/employee/me/wallet-pass", { responseType: "blob" }),
};

/* ── Contact ─────────────────────────────── */
export const contactApi = {
  submit: (data: object) => api.post("/contact", data),
  list: (params?: object) => api.get("/contact", { params }),
};

/* ── Services ─────────────────────────────── */
export const servicesApi = {
  list: (params?: object) => api.get("/services", { params }),
  get: (id: string) => api.get(`/services/${id}`),
  create: (data: object) => api.post("/services", data),
  update: (id: string, data: object) => api.patch(`/services/${id}`, data),
  delete: (id: string) => api.delete(`/services/${id}`),
};
