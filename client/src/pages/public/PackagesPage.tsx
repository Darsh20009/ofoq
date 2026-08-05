import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const PACKAGES = [
  {
    name: "الباقة الفضية",
    nameEn: "Silver",
    tagline: "للشركات الناشئة",
    dark: false,
    badge: null,
    features: [
      "وزارة التجارة",
      "منصة سلامة",
      "التأمينات الاجتماعية",
      "خدمات التأمين الطبي",
      "خدمات الزكاة والضريبة",
    ],
  },
  {
    name: "الباقة الذهبية",
    nameEn: "Gold",
    tagline: "الأكثر طلباً",
    dark: true,
    badge: "الأكثر طلباً",
    features: [
      "وزارة التجارة",
      "منصة أبشر ومقيم",
      "منصة سلامة",
      "التأمينات الاجتماعية",
      "خدمات التأمين الطبي",
      "خدمات الزكاة والضريبة",
      "خدمات الاستشارات",
    ],
  },
  {
    name: "الباقة البلاتينية",
    nameEn: "Platinum",
    tagline: "للمؤسسات الكبرى",
    dark: false,
    badge: "الأشمل",
    features: [
      "وزارة التجارة",
      "وزارة الإعلام",
      "منصة أبشر ومقيم",
      "منصة بلدي",
      "منصة سلامة",
      "التأمينات الاجتماعية",
      "خدمات التأمين الطبي",
      "خدمة تخفيف الأعباء",
      "التدريب والتطوير",
      "خدمات الاستشارات",
    ],
  },
];

export default function PackagesPage() {
  return (
    <div>
      <Helmet>
        <title>الباقات — أفق لحلول الأعمال</title>
        <meta name="description" content="اختر باقتك من أفق لحلول الأعمال — الفضية والذهبية والبلاتينية. حلول مصممة لدعم نمو عملك." />
        <link rel="canonical" href="https://ofoqhc.com/packages" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[52vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.92) 0%, rgba(43,39,63,0.50) 55%, transparent 100%), url('/images/hero-riyadh-towers.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 bottom-4 opacity-15 pointer-events-none">
          <WireframeCube className="w-64 h-44 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 relative z-10 w-full">
          <div className="flex items-center gap-2 text-white/45 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">الباقات</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-white"
          >
            اصنع مسار{" "}
            <span className="text-ofoq-yellow">نجاحك</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/55 text-base mt-2"
          >
            اختر الباقة التي تناسب احتياجات عملك
          </motion.p>
        </div>
      </section>

      {/* ══ الباقات ══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`relative rounded-3xl overflow-hidden ${
                  pkg.dark ? "bg-ofoq-navy text-white" : "bg-white text-ofoq-navy"
                } ${pkg.badge === "الأكثر طلباً" ? "ring-2 ring-ofoq-green shadow-xl" : "shadow-md"}`}
              >
                {/* شارة */}
                {pkg.badge && (
                  <div className="absolute top-4 left-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        pkg.badge === "الأكثر طلباً"
                          ? "bg-ofoq-green text-white"
                          : "bg-ofoq-yellow/20 text-ofoq-navy"
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 pt-12">
                  {/* رأس الباقة */}
                  <div className="mb-6">
                    <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${pkg.dark ? "text-ofoq-green" : "text-ofoq-green"}`}>
                      {pkg.nameEn}
                    </p>
                    <h3 className={`text-2xl font-black ${pkg.dark ? "text-white" : "text-ofoq-navy"}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-sm mt-1 ${pkg.dark ? "text-white/50" : "text-gray-400"}`}>
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* المزايا */}
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            pkg.dark ? "bg-ofoq-green/20" : "bg-ofoq-green/10"
                          }`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className={`text-sm ${pkg.dark ? "text-white/75" : "text-gray-600"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* زر الاشتراك */}
                  <Link
                    to="/client/register"
                    className={`w-full flex items-center justify-center gap-3 py-3 rounded-full font-bold text-sm transition-all ${
                      pkg.dark
                        ? "bg-ofoq-green text-white hover:bg-ofoq-green-dark"
                        : "bg-ofoq-navy text-white hover:bg-ofoq-navy-light"
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </span>
                    اشترك الآن
                  </Link>
                </div>

                {/* مكعب ديكور */}
                <div className={`absolute left-0 bottom-0 opacity-8 pointer-events-none ${pkg.dark ? "" : "opacity-5"}`}>
                  <WireframeCube
                    className="w-32 h-24"
                    color={pkg.dark ? "#33B27C" : "#2B273F"}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* جدول المقارنة */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-14"
          >
            <h2 className="text-2xl font-black text-ofoq-navy mb-6 text-center">مقارنة الباقات</h2>
            <div className="bg-white rounded-3xl overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-ofoq-navy text-white">
                      <th className="text-right px-6 py-4 font-bold text-sm">الخدمة</th>
                      <th className="text-center px-4 py-4 font-bold text-sm">فضية</th>
                      <th className="text-center px-4 py-4 font-bold text-sm text-ofoq-yellow">ذهبية</th>
                      <th className="text-center px-4 py-4 font-bold text-sm">بلاتينية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "وزارة التجارة",          s: true,  g: true,  p: true  },
                      { label: "منصة سلامة",              s: true,  g: true,  p: true  },
                      { label: "التأمينات الاجتماعية",     s: true,  g: true,  p: true  },
                      { label: "خدمات التأمين الطبي",      s: true,  g: true,  p: true  },
                      { label: "خدمات الزكاة والضريبة",    s: true,  g: true,  p: true  },
                      { label: "منصة أبشر ومقيم",          s: false, g: true,  p: true  },
                      { label: "خدمات الاستشارات",         s: false, g: true,  p: true  },
                      { label: "وزارة الإعلام",            s: false, g: false, p: true  },
                      { label: "منصة بلدي",               s: false, g: false, p: true  },
                      { label: "خدمة تخفيف الأعباء",       s: false, g: false, p: true  },
                      { label: "التدريب والتطوير",          s: false, g: false, p: true  },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                        <td className="px-6 py-3.5 text-sm text-ofoq-navy font-medium border-b border-gray-50">
                          {row.label}
                        </td>
                        {[row.s, row.g, row.p].map((val, j) => (
                          <td key={j} className="px-4 py-3.5 text-center border-b border-gray-50">
                            {val ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-ofoq-green/15">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="3">
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="inline-block w-4 h-0.5 bg-gray-200 rounded" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(135deg, #2B273F 0%, #1A1730 100%)" }}
      >
        <div className="absolute left-0 bottom-0 opacity-12 pointer-events-none">
          <WireframeCube className="w-72 h-52 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 text-center">
          <p className="text-white/40 text-sm mb-3">هل تحتاج إلى مساعدة في الاختيار؟</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            فريقنا{" "}
            <span className="text-ofoq-yellow">يساعدك</span>
          </h2>
          <Link
            to="/client/requests/new"
            className="inline-flex items-center gap-3 bg-white text-ofoq-navy font-bold text-sm px-4 py-3 rounded-full hover:shadow-lg transition-all"
          >
            <span className="w-9 h-9 rounded-full bg-ofoq-yellow flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B273F" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </span>
            <span className="pl-2">تواصل معنا</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
