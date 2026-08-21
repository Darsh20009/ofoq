import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OfoqLogo from "../components/OfoqLogo";
import { useLang } from "../i18n/LangContext";

/* ══ ثوابت ══════════════════════════════════════════════════════ */
const SOCIAL = [
  {
    label: "X",
    href: "https://x.com/ofoqhc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.634 5.9-5.634zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/ofoqhc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19v4.81h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/ofoqhc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@ofoqhc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
      </svg>
    ),
  },
];

const NAV_HREFS = ["/", "/about", "/services", "/packages", "/countries", "/blog", "/contact"];

/* ══ OFOQ Geometric Decoration — شعار OFOQ المصغّر كزخرفة ════════ */
function OfoqDecoration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 90" fill="none" className={className} aria-hidden="true">
      {/* الـ O الكبيرة — مستطيل عمودي بزوايا دائرية */}
      <rect x="3"  y="3"  width="33" height="52" rx="7" stroke="#33B27C" strokeWidth="2.5" strokeOpacity="0.75" />
      {/* الـ F — خطوط حمراء خفيفة */}
      <line x1="42" y1="6"  x2="42" y2="50" stroke="#C13229" strokeWidth="2.5" strokeOpacity="0.55" strokeLinecap="square" />
      <line x1="42" y1="6"  x2="66" y2="6"  stroke="#C13229" strokeWidth="2.5" strokeOpacity="0.55" strokeLinecap="square" />
      <line x1="42" y1="26" x2="60" y2="26" stroke="#C13229" strokeWidth="2.5" strokeOpacity="0.55" strokeLinecap="square" />
      {/* الـ o الصغيرة (أسفل) */}
      <rect x="41" y="60" width="15" height="22" rx="4" stroke="#E5FE04" strokeWidth="2" strokeOpacity="0.60" />
      {/* الـ Q الصغيرة مع كيرسور */}
      <rect x="59" y="60" width="15" height="22" rx="4" stroke="#E5FE04" strokeWidth="2" strokeOpacity="0.60" />
      <rect x="68" y="75" width="3.5" height="10" rx="1.5" fill="#C13229" fillOpacity="0.70" transform="rotate(-45 69.75 80)" />
    </svg>
  );
}

/* ══ المكوّن الرئيسي ═══════════════════════════════════════════ */
export default function PublicLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");
  const { pathname } = useLocation();
  const { lang, setLang, langs, ui } = useLang();
  const isRtl = lang === "ar" || lang === "ur";
  const isHomePage = pathname === "/";
  const navLinks = NAV_HREFS.map((href, i) => ({ href, label: (ui.header.nav ?? [])[i] ?? href }));

  /* إغلاق الـ drawer عند تغيير الصفحة */
  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  /* إرسال الاشتراك البريدي */
  async function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterState("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail, lang }),
      });
      const json = await res.json();
      if (res.status === 409 || json.alreadySubscribed) {
        setNewsletterState("already");
      } else if (!res.ok) {
        setNewsletterState("error");
      } else {
        setNewsletterState("success");
        setNewsletterEmail("");
      }
    } catch {
      setNewsletterState("error");
    }
    // Reset after 5 seconds
    setTimeout(() => setNewsletterState("idle"), 5000);
  }

  /* منع تمرير الصفحة عند فتح الـ drawer */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#2B273F]" dir={isRtl ? "rtl" : "ltr"}>

      {/* ══ الهيدر الثابت — أبيض فوق هيرو الصفحة الرئيسية ═════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 flex h-16 items-center justify-between px-6 transition-colors sm:h-[72px] sm:px-10 ${
          isHomePage ? "bg-white text-[#0B0A35] shadow-[0_1px_0_rgba(11,10,53,.08)]" : "text-white"
        }`}
      >
        {/* الشعار */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <OfoqLogo className="w-10 h-7 sm:w-12 sm:h-9" dark={isHomePage} />
          <div className="leading-none hidden sm:block">
            <p className={`font-black text-sm ${isHomePage ? "text-[#0B0A35]" : "text-white"}`}>أفق</p>
            <p className={`text-[9px] tracking-wide ${isHomePage ? "text-[#8B825B]" : "text-white/40"}`}>OFOQ BUSINESS SERVICES</p>
          </div>
        </Link>

        {/* أزرار اليمين */}
        <div className="flex items-center gap-4">
          {/* مبدّل اللغة */}
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className={`bg-transparent text-xs font-bold outline-none cursor-pointer transition-colors ${
              isHomePage ? "text-[#0B0A35]/75 hover:text-[#0B0A35]" : "text-white/60 hover:text-white"
            }`}
          >
            {langs.map((l) => (
              <option key={l.code} value={l.code} className={isHomePage ? "bg-white text-[#0B0A35]" : "bg-[#2B273F] text-white"}>
                {l.label}
              </option>
            ))}
          </select>

          {/* زر بوابة العميل */}
          <Link
            to="/client/login"
            className={`hidden sm:flex text-xs font-bold transition-colors ${
              isHomePage ? "text-[#0B0A35]/75 hover:text-[#0B0A35]" : "text-white/60 hover:text-white"
            }`}
          >
            {ui.header.clientLogin}
          </Link>

          {/* زر المزيد */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors ${
              isHomePage ? "text-[#0B0A35]/80 hover:text-[#0B0A35]" : "text-white/70 hover:text-white"
            }`}
          >
            {ui.header.menu}
            <span className="flex flex-col gap-[5px]">
              <span className="block w-5 h-[1.5px] bg-current" />
              <span className="block w-3 h-[1.5px] bg-current" />
            </span>
          </button>
        </div>
      </header>

      {/* ══ الـ Drawer الجانبي (تسامي-style) ══════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* خلفية شفافة */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* الـ Drawer نفسه */}
            <motion.div
              initial={{ x: isRtl ? -420 : 420 }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? -420 : 420 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed top-0 ${isRtl ? "left-0" : "right-0"} h-full w-80 sm:w-96 z-[80] bg-[#1a1726] flex flex-col overflow-y-auto`}
            >
              {/* رأس الـ Drawer */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/8">
                <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2.5">
                  <OfoqLogo className="w-10 h-7" />
                  <div className="leading-none">
                    <p className="font-black text-sm text-white">أفق لحلول الأعمال</p>
                    <p className="text-[9px] text-white/35 tracking-wide">OFOQ For Business Solutions</p>
                  </div>
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* الموقع — تسامي style */}
              <div className="px-8 py-8 border-b border-white/8 flex items-start gap-5">
                <OfoqDecoration className="w-14 h-16 flex-shrink-0 opacity-70 mt-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#33B27C] mb-1.5">
                    {isRtl ? "المقر الرئيسي" : "Head Office"}
                  </p>
                  <p className="text-white/70 text-sm font-semibold leading-snug">
                    {isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                  </p>
                  <p className="text-white/35 text-xs mt-2 leading-relaxed">
                    info@ofoqhc.com<br />+966 500 851 177
                  </p>
                </div>
              </div>

              {/* روابط التنقل */}
              <nav className="px-8 py-6 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30 mb-5">
                  {isRtl ? "الصفحات" : "Navigation"}
                </p>
                <ul className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.li
                      key={link.href}
                      initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 + 0.1 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setDrawerOpen(false)}
                        className={`flex items-center justify-between py-3 text-lg font-bold border-b border-white/5 transition-colors ${
                          pathname === link.href
                            ? "text-[#33B27C]"
                            : "text-white/70 hover:text-white"
                        }`}
                      >
                        <span>{link.label}</span>
                        <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 text-white/20 ${isRtl ? "rotate-180" : ""}`}>
                          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                <Link
                  to="/client/login"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-6 flex items-center gap-2 bg-[#33B27C] text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-[#2a9668] transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  {ui.header.clientLogin}
                </Link>
              </nav>

              {/* تابعنا */}
              <div className="px-8 py-6 border-t border-white/8">
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/30 mb-4">
                  {isRtl ? "تابعنا" : "Follow us"}
                </p>
                <div className="flex items-center gap-3">
                  {SOCIAL.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-[#33B27C] hover:text-[#33B27C] transition-all"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══ محتوى الصفحة ════════════════════════════════════════ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ══ الفوتر ══════════════════════════════════════════════ */}
      <footer className="bg-[#1a1726] text-white border-t border-white/8">

        {/* النشرة البريدية */}
        <div className="border-b border-white/8">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#33B27C] mb-3">
                  {isRtl ? "انضم لمجتمعنا" : "Join our community"}
                </p>
                <h3 className="text-2xl font-black text-white mb-2">
                  {isRtl
                    ? "اشترك لتعرف كيف نرفع حلول الأعمال"
                    : "Sign up to learn how we elevate business solutions"}
                </h3>
              </div>
              <div className="w-full lg:w-auto min-w-[320px]">
                {newsletterState === "success" ? (
                  <div className="flex items-center gap-3 bg-[#33B27C]/20 border border-[#33B27C]/40 rounded-full px-5 py-3.5 text-[#33B27C] font-bold text-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 flex-shrink-0">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {isRtl ? "تم الاشتراك! تحقق من بريدك." : "Subscribed! Check your inbox."}
                  </div>
                ) : newsletterState === "already" ? (
                  <div className="flex items-center gap-3 bg-amber-400/15 border border-amber-400/30 rounded-full px-5 py-3.5 text-amber-300 font-bold text-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                    </svg>
                    {isRtl ? "أنت مشترك بالفعل." : "You're already subscribed."}
                  </div>
                ) : (
                  <form
                    className="flex items-stretch"
                    onSubmit={handleNewsletterSubmit}
                    dir="ltr"
                  >
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder={isRtl ? "بريدك الإلكتروني" : "Your email address"}
                      className="flex-1 bg-white/6 border border-white/12 text-white placeholder-white/30 text-sm px-5 py-3.5 rounded-l-full outline-none focus:border-[#33B27C] transition-colors min-w-0"
                    />
                    <button
                      type="submit"
                      disabled={newsletterState === "loading"}
                      className="bg-[#E5FE04] text-[#2B273F] font-black text-sm px-6 py-3.5 rounded-r-full hover:bg-white transition-colors whitespace-nowrap disabled:opacity-60 flex-shrink-0"
                    >
                      {newsletterState === "loading"
                        ? "..."
                        : newsletterState === "error"
                          ? (isRtl ? "خطأ!" : "Error!")
                          : (isRtl ? "اشترك" : "JOIN")}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* محتوى الفوتر */}
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* عمود الشعار */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <OfoqLogo className="w-14 h-10" />
                <div>
                  <p className="font-black text-lg text-white">أفق لحلول الأعمال</p>
                  <p className="text-white/30 text-xs">OFOQ For Business Solutions</p>
                </div>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-6">
                {isRtl
                  ? "شريكك الموثوق في الموارد البشرية، الخدمات الحكومية، التأشيرات، وتأسيس الشركات في المملكة."
                  : "Your trusted partner for HR, government services, visas, and company formation in Saudi Arabia."}
              </p>
              <div className="flex items-center gap-2.5 mb-6">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-white/12 flex items-center justify-center text-white/35 hover:border-[#33B27C] hover:text-[#33B27C] transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <OfoqDecoration className="w-20 h-20 opacity-30" />
            </div>

            {/* أعمدة الروابط */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-[.2em] text-white/50 mb-5">
                  {isRtl ? "خدماتنا" : "Services"}
                </h4>
                <ul className="space-y-3">
                  {[
                    { ar: "تأسيس الشركات", en: "Company Formation", href: "/services" },
                    { ar: "الخدمات القانونية", en: "Legal Services", href: "/services" },
                    { ar: "الموارد البشرية", en: "Human Resources", href: "/services" },
                    { ar: "الخدمات الحكومية", en: "Gov. Services", href: "/services" },
                    { ar: "تأشيرات المستثمرين", en: "Investor Visas", href: "/services" },
                  ].map((l) => (
                    <li key={l.ar}>
                      <Link to={l.href} className="text-white/35 hover:text-white text-xs transition-colors">
                        {isRtl ? l.ar : l.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-[.2em] text-white/50 mb-5">
                  {isRtl ? "الباقات" : "Packages"}
                </h4>
                <ul className="space-y-3">
                  {[
                    { ar: "الفضية", en: "Silver", href: "/packages" },
                    { ar: "الذهبية", en: "Gold", href: "/packages" },
                    { ar: "البلاتينية", en: "Platinum", href: "/packages" },
                    { ar: "قارن الباقات", en: "Compare", href: "/packages" },
                  ].map((l) => (
                    <li key={l.ar}>
                      <Link to={l.href} className="text-white/35 hover:text-white text-xs transition-colors">
                        {isRtl ? l.ar : l.en}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-[.2em] text-white/50 mb-5">
                  {isRtl ? "تواصل" : "Contact"}
                </h4>
                <ul className="space-y-3 text-xs text-white/35">
                  <li><a href="mailto:info@ofoqhc.com" className="hover:text-white transition-colors">info@ofoqhc.com</a></li>
                  <li><a href="tel:+966500851177" className="hover:text-white transition-colors" dir="ltr">+966 500 851 177</a></li>
                  <li className="leading-relaxed">
                    {isRtl ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                  </li>
                  <li>
                    <Link to="/contact" className="text-[#E5FE04] hover:text-white transition-colors font-bold">
                      {isRtl ? "نموذج التواصل" : "Contact Form"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/8 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/20 text-xs">
            <p>© {new Date().getFullYear()} OFOQ For Business Solutions. {isRtl ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white transition-colors">{isRtl ? "سياسة الخصوصية" : "Privacy"}</a>
              <Link to="/terms" className="hover:text-white transition-colors">{isRtl ? "الشروط والأحكام" : "Terms"}</Link>
            </div>
          </div>
        </div>

        {/* Qirox */}
        <div className="border-t border-white/5 py-3 text-center">
          <span className="text-white/15 text-xs">
            {isRtl ? "تطوير " : "Built by "}
            <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">
              Qirox Studio Group
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
