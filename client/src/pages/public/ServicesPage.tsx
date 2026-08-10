import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ServicesPage() {
  const { lang, ui } = useLang();
  const isRtl = lang === "ar" || lang === "ur";

  return (
    <div className="bg-[#2B273F] text-white min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <Helmet>
        <title>{ui.services.title}</title>
        <meta name="description" content={ui.services.heroSub} />
      </Helmet>

      {/* ══ هيدر الصفحة ════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden pt-24">
        <img
          src="/images/riyadh-business-district.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/40 to-[#2B273F]" />

        {/* زخرفة */}
        <div className="absolute top-24 right-10 opacity-[0.07] pointer-events-none">
          <svg viewBox="0 0 300 300" fill="none" className="w-72 h-72">
            <rect x="30" y="30" width="120" height="120" stroke="#33B27C" strokeWidth="1.5" />
            <rect x="80" y="80" width="120" height="120" stroke="#E5FE04" strokeWidth="1.5" />
            <rect x="130" y="130" width="120" height="120" stroke="#33B27C" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-16 w-full">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-white/30 text-xs mb-8">
            <Link to="/" className="hover:text-white transition-colors">{ui.category.home}</Link>
            <span>/</span>
            <span className="text-white/60">{ui.category.services}</span>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-5"
          >
            {ui.services.areaBadge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-5xl sm:text-7xl font-black leading-tight max-w-3xl"
          >
            {ui.services.choose}{" "}<span className="text-[#33B27C]">{ui.services.yourService}</span>
          </motion.h1>
        </div>
      </section>

      {/* ══ شبكة الخدمات ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicesCatalog.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ delay: i * 0.08, duration: 0.7, ease }}
            >
              <Link
                to={`/services/${cat.slug}`}
                className="group relative flex flex-col justify-between min-h-[380px] overflow-hidden rounded-2xl p-7 border border-white/8 hover:border-[#33B27C]/40 transition-all duration-500"
              >
                {/* صورة */}
                <img
                  src={cat.image}
                  alt={pick(cat.title, lang)}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale transition-all duration-700 group-hover:opacity-40 group-hover:grayscale-0 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1726]/70 to-[#1a1726]/95 group-hover:to-[#2B273F]/80 transition-all duration-500" />

                <div className="relative z-10">
                  <p className="text-[#E5FE04] text-xs font-black tracking-widest mb-5">0{i + 1}</p>
                  <h3 className="text-xl font-black text-white mb-3">{pick(cat.title, lang)}</h3>
                  <p className="text-white/35 text-sm leading-7 line-clamp-2">{pick(cat.intro, lang)}</p>

                  <ul className="mt-5 space-y-2">
                    {cat.services.slice(0, 3).map((s) => (
                      <li key={s.slug} className="flex items-center gap-2.5 text-xs text-white/30 group-hover:text-white/50 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#33B27C] flex-shrink-0" />
                        {pick(s.title, lang)}
                      </li>
                    ))}
                    {cat.services.length > 3 && (
                      <li className="text-[11px] text-white/20">+{cat.services.length - 3} {ui.services.more}</li>
                    )}
                  </ul>
                </div>

                <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-white/8">
                  <span className="text-xs font-bold text-white/30 group-hover:text-[#33B27C] transition-colors">
                    {ui.services.learnMore}
                  </span>
                  <span className="w-9 h-9 rounded-full border border-white/15 group-hover:border-[#33B27C] group-hover:bg-[#33B27C] flex items-center justify-center transition-all duration-300">
                    <svg viewBox="0 0 16 16" fill="none" className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════ */}
      <section className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">
              {ui.services.ctaBadge}
            </p>
            <h2 className="text-3xl sm:text-4xl font-black">
              {ui.services.ctaTitle}
            </h2>
          </div>
          <Link
            to="/contact"
            className="flex-shrink-0 inline-flex items-center gap-3 border border-white/20 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-[#33B27C] hover:bg-[#33B27C] transition-all duration-300"
          >
            {ui.home.contact}
            <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
