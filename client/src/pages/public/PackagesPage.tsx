import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const PACKAGES = [
  { nameEn: "Silver", darkCard: false, features: ["وزارة التجارة","منصة سلامة","التأمينات الاجتماعية","خدمات التأمين الطبي","خدمات الزكاة والضريبة"] },
  { nameEn: "Gold",   darkCard: true,  features: ["وزارة التجارة","منصة أبشر ومقيم","منصة سلامة","التأمينات الاجتماعية","خدمات التأمين الطبي","خدمات الزكاة والضريبة","خدمات الاستشارات"] },
  { nameEn: "Platinum",darkCard: false, features: ["وزارة التجارة","وزارة الإعلام","منصة أبشر ومقيم","منصة بلدي","منصة سلامة","التأمينات الاجتماعية","خدمات التأمين الطبي","خدمة تخفيف الأعباء","التدريب والتطوير","خدمات الاستشارات"] },
];

const FEATURE_INDEX: Record<string, number> = {
  "وزارة التجارة": 0, "Ministry of Commerce": 0,
  "منصة سلامة": 1, "Salama platform": 1,
  "التأمينات الاجتماعية": 2, "Social insurance": 2,
  "خدمات التأمين الطبي": 3, "Medical insurance services": 3,
  "خدمات الزكاة والضريبة": 4, "Zakat and tax services": 4,
  "منصة أبشر ومقيم": 5, "Absher and Muqeem platforms": 5,
  "خدمات الاستشارات": 6, "Consulting services": 6,
  "وزارة الإعلام": 7, "Ministry of Media": 7,
  "منصة بلدي": 8, "Balady platform": 8,
  "خدمة تخفيف الأعباء": 9, "Burden relief service": 9,
  "التدريب والتطوير": 10, "Training and development": 10,
};

export default function PackagesPage() {
  const { ui, dir, lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";

  const packages = PACKAGES.map((pkg, index) => ({
    ...pkg,
    name: ui.packages.names[index],
    tagline: ui.packages.taglines[index],
    badge: ui.packages.badges[index] || null,
    features: pkg.features.map((f) => ui.packages.features[FEATURE_INDEX[f] ?? 0]),
  }));

  return (
    <div dir={dir} className="bg-[#2B273F] text-white min-h-screen">
      <Helmet>
        <title>{ui.packages.title}</title>
        <meta name="description" content={ui.packages.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/packages" />
      </Helmet>

      {/* ══ Hero ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[50vh] flex flex-col justify-end overflow-hidden pt-20">
        <img
          src="/images/riyadh-towers-palms.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/40 to-[#2B273F]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-16 w-full">
          <div className="flex items-center gap-2 text-white/30 text-xs mb-8">
            <Link to="/" className="hover:text-white transition-colors">{isRtl ? "الرئيسية" : "Home"}</Link>
            <span>/</span>
            <span className="text-white/60">{ui.packages.badge}</span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-5"
          >
            {ui.packages.badge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black leading-tight max-w-3xl"
          >
            {ui.packages.heroTitle}{" "}
            <span className="text-[#E5FE04]">{ui.packages.heroHighlight}</span>
          </motion.h1>
        </div>
      </section>

      {/* ══ الباقات ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className={`relative rounded-2xl overflow-hidden ${
                i === 1
                  ? "border border-[#33B27C]/50 bg-[#33B27C]/10"
                  : "border border-white/8 bg-white/[0.04]"
              }`}
            >
              {/* شارة */}
              {pkg.badge && (
                <div className={`absolute top-4 ${isRtl ? "right-4" : "left-4"}`}>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    i === 1 ? "bg-[#33B27C] text-white" : "bg-[#E5FE04] text-[#2B273F]"
                  }`}>
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div className="p-8 pt-14">
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#33B27C] mb-2">{pkg.nameEn}</p>
                <h3 className="text-2xl font-black text-white mb-1">{pkg.name}</h3>
                <p className="text-white/40 text-sm mb-8">{pkg.tagline}</p>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-[#33B27C]/40 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/client/register"
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-sm transition-all ${
                    i === 1
                      ? "bg-[#33B27C] text-white hover:bg-[#2a9668]"
                      : "border border-white/20 text-white hover:border-[#33B27C] hover:bg-[#33B27C]"
                  }`}
                >
                  {ui.packages.subscribe}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* جدول المقارنة */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-14">
          <h2 className="text-2xl font-black mb-8 text-center">{ui.packages.compare}</h2>
          <div className="border border-white/8 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.04]">
                    <th className={`${isRtl ? "text-right" : "text-left"} px-6 py-4 font-bold text-sm text-white/60`}>{ui.packages.service}</th>
                    <th className="text-center px-4 py-4 font-bold text-sm text-white/60">{ui.packages.silver}</th>
                    <th className="text-center px-4 py-4 font-bold text-sm text-[#33B27C]">{ui.packages.gold}</th>
                    <th className="text-center px-4 py-4 font-bold text-sm text-white/60">{ui.packages.platinum}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { index: 0, s: true,  g: true,  p: true  },
                    { index: 1, s: true,  g: true,  p: true  },
                    { index: 2, s: true,  g: true,  p: true  },
                    { index: 3, s: true,  g: true,  p: true  },
                    { index: 4, s: true,  g: true,  p: true  },
                    { index: 5, s: false, g: true,  p: true  },
                    { index: 6, s: false, g: true,  p: true  },
                    { index: 7, s: false, g: false, p: true  },
                    { index: 8, s: false, g: false, p: true  },
                    { index: 9, s: false, g: false, p: true  },
                    { index: 10, s: false, g: false, p: true },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-sm text-white/60">{ui.packages.features[row.index]}</td>
                      {[row.s, row.g, row.p].map((val, j) => (
                        <td key={j} className="px-4 py-3.5 text-center">
                          {val ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#33B27C]/20">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="3">
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-block w-4 h-px bg-white/15 rounded" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════════ */}
      <section className="border-t border-white/8 bg-[#1a1726]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">{ui.packages.help}</p>
            <h2 className="text-3xl sm:text-4xl font-black">{ui.packages.helpTitle}</h2>
          </div>
          <Link
            to="/client/requests/new"
            className="flex-shrink-0 inline-flex items-center gap-3 bg-[#E5FE04] text-[#2B273F] font-black text-sm px-8 py-4 rounded-full hover:bg-white transition-all duration-300"
          >
            {ui.packages.contact}
            <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
