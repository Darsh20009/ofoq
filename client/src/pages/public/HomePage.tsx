import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";

type Service = {
  number: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
};

const services: Service[] = [
  { number: "01", ar: "تأسيس الشركات", en: "Company formation", descriptionAr: "من الفكرة إلى كيان عامل، ننسّق خطوات التأسيس.", descriptionEn: "From idea to operating entity, we coordinate every step.", icon: "building" },
  { number: "02", ar: "خدمات التأشيرات", en: "Visa services", descriptionAr: "حلول متكاملة لتأشيرات المستثمرين والموظفين.", descriptionEn: "Integrated solutions for investor and employee visas.", icon: "passport" },
  { number: "03", ar: "الخدمات الحكومية", en: "Government services", descriptionAr: "نتابع معاملاتك الحكومية بوضوح وسرعة.", descriptionEn: "We manage your government transactions clearly and quickly.", icon: "government" },
  { number: "04", ar: "الموارد البشرية", en: "Human resources", descriptionAr: "إدارة مواردك البشرية لدعم نمو أعمالك.", descriptionEn: "Human resource management that supports your growth.", icon: "people" },
];

function LineIcon({ type, className = "" }: { type: string; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "people") return <svg viewBox="0 0 48 48" className={className} {...common}><circle cx="18" cy="16" r="5" /><circle cx="31" cy="18" r="4" /><path d="M7 36c1-7 5-10 11-10s10 3 11 10M27 28c6-4 12 0 14 7" /></svg>;
  if (type === "passport") return <svg viewBox="0 0 48 48" className={className} {...common}><rect x="10" y="6" width="28" height="36" rx="3" /><circle cx="24" cy="20" r="5" /><path d="M17 32h14M17 37h9M24 15v10M19 20h10" /></svg>;
  if (type === "government") return <svg viewBox="0 0 48 48" className={className} {...common}><path d="m7 18 17-9 17 9M10 20h28M13 20v15M21 20v15M29 20v15M37 20v15M8 39h32M6 43h36" /></svg>;
  return <svg viewBox="0 0 48 48" className={className} {...common}><path d="M7 40V18l10-5v27M17 40V10l11-5v35M28 40V21l13-6v25M5 43h38" /><path d="M12 23h1M12 29h1M22 16h1M22 22h1M34 27h1M34 33h1" /></svg>;
}

export default function HomePage() {
  const { ui, lang, dir } = useLang();
  const isArabic = lang === "ar" || lang === "ur";
  const copy = {
    eyebrow: isArabic ? "أفق / خدمات الأعمال السعودية" : "OFOQ / Saudi Business Services",
    titleOne: isArabic ? "خدمات ترتقي" : "Services that elevate",
    titleTwo: isArabic ? "بالشركات" : "your business",
    description: isArabic ? "نقدم لك منظومة متكاملة من الخدمات تدعم أعمالك في كل مرحلة من التأسيس إلى النمو والتوسع." : "We provide an integrated range of services that supports your business from formation through growth and expansion.",
    explore: isArabic ? "استكشف خدماتنا" : "Explore our services",
    watch: isArabic ? "شاهد كيف نعمل" : "See how we work",
    allServices: isArabic ? "عرض جميع الخدمات" : "View all services",
    servicesTitleOne: isArabic ? "جميع خدماتك" : "All your services",
    servicesTitleTwo: isArabic ? "في مكان واحد" : "in one place",
    servicesDescription: isArabic ? "من التأسيس إلى التشغيل، نوفر لك كل ما تحتاجه لنمو أعمالك بثقة ووضوح." : "From formation to operations, everything you need to grow with confidence and clarity.",
  };

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={copy.description} />
      </Helmet>
      <main dir={dir} className="relative overflow-hidden bg-[#F4F1EC] text-[#071936]">
        <section className="relative min-h-0 overflow-hidden bg-[#F4F1EC] pt-16 sm:min-h-[785px] sm:pt-[78px]">
          <div className="absolute inset-0 bg-[#F4F1EC]" />
          <div className="pointer-events-none absolute left-[-12%] top-[12%] h-[430px] w-[430px] rounded-full border border-[#071936]/[.035] sm:h-[620px] sm:w-[620px]" />
          <div className="pointer-events-none absolute left-[4%] top-[30%] h-[260px] w-[260px] rounded-full border border-[#C13229]/[.07]" />
          <img
            src="/images/ofoq-hero-architecture.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
          />

          <div className="relative z-10 mx-auto grid min-h-0 max-w-[1480px] items-center gap-3 px-5 pb-7 pt-7 [direction:ltr] sm:min-h-[610px] sm:grid-cols-[1.05fr_.95fr] sm:px-10 sm:pb-44 sm:pt-0 lg:px-16">
            <div dir={dir} className="order-1 z-10 text-right sm:col-start-2 sm:order-2 sm:pr-8 sm:pt-0 lg:pr-20">
              <p className="mb-5 flex items-center justify-end gap-3 text-[11px] font-bold text-[#C13229] sm:text-sm">
                {copy.eyebrow}<span className="h-px w-8 bg-[#C13229]" />
              </p>
              <h1 className="max-w-[580px] text-[2.35rem] font-black leading-[1.14] tracking-[-.045em] sm:text-[clamp(2.35rem,5vw,4.8rem)]">
                <span className="block whitespace-nowrap">{copy.titleOne}</span>
                <span className="block whitespace-nowrap">{copy.titleTwo}</span>
              </h1>
              <p className="mt-6 max-w-[345px] text-sm font-semibold leading-8 text-[#071936]/65 sm:max-w-[470px] sm:text-lg">{copy.description}</p>
              <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-end">
                <Link to="/services" className="inline-flex items-center gap-3 rounded-lg bg-[#071936] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#102b57]">
                  {copy.explore}<span className="text-lg text-[#C5B278]">←</span>
                </Link>
                <Link to="/about" className="inline-flex items-center gap-3 text-sm font-bold text-[#071936]/75">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C13229] text-[#C13229]">▶</span>{copy.watch}
                </Link>
              </div>
            </div>
          </div>
          <img
            src="/images/ofoq-hero-architecture.png"
            alt={isArabic ? "أفق الرياض" : "OFOQ Riyadh"}
            className="relative z-10 mx-auto block h-[245px] w-full object-cover object-center sm:hidden"
          />

          <div className="absolute bottom-[-1px] left-1/2 z-20 grid w-[calc(100%-2rem)] max-w-[1050px] -translate-x-1/2 grid-cols-2 overflow-hidden rounded-t-[22px] bg-[#071936] text-white sm:grid-cols-4">
            {[
              { value: "98%", label: isArabic ? "نسبة رضا العملاء" : "Client satisfaction", icon: "★" },
              { value: "25,000+", label: isArabic ? "معاملة مكتملة" : "Completed transactions", icon: "✓" },
              { value: "1,250+", label: isArabic ? "عميل وثق بنا" : "Trusted clients", icon: "♧" },
              { value: "8+", label: isArabic ? "سنوات من الخبرة" : "Years of experience", icon: "◉" },
            ].map((stat, index) => (
              <div key={stat.value} className={`flex items-center justify-center gap-3 px-3 py-5 sm:px-5 sm:py-7 ${index > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}>
                <span className="text-2xl text-[#C5B278]">{stat.icon}</span>
                <div><strong className="block text-xl font-black sm:text-2xl">{stat.value}</strong><span className="block text-[10px] text-white/60">{stat.label}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-[#071936] pb-16 pt-20 text-white sm:pb-28 sm:pt-32">
          <div className="pointer-events-none absolute -top-16 left-[-5%] hidden h-32 w-[110%] rounded-[50%] bg-[#071936] sm:block" />
          <div className="relative mx-auto grid max-w-[1480px] gap-9 px-5 sm:gap-10 sm:px-10 lg:grid-cols-[.72fr_1.8fr] lg:items-center lg:px-16">
            <div className={isArabic ? "text-right" : "text-left"}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#C5B278]">{isArabic ? "خدمات أفق" : "OFOQ SERVICES"}</p>
              <h2 className="text-[2.7rem] font-black leading-[1.2] tracking-[-.03em] sm:text-5xl"><span className="block">{copy.servicesTitleOne}</span><span className="block text-[#C5B278]">{copy.servicesTitleTwo}</span></h2>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/60">{copy.servicesDescription}</p>
              <Link to="/services" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#C13229]">{copy.allServices}<span>←</span></Link>
            </div>

            <div dir={dir} className="flex snap-x gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {services.map((service, index) => {
                const title = isArabic ? service.ar : service.en;
                const description = isArabic ? service.descriptionAr : service.descriptionEn;
                const active = index === services.length - 1;
                return (
                  <Link to={`/services/${service.icon}`} key={service.number} className={`group relative min-w-[220px] snap-start rounded-xl border p-5 transition-transform hover:-translate-y-1 sm:min-w-[235px] sm:p-6 ${active ? "border-[#C5B278] bg-[#F4F1EC] text-[#071936]" : "border-white/10 bg-[#0d2548] text-white"}`}>
                    <span className={`text-sm font-bold ${active ? "text-[#C13229]" : "text-[#C5B278]"}`}>{service.number}</span>
                    <LineIcon type={service.icon} className={`my-12 h-12 w-12 ${active ? "text-[#C13229]" : "text-[#C5B278]"}`} />
                    <h3 className="text-lg font-black">{title}</h3>
                    <p className={`mt-3 min-h-12 text-xs leading-6 ${active ? "text-[#071936]/60" : "text-white/55"}`}>{description}</p>
                    <span className={`mt-5 block text-xs font-bold ${active ? "text-[#C13229]" : "text-white/70"}`}>{isArabic ? "اعرف أكثر ←" : "Learn more →"}</span>
                  </Link>
                );
              })}
              <button aria-label={isArabic ? "الخدمات التالية" : "Next services"} className="my-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-xl text-white/80">‹</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}