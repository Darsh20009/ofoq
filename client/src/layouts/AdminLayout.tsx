import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, UserCheck, FolderKanban,
  FileText, Settings, Menu, X, Bell, LogOut,
  ChevronDown, TrendingUp, FileEdit, User,
  Building2, Target, ChevronRight, FileSignature, CreditCard, MessageSquare,
  ClipboardList, HeadphonesIcon, Layers3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { authApi, usersApi } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "../types";
import OfoqLogo from "../components/OfoqLogo";
import { useLang } from "../i18n/LangContext";
import NotificationPermissionModal from "../components/NotificationPermissionModal";
import LanguageSwitcher from "../components/LanguageSwitcher";
import AdminPageGuide from "../components/admin/AdminPageGuide";
import type { LangCode } from "../i18n/extraLangs";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
  children?: { href: string; label: string }[];
}

const adminLayoutLabels: Record<LangCode, {
  quotations: string;
  services: string;
  blogTestimonials: string;
  siteContentEditor: string;
  serviceRequests: string;
  support: string;
  operations: string;
}> = {
  ar: {
    quotations: "عروض الأسعار",
    services: "إدارة الخدمات",
    blogTestimonials: "المدونة والشهادات",
    siteContentEditor: "محرر المحتوى",
    serviceRequests: "طلبات الخدمات",
    support: "الدعم",
    operations: "منصة إدارة أفق",
  },
  en: {
    quotations: "Quotations",
    services: "Services",
    blogTestimonials: "Blog & Testimonials",
    siteContentEditor: "Site Content Editor",
    serviceRequests: "Service requests",
    support: "Support",
    operations: "OFOQ Operations",
  },
  ur: {
    quotations: "قیمت کی پیشکشیں",
    services: "سروسز کا انتظام",
    blogTestimonials: "بلاگ اور تعریفی اسناد",
    siteContentEditor: "ویب سائٹ مواد کا مدیر",
    serviceRequests: "سروس کی درخواستیں",
    support: "سپورٹ",
    operations: "اُفق آپریشنز پلیٹ فارم",
  },
  hi: {
    quotations: "मूल्य उद्धरण",
    services: "सेवा प्रबंधन",
    blogTestimonials: "ब्लॉग और प्रशंसापत्र",
    siteContentEditor: "साइट सामग्री संपादक",
    serviceRequests: "सेवा अनुरोध",
    support: "सहायता",
    operations: "OFOQ संचालन मंच",
  },
  id: {
    quotations: "Penawaran",
    services: "Manajemen layanan",
    blogTestimonials: "Blog & Testimoni",
    siteContentEditor: "Editor Konten Situs",
    serviceRequests: "Permintaan layanan",
    support: "Dukungan",
    operations: "Operasional OFOQ",
  },
  de: {
    quotations: "Angebote",
    services: "Leistungsverwaltung",
    blogTestimonials: "Blog & Erfahrungsberichte",
    siteContentEditor: "Website-Inhaltseditor",
    serviceRequests: "Serviceanfragen",
    support: "Support",
    operations: "OFOQ-Betrieb",
  },
  es: {
    quotations: "Cotizaciones",
    services: "Gestión de servicios",
    blogTestimonials: "Blog y testimonios",
    siteContentEditor: "Editor de contenido del sitio",
    serviceRequests: "Solicitudes de servicio",
    support: "Soporte",
    operations: "Operaciones de OFOQ",
  },
};

// navItems built dynamically in the component using useLang — see buildNavItems()

function NavLink({ item, collapsed, onNavigate }: {
  item: NavItem; collapsed: boolean; onNavigate: () => void;
}) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  if (item.children) {
    const isActive = item.children.some((c) => pathname === c.href);
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`sidebar-link w-full justify-between ${isActive ? "text-white bg-white/10" : ""}`}
        >
          <div className="flex items-center gap-3">
            <item.icon size={18} />
            {!collapsed && <span>{item.label}</span>}
            {item.badge ? (
              <span className="ms-auto min-w-5 h-5 px-1 rounded-full bg-[#E5FE04] text-[#101B4C] text-[10px] font-bold flex items-center justify-center">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </div>
          {!collapsed && (
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden"
            >
              {item.children.map((c) => (
                <Link
                  key={c.href}
                  to={c.href}
                  onClick={onNavigate}
                  className={`sidebar-link pr-11 text-xs ${pathname === c.href ? "active" : ""}`}
                >
                  <ChevronRight size={12} />
                  {c.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      to={item.href!}
      onClick={onNavigate}
      className={`sidebar-link ${
        pathname === item.href ? "active" : ""
      }`}
    >
      <item.icon size={18} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout({ basePath = "/admin" }: { basePath?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const { t, dir, ui, lang } = useLang();
  const isRtl = dir === "rtl";
  const labels = adminLayoutLabels[lang];
  const pagePath = (path: string) => `${basePath}${path ? `/${path}` : ""}` || "/";

  const { data: sidebarCountsData } = useQuery({
    queryKey: ["sidebar-counts", user?._id, user?.role],
    queryFn: () => usersApi.sidebarCounts().then((r) => r.data),
    enabled: !!user,
    refetchInterval: 30_000,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: false,
  });
  const sidebarCounts = sidebarCountsData || { notifications: 0, requests: 0, users: 0 };

  const navItems: NavItem[] = [
    { href: pagePath(""), label: t.admin.dashboard, icon: LayoutDashboard },
    {
      label: t.admin.crm,
      icon: TrendingUp,
      children: [
        { href: pagePath("crm/leads"),     label: t.admin.leads },
        { href: pagePath("crm/customers"), label: t.admin.customers },
      ],
    },
    { href: pagePath("projects"),      label: t.admin.projects,   icon: FolderKanban },
    { href: pagePath("quotations"),    label: labels.quotations, icon: FileText },
    { href: pagePath("invoices"),      label: t.admin.invoices,   icon: FileText },
    { href: pagePath("contracts"),     label: t.admin.contracts,  icon: FileSignature },
    { href: pagePath("services"),      label: labels.services, icon: Layers3 },
    { href: pagePath("users"),         label: t.admin.users,      icon: Users },
    {
      label: t.admin.cms,
      icon: FileEdit,
      children: [
         { href: pagePath("cms"),              label: labels.blogTestimonials },
         { href: pagePath("cms/site-content"), label: labels.siteContentEditor },
      ],
    },
    { href: pagePath("settings"),      label: t.admin.settings,   icon: Settings },
    { href: pagePath("service-requests"), label: labels.serviceRequests, icon: ClipboardList, badge: sidebarCounts.requests },
    { href: pagePath("support"),          label: labels.support, icon: HeadphonesIcon },
    { href: pagePath("contact"),          label: t.contact.consultTitle, icon: MessageSquare },
    { href: pagePath("employee/card"),    label: t.admin.myCard,   icon: CreditCard },
  ];

  // Load notifications — cached 60s, polling every 2 min (was a hot loop hitting wrong URL)
  const { data: notifData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => usersApi.notifications({ limit: 10 }).then((r) => r.data),
    staleTime:       60 * 1000,       // 1 min cache
    refetchInterval: 2 * 60 * 1000,  // poll every 2 min max
    refetchOnWindowFocus: false,      // don't hammer on tab switch
    retry: false,
  });
  const notifications: Notification[] = notifData?.notifications || [];
  const unreadCount: number           = notifData?.unreadCount    || 0;

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate(basePath ? "/admin/login" : "/login");
  };

  return (
    <div className="min-h-screen flex bg-[#F7F5F1] text-navy-700" dir={dir}>
      <NotificationPermissionModal />
      {/* ── Sidebar ─────────────────────── */}
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
          className={`fixed top-0 ${dir === "rtl" ? "right-0" : "left-0"} h-full z-50 flex flex-col transition-all duration-300 bg-[#2B273F] shadow-[0_0_45px_rgba(43,39,63,.22)]
          ${collapsed ? "w-16" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/10">
           <OfoqLogo className="w-16 h-12 text-white flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none whitespace-nowrap">{t.admin.brand}</p>
              <p className="text-white/50 text-xs whitespace-nowrap">{t.admin.brandSub}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`${dir === "rtl" ? "mr-auto" : "ml-auto"} text-white/50 hover:text-white lg:hidden`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              collapsed={collapsed}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-link w-full justify-center hidden lg:flex hover:bg-white/5"
          >
            <ChevronRight
              size={18}
              className={`transition-transform ${collapsed ? "" : "rotate-180"}`}
            />
          </button>
          {!collapsed && (
            <div className="flex items-center gap-3 mt-3 px-2">
               <div className="w-8 h-8 rounded-xl bg-ofoq-green flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-950/20">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0) || "م"}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-white/40 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main content ─────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${dir === "rtl" ? (collapsed ? "lg:mr-16" : "lg:mr-64") : (collapsed ? "lg:ml-16" : "lg:ml-64")}`}>
        {/* Top bar */}
        <header className="h-16 bg-[#FFFEFC]/90 backdrop-blur-xl border-b border-navy-100 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30">
          <button
            className="text-navy-600 hover:text-navy-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="hidden sm:block text-xs font-semibold text-gray-400">
               {labels.operations}
            </p>
          </div>

          <div className="flex items-center gap-2" ref={notifRef}>
            <LanguageSwitcher compact />
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl text-navy-400 hover:bg-navy-50 hover:text-ofoq-green transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-12 left-0 w-80 bg-[#FFFEFC] rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b flex items-center justify-between">
                      <span className="font-semibold text-sm text-navy-700">{t.admin.notifications}</span>
                      {unreadCount > 0 && (
                        <span className="badge-navy text-xs">{unreadCount} {t.admin.newBadge}</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">{t.admin.noNotif}</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? "bg-emerald-50/50" : ""}`}
                          >
                            <p className="text-sm font-medium text-navy-700">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-navy-50 transition-colors"
              >
                  <div className="w-8 h-8 rounded-xl bg-ofoq-green flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">
                    {user?.name?.charAt(0) || "م"}
                  </span>
                </div>
                <span className="text-sm font-medium text-navy-700 hidden sm:block">
                  {user?.name?.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-12 left-0 w-52 bg-[#FFFEFC] rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-50"
                  >
                    <Link
                      to={pagePath("profile")}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-navy-700 transition-colors"
                    >
                      <User size={16} className="text-gray-400" />
                      {t.admin.profile}
                    </Link>
                    <Link
                      to={pagePath("settings")}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-navy-700 transition-colors border-t"
                    >
                      <Settings size={16} className="text-gray-400" />
                      {t.admin.settings}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors border-t w-full text-right"
                    >
                      <LogOut size={16} />
                      {t.admin.logout}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative flex-1 overflow-auto p-4 sm:p-6 lg:p-8 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-44 before:bg-gradient-to-b before:from-navy-50/80 before:to-transparent">
          <div className="relative">
            <AdminPageGuide />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
