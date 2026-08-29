import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, CreditCard, User, LogOut, Menu, X, ClipboardList, HeadphonesIcon, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/client";
import OfoqLogo from "../components/OfoqLogo";
import toast from "react-hot-toast";
import { useLang } from "../i18n/LangContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function EmployeeLayout() {
  const { pathname } = useLocation();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { dir, ui } = useLang();
  const nav = [
    { href: "/", label: ui.employee.dashboard, icon: LayoutDashboard },
    { href: "/service-requests", label: ui.client.requests, icon: ClipboardList },
    { href: "/support", label: ui.client.support, icon: HeadphonesIcon },
    { href: "/contact", label: ui.contact.badge, icon: MessageSquare },
    { href: "/card", label: ui.employee.card, icon: CreditCard },
    { href: "/profile", label: ui.employee.profile, icon: User },
  ];

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate("/login", { replace: true });
    toast.success(ui.employee.logout);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F1] font-cairo text-navy-700" dir={dir}>

      {/* ── Top Bar ─────────────────────────────── */}
      <header className="bg-[#2B273F] border-b border-white/10 sticky top-0 z-40 shadow-xl shadow-navy-950/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <OfoqLogo className="w-8 h-6" />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">{ui.employee.portal}</p>
              <p className="text-white/50 text-[10px]">OFOQ Employee Portal</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 mr-4">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                       ? "bg-[#237A57] text-white shadow-lg shadow-emerald-950/20"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon size={15} />
                   {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          <LanguageSwitcher dark compact />

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || ui.employee.employeePhoto}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#33B27C]/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#33B27C]/20 flex items-center justify-center text-sm font-bold text-[#33B27C]">
                {user?.name?.charAt(0)}
              </div>
            )}
            <div className="text-right">
              <p className="text-white text-sm font-semibold leading-none">
                {user?.name}
              </p>
              <p className="text-white/50 text-xs mt-0.5">
                {user?.position || ui.employee.employee}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm"
          >
            <LogOut size={16} />
            {ui.employee.logout}
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden lg:hidden border-t border-white/10"
            >
              <div className="px-4 py-3 space-y-1">
                {/* User info on mobile */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#33B27C]/20 flex items-center justify-center text-sm font-bold text-[#33B27C]">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-white/50 text-xs">{user?.position || ui.employee.employee}</p>
                  </div>
                </div>
                <LanguageSwitcher dark />
             {nav.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-[#237A57] text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <item.icon size={16} />
                       {item.label}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-300 hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={16} />
                  {ui.employee.logout}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Content ─────────────────────────────── */}
         <main className="max-w-7xl mx-auto px-4 py-7 sm:py-9">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────── */}
       <footer className="text-center py-6 text-navy-400 text-xs border-t border-navy-100 mt-10 bg-[#FFFEFC]">
        © {new Date().getFullYear()} OFOQ Business Solutions — {ui.employee.portal}
      </footer>
    </div>
  );
}
