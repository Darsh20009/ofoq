import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useCallback, useEffect, useRef, useState } from "react";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";
import OfoqLogo from "../../components/OfoqLogo";

/* ══ Animation presets ══════════════════════════════════════════ */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.15 } } };

/* ══ Grid overlay — exactly like tasama ════════════════════════ */
const GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

/* ══ Splash screen — fast brand intro, completed in three seconds ══ */
function SplashIntro({ onDone }: { onDone: () => void }) {
  const [typedCount, setTypedCount] = useState(0);
  const [strikeVisible, setStrikeVisible] = useState(false);
  const [showDomain, setShowDomain] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const { lang, dir } = useLang();

  const messages: Record<string, string> = {
    ar: "خدمات ترتقي بالشركات",
    en: "Services that elevate businesses",
    ur: "کاروبار کو ترقی دینے والی خدمات",
    hi: "व्यवसायों को आगे बढ़ाने वाली सेवाएँ",
    id: "Layanan yang mengangkat bisnis",
    de: "Services, die Unternehmen voranbringen",
    es: "Servicios que impulsan empresas",
  };
  const message = messages[lang] ?? messages.en;

  useEffect(() => {
    let index = 0;
    const typingInterval = window.setInterval(() => {
      index += 1;
      setTypedCount(index);
      if (index >= message.length) window.clearInterval(typingInterval);
    }, Math.max(22, Math.floor(1000 / message.length)));

    const strikeTimer = window.setTimeout(() => setStrikeVisible(true), 1250);
    // Swap the content while the red panel is fully covering it, then reveal
    // the link through the panel's synchronized retracting motion.
    const domainTimer = window.setTimeout(() => setShowDomain(true), 1540);
    const removeStrikeTimer = window.setTimeout(() => setStrikeVisible(false), 1840);
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), 2540);
    const doneTimer = window.setTimeout(onDone, 3000);

    return () => {
      window.clearInterval(typingInterval);
      window.clearTimeout(strikeTimer);
      window.clearTimeout(removeStrikeTimer);
      window.clearTimeout(domainTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, [message, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      dir={dir}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#2B273F]"
    >
      <div className="relative z-10 flex w-[min(92vw,900px)] flex-col items-center text-center">
        <div className="relative inline-grid max-w-full overflow-hidden px-1">
          <AnimatePresence mode="wait" initial={false}>
            {showDomain ? (
              <motion.a
                key="domain"
                href="https://www.ofoqhc.com"
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.82, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease }}
                className="col-start-1 row-start-1 self-center text-xs font-light uppercase tracking-[.35em] text-[#E5FE04] sm:text-sm"
              >
                www.ofoqhc.com
              </motion.a>
            ) : (
              <motion.p
                key="message"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="col-start-1 row-start-1 min-h-[1.2em] self-center text-sm font-black leading-tight tracking-[-.02em] text-white sm:text-base lg:text-xl"
              >
                {message.slice(0, typedCount)}
                <span className="ml-1 inline-block h-[.8em] w-[.05em] translate-y-[.08em] animate-pulse bg-[#E5FE04]" />
              </motion.p>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {strikeVisible && (
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.3, ease }}
                className="pointer-events-none absolute inset-0 z-20 origin-right bg-[#C13229]"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ══ Client logos — supplied brand marks, prepared without backgrounds ══ */
const CLIENT_LOGOS = Array.from({ length: 10 }, (_, index) => ({
  src: `/images/client-logos/client-${String(index + 1).padStart(2, "0")}.png`,
  alt: `شعار عميل أفق ${index + 1}`,
}));

const SERVICE_CARD_THEMES = [
  {
    dark: true,
    card: "bg-[#171522] text-white",
    overlay: "bg-gradient-to-b from-[#171522]/30 via-[#171522]/58 to-[#171522]/95",
    badge: "border-white/20 bg-white/10 text-[#E5FE04]",
    number: "text-[#E5FE04]",
    copy: "text-white/75",
    action: "bg-white text-[#2B273F]",
  },
  {
    dark: false,
    card: "bg-[#F9F8F3] text-[#2B273F]",
    overlay: "bg-gradient-to-b from-white/82 via-[#F9F8F3]/84 to-[#F9F8F3]/98",
    badge: "border-[#2B273F]/15 bg-white text-[#33B27C]",
    number: "text-[#33B27C]",
    copy: "text-[#2B273F]/70",
    action: "border border-[#2B273F]/15 bg-white text-[#2B273F]",
  },
  {
    dark: true,
    card: "bg-[#247C5A] text-white",
    overlay: "bg-gradient-to-b from-[#247C5A]/25 via-[#247C5A]/62 to-[#1E6148]/96",
    badge: "border-white/25 bg-white/10 text-[#E5FE04]",
    number: "text-[#E5FE04]",
    copy: "text-white/80",
    action: "bg-[#E5FE04] text-[#2B273F]",
  },
  {
    dark: false,
    card: "bg-[#E5FE04] text-[#2B273F]",
    overlay: "bg-gradient-to-b from-[#E5FE04]/55 via-[#E5FE04]/78 to-[#E5FE04]/96",
    badge: "border-[#2B273F]/15 bg-white/70 text-[#2B273F]",
    number: "text-[#2B273F]",
    copy: "text-[#2B273F]/75",
    action: "bg-[#2B273F] text-white",
  },
] as const;

/* ══ Main component ═════════════════════════════════════════════ */
export default function HomePage() {
  const { lang, dir, ui } = useLang();
  const isRtl = dir === "rtl";
  const [splashDone, setSplashDone] = useState(false);
  const [servicePreviewIndex, setServicePreviewIndex] = useState(0);
  const servicesRailRef = useRef<HTMLDivElement>(null);
  const [servicesRailProgress, setServicesRailProgress] = useState(0);

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
  }, []);

  const aboutDetail = lang === "ar"
    ? "نقدّم حلول أعمال متكاملة تدعم الكفاءة التشغيلية، وتُسهّل رحلة المنشآت من التأسيس إلى النمو بثقة."
    : "We deliver integrated business solutions that strengthen operational efficiency and support companies from formation to confident growth.";
  const aboutQuote = lang === "ar"
    ? "خدمات أعمال تعزّز النمو وتدعم التنمية المستدامة بما يتماشى مع رؤية السعودية"
    : "Business services that advance sustainable growth in line with Saudi Vision.";
  const joinOfoqTitle = lang === "ar" ? "كن جزءًا من أفق" : "Be part of OFOQ";
  const joinOfoqDescription = lang === "ar"
    ? "انضم إلى أفق وكن جزءًا من رحلة نمو نصنع فيها حلولًا أوضح، وأعمالًا أقوى، ومستقبلًا أوسع."
    : "Join OFOQ and be part of a growth journey built around clearer solutions, stronger businesses, and a wider horizon.";
  const portalTitle = lang === "ar"
    ? "جميع خدمات أعمالك في مكان واحد"
    : "All your business services in one place";
  const portalDescription = lang === "ar"
    ? "توفّر بوابة أفق لحلول الأعمال للشركات داخل المملكة وخارجها منظومة متكاملة من الخدمات، تدعم تأسيس أعمالكم وتشغيلها وتوسيع نطاقها."
    : "OFOQ's business portal gives companies inside and outside Saudi Arabia one connected place to establish, operate, and expand their businesses.";
  const portalDetail = lang === "ar"
    ? "من إدارة الموارد البشرية والرواتب إلى الخدمات الحكومية والتأسيس والاستشارات، تقدّم أفق تجربة موحّدة واضحة وسريعة، مع متابعة عملية في كل مرحلة."
    : "From HR and payroll to government services, formation, and advisory support, OFOQ brings every step into one clear and efficient experience.";
  const portalEntryLabel = lang === "ar" ? "الدخول إلى بوابة أفق" : "Open the OFOQ client portal";
  const portalDiscoverLabel = lang === "ar" ? "اكتشف المزيد" : "Discover more";
  const activeServicePreview = servicesCatalog[servicePreviewIndex];

  const updateServicesRailProgress = () => {
    const rail = servicesRailRef.current;
    if (!rail) return;
    const maxScroll = rail.scrollWidth - rail.clientWidth;
    setServicesRailProgress(maxScroll > 0 ? Math.min(1, Math.abs(rail.scrollLeft) / maxScroll) : 0);
  };

  const scrollServicesRail = (direction: "next" | "previous") => {
    const rail = servicesRailRef.current;
    if (!rail) return;
    const distance = rail.clientWidth * 0.84;
    const advance = direction === "next" ? distance : -distance;
    rail.scrollBy({ left: isRtl ? -advance : advance, behavior: "smooth" });
  };

  useEffect(() => {
    const scrollToHash = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  useEffect(() => {
    const previewTimer = window.setInterval(() => {
      setServicePreviewIndex((index) => (index + 1) % servicesCatalog.length);
    }, 3600);
    return () => window.clearInterval(previewTimer);
  }, []);

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={ui.home.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/" />
      </Helmet>

      <AnimatePresence>
        {!splashDone && <SplashIntro onDone={handleSplashDone} />}
      </AnimatePresence>

      <div dir={dir}>

        {/* ════════════════════════════════════════════════════════
            HERO — OFOQ reference: deep blue field, warm wireframe,
            directional light, and a white header provided by the layout.
        ════════════════════════════════════════════════════════ */}
        <section className="relative isolate flex min-h-dvh overflow-hidden bg-[#2B273F] pt-16 sm:pt-[72px]">
          <div className="absolute inset-0 bg-[#2B273F]" />

          {/* The creative mark belongs to the hero itself; it is not fixed to the viewport. */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 0.13, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className={`pointer-events-none absolute bottom-[-8%] z-[1] ${
              isRtl ? "left-[-13%] sm:left-[-4%]" : "right-[-13%] sm:right-[-4%]"
            }`}
          >
            <OfoqLogo className="relative h-[300px] w-[430px] sm:h-[390px] sm:w-[560px]" />
          </motion.div>

          <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-6 py-20 sm:px-10 sm:py-24">
            <motion.div
              initial="hidden"
              animate={splashDone ? "show" : "hidden"}
              variants={stagger}
              className={`w-full max-w-2xl ${isRtl ? "mr-auto text-right sm:mr-0 sm:pr-[7%]" : "ml-auto text-left sm:ml-0 sm:pl-[7%]"}`}
            >
              <motion.p variants={fadeUp} className="mb-6 text-[10px] font-bold uppercase tracking-[.28em] text-[#E5FE04]">
                {ui.home.badge}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="text-[clamp(3.1rem,7vw,6.8rem)] font-medium leading-[1.12] tracking-[-.045em]"
              >
                <span className="block text-white">{ui.home.hero1}</span>
                <span className="block font-black text-[#E5FE04]">
                  {ui.home.hero2}
                  {ui.home.hero3 ? ` ${ui.home.hero3}` : ""}
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-8 max-w-xl text-base leading-9 text-white/80 sm:text-lg">
                {ui.home.heroSub}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  to="/services"
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-2.5 pl-6 pr-3 text-sm font-extrabold text-[#2B273F] shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-all duration-300 hover:-translate-y-0.5"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#33B27C] text-xl font-normal text-white transition-transform duration-300 group-hover:translate-x-0.5">
                    {isRtl ? "←" : "→"}
                  </span>
                  {ui.home.explore}
                </Link>
                <Link
                  to="/request"
                  className="text-sm font-bold text-white/75 underline decoration-white/35 underline-offset-8 transition-colors hover:text-white"
                >
                  {ui.home.request}
                </Link>
              </motion.div>
            </motion.div>

            <p className={`absolute bottom-8 ${isRtl ? "right-6 sm:right-10" : "left-6 sm:left-10"} text-[9px] tracking-[.38em] text-white/28 uppercase`}>
              OFOQHC.COM
            </p>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            ABOUT — editorial story, portrait, then city image
        ════════════════════════════════════════════════════════ */}
        <section id="about" className="bg-white text-[#2B273F]">
          <div className="mx-auto max-w-4xl px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              variants={stagger}
              className={isRtl ? "text-right" : "text-left"}
            >
              <motion.div variants={fadeUp} className="mb-7">
                <OfoqLogo className="h-8 w-11" dark />
              </motion.div>
              <motion.p variants={fadeUp} className="mb-4 text-xs font-black tracking-[.16em] text-[#33B27C]">
                {ui.home.aboutBadge}
              </motion.p>
              <motion.h2 variants={fadeUp} className="max-w-3xl text-4xl font-black leading-[1.2] tracking-[-.03em] sm:text-6xl">
                {ui.home.aboutTitle1}{" "}
                <span className="text-[#33B27C]">{ui.home.aboutTitle2}</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-8 max-w-3xl text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9">
                {ui.home.aboutDesc}
              </motion.p>
              <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9">
                {aboutDetail}
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9">
                <Link to="/about" className="group inline-flex items-center gap-3 text-sm font-black text-[#2B273F]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#33B27C] transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {ui.home.aboutCta}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              id="about-story"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.8, ease }}
              className={`mt-20 flex items-center gap-4 ${isRtl ? "justify-end text-right" : "justify-start text-left"}`}
            >
              <div className="relative h-16 w-16 shrink-0 rounded-full border-[3px] border-[#33B27C] bg-white p-1 shadow-sm">
                <img src="/images/about-person.png" alt="" className="h-full w-full rounded-full object-cover object-top" />
                <span className="absolute -bottom-1 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#E5FE04] text-lg font-black leading-none text-[#2B273F]">“</span>
              </div>
              <p className="max-w-xl text-lg font-bold leading-8 text-[#2B273F] sm:text-xl">
                {aboutQuote}
              </p>
            </motion.div>

            <motion.figure
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.9, ease }}
              className="mt-8 overflow-hidden rounded-sm"
            >
              <img
                src="/images/riyadh-business-district.jpg"
                alt="منطقة الأعمال في الرياض"
                className="block h-auto w-full object-contain"
              />
            </motion.figure>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            VISION / MISSION — image-led vision and blue mission field
        ════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden bg-[#2B273F] text-white">
          <div className="relative h-[330px] overflow-hidden sm:h-[480px] lg:h-[560px]">
            <img
              src="/images/riyadh-business-district.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[#17142A]/65" />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.75, ease }}
              className={`absolute bottom-8 z-10 max-w-xl px-6 sm:bottom-12 sm:px-10 lg:px-16 ${
                isRtl ? "right-0 text-right" : "left-0 text-left"
              }`}
            >
              <p className="mb-3 text-lg font-black sm:text-2xl">{ui.about.visionLabel}</p>
              <p className="text-base font-medium leading-7 text-white/90 sm:text-xl sm:leading-9">
                {ui.about.visionText}
              </p>
            </motion.div>
          </div>

          <div className="relative min-h-[370px] overflow-hidden px-6 py-12 sm:min-h-[460px] sm:px-10 sm:py-16 lg:px-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-8%] left-1/2 z-0 -translate-x-1/2 opacity-[0.08]"
            >
              <OfoqLogo className="h-[390px] w-[550px] sm:h-[520px] sm:w-[730px]" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.75, ease }}
              className={`relative z-10 max-w-4xl ${isRtl ? "ml-auto text-right" : "mr-auto text-left"}`}
            >
              <p className="mb-3 text-xl font-black sm:text-3xl">{ui.about.missionTitle}</p>
              <p className="text-base font-medium leading-7 text-white/90 sm:text-xl sm:leading-9">
                {ui.about.missionText}
              </p>
            </motion.div>

            <svg
              aria-hidden="true"
              viewBox="0 0 900 440"
              className={`pointer-events-none absolute -bottom-32 h-[390px] w-[760px] text-[#E5FE04]/75 sm:-bottom-24 sm:h-[500px] sm:w-[980px] ${
                isRtl ? "-left-36" : "-right-36"
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M0 395 355 310 545 410 170 438 0 350Z" />
              <path d="M170 438V235l375-93v268" />
              <path d="m170 235 355 100 375-90" />
              <path d="M545 142v268" />
              <path d="M510 430C595 255 700 112 900 18" />
              <path d="M645 438c78-152 160-241 310-310" />
              <path d="M720 440c70-99 127-152 230-187" />
            </svg>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CLIENTS — paired continuous logo columns
        ════════════════════════════════════════════════════════ */}
        <section className="overflow-hidden bg-white">
          <div className="mx-auto max-w-4xl px-6 pt-20 text-center sm:px-10 sm:pt-28">
            <p className="mb-2 text-sm font-black text-[#2B273F] sm:text-lg">
              {ui.home.clientsBadge}
            </p>
            <h2 className="text-4xl font-black tracking-[-.045em] text-[#2B273F] sm:text-6xl">
              {ui.home.clientsTitle1}{" "}
              <span className="text-[#C5B278]">{ui.home.clientsTitle2}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#2B273F]/70 sm:text-lg">
              {ui.home.clientsDesc}
            </p>
          </div>

          <div className="relative mx-auto mt-12 h-[470px] max-w-3xl overflow-hidden px-8 sm:mt-16 sm:h-[610px] sm:px-14">
            <div className="grid h-full grid-cols-2 gap-x-12 sm:gap-x-28">
              <motion.div
                aria-label="شعارات عملاء أفق"
                animate={{ y: isRtl ? ["0%", "-50%"] : ["-50%", "0%"] }}
                transition={{ duration: 27, ease: "linear", repeat: Infinity }}
                className="flex flex-col"
              >
                {[0, 1].map((repeat) => (
                  <div key={repeat} className="flex flex-col gap-12 pb-12 sm:gap-16 sm:pb-16">
                    {CLIENT_LOGOS.filter((_, index) => index % 2 === 0).map((logo) => (
                      <div key={`${repeat}-${logo.src}`} className="flex h-16 items-center justify-center sm:h-20">
                        <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>

              <motion.div
                aria-label="شعارات عملاء أفق"
                animate={{ y: isRtl ? ["-50%", "0%"] : ["0%", "-50%"] }}
                transition={{ duration: 27, ease: "linear", repeat: Infinity }}
                className="flex flex-col"
              >
                {[0, 1].map((repeat) => (
                  <div key={repeat} className="flex flex-col gap-12 pb-12 sm:gap-16 sm:pb-16">
                    {CLIENT_LOGOS.filter((_, index) => index % 2 === 1).map((logo) => (
                      <div key={`${repeat}-${logo.src}`} className="flex h-16 items-center justify-center sm:h-20">
                        <img src={logo.src} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent sm:h-24" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:h-24" />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            SERVICES — OFOQ editorial cards
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#2B273F] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
          <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -80px 0px" }}
              transition={{ duration: 0.8, ease }}
              className="mx-auto flex max-w-xl flex-col items-center text-center"
            >
              <p className="text-xs font-black tracking-[.18em] text-[#33B27C] sm:text-sm">
                {ui.services.areaBadge}
              </p>
              <div className="relative mt-7 h-24 w-full max-w-md overflow-hidden rounded-full border border-white/15 bg-[#171522] p-1 sm:h-28">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeServicePreview.slug}
                    src={activeServicePreview.image}
                    alt={pick(activeServicePreview.title, lang)}
                    initial={{ opacity: 0, scale: 1.12, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 0.78, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: isRtl ? 20 : -20 }}
                    transition={{ duration: 0.65, ease }}
                    className="h-full w-full rounded-full object-cover"
                  />
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2B273F]/60 via-transparent to-[#2B273F]/60" />
                <motion.div
                  key={`service-wipe-${servicePreviewIndex}`}
                  initial={{ x: isRtl ? "120%" : "-120%" }}
                  animate={{ x: isRtl ? "-120%" : "120%" }}
                  transition={{ duration: 0.8, ease: "easeInOut", delay: 0.08 }}
                  className="pointer-events-none absolute inset-y-0 w-24 -skew-x-12 bg-[#E5FE04]/85 mix-blend-screen"
                />
                <motion.div
                  key={`service-line-${servicePreviewIndex}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.95, times: [0, 0.2, 1], ease: "easeOut" }}
                  className={`pointer-events-none absolute inset-y-0 w-px bg-white/90 ${isRtl ? "right-1/2 origin-right" : "left-1/2 origin-left"}`}
                />
              </div>
              <h2 className="mt-8 text-4xl font-black leading-[1.12] tracking-[-.045em] sm:text-6xl">
                {ui.services.choose}
                <span className="mt-1 block text-[#E5FE04]">{ui.services.yourService}</span>
              </h2>
              <Link
                to="/services"
                className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white py-2 ps-2 pe-5 text-sm font-black text-[#2B273F] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#33B27C] text-white transition-transform duration-300 group-hover:-translate-x-1">
                  <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {ui.home.servicesAll}
              </Link>
            </motion.div>

            <div className="mx-auto mt-16 flex max-w-6xl items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-xs font-black tracking-[.18em] text-white/55">
                <span className="text-[#E5FE04]">01</span>
                <span className="h-px w-12 bg-white/20 sm:w-20" />
                <span>{String(servicesCatalog.length).padStart(2, "0")}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollServicesRail("previous")}
                  aria-label={lang === "ar" ? "الخدمة السابقة" : "Previous service"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#E5FE04] hover:bg-[#E5FE04] hover:text-[#2B273F]"
                >
                  <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`} aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollServicesRail("next")}
                  aria-label={lang === "ar" ? "الخدمة التالية" : "Next service"}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2B273F] transition-transform hover:scale-105"
                >
                  <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              ref={servicesRailRef}
              onScroll={updateServicesRailProgress}
              className="mt-6 -mx-6 overflow-x-auto overscroll-x-contain scroll-smooth px-6 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-10 sm:px-10"
            >
              <div className="flex w-max snap-x snap-mandatory gap-5">
              {servicesCatalog.map((cat, i) => {
                const theme = SERVICE_CARD_THEMES[i % SERVICE_CARD_THEMES.length];
                return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 42 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ delay: (i % 4) * 0.1, duration: 0.8, ease }}
                  className="w-[82vw] max-w-[330px] shrink-0 snap-start sm:w-[310px]"
                >
                  <Link
                    to={`/services/${cat.slug}`}
                    className={`group relative flex min-h-[410px] flex-col justify-between overflow-hidden rounded-md p-7 transition-transform duration-500 hover:-translate-y-2 sm:min-h-[465px] ${theme.card}`}
                  >
                    <img
                      src={cat.image}
                      alt={pick(cat.title, lang)}
                      loading="lazy"
                      className={`absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                        theme.dark ? "opacity-35 grayscale group-hover:grayscale-0" : "opacity-25"
                      }`}
                    />
                    <div className={`absolute inset-0 ${theme.overlay}`} />
                    {!theme.dark && (
                      <OfoqLogo dark className="pointer-events-none absolute -bottom-10 -left-14 h-44 w-64 opacity-[0.05]" />
                    )}

                    <div className="relative z-10">
                      <span className={`inline-flex rounded-full border px-4 py-1.5 text-[11px] font-black ${theme.badge}`}>
                        {ui.services.areaBadge}
                      </span>
                      <p className={`mt-7 text-xs font-black tracking-[.2em] ${theme.number}`}>
                        0{i + 1}
                      </p>
                      <h3 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                        {pick(cat.title, lang)}
                      </h3>
                      <p className={`mt-4 text-sm leading-7 ${theme.copy}`}>
                        {pick(cat.intro, lang)}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-sm font-black">
                        {ui.services.learnMore}
                      </span>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-x-1 ${theme.action}`}>
                        <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
                );
              })}
              </div>
            </div>
            <div className="mx-auto mt-1 h-px max-w-6xl overflow-hidden bg-white/20">
              <motion.div
                animate={{ width: `${12 + servicesRailProgress * 88}%` }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`h-full bg-[#E5FE04] ${isRtl ? "mr-auto" : ""}`}
              />
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            WHY OFOQ — light gray / off-white section
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#f5f4fa] text-gray-900">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[.78fr_1.22fr] lg:gap-20">
              <motion.figure
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -70px 0px" }}
                transition={{ duration: 0.85, ease }}
                className="relative overflow-hidden rounded-[24px] border border-[#2B273F]/10 bg-[#2B273F] p-2"
              >
                <div aria-hidden="true" className="pointer-events-none absolute inset-2 z-10 rounded-[18px] bg-[#2B273F]/10 backdrop-blur-[2px]" />
                <img
                  src="/images/ofoq-client-portal-dashboard.png"
                  alt={lang === "ar" ? "لقطة من بوابة عملاء أفق" : "OFOQ client portal preview"}
                  loading="lazy"
                  className="block h-auto max-h-[620px] w-full rounded-[18px] object-contain opacity-95"
                />
              </motion.figure>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ duration: 0.75, ease }}
              className={`mt-14 max-w-4xl border-t border-[#2B273F]/10 pt-10 ${isRtl ? "mr-auto text-right" : "ml-auto text-left"}`}
            >
              <p className="mb-4 text-sm font-black text-[#33B27C]">{ui.home.whyBadge}</p>
              <h2 className="max-w-3xl text-3xl font-black leading-[1.2] tracking-[-.04em] text-[#2B273F] sm:text-5xl">
                {portalTitle}
              </h2>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9">
                {portalDescription}
              </p>
              <p className="mt-4 max-w-3xl text-base leading-8 text-[#2B273F]/65 sm:text-lg sm:leading-9">
                {portalDetail}
              </p>
              <div className={`mt-8 flex flex-wrap gap-3 ${isRtl ? "justify-start" : "justify-start"}`}>
                <Link
                  to="/client/login"
                  className="inline-flex items-center gap-3 rounded-full bg-[#2B273F] py-2 pe-6 ps-2 text-sm font-black text-white transition-colors hover:bg-[#33B27C]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B8E8A0] text-[#2B273F]">
                    <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {portalEntryLabel}
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2B273F]/20 px-6 py-3 text-sm font-black text-[#2B273F] transition-colors hover:border-[#33B27C] hover:text-[#33B27C]"
                >
                  {portalDiscoverLabel}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CTA — quiet, centered invitation
        ════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#f8f8f7] text-[#2B273F]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-8 h-[560px] w-[360px] rounded-[100px_0_0_0] border border-[#C5B278]/25 sm:-right-10 sm:w-[430px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-24 h-[470px] w-[250px] border-l border-t border-[#C5B278]/15 sm:w-[310px]"
          />
          <div className="relative z-10 mx-auto max-w-3xl px-6 py-24 text-center sm:px-10 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="mx-auto flex max-w-2xl flex-col items-center"
            >
              <motion.p
                variants={fadeUp}
                className="max-w-md text-base leading-8 text-[#2B273F]/75 sm:text-lg sm:leading-9"
              >
                {ui.home.ctaDesc}
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="mt-10 max-w-xl text-4xl font-black leading-[1.18] tracking-[-.045em] sm:text-6xl"
              >
                <span className="text-[#2B273F]">{ui.home.ctaTitle1}</span>{" "}
                <span className="text-[#33B27C]">{ui.home.ctaTitle2}</span>
              </motion.h2>
              <motion.div variants={fadeUp} className="mt-10">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-white py-2 pe-6 ps-2 text-sm font-black text-[#2B273F] ring-1 ring-[#2B273F]/10 transition-colors hover:text-[#33B27C]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B8E8A0]">
                    <svg viewBox="0 0 16 16" fill="none" className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {ui.home.contact}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white text-[#2B273F]">
          <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-28">
            <div className="border-t border-[#2B273F]/10 pt-12 sm:pt-16">
              <div className={`grid items-end gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 ${isRtl ? "lg:[direction:rtl]" : ""}`}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ duration: 0.7, ease }}
                  className={isRtl ? "text-right" : "text-left"}
                >
                  <h2 className="max-w-md text-4xl font-black leading-[1.15] tracking-[-.04em] sm:text-5xl">
                    {joinOfoqTitle}
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-8 text-[#2B273F]/70 sm:text-lg sm:leading-9">
                    {joinOfoqDescription}
                  </p>
                  <Link
                    to="/contact"
                    className="mt-7 inline-flex border-b border-[#33B27C] pb-2 text-sm font-black text-[#2B273F] transition-colors hover:text-[#33B27C]"
                  >
                    {ui.about.requestService}
                  </Link>
                </motion.div>

                <motion.figure
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ duration: 0.8, ease }}
                  className="overflow-hidden rounded-sm bg-[#2B273F]"
                >
                  <img
                    src="/images/ofoq-brand-photo2.jpg"
                    alt={joinOfoqTitle}
                    loading="lazy"
                    className="block h-auto max-h-[520px] w-full object-cover"
                  />
                </motion.figure>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
