import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, Globe, BarChart3, Shield, Zap, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { servicesApi } from "../../api/client";

const ICONS = [TrendingUp, Globe, BarChart3, Shield, Zap, Users];

const DEFAULT_SERVICES = [
  { title: "الاستشارات الاستراتيجية", desc: "نساعدك في رسم خارطة طريق واضحة نحو أهدافك الكبرى بأساليب مدروسة ومبنية على بيانات حقيقية.", features: ["تحليل الوضع الراهن", "رسم خارطة الطريق", "قياس النتائج"] },
  { title: "التحول الرقمي", desc: "نُحوّل عملياتك التقليدية إلى منظومة رقمية متكاملة تزيد الكفاءة وتخفض التكاليف.", features: ["تقييم الجاهزية الرقمية", "خطة التحول المرحلية", "التدريب والتوطين"] },
  { title: "تحليل البيانات والذكاء الاصطناعي", desc: "نحوّل بياناتك الخام إلى رؤى استراتيجية تمنحك ميزة تنافسية حقيقية.", features: ["لوحات قيادة تفاعلية", "نماذج تنبؤية", "تحليل سلوك العملاء"] },
  { title: "تطوير البرمجيات", desc: "حلول برمجية مخصصة بالكامل لاحتياجات عملك — سرعة، موثوقية، وقابلية للتوسع.", features: ["تطبيقات الويب", "تطبيقات الجوال", "APIs والتكاملات"] },
  { title: "التسويق الرقمي", desc: "استراتيجيات تسويق رقمي متكاملة تضعك أمام عملائك في اللحظة المناسبة.", features: ["تحسين محركات البحث (SEO)", "إدارة وسائل التواصل", "الإعلانات المدفوعة"] },
  { title: "الأمن السيبراني", desc: "نحمي أصولك الرقمية من كل التهديدات الحديثة بأحدث الأدوات والممارسات العالمية.", features: ["تقييم المخاطر", "الحماية الاستباقية", "الاستجابة للحوادث"] },
];

export default function ServicesPage() {
  const { data } = useQuery({
    queryKey: ["public-services-page"],
    queryFn: () => servicesApi.list({ isActive: true, limit: 20 }).then((r) => r.data),
  });

  const services = data?.data?.services || [];

  const displayServices = services.length > 0
    ? services.map((s: { _id: string; title: { ar: string }; description?: { ar?: string }; features?: string[] }, i: number) => ({
        title: s.title.ar,
        desc: s.description?.ar || "",
        features: s.features || [],
        icon: ICONS[i % ICONS.length],
      }))
    : DEFAULT_SERVICES.map((s, i) => ({ ...s, icon: ICONS[i % ICONS.length] }));

  return (
    <>
      <Helmet>
        <title>خدماتنا | أفق لحلول الأعمال — حلول رقمية متكاملة للشركات السعودية</title>
        <meta name="description" content="خدمات أفق لحلول الأعمال (OFOQ): الاستشارات الاستراتيجية، التحول الرقمي، تحليل البيانات والذكاء الاصطناعي، تطوير البرمجيات، التسويق الرقمي، الأمن السيبراني — حلول شاملة للشركات السعودية والخليجية." />
        <meta name="keywords" content="خدمات أفق, ofoq services, حلول رقمية, تحول رقمي, استشارات اعمال, تطوير برمجيات, CRM, تسويق رقمي, أمن سيبراني, ذكاء اصطناعي, إدارة مشاريع, خدمات تقنية السعودية" />
        <link rel="canonical" href="https://ofoqhc.com/services" />
        <meta property="og:title" content="خدماتنا | أفق لحلول الأعمال — حلول رقمية شاملة" />
        <meta property="og:description" content="منظومة متكاملة من الخدمات الرقمية لتسريع نمو أعمالك: استشارات، تحول رقمي، AI، برمجيات، تسويق وأمن." />
        <meta property="og:url" content="https://ofoqhc.com/services" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "خدمات أفق لحلول الأعمال",
          "url": "https://ofoqhc.com/services",
          "description": "منظومة متكاملة من الخدمات الرقمية للشركات السعودية والخليجية",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "الاستشارات الاستراتيجية" },
            { "@type": "ListItem", "position": 2, "name": "التحول الرقمي" },
            { "@type": "ListItem", "position": 3, "name": "تحليل البيانات والذكاء الاصطناعي" },
            { "@type": "ListItem", "position": 4, "name": "تطوير البرمجيات" },
            { "@type": "ListItem", "position": 5, "name": "التسويق الرقمي" },
            { "@type": "ListItem", "position": 6, "name": "الأمن السيبراني" }
          ]
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(12,19,56,.48),rgba(28,43,110,.72)), url('/images/riyadh-kingdom-tower.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">خدماتنا</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
              حلول شاملة لنموّ أعمالك
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              من الاستراتيجية إلى التنفيذ — كل ما تحتاجه لبناء مؤسسة رقمية قوية تحت سقف واحد
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
          <h2 className="text-3xl font-black text-white mb-4">هل أنت مستعد للبدء؟</h2>
          <p className="text-white/60 mb-8">تواصل معنا اليوم واحصل على استشارة مجانية مع أحد خبرائنا.</p>
          <Link to="/contact" className="btn-yellow text-base px-8 py-4">
            احصل على استشارة مجانية <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
