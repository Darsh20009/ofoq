import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, ArrowLeft, Star } from "lucide-react";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const PACKAGES = [
  {
    name: "الباقة الفضية",
    nameEn: "Silver",
    tagline: "للشركات الناشئة",
    gradient: "from-slate-400 via-slate-300 to-slate-500",
    bgCard: "bg-gradient-to-br from-slate-50 to-gray-100",
    border: "border-slate-300",
    badge: null,
    features: [
      { text: "وزارة التجارة", included: true },
      { text: "منصة سلامة", included: true },
      { text: "التأمينات الاجتماعية", included: true },
      { text: "خدمات التأمين الطبي", included: true },
      { text: "خدمات الزكاة والضريبة", included: true },
      { text: "منصة أبشر ومقيم", included: false },
      { text: "وزارة الإعلام", included: false },
      { text: "منصة بلدي", included: false },
      { text: "خدمة تخفيف الأعباء", included: false },
      { text: "التدريب والتطوير", included: false },
      { text: "خدمات الاستشارات", included: false },
    ],
  },
  {
    name: "الباقة الذهبية",
    nameEn: "Gold",
    tagline: "الأكثر طلباً",
    gradient: "from-yellow-400 via-amber-300 to-amber-500",
    bgCard: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-300",
    badge: "⭐ موصى بها",
    features: [
      { text: "وزارة التجارة", included: true },
      { text: "منصة أبشر ومقيم", included: true },
      { text: "منصة سلامة", included: true },
      { text: "التأمينات الاجتماعية", included: true },
      { text: "خدمات التأمين الطبي", included: true },
      { text: "خدمات الزكاة والضريبة", included: true },
      { text: "خدمات الاستشارات", included: true },
      { text: "وزارة الإعلام", included: false },
      { text: "منصة بلدي", included: false },
      { text: "خدمة تخفيف الأعباء", included: false },
      { text: "التدريب والتطوير", included: false },
    ],
  },
  {
    name: "الباقة البلاتينية",
    nameEn: "Platinum",
    tagline: "للمؤسسات الكبرى",
    gradient: "from-slate-300 via-slate-100 to-slate-400",
    bgCard: "bg-gradient-to-br from-slate-50 to-slate-100",
    border: "border-slate-200",
    badge: "💎 الأشمل",
    features: [
      { text: "وزارة التجارة", included: true },
      { text: "وزارة الإعلام", included: true },
      { text: "منصة أبشر ومقيم", included: true },
      { text: "منصة بلدي", included: true },
      { text: "منصة سلامة", included: true },
      { text: "التأمينات الاجتماعية", included: true },
      { text: "خدمات التأمين الطبي", included: true },
      { text: "خدمة تخفيف الأعباء", included: true },
      { text: "التدريب والتطوير", included: true },
      { text: "خدمات الاستشارات", included: true },
    ],
  },
];

const COMPARE = [
  { label: "وزارة التجارة",         silver: true,  gold: true,  plat: true  },
  { label: "منصة سلامة",             silver: true,  gold: true,  plat: true  },
  { label: "التأمينات الاجتماعية",    silver: true,  gold: true,  plat: true  },
  { label: "التأمين الطبي",          silver: true,  gold: true,  plat: true  },
  { label: "الزكاة والضريبة",        silver: true,  gold: true,  plat: true  },
  { label: "منصة أبشر ومقيم",        silver: false, gold: true,  plat: true  },
  { label: "خدمات الاستشارات",       silver: false, gold: true,  plat: true  },
  { label: "وزارة الإعلام",          silver: false, gold: false, plat: true  },
  { label: "منصة بلدي",              silver: false, gold: false, plat: true  },
  { label: "خدمة تخفيف الأعباء",    silver: false, gold: false, plat: true  },
  { label: "التدريب والتطوير",       silver: false, gold: false, plat: true  },
];

export default function PackagesPage() {
  return (
    <>
      <Helmet>
        <title>الباقات — أفق لحلول الأعمال</title>
        <meta name="description" content="اكتشف باقات أفق: الفضية والذهبية والبلاتينية — مصممة خصيصاً لدعم نمو أعمالك في المملكة العربية السعودية." />
        <link rel="canonical" href="https://ofoqhc.com/packages" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.65),rgba(28,43,110,.80)), url('/images/riyadh-kingdom-tower.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">الباقات</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
              اصنع مسار نجاحك
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              اكتشف باقات أفق المصممة خصيصاً لدعم نمو أعمالك وإدارتها بثقة — اختر باقتك بما يناسب احتياجك
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages cards */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PACKAGES.map((pkg, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className={`relative rounded-3xl overflow-hidden border-2 ${pkg.border} ${
                  pkg.badge === "⭐ موصى بها" ? "shadow-2xl md:-mt-4" : "shadow-lg"
                } bg-white`}>

                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                    <div className={`text-xs font-black px-6 py-2 rounded-b-xl ${
                      pkg.badge === "⭐ موصى بها"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-ofoq-navy"
                        : "bg-gradient-to-r from-slate-400 to-slate-600 text-white"
                    }`}>
                      {pkg.badge}
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-br ${pkg.gradient} p-7 ${pkg.badge ? "pt-12" : "pt-7"} relative`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="w-32 h-32 rounded-full border-8 border-white absolute -top-8 -left-8" />
                    <div className="w-20 h-20 rounded-full border-4 border-white absolute bottom-2 right-4" />
                  </div>
                  <p className="text-white/70 text-xs font-bold tracking-widest uppercase mb-1">{pkg.nameEn}</p>
                  <h2 className="text-white text-3xl font-black">{pkg.name}</h2>
                  <p className="text-white/70 text-sm mt-1">{pkg.tagline}</p>
                </div>

                {/* Features */}
                <div className="p-7 space-y-3.5">
                  {pkg.features.map((f, j) => (
                    <div key={j} className={`flex items-center gap-3 ${!f.included ? "opacity-40" : ""}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        f.included ? "bg-emerald-100" : "bg-gray-100"
                      }`}>
                        {f.included ? (
                          <CheckCircle size={12} className="text-emerald-600" />
                        ) : (
                          <span className="text-gray-400 text-xs font-bold">×</span>
                        )}
                      </div>
                      <span className={`text-sm ${f.included ? "text-gray-700 font-medium" : "text-gray-400 line-through"}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-7 pb-7">
                  <Link to="/client/register"
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                      pkg.badge === "⭐ موصى بها"
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-ofoq-navy hover:opacity-90 shadow-lg"
                        : "bg-ofoq-navy text-white hover:bg-navy-700"
                    }`}>
                    اشترك الآن <ArrowLeft size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-12">
            <h2 className="section-title">مقارنة الباقات</h2>
            <p className="section-subtitle">تفاصيل الخدمات المتضمنة في كل باقة</p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ofoq-navy text-white">
                  <th className="text-right p-4 font-bold w-48">الخدمة</th>
                  <th className="text-center p-4 font-bold">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-slate-300">الفضية</span>
                      <span className="text-xs text-white/40">Silver</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-bold bg-amber-500/20">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-amber-300">الذهبية ⭐</span>
                      <span className="text-xs text-white/40">Gold</span>
                    </div>
                  </th>
                  <th className="text-center p-4 font-bold">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-slate-200">البلاتينية 💎</span>
                      <span className="text-xs text-white/40">Platinum</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="p-4 font-medium text-navy-700">{row.label}</td>
                    <td className="p-4 text-center">
                      {row.silver ? (
                        <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 font-bold text-lg">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-amber-50/30">
                      {row.gold ? (
                        <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 font-bold text-lg">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.plat ? (
                        <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                      ) : (
                        <span className="text-gray-300 font-bold text-lg">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Star size={32} className="text-ofoq-yellow mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">غير متأكد من الباقة المناسبة؟</h2>
          <p className="text-white/55 mb-8 text-lg">تواصل مع فريقنا وسنساعدك في اختيار الباقة الأنسب لاحتياجات شركتك</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/client/register" className="btn-yellow text-base px-10 py-4">
              ابدأ الاشتراك <ArrowLeft size={18} />
            </Link>
            <Link to="/contact" className="btn-outline border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
              استشر خبيرنا
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
