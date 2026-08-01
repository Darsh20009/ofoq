import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, MapPin, ChevronUp, FileText, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OfoqLogo from "../components/OfoqLogo";

function QiroxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="qx-metal2" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#555"/>
          <stop offset="35%"  stopColor="#d0d0d0"/>
          <stop offset="65%"  stopColor="#e8e8e8"/>
          <stop offset="100%" stopColor="#9a9a9a"/>
        </linearGradient>
        <clipPath id="qx-clip2">
          <polygon points="0,0 100,0 100,52 68,100 0,100"/>
        </clipPath>
      </defs>
      <circle cx="46" cy="46" r="30" stroke="url(#qx-metal2)" strokeWidth="14" fill="none" clipPath="url(#qx-clip2)"/>
      <line x1="63" y1="63" x2="87" y2="91" stroke="url(#qx-metal2)" strokeWidth="13" strokeLinecap="square"/>
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/",          label: "الرئيسية" },
  { href: "/services",  label: "خدماتنا" },
  { href: "/packages",  label: "الباقات" },
  { href: "/countries", label: "دول الاستقطاب" },
  { href: "/about",     label: "من نحن" },
  { href: "/contact",   label: "تواصل معنا" },
];

const FOOTER_LINKS = NAV_LINKS;

const SOCIAL = [
  { label: "X",  href: "#", char: "𝕏" },
  { label: "LI", href: "#", char: "in" },
  { label: "IG", href: "#", char: "◉" },
  { label: "WA", href: "#", char: "W" },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [showTop,    setShowTop]     = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark shadow-xl" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <OfoqLogo className="w-16 h-12" />
              <div className="hidden sm:block">
                <p className="text-white font-bold text-base leading-none">أفق</p>
                <p className="text-white/55 text-[10px]">لحلول الأعمال</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} to={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
              {/* البروفايل — opens PDF */}
              <a
                href="/profile.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/25 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/50 transition-all text-xs font-semibold"
                title="البروفايل"
              >
                <FileText size={13} />
                <span>البروفايل</span>
              </a>

              {/* دخول العميل */}
              <Link
                to="/client/login"
                className="hidden md:flex items-center gap-1.5 btn-red text-xs px-4 py-2"
              >
                <LogIn size={13} />
                دخول العميل
              </Link>

              {/* Mobile toggle */}
              <button
                className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10"
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
              className="lg:hidden overflow-hidden glass-dark border-t border-white/10"
            >
              <nav className="flex flex-col p-4 gap-1">
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} to={link.href}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      pathname === link.href
                        ? "bg-ofoq-red text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-2">
                  <a href="/profile.pdf" target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 btn-outline border-white/30 text-white text-sm py-2.5">
                    <FileText size={14} /> البروفايل
                  </a>
                  <Link to="/client/login"
                    className="flex-1 flex items-center justify-center gap-1.5 btn-red text-sm py-2.5">
                    <LogIn size={14} /> دخول العميل
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Page content ───────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-ofoq-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

            {/* Brand col */}
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <OfoqLogo className="w-20 h-14" />
                <div>
                  <p className="font-bold text-xl">أفق لحلول الأعمال</p>
                  <p className="text-white/45 text-xs">OFOQ Business Solutions</p>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed max-w-sm mb-6">
                شريكك الموثوق لأعمالك في السعودية — نقدم حلولاً شاملة لتسهيل أعمالك ونكون شريكًا استراتيجيًا في بناء مستقبل شركتك واستدامتها.
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-ofoq-red transition-colors text-xs font-bold text-white/70 hover:text-white"
                  >
                    {s.char}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="md:col-span-3">
              <h4 className="font-bold mb-5 text-white text-sm uppercase tracking-wider">روابط هامة</h4>
              <ul className="space-y-2.5">
                {FOOTER_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link to={l.href}
                      className="text-white/55 hover:text-ofoq-yellow text-sm transition-colors flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-ofoq-red flex-shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href="/profile.pdf" target="_blank" rel="noopener noreferrer"
                    className="text-white/55 hover:text-ofoq-yellow text-sm transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-ofoq-red flex-shrink-0" />
                    البروفايل
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-4">
              <h4 className="font-bold mb-5 text-white text-sm uppercase tracking-wider">اتصل بنا</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:info@ofoqhc.com"
                    className="flex items-start gap-3 text-white/55 hover:text-white text-sm transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-ofoq-red/20 flex items-center justify-center flex-shrink-0 group-hover:bg-ofoq-red transition-colors">
                      <Mail size={14} className="text-ofoq-red group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-white/30 text-xs mb-0.5">البريد الإلكتروني</p>
                      <span>info@ofoqhc.com</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="tel:+966500851177"
                    className="flex items-start gap-3 text-white/55 hover:text-white text-sm transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-ofoq-red/20 flex items-center justify-center flex-shrink-0 group-hover:bg-ofoq-red transition-colors">
                      <Phone size={14} className="text-ofoq-red group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-white/30 text-xs mb-0.5">رقم الجوال</p>
                      <span dir="ltr">+966 500 851 177</span>
                    </div>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/55 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-ofoq-red/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-ofoq-red" />
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-0.5">الموقع</p>
                    <span>السعودية — جدة — طريق الملك عبدالله</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/35 text-xs">
            <p>© {new Date().getFullYear()} أفق لحلول الأعمال. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Qirox attribution */}
      <div className="bg-[#070710] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2.5">
          <span className="text-white/25 text-xs">صُنع بواسطة</span>
          <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 group">
            <QiroxIcon />
            <span className="text-white/35 text-xs font-medium group-hover:text-white/65 transition-colors tracking-wide">
              Qirox Studio Group
            </span>
          </a>
        </div>
      </div>

      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 left-6 w-11 h-11 bg-ofoq-red text-white rounded-full flex items-center justify-center shadow-ofoq-red hover:scale-110 transition-transform z-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6"/></svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
