import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin, ChevronUp, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OfoqLogo from "../components/OfoqLogo";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "خدماتنا" },
  { href: "/about", label: "من نحن" },
  { href: "/blog", label: "المدونة" },
  { href: "/contact", label: "تواصل معنا" },
];

/** أيقونة Qirox — حرف Q دائري بتدرج فضي مع ذيل قطري، بدون خلفية */
function QiroxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="qirox-grad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
          <stop offset="55%" stopColor="#cccccc" stopOpacity="0.80"/>
          <stop offset="100%" stopColor="#888888" stopOpacity="0.60"/>
        </linearGradient>
      </defs>
      {/* حلقة الـ Q */}
      <circle cx="46" cy="46" r="30" stroke="url(#qirox-grad)" strokeWidth="11" fill="none"/>
      {/* الذيل القطري */}
      <line x1="68" y1="68" x2="88" y2="90" stroke="url(#qirox-grad)" strokeWidth="10" strokeLinecap="round"/>
    </svg>
  );
}

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">(() => {
    return (localStorage.getItem("ofoq_lang") as "ar" | "en") || "ar";
  });
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // تطبيق اتجاه اللغة على الصفحة
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("ofoq_lang", lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ──────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-dark shadow-xl" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <OfoqLogo className="w-16 h-12 text-white" />
              <div>
                <p className="text-white font-bold text-lg leading-none">أفق</p>
                <p className="text-white/60 text-xs">لحلول الأعمال</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-ofoq-red text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* زر تغيير اللغة */}
              <button
                onClick={toggleLang}
                title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/25 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/50 transition-all text-xs font-semibold"
              >
                <Globe size={13} />
                <span>{lang === "ar" ? "EN" : "ع"}</span>
              </button>

              <Link
                to="/contact"
                className="hidden md:flex btn-red text-xs px-4 py-2"
              >
                احصل على عرض سعر
              </Link>

              {/* Mobile toggle */}
              <button
                className="md:hidden text-white p-2 rounded-lg hover:bg-white/10"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden glass-dark border-t border-white/10"
            >
              <nav className="flex flex-col p-4 gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? "bg-ofoq-red text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/contact" className="btn-red mt-2 justify-center">
                  احصل على عرض سعر
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Content ──────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ──────────────────────── */}
      <footer className="bg-ofoq-navy text-white mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <OfoqLogo className="w-20 h-14 text-white" />
                <div>
                  <p className="font-bold text-xl">أفق لحلول الأعمال</p>
                  <p className="text-white/50 text-sm">OFOQ Business Solutions</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                نقدم حلولاً رقمية متكاملة تُمكّن الشركات من تحقيق أهدافها بكفاءة عالية، من الاستراتيجية إلى التنفيذ.
              </p>
              <div className="flex items-center gap-3 mt-6">
                {["twitter", "linkedin", "instagram"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-ofoq-red transition-colors text-xs font-bold"
                  >
                    {s[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">روابط سريعة</h4>
              <ul className="space-y-2">
                {navLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-white/60 hover:text-ofoq-yellow text-sm transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-white">تواصل معنا</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone size={14} className="text-ofoq-red flex-shrink-0" />
                  <span>+966 XX XXX XXXX</span>
                </li>
                <li className="flex items-center gap-2 text-white/60 text-sm">
                  <Mail size={14} className="text-ofoq-red flex-shrink-0" />
                  <span>info@ofoq.sa</span>
                </li>
                <li className="flex items-start gap-2 text-white/60 text-sm">
                  <MapPin size={14} className="text-ofoq-red flex-shrink-0 mt-0.5" />
                  <span>المملكة العربية السعودية</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/40 text-xs">
            <p>© {new Date().getFullYear()} أفق لحلول الأعمال. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Qirox Studio Attribution ──────────── */}
      <div className="bg-[#070710] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2.5">
          <span className="text-white/25 text-xs">صُنع بواسطة</span>
          <a
            href="https://qiroxstudio.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
            aria-label="Qirox Studio Group"
          >
            <QiroxIcon />
            <span className="text-white/40 text-xs font-medium group-hover:text-white/70 transition-colors tracking-wide">
              Qirox Studio Group
            </span>
          </a>
        </div>
      </div>

      {/* ── Back to Top ───────────────── */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 left-6 w-11 h-11 bg-ofoq-red text-white rounded-full flex items-center justify-center shadow-ofoq-red hover:scale-110 transition-transform z-40"
          >
            <ChevronUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
