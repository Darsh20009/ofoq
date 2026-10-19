export type OwnerRole = "super_admin" | "admin" | "manager" | "employee";
export type StaffStatus = "active" | "inactive" | "suspended" | "pending";

export interface OwnerUser {
  _id: string;
  fullName: string;
  fullNameAr?: string;
  email: string;
  role: OwnerRole;
  status: StaffStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface MaintenanceSettings {
  enabled: boolean;
  messageAr: string;
  messageEn: string;
  updatedAt?: string | null;
}

export interface OwnerSession {
  authenticated: boolean;
  csrfToken: string;
}

let csrfToken = "";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method) && csrfToken) headers.set("X-Qirox-CSRF", csrfToken);
  const response = await fetch(`/api/qirox-owner${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "تعذر إكمال الطلب.");
  if (body.csrfToken) csrfToken = body.csrfToken;
  return body as T;
}

export const qiroxOwnerApi = {
  session: () => request<OwnerSession>("/session"),
  login: async (password: string) => request<OwnerSession>("/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  }),
  logout: () => request<{ authenticated: false }>("/logout", { method: "POST", body: "{}" }),
  overview: () => request<{
    roles: Record<OwnerRole, Record<StaffStatus, number>>;
    totalStaff: number;
    recentActivity: Array<{ action: string; entity?: string; description?: string; severity: string; createdAt: string }>;
    maintenance: MaintenanceSettings;
    uptimeSeconds: number;
    environment: string;
  }>("/overview"),
  users: (params: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") query.set(key, String(value));
    });
    return request<{ items: OwnerUser[]; total: number; page: number; pages: number }>(`/users?${query}`);
  },
  setUserStatus: (id: string, status: "active" | "suspended") =>
    request<{ user: OwnerUser }>(`/users/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  activity: (limit = 50) => request<{ items: Array<Record<string, any>> }>(`/activity?limit=${limit}`),
  setMaintenance: (settings: MaintenanceSettings) =>
    request<{ maintenance: MaintenanceSettings }>("/maintenance", {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),
  qiroxHealth: () => request<{
    reachable: boolean;
    status: string;
    service?: string | null;
    statusCode?: number;
    checkedAt: string;
    apiDocsAvailable: false;
  }>("/qirox-health"),
  publicStatus: () => request<MaintenanceSettings>("/public-status"),
};
