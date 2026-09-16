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
        <section id="countries-network" className="border-t border-[#D8CDBD]/10 bg-[#071936] py-16 text-white sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
             <p className="mb-4 text-[10px] font-bold uppercase tracking-[.3em] text-[#7EEBFF]">{ui.countries.sectionEyebrow}</p>
             <h2 className="text-4xl font-black text-white">
               {ui.countries.sectionTitle}{" "}
               <span className="text-[#7EEBFF]">{ui.countries.sectionHighlight}</span>
            </h2>
          </div>
           <CountryConstellation
             countries={countries}
             countryName={countryName}
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
  requestLabel,
}: {
  countries: Country[];
  countryName: (country: Country) => string;
  requestLabel: string;
}) {
  const hub = { x: 615, y: 290 };
  const points = countries.map((country, index) => ({
    country,
    index,
    x: Math.min(960, Math.max(40, Number(country.mapX) || 120 + ((index * 137) % 760))),
    y: Math.min(465, Math.max(45, Number(country.mapY) || 120 + ((index * 83) % 300))),
  }));

  const routePath = (x: number, y: number) => {
    const horizontalDistance = x - hub.x;
    const verticalDistance = y - hub.y;
    const curve = Math.max(22, Math.min(100, Math.abs(horizontalDistance) * 0.2)) * (verticalDistance < 0 ? -1 : 1);
    const controlX = hub.x + horizontalDistance * 0.48;
    const controlY = hub.y + verticalDistance * 0.42 + curve;
    return `M ${hub.x} ${hub.y} Q ${controlX} ${controlY} ${x} ${y}`;
  };

  return (
    <div className="relative px-0 py-6 sm:px-2 sm:py-8">
      <div className="relative z-10 flex items-start justify-between gap-4 px-2">
        <div>
          <p className="text-[10px] font-black tracking-[.22em] text-[#7EEBFF]">OFOQ / RECRUITMENT ROUTE</p>
          <p className="mt-2 max-w-xs text-xs leading-5 text-white/55">اضغط على علم الدولة للوصول إلى طلب الاستقطاب الخاص بها</p>
        </div>
        <span className="rounded-full border border-[#7EEBFF]/35 bg-[#0B2548]/80 px-3 py-1.5 text-[10px] font-black text-[#7EEBFF]">{countries.length} {countries.length === 1 ? "stop" : "stops"}</span>
      </div>

      <div className="relative mt-10 overflow-hidden rounded-[2rem] border border-[#7EEBFF]/20 bg-[#071936] shadow-[0_24px_80px_rgba(0,0,0,.28)]">
        <div className="relative min-h-[430px] aspect-[750/356] sm:min-h-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: "url('/images/world-network-map.png')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[#071936]/35" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#071936]/10 via-transparent to-[#071936]/75" />

          <svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
            <defs>
              <filter id="country-route-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {points.map(({ country, x, y, index }) => country.code !== "SA" && (
              <g key={`route-${country._id}`}>
                <path d={routePath(x, y)} fill="none" stroke="#7EEBFF" strokeOpacity=".2" strokeWidth="7" strokeLinecap="round" />
                <motion.path
                  d={routePath(x, y)}
                  fill="none"
                  stroke="#C7F7FF"
                  strokeOpacity=".9"
                  strokeWidth="1.6"
                  strokeDasharray="2 13"
                  strokeLinecap="round"
                  filter="url(#country-route-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -80] }}
                  transition={{
                    pathLength: { duration: .8, delay: Math.min(index * .04, .7), ease: "easeOut" },
                    opacity: { duration: .25, delay: Math.min(index * .04, .7) },
                    strokeDashoffset: { duration: 3.2, repeat: Infinity, ease: "linear" },
                  }}
                />
              </g>
            ))}
            <circle cx={hub.x} cy={hub.y} r="18" fill="none" stroke="#7EEBFF" strokeOpacity=".45" strokeWidth="1.5" />
            <circle cx={hub.x} cy={hub.y} r="5" fill="#FFFFFF" filter="url(#country-route-glow)" />
          </svg>

          {points.map(({ country, x, y, index }) => (
            <motion.div
              key={country._id}
              initial={{ opacity: 0, scale: .5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: Math.min(index * .05, .7), type: "spring", stiffness: 220, damping: 18 }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x / 10}%`, top: `${y / 5}%` }}
            >
              <Link
                to={`/client/register?country=${encodeURIComponent(country.code)}`}
                aria-label={`${requestLabel}: ${countryName(country)}`}
                title={countryName(country)}
                className="group flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EEBFF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#071936]"
              >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#C7F7FF] bg-[#071936]/90 text-xl shadow-[0_0_18px_rgba(126,235,255,.8)] transition-transform duration-200 group-hover:scale-125 sm:h-12 sm:w-12 sm:text-2xl">
                  <span className="absolute -inset-2 rounded-full border border-[#7EEBFF]/45 opacity-70 group-hover:animate-ping" />
                  <span className="relative">{country.flag}</span>
                </span>
                <span className="mt-1 max-w-24 truncate rounded-full bg-[#071936]/85 px-2 py-0.5 text-[9px] font-bold text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {countryName(country)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-4 px-4 text-[10px] font-bold text-white/55 sm:justify-between">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C7F7FF] shadow-[0_0_10px_#7EEBFF]" /> {requestLabel}</span>
        <span className="text-[#7EEBFF]">CLICK A FLAG TO START</span>
      </div>
    </div>
  );
}
