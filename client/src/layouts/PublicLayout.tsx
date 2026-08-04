import { Outlet, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OfoqLogo from "../components/OfoqLogo";
import { useLang } from "../i18n/LangContext";

/* ── روابط الشبكة الاجتماعية ── */
const SOCIAL = [
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12c0-3.2 0-3.6.1-4.8C2.4 3.9 4 2.3 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12c0 3.3 0 3.7.1 4.9.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24c3.3 0 3.7 0 4.9-.1 4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9 0-3.3 0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
      </svg>
    ),
  },
  {
    label: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.634 5.9-5.634zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const NAV_LINKS = [
  { href: "/",          key: "home" as const },
  { href: "/about",     key: "about" as const },
  { href: "/services",  key: "services" as const },
  { href: "/packages",  key: "packages" as const },
  { href: "/countries", key: "countries" as const },
  { href: "/blog",      key: "blog" as const },
  { href: "/contact",   key: "contact" as const },
];

/* ── أيقونة هامبرغر مخصصة ── */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-5 flex flex-col justify-between cursor-pointer">
      <span
        className={`block h-0.5 bg-current transition-all duration-300 origin-center ${
          open ? "rotate-45 translate-y-[9px]" : ""
        }`}
      />
      <span
        className={`block h-0.5 bg-current transition-all duration-300 ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 bg-current transition-all duration-300 origin-center ${
          open ? "-rotate-45 -translate-y-[9px]" : ""
        }`}
      />
    </div>
  );
}

/* ── أكورديون في الفوتر ── */
function FooterAccordion({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-3 space-y-2 pr-2"
          >
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="text-white/50 hover:text-white text-sm transition-colors block py-0.5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   المكوّن الرئيسي
══════════════════════════════════════════════════════════════ */
export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { lang, setLang, langs, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // منع التمرير عند فتح القائمة
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ══ شريط التنقل — أبيض دائم مثل تسامي ═══════════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* الشعار — RTL: يظهر على اليمين */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <OfoqLogo dark className="w-12 h-9 sm:w-14 sm:h-10" />
              <div className="leading-none">
                <p className="font-black text-base sm:text-lg text-ofoq-navy">أفق</p>
                <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-wide">لحلول الأعمال Business Solutions</p>
              </div>
            </Link>

            {/* يسار: دخول العميل + الهامبرغر */}
            <div className="flex items-center gap-5">
              <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} aria-label="Language" className="bg-transparent text-xs font-bold text-ofoq-navy outline-none">
                {langs.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
              </select>
              <Link
                to="/client/login"
                className="text-sm font-semibold text-ofoq-navy hover:text-ofoq-green transition-colors"
              >
                دخول العميل
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-ofoq-navy"
                aria-label="القائمة"
              >
                <HamburgerIcon open={menuOpen} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* فاصل بارتفاع الهيدر الثابت */}
      <div className="h-16 sm:h-20" />

      {/* ══ القائمة الكاملة ══════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
          >
            {/* رأس القائمة */}
            <div className="flex items-center justify-between px-5 sm:px-8 h-16 sm:h-20 border-b border-gray-100 flex-shrink-0">
              <Link to="/" className="flex items-center gap-2.5">
                <OfoqLogo dark className="w-12 h-9" />
                <div className="leading-none">
                  <p className="font-black text-sm text-ofoq-navy">أفق</p>
                  <p className="text-[10px] text-gray-400">لحلول الأعمال</p>
                </div>
              </Link>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 text-ofoq-navy hover:text-ofoq-green transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* روابط القائمة */}
            <nav className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
              <ul className="space-y-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`block py-4 text-2xl font-bold border-b border-gray-50 transition-colors ${
                        pathname === link.href
                          ? "text-ofoq-green"
                          : "text-ofoq-navy hover:text-ofoq-green"
                      }`}
                    >
                      {t.nav[link.key]}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-gray-400">Language</label>
                <select value={lang} onChange={(e) => setLang(e.target.value as typeof lang)} className="mb-5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-ofoq-navy outline-none">
                  {langs.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                </select>
                <Link
                  to="/client/login"
                  className="inline-flex items-center gap-2 bg-ofoq-navy text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-ofoq-navy-light transition-colors"
                >
                  دخول العميل
                </Link>
              </div>
            </nav>

            {/* أسفل القائمة — بيانات التواصل */}
            <div className="flex-shrink-0 px-5 sm:px-8 py-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">المملكة العربية السعودية</p>
              <p className="text-sm text-gray-600 mb-4">جدة — طريق الملك عبدالله</p>
              <div className="flex items-center gap-3">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-ofoq-navy hover:text-white transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ محتوى الصفحة ════════════════════════════════════════════ */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ══ الفوتر ══════════════════════════════════════════════════ */}
      <footer className="bg-ofoq-navy text-white">

        {/* شريط النشرة البريدية */}
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black mb-1">
                  للتسجيل في{" "}
                  <span className="text-ofoq-yellow">نشرتنا</span>
                </h3>
                <p className="text-white/55 text-sm">لمعرفة المزيد حول خدمات الأعمال المتقدمة</p>
              </div>
              <form
                className="flex items-center gap-0 w-full sm:w-auto"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="bg-white/10 border border-white/20 text-white placeholder-white/35 text-sm px-5 py-3 rounded-r-full rounded-l-none outline-none focus:border-ofoq-yellow transition-colors min-w-[220px] flex-1"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-white text-ofoq-navy font-bold text-sm px-5 py-3 rounded-l-full rounded-r-none hover:bg-ofoq-yellow transition-colors whitespace-nowrap"
                >
                  <span className="w-6 h-6 rounded-full bg-ofoq-green flex items-center justify-center flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </span>
                  انضم
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* عمود الشعار */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <OfoqLogo className="w-16 h-12" />
                <div>
                  <p className="font-black text-lg">أفق لحلول الأعمال</p>
                  <p className="text-white/35 text-xs">OFOQ Business Solutions</p>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
                شريكك الموثوق لأعمالك في السعودية — نقدم حلولاً شاملة لتسهيل أعمالك ونكون شريكًا استراتيجيًا في بناء مستقبل شركتك واستدامتها.
              </p>
              <div className="flex items-center gap-2.5">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:bg-ofoq-green hover:text-white transition-all"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* أعمدة الأكورديون — موبايل */}
            <div className="lg:hidden lg:col-span-7 space-y-0">
              <FooterAccordion
                title="من نحن"
                links={[
                  { label: "قصتنا", href: "/about" },
                  { label: "رؤيتنا ومهمتنا", href: "/about" },
                  { label: "لماذا أفق؟", href: "/about" },
                ]}
              />
              <FooterAccordion
                title="الخدمات"
                links={[
                  { label: "تأسيس الشركات", href: "/services" },
                  { label: "الخدمات القانونية", href: "/services" },
                  { label: "إدارة الموارد البشرية", href: "/services" },
                  { label: "المنصات الحكومية", href: "/services" },
                ]}
              />
              <FooterAccordion
                title="الباقات"
                links={[
                  { label: "الباقة الفضية", href: "/packages" },
                  { label: "الباقة الذهبية", href: "/packages" },
                  { label: "الباقة البلاتينية", href: "/packages" },
                ]}
              />
              <FooterAccordion
                title="تواصل معنا"
                links={[
                  { label: "نموذج التواصل", href: "/contact" },
                  { label: "دخول العميل", href: "/client/login" },
                ]}
              />
            </div>

            {/* أعمدة — ديسكتوب */}
            <div className="hidden lg:grid lg:col-span-7 grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-sm mb-4 text-white/80">الخدمات</h4>
                <ul className="space-y-2">
                  {[
                    { label: "تأسيس الشركات", href: "/services" },
                    { label: "الخدمات القانونية", href: "/services" },
                    { label: "الموارد البشرية", href: "/services" },
                    { label: "المنصات الحكومية", href: "/services" },
                    { label: "خدمات المستثمرين", href: "/services" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-white/45 hover:text-white text-xs transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4 text-white/80">الباقات</h4>
                <ul className="space-y-2">
                  {[
                    { label: "الباقة الفضية", href: "/packages" },
                    { label: "الباقة الذهبية", href: "/packages" },
                    { label: "الباقة البلاتينية", href: "/packages" },
                    { label: "مقارنة الباقات", href: "/packages" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-white/45 hover:text-white text-xs transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm mb-4 text-white/80">التواصل</h4>
                <ul className="space-y-2 text-xs text-white/45">
                  <li><a href="mailto:info@ofoqhc.com" className="hover:text-white transition-colors">info@ofoqhc.com</a></li>
                  <li><a href="tel:+966500851177" className="hover:text-white transition-colors" dir="ltr">+966 500 851 177</a></li>
                  <li className="leading-relaxed">جدة — طريق الملك عبدالله</li>
                  <li><Link to="/contact" className="text-ofoq-yellow hover:text-white transition-colors">نموذج التواصل</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
            <p>© {new Date().getFullYear()} أفق لحلول الأعمال. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:text-white transition-colors">الشروط والأحكام</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Qirox attribution */}
      <div className="bg-ofoq-navy-dark border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <span className="text-white/20 text-xs">صُنع بواسطة</span>
          <a href="https://qiroxstudio.online" target="_blank" rel="noopener noreferrer"
            className="text-white/30 text-xs font-medium hover:text-white/60 transition-colors tracking-wide">
            Qirox Studio Group
          </a>
        </div>
      </div>
    </div>
  );
}
