import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, FolderOpen, MessageCircle, LogOut, Menu, X,
  Bell, User, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import OfoqLogo from "../components/OfoqLogo";
import { clientApi } from "../api/clientApi";

const NAV = [
  { href: "/client/dashboard", label: "الرئيسية",   icon: LayoutDashboard },
  { href: "/client/requests",  label: "طلباتي",      icon: FolderOpen },
  { href: "/client/support",   label: "الدعم",       icon: MessageCircle },
];

export default function ClientLayout() {
  const { user, clearAuth } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useQuery({
    queryKey: ["client-support-unread"],
    queryFn:  () => clientApi.supportUnread().then((r) => r.data.count),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
  const unread = unreadData ?? 0;

  function handleLogout() {
    clearAuth();
    navigate("/client/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">

      {/* ── Sidebar (desktop) ──────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-ofoq-navy text-white fixed inset-y-0 right-0 shadow-2xl z-30">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/client/dashboard" className="flex items-center gap-3">
            <OfoqLogo className="w-14 h-10" />
            <div>
              <p className="font-bold text-sm leading-none">أفق</p>
              <p className="text-white/40 text-xs">بوابة العملاء</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} to={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-ofoq-red text-white shadow-sm"
                    : "text-white/65 hover:text-white hover:bg-white/10"
                }`}>
                <Icon size={18} />
                <span>{label}</span>
                {href === "/client/support" && unread > 0 && (
                  <span className="mr-auto bg-ofoq-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-ofoq-red/20 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.name?.charAt(0) || "ع"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "العميل"}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
            <LogOut size={15} /> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Mobile header ──────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-ofoq-navy text-white shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/client/dashboard" className="flex items-center gap-2">
            <OfoqLogo className="w-10 h-7" />
            <span className="font-bold text-sm">بوابة العملاء</span>
          </Link>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="bg-ofoq-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-white/10 bg-ofoq-navy">
              <div className="p-3 space-y-1">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === href ? "bg-ofoq-red text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}>
                    <Icon size={16} /> {label}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10">
                  <LogOut size={16} /> تسجيل الخروج
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 lg:mr-64 mt-14 lg:mt-0 min-h-screen">
        {/* Top bar (desktop) */}
        <div className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-gray-100 sticky top-0 z-20">
          <div />
          <div className="flex items-center gap-3">
            <Link to="/client/support" className="relative p-2 rounded-lg text-gray-400 hover:text-ofoq-navy hover:bg-gray-50 transition-all">
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-ofoq-red rounded-full" />
              )}
            </Link>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-ofoq-navy flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "ع"}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut size={14} /> تسجيل الخروج
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
