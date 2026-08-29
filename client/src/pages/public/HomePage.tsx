import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";
import { servicesCatalog } from "../../data/servicesCatalog";

type Service = {
  number: string;
  href: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
};

const services: Service[] = [
  { number: "01", href: "/services/formation", ar: "تأسيس الشركات", en: "Company formation", descriptionAr: "من الفكرة إلى كيان عامل، ننسّق خطوات التأسيس.", descriptionEn: "From idea to operating entity, we coordinate every step.", icon: "building" },
  { number: "02", href: "/services/visas", ar: "خدمات التأشيرات", en: "Visa services", descriptionAr: "حلول متكاملة لتأشيرات المستثمرين والموظفين.", descriptionEn: "Integrated solutions for investor and employee visas.", icon: "passport" },
  { number: "03", href: "/services/government", ar: "الخدمات الحكومية", en: "Government services", descriptionAr: "نتابع معاملاتك الحكومية بوضوح وسرعة.", descriptionEn: "We manage your government transactions clearly and quickly.", icon: "government" },
  { number: "04", href: "/services/business", ar: "الموارد البشرية", en: "Human resources", descriptionAr: "إدارة مواردك البشرية لدعم نمو أعمالك.", descriptionEn: "Human resource management that supports your growth.", icon: "people" },
];

const catalogServices: Service[] = servicesCatalog.flatMap((category) =>
  category.services.map((service, index) => ({
    number: "",
    href: `/services/${category.slug}/${service.slug}`,
    ar: service.title.ar,
    en: service.title.en,
    descriptionAr: service.desc.ar,
    descriptionEn: service.desc.en,
    icon: category.slug === "formation" ? "building" : category.slug === "visas" ? "passport" : category.slug === "government" ? "government" : category.slug === "people" ? "people" : index % 2 ? "passport" : "building",
  })),
);

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
  const allServices = [...services, ...catalogServices];
  const featuredServices = allServices.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={copy.description} />
      </Helmet>
      <main dir={dir} className="relative overflow-hidden bg-[#F4F1EC] text-[#071936]">
        <section className="relative min-h-[620px] overflow-hidden bg-[#F4F1EC] pt-16 sm:min-h-[625px] sm:pt-[78px] lg:min-h-[535px]">
          <div className="absolute inset-0 bg-[#F4F1EC]" />
          <div className="pointer-events-none absolute left-[-14%] top-[7%] h-[430px] w-[430px] rounded-full border border-[#071936]/[.035] sm:h-[620px] sm:w-[620px]" />
          <div className="pointer-events-none absolute left-[4%] top-[26%] h-[260px] w-[260px] rounded-full border border-[#C13229]/[.07]" />
          <img
            src="/images/ofoq-hero-reference.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-center sm:block"
          />
          <img
            src="/images/ofoq-hero-reference-mobile.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 block h-full w-full object-cover object-center sm:hidden"
          />

          <div className="relative z-10 mx-auto grid min-h-[510px] max-w-[1480px] items-center gap-3 px-5 pb-24 pt-10 [direction:ltr] sm:min-h-[470px] sm:grid-cols-[1.02fr_.98fr] sm:px-10 sm:pb-24 sm:pt-0 lg:min-h-[440px] lg:px-16">
            <div dir={dir} className="order-1 z-10 text-right sm:col-start-2 sm:order-2 sm:pr-8 lg:pr-16 xl:pr-24">
              <h1 className="max-w-[540px] text-[2.15rem] font-black leading-[1.12] tracking-[-.045em] sm:text-[clamp(2.5rem,5vw,4.55rem)]">
                <span className="block whitespace-nowrap">{copy.titleOne}</span>
                <span className="block whitespace-nowrap">{copy.titleTwo}</span>
              </h1>
              <p className="mt-4 max-w-[345px] text-xs font-semibold leading-7 text-[#061a36] sm:mt-5 sm:max-w-[430px] sm:text-base sm:leading-8">{copy.description}</p>
              <div className="mt-6 flex flex-col items-start gap-4 sm:mt-7 sm:flex-row sm:items-center sm:justify-end sm:gap-5 sm:[direction:ltr]">
                <Link to="/services" className="inline-flex items-center gap-3 rounded-md bg-[#071936] px-5 py-3 text-xs font-bold text-white shadow-[0_12px_24px_rgba(7,25,54,.16)] transition-colors hover:bg-[#102b57] sm:text-sm">
                  {copy.explore}<span className="text-lg text-[#C5B278]">←</span>
                </Link>
                <Link to="/about" className="inline-flex items-center gap-3 text-xs font-bold text-[#071936]/75 sm:text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C13229] text-[10px] text-[#C13229] sm:h-9 sm:w-9 sm:text-xs">▶</span>{copy.watch}
                </Link>
              </div>
            </div>
          </div>
          <div dir="rtl" className="absolute bottom-0 left-1/2 z-20 grid w-[calc(100%-2rem)] max-w-[1050px] -translate-x-1/2 grid-cols-2 overflow-hidden rounded-t-[18px] bg-[#071936] text-white shadow-[0_-8px_30px_rgba(7,25,54,.1)] sm:grid-cols-4 sm:rounded-t-[20px]">
            {[
              { value: "98%", label: isArabic ? "نسبة رضا العملاء" : "Client satisfaction", icon: "★" },
              { value: "25,000+", label: isArabic ? "معاملة مكتملة" : "Completed transactions", icon: "✓" },
              { value: "1,250+", label: isArabic ? "عميل وثق بنا" : "Trusted clients", icon: "♧" },
              { value: "8+", label: isArabic ? "سنوات من الخبرة" : "Years of experience", icon: "◉" },
            ].map((stat, index) => (
              <div key={stat.value} className={`flex items-center justify-center gap-2 px-2 py-3.5 sm:gap-3 sm:px-5 sm:py-4 ${index > 0 ? "border-r border-white/10" : ""} ${index === 2 ? "border-t border-white/10 sm:border-t-0" : ""} ${index === 3 ? "border-t border-white/10 sm:border-t-0" : ""}`}>
                <span className="text-lg text-[#C5B278] sm:text-2xl">{stat.icon}</span>
                <div><strong className="block text-base font-black sm:text-xl">{stat.value}</strong><span className="block text-[8px] text-white/60 sm:text-[10px]">{stat.label}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative bg-[#071936] pb-10 pt-14 text-white sm:pb-16 sm:pt-14">
          <div className="pointer-events-none absolute -top-9 left-[-5%] h-16 w-[110%] rounded-[50%] bg-[#071936]" />
          <div className="relative mx-auto grid max-w-[1480px] gap-8 px-5 [direction:ltr] sm:gap-10 sm:px-10 lg:grid-cols-[.62fr_1.85fr] lg:items-start lg:px-16">
            <div dir={dir} className={isArabic ? "text-right" : "text-left"}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#C5B278] sm:mb-4 sm:text-xs">{isArabic ? "خدمات أفق" : "OFOQ SERVICES"}</p>
              <h2 className="text-[2.25rem] font-black leading-[1.15] tracking-[-.03em] sm:text-[3.25rem]"><span className="block">{copy.servicesTitleOne}</span><span className="block text-[#C5B278]">{copy.servicesTitleTwo}</span></h2>
              <p className="mt-4 max-w-xs text-xs leading-6 text-white/60 sm:mt-5 sm:text-sm sm:leading-7">{copy.servicesDescription}</p>
              <Link to="/services" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#C13229] sm:mt-7 sm:text-sm">{copy.allServices}<span>←</span></Link>
            </div>

            <div dir={dir} className="flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3">
              {featuredServices.map((service, index) => {
                const title = isArabic ? service.ar : service.en;
                const description = isArabic ? service.descriptionAr : service.descriptionEn;
                const active = index === 3;
                return (
                  <Link to={service.href} key={service.href} className={`group relative h-[188px] min-w-[170px] snap-start rounded-lg border p-3.5 transition-transform hover:-translate-y-1 sm:h-[204px] sm:min-w-[205px] sm:rounded-xl sm:p-5 ${active ? "border-[#C5B278] bg-[#F4F1EC] text-[#071936] shadow-[0_12px_25px_rgba(0,0,0,.12)]" : "border-white/10 bg-[#102d56] text-white"}`}>
                    <span className={`text-[10px] font-bold sm:text-xs ${active ? "text-[#C13229]" : "text-[#C5B278]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <LineIcon type={service.icon} className={`mb-3 mt-4 h-8 w-8 sm:mb-3 sm:mt-5 sm:h-9 sm:w-9 ${active ? "text-[#C13229]" : "text-[#C5B278]"}`} />
                    <h3 className="text-sm font-black sm:text-base">{title}</h3>
                    <p className={`mt-2 min-h-10 text-[10px] leading-5 sm:text-[11px] sm:leading-5 ${active ? "text-[#071936]/60" : "text-white/55"}`}>{description}</p>
                    <span className={`absolute bottom-3.5 right-3.5 text-[9px] font-bold sm:bottom-5 sm:right-5 sm:text-[10px] ${active ? "text-[#C13229]" : "text-white/70"}`}>{isArabic ? "اعرف أكثر ←" : "Learn more →"}</span>
                  </Link>
                );
              })}
              <button aria-label={isArabic ? "الخدمات التالية" : "Next services"} className="my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg text-white/80 transition-colors hover:border-[#C5B278] hover:text-[#C5B278] sm:h-10 sm:w-10">‹</button>
            </div>
          </div>
        </section>

        <section className="bg-[#071936] px-5 pb-16 text-white sm:px-10 sm:pb-24 lg:px-16">
          <div className="mx-auto grid max-w-[1380px] items-center gap-8 overflow-hidden rounded-[24px] border border-white/10 bg-[#122846] px-6 py-8 [direction:ltr] sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:px-14 lg:py-10">
            <div dir={dir} className="order-2 text-right lg:order-2">
              <p className="mb-3 text-xs font-bold text-[#C5B278]">{isArabic ? "بوابة أفق الذكية" : "OFOQ SMART PORTAL"}</p>
              <h2 className="max-w-lg text-3xl font-black leading-[1.35] sm:text-4xl">
                {isArabic ? "لإدارة أعمالك بسهولة" : "Manage your business with ease"}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/60">
                {isArabic ? "منصة رقمية متكاملة تمنحك رؤية واضحة وتحكمًا كاملًا في خدماتك ومعاملاتك." : "An integrated digital platform giving you complete visibility and control over your services and transactions."}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {(isArabic
                  ? ["متابعة الطلبات والمعاملات أولًا بأول", "مستنداتك وفواتيرك في مكان واحد", "تقارير ذكية تساعدك على اتخاذ القرار"]
                  : ["Track requests and transactions in real time", "Keep documents and invoices in one place", "Smart reports to help you decide"]).map((item) => (
                  <li key={item} className="flex items-center justify-end gap-3">
                    <span>{item}</span><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C5B278] text-[10px] text-[#C5B278]">✓</span>
                  </li>
                ))}
              </ul>
              <Link to="/client/login" className="mt-7 inline-flex rounded-lg bg-[#C5B278] px-5 py-3 text-sm font-bold text-[#071936] transition-colors hover:bg-white">
                {isArabic ? "الدخول إلى البوابة" : "Open the portal"}
              </Link>
            </div>
            <div className="order-1 flex justify-center lg:order-1 lg:justify-start">
              <div className="relative w-full max-w-[580px] overflow-hidden rounded-[18px] border-[10px] border-[#0a1b31] bg-[#e8ebef] shadow-2xl">
                <div className="aspect-[1.55] overflow-hidden">
                  <img src="/images/ofoq-client-portal-dashboard.png" alt={isArabic ? "لوحة بوابة أفق" : "OFOQ portal dashboard"} className="h-full w-full object-cover object-top" />
                </div>
                <div className="absolute bottom-[-14px] left-1/2 h-3 w-2/3 -translate-x-1/2 rounded-full bg-[#071936]" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#071936] px-5 pb-10 sm:px-10 sm:pb-14 lg:px-16">
          <div className="mx-auto max-w-[1380px] rounded-2xl bg-[#F4F1EC] px-5 py-6 text-[#071936] sm:px-10 sm:py-7">
            <div className="flex flex-col items-center justify-between gap-5 sm:flex-row" dir={dir}>
              <p className="text-center text-xs font-bold text-[#071936]/65 sm:text-right">
                {isArabic ? "عملاء نفخر بخدمتهم" : "Trusted by businesses we are proud to serve"}
              </p>
              <div className="flex w-full flex-wrap items-center justify-center gap-x-7 gap-y-4 sm:w-auto sm:justify-end sm:gap-x-9">
                {[
                  { name: "SNB", detail: isArabic ? "الأهلي السعودي" : "Saudi National Bank" },
                  { name: "stc", detail: isArabic ? "حلول الأعمال" : "business" },
                  { name: "مرافق", detail: isArabic ? "للطاقة والمياه" : "utilities" },
                  { name: "المراعي", detail: isArabic ? "جودة تستحق الثقة" : "quality you trust" },
                  { name: "سبيك", detail: isArabic ? "للحلول الذكية" : "smart solutions" },
                ].map((partner) => (
                  <div key={partner.name} className="min-w-[72px] text-center opacity-75 transition-opacity hover:opacity-100">
                    <strong className="block text-lg font-black tracking-[-.06em] text-[#071936]">{partner.name}</strong>
                    <span className="block text-[7px] font-bold text-[#071936]/50">{partner.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#071936] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16">
          <div className="relative mx-auto min-h-[235px] max-w-[1380px] overflow-hidden rounded-[24px] border border-white/10 bg-[#102d56]">
            <img src="/images/riyadh-district-dark.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-l from-[#071936]/95 via-[#071936]/75 to-[#071936]/25" />
            <div className="relative grid min-h-[235px] items-center gap-8 px-6 py-8 [direction:ltr] sm:px-12 lg:grid-cols-[1fr_1.2fr] lg:px-16">
              <div className="hidden justify-center lg:flex">
                <OfoqOutlineMark />
              </div>
              <div dir={dir} className="text-right">
                <p className="mb-2 text-xs font-bold text-[#C5B278]">{isArabic ? "كن جزءًا من أفق" : "BE PART OF OFOQ"}</p>
                <h2 className="text-2xl font-black text-white sm:text-3xl">{isArabic ? "شريكك في رحلة النمو" : "Your partner for the growth journey"}</h2>
                <p className="mt-3 max-w-lg text-xs leading-6 text-white/65 sm:text-sm sm:leading-7">
                  {isArabic ? "انضم إلى أكثر من 1,250 عميلًا يثقون بأفق لإدارة أعمالهم بثقة ووضوح." : "Join more than 1,250 clients who trust OFOQ to manage their business with confidence and clarity."}
                </p>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#C13229] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#d34a42] sm:text-sm">
                  {isArabic ? "ابدأ معنا الآن" : "Start with us"} <span>←</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function OfoqOutlineMark() {
  return (
    <svg viewBox="0 0 210 148" className="h-40 w-56 opacity-25" fill="none" aria-hidden="true">
      <rect x="6" y="5" width="58" height="90" rx="11" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M73 10v80M73 10h52M73 47h39" stroke="#C13229" strokeWidth="9" strokeLinecap="square" />
      <rect x="72" y="103" width="26" height="38" rx="6" stroke="#FFFFFF" strokeWidth="5" />
      <rect x="102" y="103" width="26" height="38" rx="6" stroke="#FFFFFF" strokeWidth="5" />
    </svg>
  );
}