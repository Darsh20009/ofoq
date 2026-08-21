import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useCallback, useEffect, useState } from "react";
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

  const handleSplashDone = useCallback(() => {
    setSplashDone(true);
  }, []);

  const aboutDetail = lang === "ar"
    ? "نقدّم حلول أعمال متكاملة تدعم الكفاءة التشغيلية، وتُسهّل رحلة المنشآت من التأسيس إلى النمو بثقة."
    : "We deliver integrated business solutions that strengthen operational efficiency and support companies from formation to confident growth.";
  const aboutQuote = lang === "ar"
    ? "خدمات أعمال تعزّز النمو وتدعم التنمية المستدامة بما يتماشى مع رؤية السعودية"
    : "Business services that advance sustainable growth in line with Saudi Vision.";

  useEffect(() => {
    const scrollToHash = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
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
                <motion.div
                  animate={{ x: isRtl ? ["-50%", "0%"] : ["0%", "-50%"] }}
                  transition={{ duration: 24, ease: "linear", repeat: Infinity }}
                  className="flex h-full w-max gap-2"
                >
                  {[0, 1].map((repeat) => (
                    <div key={repeat} className="flex h-full gap-2 pe-2">
                      {servicesCatalog.map((service) => (
                        <img
                          key={`${repeat}-${service.slug}`}
                          src={service.image}
                          alt=""
                          className="h-full w-28 shrink-0 rounded-full object-cover opacity-75 sm:w-36"
                        />
                      ))}
                    </div>
                  ))}
                </motion.div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#2B273F]/70 via-transparent to-[#2B273F]/70" />
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#2B273F] shadow-lg">
                    <svg viewBox="0 0 16 16" className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true">
                      <path d="m5 3 7 5-7 5V3Z" />
                    </svg>
                  </span>
                </span>
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

            <div className="mt-20 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {servicesCatalog.map((cat, i) => {
                const theme = SERVICE_CARD_THEMES[i % SERVICE_CARD_THEMES.length];
                return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 42 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                  transition={{ delay: (i % 4) * 0.1, duration: 0.8, ease }}
                  className={i % 4 === 0 ? "xl:translate-y-10" : i % 4 === 2 ? "xl:translate-y-5" : ""}
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
        </section>

        {/* ════════════════════════════════════════════════════════
            WHY OFOQ — light gray / off-white section
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#f5f4fa] text-gray-900">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">
                {ui.home.whyBadge}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-[#2B273F]">
                {ui.home.whyTitle}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200">
              {(ui.home.reasons ?? []).map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.7, ease }}
                  className="bg-[#f5f4fa] p-8"
                >
                  <div className="w-10 h-10 rounded-full bg-[#33B27C]/15 flex items-center justify-center mb-5">
                    <span className="text-[#33B27C] font-black text-sm">0{i + 1}</span>
                  </div>
                  <h3 className="font-black text-[#2B273F] mb-3">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-7">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════
            CTA — GREEN accent section (tasama style)
        ════════════════════════════════════════════════════════ */}
        <section className="bg-[#33B27C] text-white relative overflow-hidden">
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-32">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl"
            >
              <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-white/60 mb-6">
                {ui.home.ctaTitle1}
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black leading-tight mb-8">
                {ui.home.ctaTitle2}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-lg mb-10">
                {ui.home.ctaDesc}
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 bg-white text-[#33B27C] font-bold text-sm px-8 py-4 rounded-full hover:bg-[#E5FE04] hover:text-[#2B273F] transition-all duration-300"
                >
                  {ui.home.contact}
                  <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 border border-white/40 text-white font-bold text-sm px-8 py-4 rounded-full hover:border-white hover:bg-white/10 transition-all duration-300"
                >
                  {ui.about.badge}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}
