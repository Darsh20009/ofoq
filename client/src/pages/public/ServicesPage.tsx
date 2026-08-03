import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Building2, Scale, BadgeCheck, Landmark, Users,
  MonitorSmartphone, TrendingUp, BarChart3,
} from "lucide-react";
import WireframeCube from "../../components/WireframeCube";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const SERVICES = [
  {
    num: "١",
    icon: Building2,
    title: "تأسيس الشركات",
    shortDesc: "نرافقك في كل خطوة من خطوات تأسيس شركتك في المملكة.",
    features: [
      "إعداد عقود التأسيس وصياغتها بما يتوافق مع القوانين المحلية",
      "استخراج إجراءات السجل التجاري والتراخيص اللازمة",
      "الإشراف على كافة الإجراءات التأسيسية حتى الاكتمال",
    ],
    dark: false,
  },
  {
    num: "٢",
    icon: Scale,
    title: "الخدمات القانونية",
    shortDesc: "فريق قانوني متخصص يحمي مصالحك في كل القضايا.",
    features: [
      "صياغة ومراجعة جميع أنواع العقود لحماية مصالحك",
      "تقديم المشورة القانونية في القضايا التجارية والعمالية",
      "التمثيل القانوني أمام الجهات القضائية وشبه القضائية",
    ],
    dark: true,
  },
  {
    num: "٣",
    icon: BadgeCheck,
    title: "تسجيل العلامات التجارية",
    shortDesc: "نحمي هويتك التجارية ونضمن حقوق ملكيتك الفكرية.",
    features: [
      "دراسة وتحليل إمكانية تسجيل العلامة التجارية",
      "تقديم طلبات التسجيل ومتابعتها مع الجهات المختصة",
      "الحفاظ على حقوق العلامة التجارية وتجديدها",
    ],
    dark: false,
  },
  {
    num: "٤",
    icon: Landmark,
    title: "الخدمات الحكومية",
    shortDesc: "نتولى إنهاء معاملاتك الحكومية بسرعة ودقة.",
    features: [
      "إنهاء جميع الإجراءات الحكومية مع الجهات المختلفة",
      "إنهاء إجراءات استقطاب العمالة من سفارات المملكة",
      "استخراج وتجديد التراخيص التجارية والصناعية",
      "إصدار وتجديد إقامات وتأشيرات العمل",
    ],
    dark: true,
  },
  {
    num: "٥",
    icon: Users,
    title: "إدارة الموارد البشرية",
    shortDesc: "حلول متكاملة لإدارة رأس المال البشري من التوظيف إلى التطوير.",
    features: [
      "التوظيف واستقطاب الكفاءات ومساعدتك في اختيار أفضل المرشحين",
      "إدارة الرواتب والأجور وإعداد كشوف الرواتب",
      "وضع خطط التدريب لتطوير مهارات الموظفين",
    ],
    dark: false,
  },
  {
    num: "٦",
    icon: MonitorSmartphone,
    title: "إدارة المنصات الحكومية",
    shortDesc: "نتولى إدارة حساباتك على جميع المنصات الرقمية.",
    features: [
      "منصة قوى: إدارة حسابات الشركة وتسهيل الإجراءات",
      "منصة مقيم: متابعة وإدارة بيانات الموظفين المقيمين",
      "التأمينات الاجتماعية: تسجيل وتحديث بيانات الموظفين",
    ],
    dark: true,
  },
  {
    num: "٧",
    icon: TrendingUp,
    title: "خدمات المستثمرين",
    shortDesc: "نرشدك لاتخاذ قراراتك الاستثمارية الصحيحة.",
    features: [
      "استشارات قانونية ومالية لدعم قرارات الاستثمار",
      "المساعدة في فتح الحسابات البنكية وإتمام المعاملات المالية",
    ],
    dark: false,
  },
  {
    num: "٨",
    icon: BarChart3,
    title: "تأهيل الشركات للإدراج",
    shortDesc: "نهيّئ شركتك للطرح العام في سوق الأسهم السعودي.",
    features: [
      "التحضير للطرح العام (IPO) وتهيئة الشركات لاستيفاء المتطلبات",
      "تجهيز البيانات المالية والوثائق القانونية المطلوبة",
      "ضمان الامتثال لجميع الأنظمة واللوائح التنظيمية",
    ],
    dark: true,
  },
];

export default function ServicesPage() {
  const [active, setActive] = useState(0);
  const svc = SERVICES[active];

  return (
    <div dir="rtl">
      <Helmet>
        <title>خدماتنا — أفق لحلول الأعمال</title>
        <meta name="description" content="خدمات أفق المتكاملة: تأسيس الشركات، الخدمات القانونية، إدارة الموارد البشرية، المنصات الحكومية، وتأهيل الشركات للإدراج." />
        <link rel="canonical" href="https://ofoqhc.com/services" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[55vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.90) 0%, rgba(43,39,63,0.45) 55%, transparent 100%), url('/images/aramco-tower-sunset.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 bottom-4 opacity-18 pointer-events-none">
          <WireframeCube className="w-64 h-44 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 relative z-10 w-full">
          <div className="flex items-center gap-2 text-white/45 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">خدماتنا</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-white"
          >
            خدماتنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/55 text-sm mt-2"
          >
            حلول متكاملة لكل احتياجات عملك
          </motion.p>
        </div>
      </section>

      {/* ══ بطاقة الخدمة النشطة + القائمة ══════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          {/* شريط الأسهم */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-ofoq-navy">
              الخدمة {svc.num}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActive((p) => Math.min(SERVICES.length - 1, p + 1))}
                disabled={active >= SERVICES.length - 1}
                className="w-10 h-10 rounded-full border-2 border-ofoq-navy/20 flex items-center justify-center text-ofoq-navy hover:border-ofoq-navy transition-colors disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button
                onClick={() => setActive((p) => Math.max(0, p - 1))}
                disabled={active <= 0}
                className="w-10 h-10 rounded-full bg-ofoq-green flex items-center justify-center text-white hover:bg-ofoq-green-dark transition-colors disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* بطاقة الخدمة الرئيسية */}
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`lg:col-span-7 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[360px] ${
                svc.dark ? "bg-ofoq-navy text-white" : "bg-white text-ofoq-navy"
              }`}
            >
              <div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 ${
                    svc.dark ? "bg-white/10 text-white/60" : "bg-ofoq-navy/8 text-ofoq-navy/70"
                  }`}
                >
                  الخدمات {svc.num}
                </span>
                <h3
                  className={`text-3xl sm:text-4xl font-black mb-4 ${
                    svc.dark ? "text-ofoq-yellow" : "text-ofoq-green"
                  }`}
                >
                  {svc.title}
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${svc.dark ? "text-white/65" : "text-gray-500"}`}>
                  {svc.shortDesc}
                </p>
                <ul className="space-y-3">
                  {svc.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          svc.dark ? "bg-ofoq-green/20" : "bg-ofoq-green/15"
                        }`}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className={`text-sm leading-relaxed ${svc.dark ? "text-white/70" : "text-gray-600"}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-end justify-between mt-8">
                <Link
                  to="/contact"
                  className={`flex items-center gap-2 text-sm font-bold transition-all hover:gap-3 ${
                    svc.dark ? "text-ofoq-yellow" : "text-ofoq-green"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  اطلب الخدمة
                </Link>
                <div className={`opacity-15 ${svc.dark ? "text-ofoq-green" : "text-ofoq-navy"}`}>
                  <WireframeCube className="w-28 h-20" color={svc.dark ? "#33B27C" : "#2B273F"} />
                </div>
              </div>
            </motion.div>

            {/* قائمة جانبية */}
            <div className="lg:col-span-5 space-y-2">
              {SERVICES.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.num}
                    onClick={() => setActive(i)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-right transition-all border ${
                      active === i
                        ? "bg-ofoq-navy text-white border-ofoq-navy shadow-md"
                        : "bg-white text-ofoq-navy border-gray-100 hover:border-ofoq-green/30 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        active === i ? "bg-ofoq-green/20" : "bg-ofoq-navy/8"
                      }`}
                    >
                      <Icon size={16} className={active === i ? "text-ofoq-green" : "text-ofoq-navy"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm truncate ${active === i ? "text-white" : "text-ofoq-navy"}`}>
                        {s.title}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${active === i ? "text-white/55" : "text-gray-400"}`}>
                        الخدمة {s.num}
                      </p>
                    </div>
                    {active === i && (
                      <span className="w-2 h-2 rounded-full bg-ofoq-green flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(135deg, #2B273F 0%, #1A1730 100%)" }}
      >
        <div className="absolute left-0 bottom-0 opacity-12 pointer-events-none">
          <WireframeCube className="w-72 h-52 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 text-center">
          <p className="text-white/40 text-sm mb-3">تحتاج إلى استشارة؟</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            نحن هنا{" "}
            <span className="text-ofoq-yellow">لمساعدتك</span>
          </h2>
          <Link
            to="/contact"
            className="inline-flex items-center gap-3 bg-white text-ofoq-navy font-bold text-sm px-4 py-3 rounded-full hover:shadow-lg transition-all"
          >
            <span className="w-9 h-9 rounded-full bg-ofoq-yellow flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2B273F" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </span>
            <span className="pl-2">تواصل مع فريقنا</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
