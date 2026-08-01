import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Star, TrendingUp, Users, Award, Globe, Zap, Shield, BarChart3, ChevronLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { cmsApi, servicesApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";

const SERVICES_ICONS = [TrendingUp, Globe, BarChart3, Shield, Zap, Users];
const WHY_ICONS = [Award, Zap, Users, CheckCircle];

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HomePage() {
  const { t, lang } = useLang();
  const { data: servicesData } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => servicesApi.list({ isActive: true, limit: 6 }).then((r) => r.data),
  });
  const { data: testimonialsData } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: () => cmsApi.testimonials.list().then((r) => r.data),
  });

  const services     = servicesData?.data?.services || [];
  const testimonials = testimonialsData?.data?.testimonials || [];

  const STATS = [
    { value: t.home.stat0v, label: t.home.stat0, icon: Award },
    { value: t.home.stat1v, label: t.home.stat1, icon: Star },
    { value: t.home.stat2v, label: t.home.stat2, icon: Users },
    { value: t.home.stat3v, label: t.home.stat3, icon: Globe },
  ];

  const WHY_US = [
    { title: t.home.whyReason0t, desc: t.home.whyReason0d, icon: Award },
    { title: t.home.whyReason1t, desc: t.home.whyReason1d, icon: Zap },
    { title: t.home.whyReason2t, desc: t.home.whyReason2d, icon: Users },
    { title: t.home.whyReason3t, desc: t.home.whyReason3d, icon: CheckCircle },
  ];

  const DEFAULT_SERVICES = [
    { title: t.home.svc0t, desc: t.home.svc0d },
    { title: t.home.svc1t, desc: t.home.svc1d },
    { title: t.home.svc2t, desc: t.home.svc2d },
    { title: t.home.svc3t, desc: t.home.svc3d },
    { title: t.home.svc4t, desc: t.home.svc4d },
    { title: t.home.svc5t, desc: t.home.svc5d },
  ];

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>{t.home.metaTitle}</title>
        <meta name="description" content="أفق (OFOQ) — منصة إدارة أعمال متكاملة للشركات السعودية والخليجية: CRM، مشاريع، فواتير إلكترونية، عقود، ذكاء اصطناعي. شريكك في التحول الرقمي." />
        <link rel="canonical" href="https://ofoqhc.com/" />
        <meta property="og:title" content="أفق لحلول الأعمال | OFOQ — نظام إداري متكامل" />
        <meta property="og:url" content="https://ofoqhc.com/" />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="min-h-screen flex items-center relative pt-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(8,13,42,.45),rgba(20,35,90,.65)), url('/images/hero-aramco-hq.jpg')" }}
      >
        <div className="absolute top-32 left-16 w-72 h-72 rounded-full bg-ofoq-red/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-56 h-56 rounded-full bg-ofoq-yellow/8 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-ofoq-red/15 border border-ofoq-red/30 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-ofoq-red rounded-full animate-pulse" />
              <span className="text-red-200 text-sm font-medium">{t.home.heroBadge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6"
            >
              {t.home.heroTitle1}
              <br />
              <span className="text-ofoq-red">{t.home.heroTitle2}</span>{" "}
              {t.home.heroTitle3}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/65 text-xl leading-relaxed mb-10 max-w-2xl"
            >
              {t.home.heroSub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/contact" className="btn-yellow text-base px-8 py-4 shadow-ofoq-yellow">
                {t.home.heroCta1}
                <ArrowLeft size={18} />
              </Link>
              <Link to="/services" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white text-base px-8 py-4">
                {t.home.heroCta2}
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-white/55 text-sm mt-8"
            >
              {t.home.heroTrust}
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs">{t.home.scrollDown}</span>
          <div className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-ofoq-navy/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-ofoq-red/10 transition-colors">
                  <stat.icon size={24} className="text-ofoq-red" />
                </div>
                <p className="text-4xl font-black text-ofoq-navy mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="badge-red mb-4">{t.home.servicesBadge}</span>
            <h2 className="section-title mt-2">{t.home.servicesTitle}</h2>
            <p className="section-subtitle max-w-2xl mx-auto">{t.home.servicesSub}</p>
          </motion.div>

          {services.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEFAULT_SERVICES.map((s, i) => {
                const Icon = SERVICES_ICONS[i % SERVICES_ICONS.length];
                return (
                  <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="card-hover group">
                    <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mb-4 group-hover:bg-ofoq-red transition-colors">
                      <Icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-navy-700 text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                    <Link to="/services" className="text-ofoq-red text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      {t.common.learnMore} <ChevronLeft size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s: { _id: string; title: { ar: string; en?: string }; description?: { ar?: string; en?: string }; icon?: string }, i: number) => {
                const Icon = SERVICES_ICONS[i % SERVICES_ICONS.length];
                return (
                  <motion.div key={s._id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="card-hover group">
                    <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mb-4 group-hover:bg-ofoq-red transition-colors">
                      <Icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-navy-700 text-lg mb-2">
                      {lang === "en" && s.title.en ? s.title.en : s.title.ar}
                    </h3>
                    {s.description?.ar && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">
                        {lang === "en" && s.description.en ? s.description.en : s.description.ar}
                      </p>
                    )}
                    <Link to="/services" className="text-ofoq-red text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      {t.common.learnMore} <ChevronLeft size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services" className="btn-outline">
              {t.common.viewAll} <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Photo Section ───────────────────────────────── */}
      <section
        className="relative py-28 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/ofoq-brand-photo2.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-ofoq-navy/95 via-ofoq-navy/80 to-ofoq-navy/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl mr-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block bg-ofoq-red/20 border border-ofoq-red/30 rounded-full px-4 py-1.5 text-red-300 text-sm font-medium mb-6">
                {t.home.brandBadge}
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                {t.home.brandTitle1}<br />
                <span className="text-ofoq-yellow">{t.home.brandTitle2}</span>
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-8">{t.home.brandDesc}</p>
              <Link to="/about" className="btn-yellow inline-flex">
                {t.home.brandCta} <ArrowLeft size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────── */}
      <section
        className="py-24 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.68),rgba(28,43,110,.78)), url('/images/hero-riyadh-towers.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">
                {t.home.whyBadge}
              </span>
              <h2 className="text-4xl font-black text-white mt-2 mb-6 leading-tight">
                {t.home.whyTitle.split(" ").slice(0, -2).join(" ")}<br />
                <span className="text-ofoq-yellow">{t.home.whyTitle.split(" ").slice(-2).join(" ")}</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">{t.home.whySub}</p>
              <Link to="/contact" className="btn-yellow mt-8 inline-flex">
                {t.home.whyCta} <ArrowLeft size={16} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY_US.map((item, i) => (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-ofoq-red/20 flex items-center justify-center mb-3">
                    <item.icon size={20} className="text-red-300" />
                  </div>
                  <h4 className="font-bold text-white mb-1.5">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Strip ─────────────────────────────────────────────── */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.30),rgba(28,43,110,.55)), url('/images/riyadh-itcc-tower.jpg')" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
            <p className="text-white/90 text-2xl sm:text-3xl font-black">
              {t.home.strip1} <span className="text-ofoq-yellow">{t.home.strip2}</span> {t.home.strip3}
            </p>
            <p className="text-white/55 text-sm mt-2">{t.home.stripSub}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-16">
              <span className="badge-red mb-4">{t.home.testimBadge}</span>
              <h2 className="section-title mt-2">{t.home.testimTitle}</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((tm: { _id: string; author: { name: string; company: string; position?: string }; content: { ar: string; en?: string }; rating: number }, i: number) => (
                <motion.div key={tm._id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} className="card-hover">
                  <div className="flex gap-1 mb-4">
                    {[...Array(tm.rating || 5)].map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">
                    "{lang === "en" && tm.content?.en ? tm.content.en : tm.content?.ar}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ofoq-navy flex items-center justify-center text-white font-bold">
                      {tm.author?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-700 text-sm">{tm.author?.name}</p>
                      <p className="text-gray-400 text-xs">{tm.author?.position ? `${tm.author.position}، ` : ""}{tm.author?.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.78),rgba(28,43,110,.88)), url('/images/riyadh-evening.jpg')" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-block px-5 py-2 rounded-full bg-ofoq-yellow/15 border border-ofoq-yellow/30 text-ofoq-yellow text-sm font-medium mb-6">
              {t.home.ctaBadge}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">{t.home.ctaTitle}</h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">{t.home.ctaSub}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-yellow text-base px-8 py-4">
                {t.common.freeConsult} <ArrowLeft size={18} />
              </Link>
              <Link to="/about" className="btn-outline border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                {t.home.ctaBtn2}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
