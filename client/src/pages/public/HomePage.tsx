import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useCallback, useEffect, useState } from "react";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";
import OfoqLogo from "../../components/OfoqLogo";

/* ══ Animation presets ══════════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

/* ══ Grid overlay — exactly like tasama ════════════════════════ */
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

/* ══ Splash screen — fast brand intro, completed in three seconds ══ */
function SplashIntro({ onDone }: { onDone: () => void }) {
  const [typedCount, setTypedCount] = useState(0);
  const [strikeVisible, setStrikeVisible] = useState(false);
  const [showDomain, setShowDomain] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { lang, dir } = useLang();

  const messages: Record<string, string> = {
    ar: "خدمات ترتقي بالشركات",
    en: "Services that elevate businesses",
    ur: "کاروبار کو ترقی دینے والی خدمات",
    hi: "व्यवसायों को आगे बढ़ाने वाली सेवाएँ",
    id: "Layanan yang mengangkat bisnis",
    de: "Services, die Unternehmen voranbringen",
    es: "Servicios que impulsan empresas",
  };
  const message = messages[lang] ?? messages.en;

  useEffect(() => {
    let index = 0;
    const typingInterval = window.setInterval(() => {
      index += 1;
      setTypedCount(index);
      if (index >= message.length) window.clearInterval(typingInterval);
    }, Math.max(22, Math.floor(1000 / message.length)));

    const strikeTimer = window.setTimeout(() => setStrikeVisible(true), 1250);
    const removeStrikeTimer = window.setTimeout(() => setStrikeVisible(false), 1640);
    const domainTimer = window.setTimeout(() => setShowDomain(true), 1740);
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), 2540);
    const doneTimer = window.setTimeout(onDone, 3000);

    return () => {
      window.clearInterval(typingInterval);
      window.clearTimeout(strikeTimer);
      window.clearTimeout(removeStrikeTimer);
      window.clearTimeout(domainTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [message, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      dir={dir}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#2B273F]"
    >
      <div className="relative z-10 flex w-[min(92vw,900px)] flex-col items-center text-center">
        <AnimatePresence mode="wait">
          {!showDomain ? (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
              className="relative inline-block max-w-full overflow-hidden px-1"
            >
              <p className="min-h-[1.2em] text-sm font-black leading-tight tracking-[-.02em] text-white sm:text-base lg:text-xl">
                {message.slice(0, typedCount)}
                <span className="ml-1 inline-block h-[.8em] w-[.05em] translate-y-[.08em] animate-pulse bg-[#E5FE04]" />
              </p>
              {strikeVisible && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.24, ease }}
                  className="absolute inset-x-1 top-[18%] h-[.68em] origin-right bg-[#C13229]"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ) : (
            <motion.span
            key="domain"
              initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 0.8, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease }}
            className="text-xs font-light uppercase tracking-[.35em] text-[#E5FE04] sm:text-sm"
            >
            <a href="https://www.ofoqhc.com" target="_blank" rel="noreferrer">
              www.ofoqhc.com
            </a>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ══ Clients grid — exactly like tasama ════════════════════════ */
const CLIENTS = [
  { name: "Aramco",         sector: "Energy" },
  { name: "SABIC",          sector: "Chemicals" },
  { name: "STC",            sector: "Telecom" },
  { name: "Mobily",         sector: "Telecom" },
  { name: "BinLadin Group", sector: "Construction" },
  { name: "Kingdom Holding",sector: "Holding" },
  { name: "Riyad Bank",     sector: "Finance" },
  { name: "Wataniya",       sector: "Insurance" },
  { name: "Al-Faisaliah",   sector: "Real Estate" },
  { name: "Dur Hospitality",sector: "Hospitality" },
  { name: "Manafea",        sector: "Services" },
  { name: "Namaa",          sector: "Investment" },
];

/* ══ Main component ═════════════════════════════════════════════ */
export default function HomePage() {
  const { lang, dir, ui } = useLang();
  const isRtl = dir === "rtl";
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
  }, []);

  const featuredServices = servicesCatalog.slice(0, 3);
  const aboutDetail = lang === "ar"
    ? "نقدّم حلول أعمال متكاملة تدعم الكفاءة التشغيلية، وتُسهّل رحلة المنشآت من التأسيس إلى النمو بثقة."
    : "We deliver integrated business solutions that strengthen operational efficiency and support companies from formation to confident growth.";
  const aboutQuote = lang === "ar"
    ? "خدمات أعمال تعزّز النمو وتدعم التنمية المستدامة بما يتماشى مع رؤية السعودية"
    : "Business services that advance sustainable growth in line with Saudi Vision.";

  useEffect(() => {
    const scrollToHash = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={ui.home.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/" />
      </Helmet>

      <AnimatePresence>
        {!splashDone && <SplashIntro onDone={handleSplashDone} />}
      </AnimatePresence>

      <div dir={dir}>

        {/* ════════════════════════════════════════════════════════
            HERO — OFOQ reference: deep blue field, warm wireframe,
            directional light, and a white header provided by the layout.
        ════════════════════════════════════════════════════════ */}
        <section className="relative isolate flex min-h-dvh overflow-hidden bg-[#2B273F] pt-16 sm:pt-[72px]">
          <div className="absolute inset-0 bg-[#2B273F]" />

          {/* The creative mark belongs to the hero itself; it is not fixed to the viewport. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 0.13, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className={`pointer-events-none absolute bottom-[-8%] z-[1] ${
              isRtl ? "left-[-13%] sm:left-[-4%]" : "right-[-13%] sm:right-[-4%]"
            }`}
          >
            <OfoqLogo className="relative h-[300px] w-[430px] sm:h-[390px] sm:w-[560px]" />
          </motion.div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-6 py-20 sm:px-10 sm:py-24">
            <motion.div
              initial="hidden"
              animate={splashDone ? "show" : "hidden"}
              variants={stagger}
              className={`w-full max-w-2xl ${isRtl ? "mr-auto text-right sm:mr-0 sm:pr-[7%]" : "ml-auto text-left sm:ml-0 sm:pl-[7%]"}`}
            >
              <motion.p variants={fadeUp} className="mb-6 text-[10px] font-bold uppercase tracking-[.28em] text-[#E5FE04]">
                {ui.home.badge}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-[clamp(3.1rem,7vw,6.8rem)] font-medium leading-[1.12] tracking-[-.045em]"
              >
                <span className="block text-white">{ui.home.hero1}</span>
                <span className="block font-black text-[#E5FE04]">
                  {ui.home.hero2}
                  {ui.home.hero3 ? ` ${ui.home.hero3}` : ""}
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-8 max-w-xl text-base leading-9 text-white/80 sm:text-lg">
                {ui.home.heroSub}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-3 text-sm font-extrabold text-[#2B273F] shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-0.5"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#33B27C] text-xl font-normal text-white transition-transform duration-300 group-hover:translate-x-0.5">
                    {isRtl ? "←" : "→"}
                  </span>
                  {ui.home.explore}
                </Link>
                <Link
                  to="/request"
                  className="text-sm font-bold text-white/75 underline decoration-white/35 underline-offset-8 transition-colors hover:text-white"
                >
                  {ui.home.request}
                </Link>
              </motion.div>
            </motion.div>

            <p className={`absolute bottom-8 ${isRtl ? "right-6 sm:right-10" : "left-6 sm:left-10"} text-[9px] tracking-[.38em] text-white/28 uppercase`}>
              OFOQHC.COM
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            ABOUT — editorial story, portrait, then city image
        ════════════════════════════════════════════════════════ */}
        <section id="about" className="bg-white text-[#2B273F]">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              variants={stagger}
              className={isRtl ? "text-right" : "text-left"}
            >
              <motion.div variants={fadeUp} className="mb-7">
                <OfoqLogo className="h-8 w-11" dark />
              </motion.div>
              <motion.p variants={fadeUp} className="mb-4 text-xs font-black tracking-[.16em] text-[#33B27C]">
                {ui.home.aboutBadge}
              </motion.p>
              <motion.h2 variants={fadeUp} className="max-w-3xl text-4xl font-black leading-[1.2] tracking-[-.03em] sm:text-6xl">
                {ui.home.aboutTitle1}{" "}
                <span className="text-[#33B27C]">{ui.home.aboutTitle2}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-8 max-w-3xl text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9">
                {ui.home.aboutDesc}
              </motion.p>
              <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9">
                {aboutDetail}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9">
                <Link to="/about" className="group inline-flex items-center gap-3 text-sm font-black text-[#2B273F]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#33B27C] transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {ui.home.aboutCta}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              id="about-story"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.8, ease }}
              className={`mt-20 flex items-center gap-4 ${isRtl ? "justify-end text-right" : "justify-start text-left"}`}
            >
              <div className="relative h-16 w-16 shrink-0 rounded-full border-[3px] border-[#33B27C] bg-white p-1 shadow-sm">
                <img src="/images/about-person.png" alt="" className="h-full w-full rounded-full object-cover object-top" />
                <span className="absolute -bottom-1 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E5FE04] text-lg font-black leading-none text-[#2B273F]">“</span>
              </div>
              <p className="max-w-xl text-lg font-bold leading-8 text-[#2B273F] sm:text-xl">
                {aboutQuote}
              </p>
            </motion.div>

            <motion.figure
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.9, ease }}
              className="mt-8 overflow-hidden rounded-sm"
            >
              <img
                src="/images/riyadh-business-district.jpg"
                alt="منطقة الأعمال في الرياض"
                className="h-[390px] w-full object-cover object-center sm:h-[560px]"
              />
            </motion.figure>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            VISION / MISSION — dark section (tasama two-column)
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#2B273F]" style={GRID_STYLE}>
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
            <div className="grid md:grid-cols-2 gap-px bg-white/8">
              {[
                {
                  label: ui.about.visionLabel,
                  text: ui.about.visionText,
                },
                {
                  label: ui.about.missionTitle,
                  text: ui.about.missionText,
                },
              ].map(({ label, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease }}
                  className="bg-[#2B273F] p-10 sm:p-14"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">{label}</p>
                  <p className="text-white/60 text-base sm:text-lg leading-8">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CLIENTS — WHITE, logo GRID exactly like tasama
        ════════════════════════════════════════════════════════ */}
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-0">
            <div className="flex flex-wrap items-end gap-6 mb-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">
                  {ui.home.clientsBadge}
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                  {ui.home.clientsTitle1} <span className="text-[#33B27C]">{ui.home.clientsTitle2}</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm max-w-sm pb-1">
                {ui.home.clientsDesc}
              </p>
            </div>
          </div>

          {/* Clients grid — bordered cells exactly like tasama */}
          <div className="mt-12 border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {CLIENTS.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.5 }}
                    className="border-b border-r border-gray-200 py-10 px-6 flex flex-col items-center justify-center gap-2 hover:bg-[#f8f7ff] transition-colors group cursor-default"
                  >
                    <span className="text-gray-800 font-black text-sm sm:text-base tracking-wide group-hover:text-[#2B273F] transition-colors">
                      {c.name}
                    </span>
                    <span className="text-gray-400 text-[10px] uppercase tracking-[.2em]">{c.sector}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SERVICES — dark, big image cards (tasama style)
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#2B273F] text-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">
                  {ui.services.areaBadge}
                </p>
                <h2 className="text-4xl sm:text-5xl font-black">
                  {ui.services.choose}{" "}
                  <span className="text-[#33B27C]">{ui.services.yourService}</span>
                </h2>
              </div>
              <Link
                to="/services"
                className="text-sm font-bold text-white/50 hover:text-white transition-colors border-b border-white/20 hover:border-white pb-0.5"
              >
                {ui.home.servicesAll}
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map((cat, i) => (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease }}
                >
                  <Link
                    to={`/services/${cat.slug}`}
                    className="group relative flex flex-col justify-between min-h-[420px] overflow-hidden rounded-2xl p-8 transition-all duration-500"
                  >
                    <img
                      src={cat.image}
                      alt={pick(cat.title, lang)}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale transition-all duration-700 group-hover:opacity-50 group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1a1726]/60 via-[#1a1726]/70 to-[#1a1726]/90 group-hover:to-[#33B27C]/30 transition-all duration-500" />
                    <div className="absolute inset-0 border border-white/8 rounded-2xl group-hover:border-[#33B27C]/40 transition-colors duration-500" />

                    <div className="relative z-10">
                      <p className="text-[#E5FE04] text-xs font-black tracking-widest mb-4">0{i + 1}</p>
                      <h3 className="text-2xl font-black text-white leading-tight mb-3">
                        {pick(cat.title, lang)}
                      </h3>
                      <p className="text-white/40 text-sm leading-7 line-clamp-3">
                        {pick(cat.intro, lang)}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between mt-8">
                      <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                        {ui.services.learnMore}
                      </span>
                      <span className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#33B27C] group-hover:bg-[#33B27C] flex items-center justify-center transition-all duration-300">
                        <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            WHY OFOQ — light gray / off-white section
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#f5f4fa] text-gray-900">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">
                {ui.home.whyBadge}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#2B273F]">
                {ui.home.whyTitle}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
              {(ui.home.reasons ?? []).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease }}
                  className="bg-[#f5f4fa] p-8"
                >
                  <div className="w-10 h-10 rounded-full bg-[#33B27C]/15 flex items-center justify-center mb-5">
                    <span className="text-[#33B27C] font-black text-sm">0{i + 1}</span>
                  </div>
                  <h3 className="font-black text-[#2B273F] mb-3">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-7">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CTA — GREEN accent section (tasama style)
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#33B27C] text-white relative overflow-hidden">
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-white/60 mb-6">
                {ui.home.ctaTitle1}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black leading-tight mb-8">
                {ui.home.ctaTitle2}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-lg mb-10">
                {ui.home.ctaDesc}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 bg-white text-[#33B27C] font-bold text-sm px-8 py-4 rounded-full hover:bg-[#E5FE04] hover:text-[#2B273F] transition-all duration-300"
                >
                  {ui.home.contact}
                  <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 border border-white/40 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-white hover:bg-white/10 transition-all duration-300"
                >
                  {ui.about.badge}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
