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
    <div className="ofoq-shell min-h-screen bg-[#f5f1eb] font-cairo text-navy-700" dir={dir}>
      <AnimatePresence>
        {menuOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40 bg-[#071a30]/55 lg:hidden" />}
      </AnimatePresence>
      <aside className={`fixed inset-y-0 ${dir === "rtl" ? "right-0" : "left-0"} z-50 w-64 bg-[#071a30] shadow-[0_0_45px_rgba(7,26,48,.28)] transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"}`}>
        <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-5">
          <OfoqLogo className="h-12 w-16" />
          <div><p className="text-sm font-bold text-white">{ui.employee.portal}</p><p className="text-[10px] text-white/45">OFOQ Workspace</p></div>
          <button onClick={() => setMenuOpen(false)} className="ms-auto text-white/60 lg:hidden"><X size={18} /></button>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return <Link key={item.href} to={item.href} onClick={() => setMenuOpen(false)}
              className={`sidebar-link ${active ? "active" : ""}`}><item.icon size={18} /><span>{item.label}</span></Link>;
          })}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b88a4a] text-sm font-bold text-white">{user?.name?.charAt(0)}</div>
            <div className="min-w-0"><p className="truncate text-xs font-semibold text-white">{user?.name}</p><p className="truncate text-[11px] text-white/45">{user?.position || ui.employee.employee}</p></div>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-white/60 transition-colors hover:bg-red-500/15 hover:text-red-200"><LogOut size={15} />{ui.employee.logout}</button>
        </div>
      </aside>
      <div className={`min-h-screen ${dir === "rtl" ? "lg:mr-64" : "lg:ml-64"}`}>
        <header className="sticky top-0 z-30 flex h-[72px] items-center gap-4 border-b border-[#e8e1d7] bg-[#fffdfa]/92 px-4 backdrop-blur-xl sm:px-7">
          <button onClick={() => setMenuOpen(true)} className="text-navy-600 lg:hidden"><Menu size={22} /></button>
          <div className="flex-1"><p className="hidden text-xs font-semibold text-[#a0835d] sm:block">{ui.employee.portal}</p></div>
          <LanguageSwitcher compact />
          <div className="hidden items-center gap-2 sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b88a4a] text-sm font-bold text-white">{user?.name?.charAt(0)}</div><span className="text-sm font-semibold text-navy-700">{user?.name?.split(" ")[0]}</span></div>
        </header>
        <main className="relative min-h-[calc(100dvh-72px)] overflow-auto p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
