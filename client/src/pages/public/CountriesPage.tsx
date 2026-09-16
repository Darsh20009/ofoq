import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";
import { useQuery } from "@tanstack/react-query";
import { cmsApi } from "../../api/client";
import type { Country } from "../../types";
import InteractiveWorldMap from "../../components/InteractiveWorldMap";

const COUNTRY_CODES = ["PK", "IN", "JO", "LK", "EG", "PH", "BD", "UG", "NP", "SD"];
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
    mapX: 0,
    mapY: 0,
    order: i + 1,
    isPublished: true,
    createdAt: "",
    updatedAt: "",
  }));
  const countries: Country[] = Array.isArray(data?.countries) && data.countries.length > 0 ? data.countries : fallbackCountries;
  const isArabic = lang === "ar" || lang === "ur";
  const countryName = (country: Country) => isArabic ? country.nameAr || country.nameEn : country.nameEn || country.nameAr;
  return (
    <div dir={dir} className="min-h-screen bg-[#F4F0E8] text-[#17251F]">
      <Helmet>
        <title>{ui.countries.metaTitle}</title>
        <meta name="description" content={ui.countries.metaDescription} />
        <link rel="canonical" href="https://ofoqhc.com/countries" />
      </Helmet>

      {/* ══ رأس الصفحة والخريطة ═════════════════════════════════ */}
      <section className="border-b border-[#D9D2C5] bg-[#F4F0E8]">
        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs text-[#68716B]">
            <Link to="/" className="transition-colors hover:text-[#1F6B55]">{ui.category.home}</Link>
            <span>/</span>
            <span>{ui.countries.badge}</span>
          </div>
          <div className="mt-10 max-w-3xl">
            <p className="text-xs font-bold tracking-[.16em] text-[#1F6B55]">{ui.countries.sectionEyebrow}</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-[#17251F] sm:text-5xl">
              {ui.countries.heroTitle}{" "}
              <span className="text-[#1F6B55]">{ui.countries.heroHighlight}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#68716B]">
              اختر الدولة للوصول إلى طلب الاستقطاب الخاص بها
            </p>
          </div>
        </div>
      </section>

      <section id="countries-network" className="bg-[#F4F0E8] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <InteractiveWorldMap
            countries={countries}
            countryName={countryName}
            requestLabel={ui.countries.request}
          />
        </div>
      </section>

      {/* ══ قسم العملية ══════════════════════════════════════ */}
      <section className="border-t border-[#D9D2C5] bg-[#EDE7DC] py-20 text-[#17251F]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[.16em] text-[#1F6B55]">{ui.countries.processEyebrow}</p>
            <h2 className="text-4xl font-black">
              {ui.countries.processTitle}{" "}
              <span className="text-[#1F6B55]">{ui.countries.processHighlight}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ui.countries.steps.map((step, i) => (
              <div key={i} className="rounded-2xl border border-[#D9D2C5] bg-[#F4F0E8] p-7 text-center">
                <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-[#1F6B55]/35 text-lg font-black text-[#1F6B55]">
                  {i + 1}
                </span>
                <h4 className="mb-3 text-sm font-black text-[#17251F]">{step.title}</h4>
                <p className="text-xs leading-relaxed text-[#68716B]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section className="border-t border-[#D9D2C5] bg-[#F4F0E8]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[.16em] text-[#1F6B55]">{ui.countries.ctaEyebrow}</p>
            <h2 className="text-3xl font-black text-[#17251F] sm:text-4xl">
              {ui.countries.ctaTitle}{" "}
              <span className="text-[#1F6B55]">{ui.countries.ctaHighlight}</span>
            </h2>
          </div>
          <Link
            to="/client/register"
            className="inline-flex flex-shrink-0 items-center gap-3 rounded-xl bg-[#1F6B55] px-8 py-4 text-sm font-black text-white transition-colors hover:bg-[#17251F]"
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
