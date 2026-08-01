import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Globe, Users, FileText } from "lucide-react";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.45 } }),
};

const COUNTRIES = [
  {
    name: "باكستان",
    nameEn: "Pakistan",
    flag: "🇵🇰",
    desc: "استقطاب كفاءات متميزة في مجالات الهندسة والبناء والخدمات",
  },
  {
    name: "الهند",
    nameEn: "India",
    flag: "🇮🇳",
    desc: "كفاءات عالية في تقنية المعلومات والطب والمحاسبة",
  },
  {
    name: "الأردن",
    nameEn: "Jordan",
    flag: "🇯🇴",
    desc: "كوادر متخصصة في الخدمات الإدارية والمهن الطبية",
  },
  {
    name: "سريلانكا",
    nameEn: "Sri Lanka",
    flag: "🇱🇰",
    desc: "عمالة ماهرة في الضيافة والتشييد والخدمات المنزلية",
  },
  {
    name: "مصر",
    nameEn: "Egypt",
    flag: "🇪🇬",
    desc: "كفاءات متميزة في المجالات التقنية والإدارية والهندسية",
  },
  {
    name: "الفلبين",
    nameEn: "Philippines",
    flag: "🇵🇭",
    desc: "متخصصون في الرعاية الصحية والضيافة وخدمة العملاء",
  },
  {
    name: "بنجلاديش",
    nameEn: "Bangladesh",
    flag: "🇧🇩",
    desc: "عمالة ماهرة في البناء والتشييد والصناعات المختلفة",
  },
  {
    name: "أوغندا",
    nameEn: "Uganda",
    flag: "🇺🇬",
    desc: "كوادر في قطاعات الزراعة والتشييد والخدمات",
  },
  {
    name: "نيبال",
    nameEn: "Nepal",
    flag: "🇳🇵",
    desc: "عمالة متميزة في البناء والتشييد والأمن",
  },
  {
    name: "السودان",
    nameEn: "Sudan",
    flag: "🇸🇩",
    desc: "كفاءات في الخدمات الإدارية والمهنية",
  },
];

const STEPS = [
  {
    icon: FileText,
    title: "تقديم الطلب",
    desc: "سجّل في المنصة واختر الدولة والتخصص المطلوب",
  },
  {
    icon: Users,
    title: "اختيار المرشحين",
    desc: "يقوم فريقنا بترشيح أفضل الكفاءات المناسبة لاحتياجاتك",
  },
  {
    icon: Globe,
    title: "إنهاء الإجراءات",
    desc: "نتولى كامل إجراءات الاستقطاب من التأشيرات حتى الوصول",
  },
];

export default function CountriesPage() {
  return (
    <>
      <Helmet>
        <title>دول الاستقطاب — أفق لحلول الأعمال</title>
        <meta name="description" content="أفق تستقطب الكفاءات من: باكستان، الهند، الأردن، سريلانكا، مصر، الفلبين، بنجلاديش، أوغندا، نيبال، السودان." />
        <link rel="canonical" href="https://ofoqhc.com/countries" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.60),rgba(28,43,110,.78)), url('/images/hero-riyadh-towers.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">دول الاستقطاب</span>
            <h1 className="text-4xl sm:text-6xl font-black text-white mt-3 mb-4">
              نستقطب الكفاءات
              <br />
              <span className="text-ofoq-yellow">من حول العالم</span>
            </h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
              شبكة واسعة من الشراكات مع وكالات التوظيف في أبرز دول الاستقطاب — نُوصلك بأفضل الكفاءات
            </p>
          </motion.div>
        </div>
      </section>

      {/* Countries grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="section-title">الدول المتاحة للاستقطاب</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              نغطي أبرز الدول المصدّرة للكفاءات والعمالة الماهرة لخدمة سوق العمل السعودي
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 xl:gap-6">
            {COUNTRIES.map((c, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1.5 transition-all group">

                {/* Flag */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{c.flag}</div>
                  <div>
                    <h3 className="font-black text-navy-700 text-xl">{c.name}</h3>
                    <p className="text-gray-400 text-xs">{c.nameEn}</p>
                  </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-5">{c.desc}</p>

                <Link to="/client/register"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ofoq-navy text-white text-sm font-semibold hover:bg-ofoq-red transition-colors">
                  اطلب الآن <ArrowLeft size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.80),rgba(28,43,110,.90)), url('/images/riyadh-itcc-tower.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl font-black text-white">كيف يعمل الاستقطاب؟</h2>
            <p className="text-white/50 mt-3">خطوات بسيطة لاستقطاب الكفاءة المناسبة لشركتك</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-7 text-center hover:bg-white/10 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-ofoq-red/20 border border-ofoq-red/30 flex items-center justify-center mx-auto mb-5">
                    <Icon size={26} className="text-ofoq-yellow" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-ofoq-red/20 flex items-center justify-center mx-auto mb-3">
                    <span className="text-ofoq-red font-black text-sm">{i + 1}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Note about more countries */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-ofoq-navy/5 border border-ofoq-navy/10 rounded-2xl p-8">
            <Globe size={36} className="text-ofoq-navy mx-auto mb-4" />
            <h3 className="font-black text-navy-700 text-xl mb-3">تحتاج دولة أخرى؟</h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              لا تقتصر خدمتنا على الدول المذكورة — نستطيع الاستقطاب من أي دولة حول العالم وفق احتياجاتك
            </p>
            <Link to="/contact" className="btn-primary">
              تواصل معنا <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-3">ابدأ إجراءات الاستقطاب الآن</h2>
          <p className="text-white/50 mb-7">سجّل بياناتك وسيتواصل معك فريقنا المتخصص فوراً</p>
          <Link to="/client/register" className="btn-yellow text-base px-10 py-4">
            ابدأ طلبك <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
