import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useRef, useEffect, useState } from "react";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

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

/* ══ Splash screen — tasama style ══════════════════════════════ */
function SplashIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const { ui } = useLang();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 200);
    const t2 = setTimeout(() => setPhase("out"), 2600);
    const t3 = setTimeout(onDone, 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const words = ui.home.splash ?? ["نرتّب", "التفاصيل،", "لتنتفرغ", "للنمو."];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-[#2B273F] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "in" ? 0 : 0.35 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-10 text-white text-xs tracking-[.4em] uppercase font-light"
      >
        ofoqhc.com
      </motion.p>

      <div className="flex flex-col items-center gap-1 sm:gap-2 relative z-10">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase !== "in" ? 1 : 0, y: phase !== "in" ? 0 : 30 }}
            transition={{ delay: i * 0.18, duration: 0.6, ease }}
            className={`block font-black leading-none text-center ${
              i === 1 || i === 2
                ? "text-4xl sm:text-6xl lg:text-7xl text-[#33B27C]"
                : "text-4xl sm:text-6xl lg:text-7xl text-white"
            }`}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

/* ══ Animated counter ═══════════════════════════════════════════ */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const val = useMotionValue(0);
  const spring = useSpring(val, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v) + suffix);
  useEffect(() => { if (inView) val.set(to); }, [inView, to, val]);
  return <motion.span ref={ref}>{display}</motion.span>;
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
  const [splashDone, setSplashDone] = useState(() =>
    sessionStorage.getItem("ofoq_splash_done") === "1"
  );

  const handleSplashDone = () => {
    sessionStorage.setItem("ofoq_splash_done", "1");
    setSplashDone(true);
  };

  const featuredServices = servicesCatalog.slice(0, 3);

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
            HERO — dark, full viewport, grid overlay, tasama exact
        ════════════════════════════════════════════════════════ */}
        <section className="relative min-h-dvh flex flex-col justify-end overflow-hidden bg-[#2B273F]">
          {/* Grid overlay like tasama */}
          <div className="absolute inset-0 pointer-events-none" style={GRID_STYLE} />

          <img
            src="/images/riyadh-business-district.jpg"
            alt=""
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/40 via-[#2B273F]/60 to-[#2B273F]" />

          {/* Geometric decoration — tasama style */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 600 600" className="absolute -right-20 -top-20 w-[600px] h-[600px] opacity-[0.08]" aria-hidden="true">
              <rect x="60" y="60" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
              <rect x="120" y="120" width="220" height="220" stroke="#E5FE04" strokeWidth="1.5" fill="none" />
              <rect x="180" y="180" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
              <line x1="60" y1="280" x2="280" y2="60" stroke="#E5FE04" strokeWidth="1" opacity="0.4" />
            </svg>
            <svg viewBox="0 0 300 300" className="absolute -left-10 bottom-20 w-[300px] h-[300px] opacity-[0.07]" aria-hidden="true">
              <rect x="30" y="30" width="120" height="120" stroke="#E5FE04" strokeWidth="1" fill="none" />
              <rect x="70" y="70" width="120" height="120" stroke="#33B27C" strokeWidth="1" fill="none" />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-20 sm:pb-28 pt-36 w-full">
            <motion.div
              initial="hidden"
              animate={splashDone ? "show" : "hidden"}
              variants={stagger}
              className="max-w-5xl"
            >
              {/* Hero headline — 3 lines exactly like tasama */}
              <motion.h1
                variants={fadeUp}
                className="text-[clamp(2.8rem,8vw,7.5rem)] font-black leading-[1.0] tracking-tight"
              >
                <span className="block text-white/50 font-light">{ui.home.hero1}</span>
                <span className="block text-white">{ui.home.hero2}</span>
                <span className="block text-[#33B27C]">
                  {ui.home.hero3}
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-8 text-white/50 text-lg max-w-md leading-8">
                {ui.home.heroSub}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/request"
                  className="group inline-flex items-center gap-3 bg-[#33B27C] text-white font-bold text-sm px-8 py-4 rounded-full hover:bg-[#2a9a6a] transition-all duration-300"
                >
                  {ui.home.request}
                  <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-3 border border-white/25 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-white/60 hover:bg-white/5 transition-all duration-300"
                >
                  {ui.home.explore}
                </Link>
              </motion.div>
            </motion.div>

            <p className={`absolute bottom-8 ${isRtl ? "left-8 sm:left-12" : "right-8 sm:right-12"} text-[10px] tracking-[.35em] text-white/25 uppercase`}>
              Riyadh · Jeddah · KSA
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            ABOUT — WHITE section (tasama inner white style)
        ════════════════════════════════════════════════════════ */}
        <section className="bg-white text-gray-900">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text */}
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                variants={stagger}
              >
                <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6">
                  {ui.home.aboutBadge}
                </motion.p>
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black leading-tight mb-6 text-gray-900">
                  {ui.home.aboutTitle1}{" "}
                  <span className="text-[#2B273F]">{ui.home.aboutTitle2}</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="text-gray-500 text-base leading-8 max-w-lg mb-8">
                  {ui.home.aboutDesc}
                </motion.p>
                <motion.div variants={fadeUp}>
                  <Link
                    to="/about"
                    className="group inline-flex items-center gap-3 font-black text-sm text-[#2B273F]"
                  >
                    <span className="w-10 h-10 rounded-full bg-[#33B27C] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    {ui.home.aboutCta}
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats grid — white section tasama style */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease }}
                className="grid grid-cols-2 gap-px bg-gray-200"
              >
                {[
                  { n: 200, suffix: "+", label: ui.home.stats[0] },
                  { n: 98,  suffix: "%", label: ui.home.stats[1] },
                  { n: 50,  suffix: "+", label: ui.home.stats[2] },
                  { n: 7,   suffix: "",  label: ui.home.stats[3] },
                ].map(({ n, suffix, label }, i) => (
                  <div key={i} className="bg-white p-8 sm:p-10">
                    <p className="text-4xl sm:text-5xl font-black text-[#2B273F]">
                      <Counter to={n} suffix={suffix} />
                    </p>
                    <p className="text-gray-400 text-sm mt-2">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
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
