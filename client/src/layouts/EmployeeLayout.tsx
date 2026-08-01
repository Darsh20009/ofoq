import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { LayoutDashboard, CreditCard, User, LogOut, Menu, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/client";
import OfoqLogo from "../components/OfoqLogo";
import toast from "react-hot-toast";

const NAV = [
  { href: "/",        label: "لوحتي",    icon: LayoutDashboard },
  { href: "/card",    label: "بطاقتي",   icon: CreditCard },
  { href: "/profile", label: "ملفي",     icon: User },
];

export default function EmployeeLayout() {
  const { pathname } = useLocation();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate("/login", { replace: true });
    toast.success("تم تسجيل الخروج");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-cairo" dir="rtl">

      {/* ── Top Bar ─────────────────────────────── */}
      <header className="bg-[#1C2B6E] shadow-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <OfoqLogo size={32} />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-none">بوابة الموظفين</p>
              <p className="text-white/50 text-[10px]">OFOQ Employee Portal</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1 mr-6">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#33B27C] text-white"
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

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
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
                {user?.position || "موظف"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm"
          >
            <LogOut size={16} />
            خروج
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="sm:hidden p-2 text-white/70 hover:text-white"
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
              className="overflow-hidden sm:hidden border-t border-white/10"
            >
              <div className="px-4 py-3 space-y-1">
                {/* User info on mobile */}
                <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#33B27C]/20 flex items-center justify-center text-sm font-bold text-[#33B27C]">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user?.name}</p>
                    <p className="text-white/50 text-xs">{user?.position || "موظف"}</p>
                  </div>
                </div>
                {NAV.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-[#33B27C] text-white"
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
                  تسجيل الخروج
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Content ─────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────────────── */}
      <footer className="text-center py-6 text-gray-400 text-xs border-t border-gray-200 mt-10">
        © {new Date().getFullYear()} أفق لحلول الأعمال — بوابة الموظفين
      </footer>
    </div>
  );
}
