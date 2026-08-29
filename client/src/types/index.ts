/* ── Auth ──────────────────────────────────── */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "manager" | "employee" | "client";
  status: "active" | "inactive" | "suspended";
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/* ── API ──────────────────────────────────── */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/* ── CRM ──────────────────────────────────── */
export type LeadStage =
  | "new" | "contacted" | "qualified" | "proposal"
  | "negotiation" | "won" | "lost";

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  stage: LeadStage;
  priority: "low" | "medium" | "high" | "urgent";
  budget?: number;
  currency: string;
  source: string;
  notes?: string;
  assignedTo?: User;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  /** Legacy alias retained while existing records are migrated. */
  company?: string;
  companyName?: string;
  tier: "standard" | "silver" | "gold" | "platinum";
  status: "active" | "inactive" | "vip" | "at_risk";
  totalRevenue: number;
  currency: string;
  country?: string;
  industry?: string;
  accountManager?: User;
  createdAt: string;
}

/* ── Projects ──────────────────────────────── */
export type ProjectStage =
  | "request" | "review" | "quotation" | "contract"
  | "payment" | "execution" | "closed";

export interface Project {
  _id: string;
  projectNumber: string;
  title: { ar: string; en?: string };
  description?: { ar?: string };
  stage: ProjectStage;
  status: "active" | "on_hold" | "cancelled" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  customer?: Customer;
  manager?: User;
  budget?: number;
  currency: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  progress: number;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project?: string;
  assignedTo?: User;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  createdAt: string;
}

/* ── Invoices ──────────────────────────────── */
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer?: Customer;
  customerId?: Customer | string;
  project?: Project;
  projectId?: Project | string;
  status: "draft" | "sent" | "viewed" | "partial" | "paid" | "overdue" | "cancelled";
  issueDate?: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  vatRate?: number;
  vatAmount?: number;
  total: number;
  currency: string;
  paidAt?: string;
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/* ── CMS ──────────────────────────────────── */
export interface BlogPost {
  _id: string;
  slug: string;
  title: { ar: string; en?: string };
  excerpt?: { ar?: string };
  content?: { ar?: string };
  coverImage?: string;
  category?: string;
  isPublished: boolean;
  publishedAt?: string;
  author?: User;
  tags?: string[];
  createdAt: string;
}

export interface Partner {
  _id: string;
  nameAr: string;
  nameEn: string;
  logo: string;
  descriptionAr: string;
  descriptionEn: string;
  partnershipAr: string;
  partnershipEn: string;
  servicesAr: string;
  servicesEn: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ── Notifications ─────────────────────────── */
export interface Notification {
  _id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

/* ── Analytics ─────────────────────────────── */
export interface DashboardStats {
  users: { total: number; new: number };
  leads: { total: number; new: number; wonRate: number };
  customers: { total: number; active: number };
  projects: { total: number; active: number; overdue: number };
  invoices: { total: number; revenue: number; pending: number; overdue: number };
  revenue: { month: number; total: number };
}
