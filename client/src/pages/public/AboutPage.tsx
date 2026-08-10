import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const VALUES_ICONS = [
  <svg key="0" viewBox="0 0 48 48" fill="none" className="w-7 h-7"><circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" opacity=".4"/><circle cx="24" cy="24" r="24" stroke="currentColor" strokeWidth="1" opacity=".2"/></svg>,
  <svg key="1" viewBox="0 0 48 48" fill="none" className="w-7 h-7"><path d="M8 24 L24 8 L40 24 L24 40 Z" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="24" r="4" fill="currentColor" opacity=".6"/></svg>,
  <svg key="2" viewBox="0 0 48 48" fill="none" className="w-7 h-7"><circle cx="16" cy="24" r="8" stroke="currentColor" strokeWidth="2"/><circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="13" r="8" stroke="currentColor" strokeWidth="2"/></svg>,
  <svg key="3" viewBox="0 0 48 48" fill="none" className="w-7 h-7"><rect x="8" y="8" width="13" height="13" stroke="currentColor" strokeWidth="2"/><rect x="27" y="8" width="13" height="13" stroke="currentColor" strokeWidth="2"/><rect x="8" y="27" width="13" height="13" stroke="currentColor" strokeWidth="2"/><rect x="27" y="27" width="13" height="13" stroke="currentColor" strokeWidth="2"/></svg>,
];

export default function AboutPage() {
  const { ui, lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";
  const values = ui.about.values;

  return (
    <div className="bg-[#2B273F] text-white min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <Helmet>
        <title>{ui.about.metaTitle}</title>
        <meta name="description" content={ui.about.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/about" />
      </Helmet>

      {/* ══ Hero ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[60vh] flex flex-col justify-end overflow-hidden pt-20">
        <img
          src="/images/riyadh-towers-palms.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/30 via-[#2B273F]/50 to-[#2B273F]" />

        {/* زخرفة */}
        <div className="absolute right-8 top-28 opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 400 400" fill="none" className="w-96 h-96">
            <rect x="40" y="40" width="160" height="160" stroke="#33B27C" strokeWidth="1.5" />
            <rect x="100" y="100" width="160" height="160" stroke="#E5FE04" strokeWidth="1.5" />
            <rect x="160" y="160" width="160" height="160" stroke="#33B27C" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-16 w-full">
          <div className="flex items-center gap-2 text-white/30 text-xs mb-8">
            <Link to="/" className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <span>/</span>
            <span className="text-white/60">{isRtl ? "من نحن" : "About"}</span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-5"
          >
            {ui.about.badge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-5xl sm:text-7xl font-black leading-tight max-w-3xl"
          >
            {ui.about.heroTitle1}
            <br />
            <span className="text-[#33B27C]">{ui.about.heroTitle2}</span>
          </motion.h1>
        </div>
      </section>

      {/* ══ قصتنا ══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6">
              {ui.about.storyTitle}
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-5 text-white/55 text-base leading-8">
              <p>{ui.about.storyP1}</p>
              <p>{ui.about.storyP2}</p>
              <p>{ui.about.storyP3}</p>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 border border-white/20 text-white font-bold text-sm px-7 py-3.5 rounded-full hover:border-[#33B27C] hover:bg-[#33B27C] transition-all duration-300"
              >
                {isRtl ? "تواصل معنا" : "Contact us"}
                <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>

          {/* صورة + رؤية + رسالة */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
              <img
                src="/images/riyadh-business-district.jpg"
                alt=""
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2B273F]/80 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">OFOQ · 2019</p>
                <p className="text-white font-black text-lg">
                  {isRtl ? "نقود النمو ونحقق التنمية المستدامة" : "Driving growth & sustainable development"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.04] border border-white/8 rounded-xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#33B27C] mb-3">
                  {ui.about.storyVision}
                </p>
                <p className="text-white/50 text-sm leading-6">{isRtl ? "اقتصاد مزدهر مرفوع بخدمات أعمال مبتكرة." : "A thriving economy elevated by innovative business services."}</p>
              </div>
              <div className="bg-white/[0.04] border border-white/8 rounded-xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#33B27C] mb-3">
                  {isRtl ? "رسالتنا" : "Mission"}
                </p>
                <p className="text-white/50 text-sm leading-6">{isRtl ? "تمكين الشركات من النمو بخدمات رقمية موثوقة." : "Empowering businesses to grow with reliable digital services."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ قيمنا ══════════════════════════════════════════════════ */}
      <section className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">
              {ui.about.valuesTitle}
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black mb-14 max-w-xl">
              {ui.about.valuesSub}
            </motion.h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ title, desc }, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="group bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:border-[#33B27C]/40 transition-all duration-300"
                >
                  <div className="text-[#33B27C] mb-5 transition-transform duration-300 group-hover:scale-110 origin-left">
                    {VALUES_ICONS[i % VALUES_ICONS.length]}
                  </div>
                  <h3 className="font-black text-base mb-3 text-white">{title}</h3>
                  <p className="text-white/40 text-sm leading-6">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════ */}
      <section className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">
              {isRtl ? "معاً نصنع الأثر" : "Let's create impact together"}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black">{ui.about.ctaTitle}</h2>
          </div>
          <Link
            to="/client/requests/new"
            className="flex-shrink-0 inline-flex items-center gap-3 bg-[#E5FE04] text-[#2B273F] font-black text-sm px-8 py-4 rounded-full hover:bg-white transition-all duration-300"
          >
            {isRtl ? "اطلب خدمة" : "Request a service"}
            <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
