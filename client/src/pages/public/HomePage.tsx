import { Link } from "react-router-dom";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { useRef, useEffect } from "react";
import WireframeCube from "../../components/WireframeCube";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

/* ── Animation presets ──────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

/* ── Animated counter ───────────────────────────────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const val = useMotionValue(0);
  const spring = useSpring(val, { duration: 1600, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v) + suffix);
  useEffect(() => { if (inView) val.set(to); }, [inView, to, val]);
  return <motion.span ref={ref}>{display}</motion.span>;
}

/* ── Arrow icon ─────────────────────────────────────────── */
function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  const { lang, ui } = useLang();
  const rtl = lang === "ar" || lang === "ur";

  const T = {
    badge: ui.home.badge, hero1: ui.home.hero1, hero2: ui.home.hero2, heroSub: ui.home.heroSub,
    cta1: ui.home.request, cta2: ui.home.explore, aboutBadge: ui.home.aboutBadge,
    aboutTitle1: ui.home.aboutTitle1, aboutTitle2: ui.home.aboutTitle2, aboutDesc: ui.home.aboutDesc,
    aboutCta: ui.home.aboutCta, servicesBadge: ui.home.servicesBadge, servicesTitle1: ui.home.servicesTitle1,
    servicesTitle2: ui.home.servicesTitle2, servicesAll: ui.home.servicesAll, moreServices: ui.home.more,
    whyBadge: ui.home.whyBadge, whyTitle: ui.home.whyTitle, ctaTitle1: ui.home.ctaTitle1,
    ctaTitle2: ui.home.ctaTitle2, ctaDesc: ui.home.ctaDesc, contact: ui.home.contact,
  };

  const stats = [
    { n: 200, suffix: "+", label: ui.home.stats[0] },
    { n: 98, suffix: "%", label: ui.home.stats[1] },
    { n: 50, suffix: "+", label: ui.home.stats[2] },
    { n: 7, suffix: "", label: ui.home.stats[3] },
  ];

  const reasons = ui.home.reasons.map((reason, i) => ({ n: `0${i + 1}`, ...reason }));

  return (
    <div className="bg-white text-[#2B273F]">
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta
          name="description"
          content={ui.home.heroSub}
        />
        <link rel="canonical" href="https://ofoqhc.com/" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden bg-[#2B273F]">
        {/* Background image */}
        <img
          src="/images/riyadh-business-district.jpg"
          alt={ui.home.strip1}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.58]"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B273F]/75 via-[#2B273F]/38 to-[#2B273F]/12" />

        {/* Wireframe decorations */}
        <WireframeCube
          color="#33B27C"
          className="absolute -bottom-20 -left-12 h-[520px] w-[640px] opacity-25 sm:opacity-35"
        />
        <WireframeCube
          color="#E5FE04"
          className="absolute right-[4%] top-[8%] h-48 w-60 rotate-6 opacity-50 sm:opacity-65"
        />

        {/* Content */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl grow flex-col justify-end px-6 pb-20 pt-36 sm:px-10 lg:pb-28">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl">
            {/* Badge */}
            <motion.p
              variants={fadeUp}
              className="mb-6 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.3em] text-[#E5FE04]"
            >
              <span className="h-px w-10 bg-[#E5FE04]" />
              {T.badge}
            </motion.p>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl font-black leading-[1.05] text-white sm:text-7xl lg:text-[6.5rem]"
            >
              {T.hero1}
              <br />
              <span className="text-[#33B27C]">{T.hero2}</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-lg text-lg leading-9 text-white/60"
            >
              {T.heroSub}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              {/* Primary */}
              <Link
                to="/client/requests/new"
                className="group flex items-center gap-3 rounded-full bg-[#E5FE04] px-8 py-4 font-black text-[#2B273F] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2B273F] transition-colors group-hover:bg-[#33B27C]">
                  <ArrowIcon className="h-4 w-4 text-[#E5FE04] group-hover:text-white" />
                </span>
                {T.cta1}
              </Link>
              {/* Secondary */}
              <Link
                to="/services"
                className="flex items-center gap-3 rounded-full border border-white/25 px-8 py-4 font-black text-white transition-all duration-300 hover:border-[#33B27C] hover:bg-[#33B27C]"
              >
                {T.cta2}
              </Link>
            </motion.div>
          </motion.div>

          {/* Location */}
          <p className="absolute bottom-8 right-8 text-[10px] tracking-[.35em] text-white/30 sm:right-12">
            RIYADH · JEDDAH · KSA
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BRIEF INTRO + STATS
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.25em] text-[#33B27C]"
            >
              <span className="h-px w-8 bg-[#33B27C]" />
              {T.aboutBadge}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-black leading-tight sm:text-5xl"
            >
              {T.aboutTitle1}
              <br />
              <span className="text-[#33B27C]">{T.aboutTitle2}</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg leading-9 text-[#2B273F]/60"
            >
              {T.aboutDesc}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <Link
                to="/about"
                className="group inline-flex items-center gap-3 font-black text-[#2B273F]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#33B27C] shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                  <ArrowIcon className="h-4 w-4 text-white" />
                </span>
                {T.aboutCta}
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
            variants={stagger}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map(({ n, suffix, label }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-[1.75rem] bg-[#f4f2ed] p-7 transition-transform duration-300 hover:-translate-y-1"
              >
                <p className="text-4xl font-black text-[#2B273F]">
                  <Counter to={n} suffix={suffix} />
                </p>
                <p className="mt-2 text-sm text-[#2B273F]/50">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SERVICE CATEGORIES (TASAMA-inspired)
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#2B273F] px-6 py-20 sm:px-10 lg:py-28">
        <WireframeCube
          color="#33B27C"
          className="absolute -right-20 -top-12 h-[520px] w-[640px] opacity-15"
        />
        <WireframeCube
          color="#E5FE04"
          className="absolute -left-10 bottom-0 h-56 w-72 opacity-10"
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Section header */}
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.25em] text-[#E5FE04]">
                <span className="h-px w-8 bg-[#E5FE04]" />
                {T.servicesBadge}
              </p>
              <h2 className="text-4xl font-black text-white sm:text-5xl">
                {T.servicesTitle1}
                <br />
                <span className="text-[#33B27C]">{T.servicesTitle2}</span>
              </h2>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-3 rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white transition-all duration-300 hover:border-[#33B27C] hover:bg-[#33B27C]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20">
                <ArrowIcon className="h-3.5 w-3.5" />
              </span>
              {T.servicesAll}
            </Link>
          </div>

          {/* Category cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {servicesCatalog.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ delay: i * 0.07, duration: 0.65, ease }}
              >
                <Link
                  to={`/services/${cat.slug}`}
                  className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-white/[0.06] p-6 transition-all duration-500 hover:bg-[#33B27C] hover:shadow-2xl"
                >
                  <img
                    src={cat.image}
                    alt={pick(cat.title, lang)}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover opacity-25 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-35 group-hover:grayscale-0"
                  />
                  <span className="absolute inset-0 bg-[#2B273F]/65 transition-colors group-hover:bg-[#33B27C]/70" />
                  {/* Number */}
                  <span className="relative z-10 text-[11px] font-black tracking-widest text-[#E5FE04] transition-colors group-hover:text-white/70">
                    0{i + 1}
                  </span>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="mb-5 text-xl font-black text-white">
                      {pick(cat.title, lang)}
                    </h3>
                    {/* Sub-services */}
                    <ul className="space-y-2">
                      {cat.services.slice(0, 4).map((s) => (
                        <li
                          key={s.slug}
                          className="flex items-center gap-2.5 text-xs text-white/50 transition-colors group-hover:text-white/80"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#33B27C] transition-colors group-hover:bg-white" />
                          {pick(s.title, lang)}
                        </li>
                      ))}
                      {cat.services.length > 4 && (
                        <li className="text-[11px] text-white/30 transition-colors group-hover:text-white/50">
                          +{cat.services.length - 4} {T.moreServices}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Arrow button */}
                  <div className="mt-6 flex justify-end">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#33B27C] text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-[#33B27C]">
                      <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY OFOQ
      ══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          variants={stagger}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.25em] text-[#33B27C]"
          >
            <span className="h-px w-8 bg-[#33B27C]" />
            {T.whyBadge}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="mb-14 max-w-2xl text-4xl font-black sm:text-5xl"
          >
            {T.whyTitle}
          </motion.h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(({ n, title, desc }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group rounded-[1.75rem] border border-[#2B273F]/10 p-7 transition-all duration-300 hover:border-[#33B27C] hover:shadow-lg"
              >
                <p className="mb-6 text-3xl font-black text-[#33B27C]/25 transition-colors group-hover:text-[#33B27C]">
                  {n}
                </p>
                <h3 className="mb-3 text-lg font-black">{title}</h3>
                <p className="text-sm leading-7 text-[#2B273F]/55">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#2B273F] px-6 py-24 sm:px-10">
        <WireframeCube
          color="#E5FE04"
          className="absolute -left-16 bottom-0 h-72 w-96 opacity-15"
        />
        <WireframeCube
          color="#33B27C"
          className="absolute -right-10 top-0 h-48 w-64 opacity-15"
        />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease }}
            className="text-4xl font-black text-white sm:text-6xl"
          >
            {T.ctaTitle1}
            <br />
            <span className="text-[#33B27C]">{T.ctaTitle2}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.15, ease }}
            className="mt-6 text-lg text-white/55"
          >
            {T.ctaDesc}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.3, ease }}
            className="mt-10"
          >
            <Link
              to="/client/requests/new"
              className="group inline-flex items-center gap-3 rounded-full bg-[#E5FE04] px-10 py-5 font-black text-[#2B273F] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#2B273F] transition-colors group-hover:bg-[#33B27C]">
                <ArrowIcon className="h-4 w-4 text-[#E5FE04] group-hover:text-white" />
              </span>
              {T.contact}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
