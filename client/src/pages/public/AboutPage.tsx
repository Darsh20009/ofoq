import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const STATS = [
  { value: "2018", ar: "نحو أفق المستقبل", en: "Toward the future" },
  { value: "98%", ar: "نسبة رضا العملاء", en: "Client satisfaction" },
  { value: "+25,000", ar: "معاملة مكتملة", en: "Completed transactions" },
  { value: "+1,250", ar: "عميل وثق بنا", en: "Clients served" },
  { value: "+8", ar: "سنوات من الخبرة", en: "Years of experience" },
];

const MILESTONES = [
  { year: "2018", ar: "الانطلاقة", en: "The beginning", arDesc: "بدأت أفق برؤية لصناعة تجربة أعمال أكثر سهولة.", enDesc: "OFOQ began with a vision for simpler business services." },
  { year: "2019", ar: "بناء الخدمات", en: "Building services", arDesc: "توسعت خدماتنا لتغطي احتياجات الشركات الأساسية.", enDesc: "Our offering expanded to cover core company needs." },
  { year: "2020", ar: "التحول الرقمي", en: "Digital shift", arDesc: "أطلقنا تجربة رقمية أسرع لمتابعة الطلبات.", enDesc: "We launched a faster digital request experience." },
  { year: "2021", ar: "شراكات استراتيجية", en: "Strategic partnerships", arDesc: "وسعنا شبكة شركائنا وخبراتنا في السوق السعودي.", enDesc: "We grew our partner network and local expertise." },
  { year: "2023", ar: "تجربة متكاملة", en: "Integrated experience", arDesc: "جمعنا خدمات الأعمال تحت مسار واحد واضح.", enDesc: "We brought business services into one clear journey." },
  { year: "2024", ar: "نمو مستمر", en: "Continued growth", arDesc: "واصلنا النمو بثقة مع عملائنا وشركائنا.", enDesc: "We continued growing with our clients and partners." },
  { year: "الآن", enYear: "Now", ar: "أفق أبعد", en: "A wider horizon", arDesc: "نعمل اليوم على مستقبل أكثر كفاءة واستدامة.", enDesc: "Today we build a more efficient, sustainable future." },
];

const VALUE_ICONS = [
  <svg key="integration" viewBox="0 0 48 48" fill="none" className="h-9 w-9"><rect x="7" y="7" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="28" y="7" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="7" y="28" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><rect x="28" y="28" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/></svg>,
  <svg key="reliability" viewBox="0 0 48 48" fill="none" className="h-9 w-9"><circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/><path d="m16 24 5 5 11-12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  <svg key="value" viewBox="0 0 48 48" fill="none" className="h-9 w-9"><path d="m24 6 15 18-15 18L9 24 24 6Z" stroke="currentColor" strokeWidth="2"/><circle cx="24" cy="24" r="5" fill="currentColor" opacity=".25"/></svg>,
  <svg key="excellence" viewBox="0 0 48 48" fill="none" className="h-9 w-9"><circle cx="17" cy="18" r="7" stroke="currentColor" strokeWidth="2"/><circle cx="31" cy="18" r="7" stroke="currentColor" strokeWidth="2"/><path d="M6 39c1-8 5-12 11-12s10 4 11 12M20 39c1-8 5-12 11-12s10 4 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
];

function Arrow({ rtl }: { rtl: boolean }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={`h-4 w-4 ${rtl ? "rotate-180" : ""}`}>
      <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AboutPage() {
  const { ui, lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";
  const isArabic = lang === "ar";
  const values = ui.about.values;

  return (
    <div className="min-h-screen overflow-hidden bg-[#F5F0E8] text-[#071936]" dir={isRtl ? "rtl" : "ltr"}>
      <Helmet>
        <title>{ui.about.metaTitle}</title>
        <meta name="description" content={ui.about.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/about" />
        <link rel="preload" as="image" href="/images/about-hero-riyadh.webp" />
      </Helmet>

      <section className="relative px-5 pb-12 pt-[98px] sm:px-10 sm:pb-16 sm:pt-[118px] lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-bold text-[#071936]/45">
            <Link to="/" className="transition-colors hover:text-[#C13229]">{ui.category.home}</Link>
            <span>/</span>
            <span>{ui.about.badge}</span>
          </div>

          <div className="grid items-center gap-9 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <motion.div initial="hidden" animate="show" variants={stagger} className="relative z-10">
              <motion.p variants={fadeUp} className="mb-3 text-[11px] font-black text-[#C13229]">
                {ui.about.badge}
              </motion.p>
              <motion.h1 variants={fadeUp} className="max-w-xl text-[42px] font-black leading-[1.12] sm:text-6xl lg:text-[72px]">
                {ui.about.heroTitle1}
                <br />
                <span className="text-[#C13229]">{ui.about.heroTitle2}</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-5 max-w-lg text-sm font-semibold leading-7 text-[#071936]/65 sm:text-base sm:leading-8">
                {ui.about.heroSub}
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link to="/contact" className="mt-7 inline-flex items-center gap-3 rounded-lg bg-[#071936] px-6 py-3.5 text-xs font-black text-white shadow-[0_12px_30px_rgba(7,25,54,.18)] transition-transform hover:-translate-y-0.5">
                  {isArabic ? "تواصل معنا" : "Contact us"}
                  <Arrow rtl={isRtl} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease }} className="relative order-first lg:order-none">
              <div className="absolute -inset-3 rounded-[36px_10px_36px_10px] border border-[#C13229]/35 sm:-inset-4" />
              <div className="relative aspect-[1.28/1] overflow-hidden rounded-[30px_8px_30px_8px] bg-[#E8E1D7]">
                <img src="/images/about-hero-riyadh.webp" alt={isArabic ? "أفق مدينة الرياض" : "Riyadh skyline"} loading="eager" decoding="async" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071936]/15 via-transparent to-white/10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 sm:px-10 lg:px-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }} variants={stagger} className="mx-auto grid max-w-7xl grid-cols-2 overflow-hidden rounded-2xl bg-[#071936] px-3 py-5 text-white shadow-[0_22px_45px_rgba(7,25,54,.18)] sm:grid-cols-5 sm:px-5">
          {STATS.map((stat, index) => (
            <motion.div key={stat.value} variants={fadeUp} className={`flex min-h-20 flex-col items-center justify-center px-2 text-center ${index > 0 ? "border-s border-white/10" : ""} ${index === 4 ? "col-span-2 border-t border-white/10 pt-4 sm:col-span-1 sm:border-t-0 sm:pt-0" : ""}`}>
              <strong className="text-xl font-black sm:text-2xl">{stat.value}</strong>
              <span className="mt-1 text-[9px] text-white/55 sm:text-[10px]">{isArabic ? stat.ar : stat.en}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="px-5 py-16 sm:px-10 sm:py-24 lg:px-14">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}>
            <motion.p variants={fadeUp} className="mb-3 text-[10px] font-black text-[#C13229]">{ui.about.storyTitle}</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-black leading-tight sm:text-4xl">
              {isArabic ? "بدأت أفق من إيمان بسيط:" : "OFOQ began with a simple belief:"}
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-base font-bold leading-8 text-[#071936]/80">{ui.about.storyVision}</motion.p>
            <motion.div variants={fadeUp} className="mt-4 space-y-3 text-sm leading-7 text-[#071936]/60">
              <p>{ui.about.storyP2}</p>
              <p>{ui.about.storyP3}</p>
              <p>{ui.about.storyP4}</p>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link to="/contact" className="mt-7 inline-flex items-center gap-3 rounded-lg border border-[#071936]/20 bg-white/40 px-6 py-3 text-xs font-black transition-colors hover:border-[#C13229] hover:text-[#C13229]">
                {isArabic ? "تواصل معنا" : "Contact us"}
                <Arrow rtl={isRtl} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8, ease }} className="relative aspect-[16/10] overflow-hidden rounded-2xl">
            <img src="/images/about-story-riyadh.webp" alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071936]/80 via-[#071936]/5 to-transparent" />
            <div className="absolute bottom-5 start-5 text-white sm:bottom-7 sm:start-7">
              <p className="text-3xl font-black">OFOQ</p>
              <p className="text-sm font-bold text-[#C5B278]">2018 {isArabic ? "منذ" : "Since"}</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#071936]/8 bg-white/35 px-5 py-16 sm:px-10 sm:py-20 lg:px-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mx-auto max-w-7xl text-center">
          <motion.p variants={fadeUp} className="text-[10px] font-black text-[#C13229]">{ui.about.valuesTitle}</motion.p>
          <motion.h2 variants={fadeUp} className="mx-auto mt-3 max-w-2xl text-2xl font-black sm:text-3xl">{ui.about.valuesSub}</motion.h2>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.article key={value.title} variants={fadeUp} className="rounded-xl border border-[#071936]/10 bg-[#F9F6F0] px-5 py-7 text-center transition-transform hover:-translate-y-1">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center ${index % 2 ? "text-[#C5A86B]" : "text-[#071936]"}`}>{VALUE_ICONS[index % VALUE_ICONS.length]}</div>
                <h3 className="text-sm font-black">{value.title}</h3>
                <p className="mt-2 text-[11px] leading-6 text-[#071936]/55">{value.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-5 py-16 sm:px-10 sm:py-20 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-[10px] font-black text-[#C13229]">{isArabic ? "مسيرتنا" : "Our journey"}</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{isArabic ? "رحلتنا منذ البداية" : "Our journey from the beginning"}</h2>
          </div>

          <div className="mt-10 hidden grid-cols-7 lg:grid">
            {MILESTONES.map((item, index) => (
              <div key={`${item.year}-${item.ar}`} className="relative px-2 pt-7 text-center">
                <div className={`absolute inset-x-0 top-2 h-px ${index === 0 ? "start-1/2" : ""} ${index === MILESTONES.length - 1 ? "end-1/2" : ""} bg-[#071936]/25`} />
                <span className={`absolute start-1/2 top-0 h-4 w-4 -translate-x-1/2 rounded-full border-[5px] border-[#F5F0E8] ${index === MILESTONES.length - 1 ? "bg-[#33B27C]" : index === 0 ? "bg-[#C13229]" : "bg-[#071936]"}`} />
                <strong className="text-sm font-black text-[#071936]">{isArabic ? item.year : item.enYear ?? item.year}</strong>
                <h3 className="mt-2 text-[11px] font-black">{isArabic ? item.ar : item.en}</h3>
                <p className="mt-1 text-[9px] leading-5 text-[#071936]/50">{isArabic ? item.arDesc : item.enDesc}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-9 space-y-5 ps-7 lg:hidden">
            <div className="absolute bottom-4 start-[7px] top-4 w-px bg-[#071936]/20" />
            {MILESTONES.map((item, index) => (
              <motion.article key={`${item.year}-${item.en}`} initial={{ opacity: 0, x: isRtl ? 18 : -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-xl border border-[#071936]/8 bg-white/40 p-4">
                <span className={`absolute -start-[27px] top-5 h-3.5 w-3.5 rounded-full border-4 border-[#F5F0E8] ${index === MILESTONES.length - 1 ? "bg-[#33B27C]" : index === 0 ? "bg-[#C13229]" : "bg-[#071936]"}`} />
                <strong className="text-sm font-black text-[#C13229]">{isArabic ? item.year : item.enYear ?? item.year}</strong>
                <h3 className="mt-1 text-sm font-black">{isArabic ? item.ar : item.en}</h3>
                <p className="mt-1 text-xs leading-6 text-[#071936]/55">{isArabic ? item.arDesc : item.enDesc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 sm:px-10 sm:pb-12 lg:px-14">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-[#071936] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-10">
          <div className="absolute -bottom-20 -end-12 h-44 w-44 rounded-full border border-[#C13229]/30" />
          <div className="relative">
            <p className="text-[10px] font-bold text-[#C5B278]">{ui.about.ctaBadge}</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">{ui.about.ctaTitle}</h2>
          </div>
          <Link to="/client/requests/new" className="relative inline-flex shrink-0 items-center gap-3 rounded-lg bg-[#C13229] px-6 py-3.5 text-xs font-black text-white transition-colors hover:bg-[#A82922]">
            {ui.about.requestService}
            <Arrow rtl={isRtl} />
          </Link>
        </div>
      </section>
    </div>
  );
}