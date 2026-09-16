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
           <CountryConstellation
             countries={countries}
             countryName={countryName}
             countryDescription={countryDescription}
             requestLabel={ui.countries.request}
           />
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

function CountryConstellation({
  countries,
  countryName,
  countryDescription,
  requestLabel,
}: {
  countries: Country[];
  countryName: (country: Country) => string;
  countryDescription: (country: Country) => string;
  requestLabel: string;
}) {
  return (
    <div className="relative px-3 py-6 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: "radial-gradient(#2B273F 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative z-10 flex items-start justify-between gap-4 px-2">
        <div>
          <p className="text-[10px] font-black tracking-[.22em] text-[#C13229]">OFOQ / RECRUITMENT ROUTE</p>
          <p className="mt-2 max-w-xs text-xs leading-5 text-[#2B273F]/50">اضغط على العلم للوصول إلى طلب الاستقطاب الخاص بالدولة</p>
        </div>
        <span className="rounded-full border border-[#C13229]/35 bg-white/70 px-3 py-1.5 text-[10px] font-black text-[#C13229]">{countries.length} {countries.length === 1 ? "stop" : "stops"}</span>
      </div>

      <div className="relative mt-10">
        <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-[#C13229]/20 sm:block" />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-x-20 sm:gap-y-8">
          {countries.map((country, index) => (
        <motion.div
          key={country._id}
          initial={{ opacity: 0, scale: .7, y: 12 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: Math.min(index * .07, .7), type: "spring", stiffness: 180, damping: 16 }}
          className={`relative z-10 flex ${index % 2 === 0 ? "sm:justify-end" : "sm:justify-start"}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 hidden h-px w-20 -translate-y-1/2 bg-[#C13229]/35 sm:block ${
              index % 2 === 0 ? "right-0" : "left-0"
            }`}
          />
          <Link
            to={`/client/register?country=${encodeURIComponent(country.code)}`}
            aria-label={`${requestLabel}: ${countryName(country)}`}
            className="group flex w-full max-w-[300px] items-center gap-4 rounded-2xl border border-[#2B273F]/10 bg-white/80 p-3 text-start transition-colors hover:border-[#C13229]/45 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C13229] focus-visible:ring-offset-4 focus-visible:ring-offset-[#F7F3EE] sm:w-[calc(100%-1.25rem)] sm:p-4"
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#C13229] bg-white text-3xl transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16">
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#071936] text-[9px] font-black text-[#E5FE04]">{String(index + 1).padStart(2, "0")}</span>
              {country.flag}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-black text-[#2B273F] transition-colors group-hover:text-[#C13229] sm:text-sm">
                {countryName(country)}
              </span>
              <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-[#2B273F]/50">
                {countryDescription(country)}
              </span>
            </span>
          </Link>
        </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4 px-4 text-[10px] font-bold text-[#2B273F]/45 sm:justify-between">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E5FE04] ring-2 ring-[#C13229]/30" /> {requestLabel}</span>
        <span className="text-[#C13229]">CLICK A FLAG TO START</span>
      </div>
    </div>
  );
}
