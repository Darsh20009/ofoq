import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, Globe, BarChart3, Shield, Zap, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { servicesApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";

const ICONS = [TrendingUp, Globe, BarChart3, Shield, Zap, Users];

export default function ServicesPage() {
  const { t, lang } = useLang();
  const { data } = useQuery({
    queryKey: ["public-services-page"],
    queryFn: () => servicesApi.list({ isActive: true, limit: 20 }).then((r) => r.data),
  });

  const services = data?.data?.services || [];

  const displayServices = services.length > 0
    ? services.map((s: { _id: string; title: { ar: string; en?: string }; description?: { ar?: string; en?: string }; features?: string[] }, i: number) => ({
        title: lang === "en" && s.title.en ? s.title.en : s.title.ar,
        desc:  lang === "en" && s.description?.en ? s.description.en : (s.description?.ar || ""),
        features: s.features || [],
        icon: ICONS[i % ICONS.length],
      }))
    : t.services.items.map((s, i) => ({ ...s, icon: ICONS[i % ICONS.length] }));

  return (
    <>
      <Helmet>
        <title>{t.services.metaTitle}</title>
        <meta name="description" content="خدمات أفق لحلول الأعمال: الاستشارات الاستراتيجية، التحول الرقمي، تحليل البيانات والذكاء الاصطناعي، تطوير البرمجيات، التسويق الرقمي، الأمن السيبراني." />
        <link rel="canonical" href="https://ofoqhc.com/services" />
        <meta property="og:title" content={t.services.metaTitle} />
        <meta property="og:url" content="https://ofoqhc.com/services" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(12,19,56,.48),rgba(28,43,110,.72)), url('/images/riyadh-kingdom-tower.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">{t.services.badge}</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
              {t.services.heroTitle}
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              {t.services.heroSub}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {displayServices.map((service, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }} viewport={{ once: true }}
                className="card-hover group flex gap-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-ofoq-navy/5 flex items-center justify-center flex-shrink-0 group-hover:bg-ofoq-red transition-colors">
                  <service.icon size={26} className="text-ofoq-navy group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-navy-700 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{service.desc}</p>
                  {service.features.length > 0 && (
                    <ul className="space-y-1.5">
                      {service.features.map((f: string, j: number) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle size={14} className="text-ofoq-red flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">{t.services.ctaTitle}</h2>
          <p className="text-white/60 mb-8">{t.services.ctaSub}</p>
          <Link to="/contact" className="btn-yellow text-base px-8 py-4">
            {t.common.freeConsult} <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
