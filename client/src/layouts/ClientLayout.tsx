import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, FolderOpen, MessageCircle, LogOut, Menu, X,
  Bell, ChevronDown, ArrowUpRight, Building2, Landmark, Scale, UsersRound, Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import OfoqLogo from "../components/OfoqLogo";
import { clientApi } from "../api/clientApi";
import { useLang } from "../i18n/LangContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

const NAV = [
  { href: "/client/dashboard", icon: LayoutDashboard },
  { href: "/client/requests",  icon: FolderOpen },
  { href: "/client/support",   icon: MessageCircle },
];

const SERVICE_NAV = [
  { href: "/services/hr", key: "hr_management", icon: UsersRound },
  { href: "/services/government", key: "government_services", icon: Landmark },
  { href: "/services/formation", key: "company_formation", icon: Building2 },
  { href: "/services/legal", key: "legal_services", icon: Scale },
];

export default function ClientLayout() {
  const { user, clearAuth } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { dir, ui } = useLang();
  const navLabels = [ui.client.dashboard, ui.client.requests, ui.client.support];

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
    <div className="min-h-screen bg-[#f8f5f0] flex text-[#071a32]" dir={dir}>

      {/* ── Sidebar (desktop) ──────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col w-[256px] bg-[#071a32] text-white fixed inset-y-0 border-white/10 z-30 shadow-[0_0_45px_rgba(7,26,50,.24)] ${dir === "rtl" ? "right-0 border-l" : "left-0 border-r"}`}>
        {/* Logo */}
        <div className="border-b border-white/10 px-6 py-5">
          <Link to="/client/dashboard" className="flex items-center gap-3">
            <OfoqLogo className="w-14 h-10" />
            <div>
              <p className="font-bold text-sm leading-none">{ui.client.portal}</p>
              <p className="text-white/40 text-[10px] mt-1">OFOQ Business Solutions</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="space-y-1 p-4">
          {NAV.map(({ href, icon: Icon }, index) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} to={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#c59650] text-[#071a32] shadow-lg shadow-black/20"
                    : "text-white/65 hover:bg-white/10 hover:text-white"
                }`}>
                <Icon size={18} />
                <span>{navLabels[index]}</span>
                {href === "/client/support" && unread > 0 && (
                    <span className="ms-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#E5FE04] text-xs font-bold text-[#2B273F]">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Service shortcuts */}
        <div className="flex-1 border-t border-white/10 px-4 py-5">
          <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-xs font-bold text-white/55">
              {ui.footer.services}
            </p>
              <ArrowUpRight size={14} className="text-[#c59650]" />
          </div>
          <div className="space-y-1">
            {SERVICE_NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon size={16} className="text-white/40 transition-colors group-hover:text-[#c59650]" />
                <span>{(ui.client.services as Record<string, string>)[key] || key}</span>
              </Link>
            ))}
          </div>
          <Link
            to="/client/requests/new"
            className="mt-5 flex items-center justify-between rounded-xl border border-[#c59650]/80 bg-transparent px-3 py-3 text-xs font-bold text-[#e0b875] transition-colors hover:bg-[#c59650] hover:text-[#071a32]"
          >
            <span>{ui.client.newRequest}</span>
            <Plus size={14} />
          </Link>
        </div>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#c59650] bg-white/5 font-bold text-[#e0b875]">
              {user?.name?.charAt(0) || "ع"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name || "العميل"}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white">
             <LogOut size={15} /> {ui.client.logout}
          </button>
        </div>
      </aside>

      {/* ── Mobile header ──────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-[#071a32] text-white shadow-lg">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/client/dashboard" className="flex items-center gap-2">
            <OfoqLogo className="w-10 h-7" />
            <span className="font-bold text-sm">{ui.client.portal}</span>
          </Link>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="bg-ofoq-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
            <LanguageSwitcher dark compact />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2"
              aria-label={ui.header.menu}
              aria-expanded={mobileOpen}
              aria-controls="client-mobile-navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
              id="client-mobile-navigation"
              className="overflow-hidden border-t border-white/10 bg-[#071a32]">
              <div className="p-3 space-y-1">
                {NAV.map(({ href, icon: Icon }, index) => (
                  <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        pathname === href || pathname.startsWith(href + "/") ? "bg-[#c59650] text-[#071a32]" : "text-white/65 hover:bg-white/10 hover:text-white"
                    }`}>
                    <Icon size={16} /> {navLabels[index]}
                  </Link>
                ))}
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10">
                  <LogOut size={16} /> {ui.client.logout}
                </button>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main content ───────────────────────────────────── */}
      <main className={`mt-14 min-h-screen flex-1 lg:mt-0 ${dir === "rtl" ? "lg:mr-[256px]" : "lg:ml-[256px]"}`}>
        {/* Top bar (desktop) */}
         <div className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-[#e7dfd4] bg-[#fffdfa]/95 px-8 backdrop-blur-xl lg:flex">
           <p className="text-xs font-bold text-[#7f786d]">{ui.client.dashboardSub}</p>
          <div className="flex items-center gap-3">
             <LanguageSwitcher compact />
             <Link
               to="/client/support"
               aria-label={ui.client.support}
               className="relative rounded-lg p-2 text-[#7f786d] transition-all hover:bg-[#f4efe8] hover:text-[#071a32]"
             >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-ofoq-red rounded-full" />
              )}
            </Link>
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                 <div className="w-8 h-8 rounded-lg bg-ofoq-green flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || "ع"}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              <AnimatePresence>
                 {profileOpen && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                     className={`absolute top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-[#e7dfd4] bg-white shadow-xl ${dir === "rtl" ? "right-0" : "left-0"}`}>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                       <LogOut size={14} /> {ui.client.logout}
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
