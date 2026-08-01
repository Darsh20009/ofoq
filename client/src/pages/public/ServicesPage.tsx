import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Building2, Scale, Trademark, Landmark, Users, MonitorSmartphone,
  TrendingUp, BarChart3, ArrowLeft, CheckCircle,
} from "lucide-react";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const SERVICES = [
  {
    icon: Building2,
    num: "أولاً",
    title: "تأسيس الشركات",
    desc: "نرافقك في كل خطوة من خطوات تأسيس شركتك في المملكة العربية السعودية بكفاءة واحترافية.",
    features: [
      "إعداد عقود التأسيس وصياغتها بما يتوافق مع القوانين المحلية",
      "استخراج إجراءات السجل التجاري والتراخيص اللازمة",
      "الإشراف على كافة الإجراءات التأسيسية حتى الاكتمال",
    ],
    accent: "#3B82F6",
  },
  {
    icon: Scale,
    num: "ثانياً",
    title: "الخدمات القانونية",
    desc: "فريق قانوني متخصص يحمي مصالحك ويدعمك في كل القضايا التجارية والعمالية.",
    features: [
      "صياغة ومراجعة جميع أنواع العقود لحماية مصالحك",
      "تقديم المشورة القانونية في القضايا التجارية والعمالية",
      "التمثيل القانوني أمام الجهات القضائية وشبه القضائية",
    ],
    accent: "#8B5CF6",
  },
  {
    icon: Trademark,
    num: "ثالثاً",
    title: "تسجيل العلامات التجارية",
    desc: "نحمي هويتك التجارية ونضمن حقوق ملكيتك الفكرية لدى الجهات الرسمية.",
    features: [
      "دراسة وتحليل إمكانية تسجيل العلامة التجارية",
      "تقديم طلبات التسجيل ومتابعتها مع الجهات المختصة",
      "الحفاظ على حقوق العلامة التجارية وتجديدها",
    ],
    accent: "#F59E0B",
  },
  {
    icon: Landmark,
    num: "رابعاً",
    title: "الخدمات الحكومية",
    desc: "نتولى إنهاء معاملاتك الحكومية بسرعة ودقة لتوفير وقتك وجهدك.",
    features: [
      "إنهاء جميع الإجراءات الحكومية مع الجهات المختلفة",
      "إنهاء إجراءات استقطاب العمالة من سفارات المملكة حول العالم",
      "استخراج وتجديد التراخيص التجارية والصناعية",
      "إصدار وتجديد إقامات وتأشيرات العمل",
    ],
    accent: "#10B981",
  },
  {
    icon: Users,
    num: "خامساً",
    title: "إدارة الموارد البشرية",
    desc: "حلول متكاملة لإدارة رأس المال البشري من التوظيف إلى التطوير.",
    features: [
      "التوظيف واستقطاب الكفاءات ومساعدتك في اختيار أفضل المرشحين",
      "إدارة الرواتب والأجور وإعداد كشوف الرواتب وإدارة الحضور",
      "وضع خطط التدريب لتطوير مهارات الموظفين وتحسين إنتاجيتهم",
    ],
    accent: "#EF4444",
  },
  {
    icon: MonitorSmartphone,
    num: "سادساً",
    title: "إدارة المنصات الحكومية",
    desc: "نتولى إدارة حساباتك على جميع المنصات الحكومية الرقمية.",
    features: [
      "منصة قوى: إدارة حسابات الشركة وتسهيل الإجراءات",
      "منصة مقيم: متابعة وإدارة بيانات الموظفين المقيمين",
      "التأمينات الاجتماعية: تسجيل وتحديث بيانات الموظفين",
    ],
    accent: "#06B6D4",
  },
  {
    icon: TrendingUp,
    num: "سابعاً",
    title: "خدمات المستثمرين",
    desc: "نرشدك لاتخاذ قراراتك الاستثمارية الصحيحة بثقة ومعلومات دقيقة.",
    features: [
      "استشارات قانونية ومالية لدعمك في اتخاذ قرارات استثمارية صحيحة",
      "المساعدة في فتح الحسابات البنكية وإتمام المعاملات المالية",
    ],
    accent: "#6366F1",
  },
  {
    icon: BarChart3,
    num: "ثامناً",
    title: "تأهيل الشركات للإدراج في سوق الأسهم",
    desc: "نهيّئ شركتك للطرح العام وندعمها لاستيفاء متطلبات الإدراج بسوق الأسهم السعودي.",
    features: [
      "التحضير للطرح العام (IPO) وتهيئة الشركات لاستيفاء المتطلبات",
      "تجهيز البيانات المالية والوثائق القانونية المطلوبة",
      "ضمان الامتثال لجميع الأنظمة واللوائح التنظيمية",
    ],
    accent: "#F43F5E",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Helmet>
        <title>خدماتنا — أفق لحلول الأعمال</title>
        <meta name="description" content="خدمات أفق: تأسيس الشركات، خدمات قانونية، علامات تجارية، خدمات حكومية، موارد بشرية، منصات حكومية، خدمات المستثمرين، تأهيل الإدراج في سوق الأسهم." />
        <link rel="canonical" href="https://ofoqhc.com/services" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(12,19,56,.52),rgba(28,43,110,.75)), url('/images/riyadh-kingdom-tower.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">خدماتنا</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
              حلول متكاملة لكل احتياجاتك
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              ٨ محاور رئيسية من الخدمات المتخصصة لدعم نمو أعمالك وتعزيز قدرتك التنافسية
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all group">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon + number */}
                    <div className="flex flex-col items-center md:items-start gap-2 md:w-24 flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: `${service.accent}20` }}>
                        <Icon size={28} style={{ color: service.accent }} />
                      </div>
                      <span className="text-xs font-bold text-gray-300 tracking-wider">{service.num}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-black text-navy-700 mb-2"
                        style={{ borderRight: `4px solid ${service.accent}`, paddingRight: "12px" }}>
                        {service.title}
                      </h2>
                      <p className="text-gray-500 mb-5 leading-relaxed">{service.desc}</p>
                      <ul className="space-y-2.5">
                        {service.features.map((f, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-gray-600">
                            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: service.accent }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">هل تحتاج إلى خدمة متخصصة؟</h2>
          <p className="text-white/55 mb-8 text-lg leading-relaxed">
            تواصل معنا الآن وسيسعد فريقنا بتقديم الاستشارة المناسبة لاحتياجاتك
          </p>
          <Link to="/client/register" className="btn-yellow text-base px-10 py-4">
            ابدأ طلبك الآن <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
