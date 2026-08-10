import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useRef, useEffect, useState } from "react";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

/* ══ Animation presets ══════════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

/* ══ الـ Splash screen — بالضبط كتسامي ════════════════════════ */
function SplashIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 200);
    const t2 = setTimeout(() => setPhase("out"), 2600);
    const t3 = setTimeout(onDone, 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const words = ["نرتّب", "التفاصيل،", "لتنتفرغ", "للنمو."];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "out" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-[#2B273F] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* زخرفة هندسية */}
      <div className="absolute inset-0 pointer-events-none">
        <svg viewBox="0 0 800 600" className="absolute inset-0 w-full h-full opacity-5" preserveAspectRatio="xMidYMid slice">
          <rect x="50" y="50" width="200" height="200" stroke="#33B27C" strokeWidth="1" fill="none" />
          <rect x="120" y="120" width="200" height="200" stroke="#E5FE04" strokeWidth="1" fill="none" />
          <rect x="550" y="300" width="200" height="200" stroke="#33B27C" strokeWidth="1" fill="none" />
          <rect x="480" y="230" width="200" height="200" stroke="#E5FE04" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* اسم الموقع — صغير في الأسفل مثل تسامي */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "in" ? 0 : 0.35 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-10 text-white text-xs tracking-[.4em] uppercase font-light"
      >
        ofoqhc.com
      </motion.p>

      {/* الكلمات تظهر واحدة واحدة */}
      <div className="flex flex-col items-center gap-1 sm:gap-2">
        {words.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: phase !== "in" ? 1 : 0, y: phase !== "in" ? 0 : 30 }}
            transition={{ delay: i * 0.18, duration: 0.6, ease }}
            className={`block font-black leading-none text-center ${
              i === 1 || i === 2
                ? "text-4xl sm:text-6xl lg:text-7xl text-[#33B27C]"
                : "text-4xl sm:text-6xl lg:text-7xl text-white"
            }`}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

/* ══ عداد متحرك ═════════════════════════════════════════════════ */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const val = useMotionValue(0);
  const spring = useSpring(val, { duration: 1800, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v) + suffix);
  useEffect(() => { if (inView) val.set(to); }, [inView, to, val]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ══ شريط الشعارات المتحرك ══════════════════════════════════════ */
function LogoMarquee() {
  const clients = [
    "أرامكو", "سابك", "stc", "موبايلي", "الرياض المالي",
    "بنك الرياض", "مجموعة بن لادن", "الوطنية للتأمين", "المملكة القابضة", "ثروة",
  ];
  return (
    <div className="overflow-hidden py-10">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-0 w-max"
      >
        {[...clients, ...clients].map((name, i) => (
          <div
            key={i}
            className="mx-8 flex-shrink-0 flex items-center justify-center h-10"
          >
            <span className="text-white/25 font-black text-sm sm:text-base tracking-widest uppercase">
              {name}
            </span>
            {i < clients.length * 2 - 1 && (
              <span className="mx-8 text-white/10 text-xl">·</span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ══ المكوّن الرئيسي ═════════════════════════════════════════════ */
export default function HomePage() {
  const { lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";
  const [splashDone, setSplashDone] = useState(() => {
    // لا تعرض الـ splash مرة ثانية في نفس الجلسة
    return sessionStorage.getItem("ofoq_splash_done") === "1";
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("ofoq_splash_done", "1");
    setSplashDone(true);
  };

  /* — الخدمات الرئيسية الثلاث لقسم الـ cards الكبيرة — */
  const featuredServices = servicesCatalog.slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{isRtl ? "أفق لحلول الأعمال — شريك الأعمال السعودي" : "OFOQ For Business Solutions"}</title>
        <meta
          name="description"
          content={isRtl
            ? "شريكك الموثوق في الموارد البشرية والخدمات الحكومية والتأشيرات وتأسيس الشركات في المملكة العربية السعودية."
            : "Your trusted partner for HR, government services, visas, and company formation in Saudi Arabia."}
        />
        <link rel="canonical" href="https://ofoqhc.com/" />
      </Helmet>

      {/* ══ Splash Screen ══════════════════════════════════════════ */}
      <AnimatePresence>
        {!splashDone && <SplashIntro onDone={handleSplashDone} />}
      </AnimatePresence>

      <div className="bg-[#2B273F] text-white" dir={isRtl ? "rtl" : "ltr"}>

        {/* ══════════════════════════════════════════════════════════
            HERO — فول فيو بورت بالضبط كتسامي
        ══════════════════════════════════════════════════════════ */}
        <section className="relative min-h-dvh flex flex-col justify-end overflow-hidden">
          {/* خلفية بالصورة */}
          <img
            src="/images/riyadh-business-district.jpg"
            alt="الرياض"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          {/* تدرج */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/30 via-[#2B273F]/50 to-[#2B273F]" />

          {/* زخرفة هندسية — تشبه الـ T عند تسامي */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 600 600" className="absolute -right-20 -top-20 w-[600px] h-[600px] opacity-[0.06]" aria-hidden="true">
              <rect x="60" y="60" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
              <rect x="120" y="120" width="220" height="220" stroke="#E5FE04" strokeWidth="1.5" fill="none" />
              <rect x="180" y="180" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
              <line x1="60" y1="280" x2="280" y2="60" stroke="#E5FE04" strokeWidth="1" opacity="0.5" />
              <line x1="120" y1="340" x2="340" y2="120" stroke="#33B27C" strokeWidth="1" opacity="0.5" />
            </svg>
            <svg viewBox="0 0 300 300" className="absolute -left-10 bottom-20 w-[300px] h-[300px] opacity-[0.07]" aria-hidden="true">
              <rect x="30" y="30" width="120" height="120" stroke="#E5FE04" strokeWidth="1" fill="none" />
              <rect x="70" y="70" width="120" height="120" stroke="#33B27C" strokeWidth="1" fill="none" />
            </svg>
          </div>

          {/* المحتوى */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-20 sm:pb-28 pt-36 w-full">
            <motion.div
              initial="hidden"
              animate={splashDone ? "show" : "hidden"}
              variants={stagger}
              className="max-w-5xl"
            >
              {/* العنوان الرئيسي — 3 أسطر مثل تسامي */}
              <motion.h1
                variants={fadeUp}
                className="text-[clamp(2.8rem,8vw,7.5rem)] font-black leading-[1.0] tracking-tight"
              >
                <span className="block text-white/60 font-light">
                  {isRtl ? "نرتّب" : "Boundlessly"}
                </span>
                <span className="block text-white">
                  {isRtl ? "التفاصيل،" : "Elevating"}
                </span>
                <span className="block text-[#33B27C]">
                  {isRtl ? "لتنتفرغ للنمو." : "Business Services"}
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-8 text-white/50 text-lg max-w-md leading-8"
              >
                {isRtl
                  ? "أفق شريكك لتحقيق النمو ضمن رؤية المملكة العربية السعودية."
                  : "OFOQ is your partner to thrive within the Saudi Vision."}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10">
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-3 border border-white/25 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-[#33B27C] hover:bg-[#33B27C] transition-all duration-300"
                >
                  {isRtl ? "استكشف خدماتنا" : "Explore our services"}
                  <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>

            {/* الموقع — أسفل يسار/يمين */}
            <p className={`absolute bottom-8 ${isRtl ? "left-8 sm:left-12" : "right-8 sm:right-12"} text-[10px] tracking-[.35em] text-white/25 uppercase`}>
              Riyadh · Jeddah · KSA
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ABOUT — تقسيم نصف/نصف مع رقم السنة البارز كتسامي
        ══════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          {/* الزخرفة الصغيرة */}
          <div className="flex items-center gap-3 mb-12">
            <svg viewBox="0 0 120 120" fill="none" className="w-12 h-12 opacity-40" aria-hidden="true">
              <rect x="10" y="10" width="40" height="40" stroke="#33B27C" strokeWidth="1.5" fill="none" />
              <rect x="30" y="30" width="40" height="40" stroke="#E5FE04" strokeWidth="1.5" fill="none" />
              <rect x="50" y="50" width="40" height="40" stroke="#33B27C" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* النص */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6"
              >
                {isRtl ? "من نحن" : "About us"}
              </motion.p>

              {/* مثل تسامي: "تأسست سنة XXXX" */}
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                {isRtl ? (
                  <>
                    أفق تأسست منذ{" "}
                    <span className="text-[#E5FE04] italic">2019</span>{" "}
                    وهي شريك{" "}
                    <span className="text-[#33B27C]">موثوق</span>{" "}
                    في السوق السعودي.
                  </>
                ) : (
                  <>
                    OFOQ was established in{" "}
                    <span className="text-[#E5FE04] italic">2019</span>{" "}
                    as a{" "}
                    <span className="text-[#33B27C]">trusted</span>{" "}
                    Saudi market partner.
                  </>
                )}
              </motion.h2>

              <motion.p variants={fadeUp} className="text-white/45 text-base leading-8 max-w-lg mb-8">
                {isRtl
                  ? "تهدف أفق إلى إعادة تعريف معايير الخدمات الإدارية في السوق السعودي لتكون الشريك المفضّل للمنشآت الحكومية والخاصة والدولية. خدماتنا المتكاملة — من الموارد البشرية والخدمات الحكومية إلى تأسيس الشركات والاستثمار — مصمّمة لتمكينك من التركيز على النمو."
                  : "OFOQ aims to redefine administrative service standards in the Saudi market, becoming the preferred partner for government, private, and international organizations. Our end-to-end services — from HR and government services to company formation and investment — are designed to let you focus on growth."}
              </motion.p>

              <motion.div variants={fadeUp}>
                <Link
                  to="/about"
                  className="group inline-flex items-center gap-3 font-black text-sm text-white"
                >
                  <span className="w-10 h-10 rounded-full bg-[#33B27C] flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {isRtl ? "تعرف أكثر عنا" : "Learn more about us"}
                </Link>
              </motion.div>
            </motion.div>

            {/* الصورة + اقتباس — مثل تسامي */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ duration: 0.9, ease }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src="/images/riyadh-business-district.jpg"
                  alt="أفق لحلول الأعمال"
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B273F]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white/60 text-sm leading-relaxed font-light italic">
                    {isRtl
                      ? '"نقود النمو ونحقق التنمية المستدامة بما يتوافق مع رؤية المملكة."'
                      : '"Driving growth & supporting sustainable development in line with Saudi\'s vision."'}
                  </p>
                </div>
              </div>

              {/* بطاقة الإحصائيات */}
              <div className="grid grid-cols-2 gap-3 mt-3">
                {[
                  { n: 200, suffix: "+", label: isRtl ? "عميل راضٍ" : "Satisfied Clients" },
                  { n: 98, suffix: "%", label: isRtl ? "نسبة الرضا" : "Satisfaction Rate" },
                  { n: 50, suffix: "+", label: isRtl ? "خدمة متخصصة" : "Specialized Services" },
                  { n: 7, suffix: "", label: isRtl ? "دول نخدمها" : "Countries Served" },
                ].map(({ n, suffix, label }, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.05] border border-white/8 rounded-xl p-4"
                  >
                    <p className="text-2xl font-black text-white">
                      <Counter to={n} suffix={suffix} />
                    </p>
                    <p className="text-white/40 text-xs mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            رؤيتنا ورسالتنا — مثل تسامي
        ══════════════════════════════════════════════════════════ */}
        <section className="border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
            <div className="grid md:grid-cols-2 gap-px bg-white/8">
              {[
                {
                  label: isRtl ? "رؤيتنا" : "Our Vision",
                  text: isRtl
                    ? "اقتصاد مزدهر مرفوع بخدمات أعمال مبتكرة وحديثة."
                    : "A thriving economy elevated by innovative and state-of-the-art business services.",
                },
                {
                  label: isRtl ? "رسالتنا" : "Our Mission",
                  text: isRtl
                    ? "تمكين الشركات والمؤسسات الحكومية من النمو وتحقيق الكفاءة بتقديم خدمات أعمال موثوقة ورشيقة ورقمية تلبّي احتياجاتها."
                    : "Empowering businesses and government institutions to grow by delivering reliable, agile, and digitally native business services tailored to their needs.",
                },
              ].map(({ label, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease }}
                  className="bg-[#2B273F] p-10 sm:p-14"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">{label}</p>
                  <p className="text-white/60 text-base sm:text-lg leading-8">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            عملاؤنا — Marquee كتسامي
        ══════════════════════════════════════════════════════════ */}
        <section className="border-t border-white/8 py-4">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 pb-4">
            <div className="flex flex-wrap items-end gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-3">
                  {isRtl ? "قطاعات متنوعة" : "Various industries"}
                </p>
                <h2 className="text-3xl sm:text-4xl font-black">
                  {isRtl ? (
                    <>عملاء <span className="text-[#33B27C]">متنوعون</span></>
                  ) : (
                    <>Diverse <span className="text-[#33B27C]">clients</span></>
                  )}
                </h2>
              </div>
              <p className="text-white/35 text-sm max-w-sm">
                {isRtl
                  ? "محفظة متكاملة من الخدمات لعملاء متنوعين."
                  : "Comprehensive portfolio of services for diverse clients."}
              </p>
            </div>
          </div>
          <div className="border-t border-b border-white/8">
            <LogoMarquee />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            الخدمات — 3 بطاقات كبيرة بصور خلفية كتسامي
        ══════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">
                {isRtl ? "منطقة خبرتنا" : "Our area of expertise"}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black">
                {isRtl ? (
                  <>{" "}خدماتنا <span className="text-[#33B27C]">المتكاملة</span></>
                ) : (
                  <>Our <span className="text-[#33B27C]">Services</span></>
                )}
              </h2>
            </div>
            <Link
              to="/services"
              className="text-sm font-bold text-white/50 hover:text-white transition-colors border-b border-white/20 hover:border-white pb-0.5"
            >
              {isRtl ? "جميع الخدمات" : "all services"}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ delay: i * 0.1, duration: 0.8, ease }}
              >
                <Link
                  to={`/services/${cat.slug}`}
                  className="group relative flex flex-col justify-between min-h-[420px] overflow-hidden rounded-2xl p-8 transition-all duration-500"
                >
                  {/* صورة الخلفية */}
                  <img
                    src={cat.image}
                    alt={pick(cat.title, lang)}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale transition-all duration-700 group-hover:opacity-50 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1a1726]/60 via-[#1a1726]/70 to-[#1a1726]/90 group-hover:from-[#2B273F]/50 group-hover:to-[#33B27C]/30 transition-all duration-500" />
                  <div className="absolute inset-0 border border-white/8 rounded-2xl group-hover:border-[#33B27C]/40 transition-colors duration-500" />

                  {/* المحتوى */}
                  <div className="relative z-10">
                    <p className="text-[#E5FE04] text-xs font-black tracking-widest mb-4">0{i + 1}</p>
                    <h3 className="text-2xl font-black text-white leading-tight mb-3">
                      {pick(cat.title, lang)}
                    </h3>
                    <p className="text-white/40 text-sm leading-7 line-clamp-3">
                      {pick(cat.intro, lang)}
                    </p>
                  </div>

                  {/* زر الانتقال */}
                  <div className="relative z-10 flex items-center justify-between mt-8">
                    <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                      {isRtl ? "اعرف أكثر" : "Learn more"}
                    </span>
                    <span className="w-10 h-10 rounded-full border border-white/20 group-hover:border-[#33B27C] group-hover:bg-[#33B27C] flex items-center justify-center transition-all duration-300">
                      <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* صورة توضيحية كتسامي */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease }}
            className="mt-8 relative rounded-2xl overflow-hidden h-48 sm:h-64"
          >
            <img
              src="/images/riyadh-business-district.jpg"
              alt=""
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <p className="text-white/30 text-xs font-bold uppercase tracking-[.3em] mb-3">
                {isRtl ? "لنحوّل أعمالك إلى قصة نجاح!" : "Let's turn your business"}
              </p>
              <p className="text-white text-2xl sm:text-3xl font-black">
                {isRtl ? "لنحوّل أعمالك إلى قصة نجاح!" : "into a success story!"}
              </p>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CTA — كتسامي بالضبط
        ══════════════════════════════════════════════════════════ */}
        <section className="border-t border-white/8">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6">
                {isRtl ? "معاً نصنع الأثر" : "Let's create"}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black leading-tight mb-8">
                {isRtl ? (
                  <>لنصنع <span className="text-[#33B27C]">أثراً مستداماً</span> معاً</>
                ) : (
                  <>Let's create <span className="text-[#33B27C]">sustainable impact</span></>
                )}
              </motion.h2>
              <motion.div variants={fadeUp}>
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 border border-white/25 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-[#33B27C] hover:bg-[#33B27C] transition-all duration-300"
                >
                  {isRtl ? "تواصل معنا" : "Contact us"}
                  <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
