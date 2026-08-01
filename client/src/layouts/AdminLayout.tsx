import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Users, UserCheck, FolderKanban,
  FileText, Settings, Menu, X, Bell, LogOut,
  ChevronDown, TrendingUp, FileEdit, User,
  Building2, Target, ChevronRight, FileSignature, CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { authApi, usersApi } from "../api/client";
import type { Notification } from "../types";
import OfoqLogo from "../components/OfoqLogo";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: { href: string; label: string }[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "لوحة القيادة", icon: LayoutDashboard },
  {
    label: "إدارة العلاقات",
    icon: TrendingUp,
    children: [
      { href: "/admin/crm/leads", label: "الفرص التجارية" },
      { href: "/admin/crm/customers", label: "العملاء" },
    ],
  },
  { href: "/admin/projects", label: "المشاريع", icon: FolderKanban },
  { href: "/admin/invoices", label: "الفواتير", icon: FileText },
  { href: "/admin/contracts", label: "العقود", icon: FileSignature },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/cms", label: "المحتوى", icon: FileEdit },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin/employee/card", label: "بطاقتي", icon: CreditCard },
];

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

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    usersApi.notifications({ limit: 10 }).then((r) => {
      setNotifications(r.data.data?.notifications || []);
      setUnreadCount(r.data.data?.unread || 0);
    }).catch(() => {});
  }, []);

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
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-50" dir="rtl">
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
        className={`fixed top-0 right-0 h-full z-50 flex flex-col transition-all duration-300 bg-navy-gradient
          ${collapsed ? "w-16" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/10">
           <OfoqLogo className="w-16 h-12 text-white flex-shrink-0" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none whitespace-nowrap">أفق</p>
              <p className="text-white/50 text-xs whitespace-nowrap">لوحة التحكم</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="mr-auto text-white/50 hover:text-white lg:hidden"
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
            className="sidebar-link w-full justify-center hidden lg:flex"
          >
            <ChevronRight
              size={18}
              className={`transition-transform ${collapsed ? "" : "rotate-180"}`}
            />
          </button>
          {!collapsed && (
            <div className="flex items-center gap-3 mt-3 px-2">
               <div className="w-8 h-8 rounded-full bg-ofoq-red flex items-center justify-center flex-shrink-0">
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "lg:mr-16" : "lg:mr-64"}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30 shadow-sm">
          <button
            className="text-navy-600 hover:text-navy-900 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2" ref={notifRef}>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-navy-700 transition-colors"
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
                    className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b flex items-center justify-between">
                      <span className="font-semibold text-sm text-navy-700">الإشعارات</span>
                      {unreadCount > 0 && (
                        <span className="badge-navy text-xs">{unreadCount} جديد</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">لا توجد إشعارات</p>
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
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                 <div className="w-8 h-8 rounded-full bg-ofoq-red flex items-center justify-center">
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
                    className="absolute top-12 left-0 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <Link
                      to="/admin/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-navy-700 transition-colors"
                    >
                      <User size={16} className="text-gray-400" />
                      الملف الشخصي
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-navy-700 transition-colors border-t"
                    >
                      <Settings size={16} className="text-gray-400" />
                      الإعدادات
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors border-t w-full text-right"
                    >
                      <LogOut size={16} />
                      تسجيل الخروج
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
