import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, Target, Heart, Users, Globe, TrendingUp, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

const VAL_ICONS = [Heart, TrendingUp, Award, Target];
const STAT_ICONS = [Award, Users, Globe, TrendingUp];

export default function AboutPage() {
  const { t } = useLang();

  const VALUES = [
    { title: t.about.val0t, desc: t.about.val0d, icon: Heart },
    { title: t.about.val1t, desc: t.about.val1d, icon: TrendingUp },
    { title: t.about.val2t, desc: t.about.val2d, icon: Award },
    { title: t.about.val3t, desc: t.about.val3d, icon: Target },
  ];

  const STATS = [
    { icon: Award,      val: t.about.stat0v, label: t.about.stat0l },
    { icon: Users,      val: t.about.stat1v, label: t.about.stat1l },
    { icon: Globe,      val: t.about.stat2v, label: t.about.stat2l },
    { icon: TrendingUp, val: t.about.stat3v, label: t.about.stat3l },
  ];

  return (
    <>
      <Helmet>
        <title>{t.about.metaTitle}</title>
        <meta name="description" content="تعرّف على قصة أفق لحلول الأعمال (OFOQ) — رؤيتنا ومهمتنا وفريقنا المتميز في تقديم حلول رقمية متكاملة للشركات السعودية والخليجية." />
        <link rel="canonical" href="https://ofoqhc.com/about" />
        <meta property="og:title" content={t.about.metaTitle} />
        <meta property="og:url" content="https://ofoqhc.com/about" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.45),rgba(28,43,110,.62)), url('/images/riyadh-towers-palms.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge bg-ofoq-red/20 text-red-200 mb-4">{t.about.badge}</span>
              <h1 className="text-5xl font-black text-white mt-3 mb-5">
                {t.about.heroTitle1}<br />
                <span className="text-ofoq-yellow">{t.about.heroTitle2}</span>
              </h1>
              <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
                {t.about.heroSub}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="section-title mb-6">{t.about.storyTitle}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  {t.about.storyP1}{" "}
                  <strong className="text-navy-700">{t.about.storyVision}</strong>{" "}
                  {t.about.storyP2}
                </p>
                <p>{t.about.storyP3}</p>
                <p>{t.about.storyP4}</p>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 gap-5">
              {STATS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  className="card text-center group hover:shadow-ofoq-red transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-ofoq-red transition-colors">
                    <s.icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-3xl font-black text-navy-700 mb-1">{s.val}</p>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">{t.about.valuesTitle}</h2>
            <p className="section-subtitle">{t.about.valuesSub}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card text-center group hover:shadow-ofoq transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-ofoq-navy flex items-center justify-center mx-auto mb-4 group-hover:bg-ofoq-green transition-colors">
                  <v.icon size={24} className="text-ofoq-yellow group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-navy-700 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">{t.about.teamTitle}</h2>
            <p className="section-subtitle">{t.about.teamSub}</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {t.about.team.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card text-center group hover:shadow-ofoq transition-all hover:-translate-y-1">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ofoq-navy to-navy-600 flex items-center justify-center mx-auto mb-4 shadow-ofoq group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">{member.initials}</span>
                </div>
                <h3 className="font-bold text-navy-700">{member.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">{t.about.ctaTitle}</h2>
          <p className="text-white/60 mb-8">{t.about.ctaSub}</p>
          <Link to="/contact" className="btn-yellow text-base px-8 py-4">
            {t.common.contactToday} <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
