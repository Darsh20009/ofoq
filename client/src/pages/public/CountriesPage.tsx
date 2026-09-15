import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";
import { useQuery } from "@tanstack/react-query";
import { cmsApi } from "../../api/client";
import type { Country } from "../../types";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

const COUNTRY_CODES = ["PK", "IN", "JO", "LK", "EG", "PH", "BD", "UG", "NP", "SD"];
const MAP_POSITIONS = [
  [682, 267], [709, 293], [589, 250], [718, 349], [550, 273],
  [816, 323], [735, 281], [572, 349], [724, 253], [558, 322],
];
const FLAGS = ["🇵🇰", "🇮🇳", "🇯🇴", "🇱🇰", "🇪🇬", "🇵🇭", "🇧🇩", "🇺🇬", "🇳🇵", "🇸🇩"];

export default function CountriesPage() {
  const { ui, dir, lang } = useLang();
  const { data } = useQuery({
    queryKey: ["public-countries"],
    queryFn: () => cmsApi.countries.list().then((response) => response.data),
    staleTime: 5 * 60 * 1000,
  });
  const fallbackCountries: Country[] = ui.countries.items.map((country, i) => ({
    _id: `fallback-country-${COUNTRY_CODES[i]}`,
    code: COUNTRY_CODES[i],
    nameAr: country.name,
    nameEn: country.name,
    descriptionAr: country.desc,
    descriptionEn: country.desc,
    flag: FLAGS[i],
    mapX: MAP_POSITIONS[i][0],
    mapY: MAP_POSITIONS[i][1],
    order: i + 1,
    isPublished: true,
    createdAt: "",
    updatedAt: "",
  }));
  const countries: Country[] = Array.isArray(data?.countries) && data.countries.length > 0 ? data.countries : fallbackCountries;
  const isArabic = lang === "ar" || lang === "ur";
  const countryName = (country: Country) => isArabic ? country.nameAr || country.nameEn : country.nameEn || country.nameAr;
  const countryDescription = (country: Country) => isArabic ? country.descriptionAr || country.descriptionEn : country.descriptionEn || country.descriptionAr;
  return (
    <div dir={dir} className="min-h-screen bg-[#F7F3EE] text-[#2B273F]">
      <Helmet>
        <title>{ui.countries.metaTitle}</title>
        <meta name="description" content={ui.countries.metaDescription} />
        <link rel="canonical" href="https://ofoqhc.com/countries" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[52vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.92) 0%, rgba(43,39,63,0.50) 55%, transparent 100%), url('/images/hero-aramco-hq.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 relative z-10 w-full">
          <div className="flex items-center gap-2 text-white/45 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">{ui.category.home}</Link>
            <span>/</span>
            <span className="text-white/70">{ui.countries.badge}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-white"
          >
            {ui.countries.heroTitle}{" "}
            <br />
            <span className="text-ofoq-yellow">{ui.countries.heroHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/55 text-base mt-3 max-w-lg"
          >
            {ui.countries.heroSub}
          </motion.p>
        </div>
      </section>

       {/* ══ خريطة الدول ═══════════════════════════════════════ */}
        <section className="border-t border-[#2B273F]/10 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">{ui.countries.sectionEyebrow}</p>
            <h2 className="text-4xl font-black text-[#2B273F]">
              {ui.countries.sectionTitle}{" "}
              <span className="text-[#33B27C]">{ui.countries.sectionHighlight}</span>
            </h2>
          </div>
           <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_.65fr]">
             <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071936] p-3 shadow-[0_18px_50px_rgba(7,25,54,.18)] sm:p-6">
               <WorldMapGraphic countries={countries} countryName={countryName} />
             </div>
             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
               {countries.map((country, i) => (
                 <motion.div
                   key={country._id}
                   variants={fadeUp}
                   custom={i}
                   initial="hidden"
                   whileInView="visible"
                   viewport={{ once: true }}
                   className="group rounded-2xl border border-[#2B273F]/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#33B27C]/50"
                 >
                   <div className="flex items-start gap-3">
                     <span className="text-2xl transition-transform group-hover:scale-110">{country.flag}</span>
                     <div className="min-w-0">
                       <h3 className="font-black text-[#2B273F]">{countryName(country)}</h3>
                       <p className="mt-1 text-xs leading-5 text-[#2B273F]/55">{countryDescription(country)}</p>
                     </div>
                   </div>
                   <Link to="/client/register" className="mt-3 flex items-center gap-2 text-xs font-bold text-[#33B27C] transition-colors hover:text-[#2B273F]">
                     {ui.countries.request}
                     <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                       <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                     </svg>
                   </Link>
                 </motion.div>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* ══ قسم العملية ══════════════════════════════════════ */}
      <section className="py-20 border-t border-white/8 bg-[#2B273F] text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">{ui.countries.processEyebrow}</p>
            <h2 className="text-4xl font-black">
              {ui.countries.processTitle}{" "}
              <span className="text-[#E5FE04]">{ui.countries.processHighlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ui.countries.steps.map((step, i) => (
              <div key={i} className="bg-white/[0.04] border border-white/8 rounded-2xl p-7 text-center">
                <span className="w-12 h-12 rounded-full border border-[#33B27C]/40 flex items-center justify-center text-[#33B27C] font-black text-lg mx-auto mb-5">
                  {i + 1}
                </span>
                <h4 className="font-black text-white text-sm mb-3">{step.title}</h4>
                <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section className="border-t border-[#2B273F]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">{ui.countries.ctaEyebrow}</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2B273F]">
              {ui.countries.ctaTitle}{" "}
              <span className="text-[#33B27C]">{ui.countries.ctaHighlight}</span>
            </h2>
          </div>
          <Link
            to="/client/register"
            className="flex-shrink-0 inline-flex items-center gap-3 bg-[#E5FE04] text-[#2B273F] font-black text-sm px-8 py-4 rounded-full hover:bg-white transition-all duration-300"
          >
            {ui.countries.ctaButton}
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

function WorldMapGraphic({ countries, countryName }: { countries: Country[]; countryName: (country: Country) => string }) {
  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4 px-2 text-white">
        <div>
          <p className="text-xs font-black text-[#C5B278]">OFOQ GLOBAL NETWORK</p>
          <p className="mt-1 text-[11px] text-white/45">Recruitment partners across the world</p>
        </div>
        <span className="rounded-full border border-[#C13229]/60 px-3 py-1 text-[10px] font-bold text-[#C13229]">{countries.length} countries</span>
      </div>
      <svg viewBox="0 0 1000 500" role="img" aria-label="OFOQ recruitment countries map" className="h-auto w-full">
        <defs>
          <linearGradient id="ofoq-map-land" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1C2B6E" />
            <stop offset="100%" stopColor="#102d56" />
          </linearGradient>
          <radialGradient id="ofoq-map-glow">
            <stop offset="0%" stopColor="#C13229" stopOpacity=".6" />
            <stop offset="100%" stopColor="#C13229" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1000" height="500" rx="24" fill="#0b2144" />
        <g fill="url(#ofoq-map-land)" stroke="#5671a0" strokeOpacity=".28" strokeWidth="2">
          <path d="M80 135 124 96l66-12 50 28 43 2 35 38-19 40-46 5-30 38-48-5-31-43-40-14z" />
          <path d="m280 260 53-18 48 21 26 57-18 46-26 61-35 51-26-15 4-57-27-43 17-42-19-33z" />
          <path d="m437 102 37-30 58-9 29 18 37-1 30 32-22 31-27 16-17 32-38-9-33 19-23-31-31-7z" />
          <path d="m519 203 39-4 26 20 32-2 25 30 54 16 27 39-7 54-34 21-29-17-20 31-41-5-18-43-30-20-3-43-30-20z" />
          <path d="m699 123 78-23 85 14 59 38 12 41-45 19-19 44-52-4-37-29-58 1-39-35z" />
          <path d="m807 313 52 5 35 32-20 28-54 3-30-24z" />
          <path d="m900 412 37 8 23 25-18 19-46-7-20-21z" />
          <path d="m698 399 32-8 31 24-17 23-37-5z" />
        </g>
        <path d="M40 250h920M500 35v430" stroke="#ffffff" strokeOpacity=".08" strokeDasharray="3 12" />
        {countries.map((country, index) => (
          <motion.g
            key={country._id}
            initial={{ opacity: 0, scale: 0, x: country.mapX, y: country.mapY }}
            animate={{ opacity: 1, scale: 1, x: country.mapX, y: country.mapY }}
            transition={{ delay: Math.min(index * 0.08, 1.2), type: "spring", stiffness: 180, damping: 16 }}
            style={{ transformOrigin: `${country.mapX}px ${country.mapY}px` }}
          >
            <motion.circle
              cx={country.mapX}
              cy={country.mapY}
              r="22"
              fill="url(#ofoq-map-glow)"
              animate={{ opacity: [0.35, 0.7, 0.35], scale: [0.85, 1.18, 0.85] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: index * 0.13 }}
            />
            <circle cx={country.mapX} cy={country.mapY} r="6" fill="#C13229" stroke="#F4F1EC" strokeWidth="3" />
            <title>{countryName(country)}</title>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
