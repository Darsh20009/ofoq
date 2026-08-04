import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5 } }),
};

const COUNTRIES = [
  { name: "باكستان",   flag: "🇵🇰", desc: "استقطاب كفاءات متخصصة في قطاعات التقنية والبناء والخدمات" },
  { name: "الهند",     flag: "🇮🇳", desc: "كوادر بشرية متميزة في مجالات الهندسة والتقنية والطب" },
  { name: "الأردن",    flag: "🇯🇴", desc: "مهارات متخصصة في المحاسبة والقانون والإدارة" },
  { name: "سريلانكا", flag: "🇱🇰", desc: "عمالة ماهرة في قطاعات الضيافة والخدمات المنزلية والصناعة" },
  { name: "مصر",       flag: "🇪🇬", desc: "كفاءات في الإعلام والتسويق والهندسة والتعليم" },
  { name: "الفلبين",  flag: "🇵🇭", desc: "عمالة متميزة في الرعاية الصحية والخدمات والتقنية" },
  { name: "بنجلاديش", flag: "🇧🇩", desc: "عمالة متخصصة في البناء والصناعة والخدمات" },
  { name: "أوغندا",   flag: "🇺🇬", desc: "كوادر في قطاعات الزراعة والخدمات والبناء" },
  { name: "نيبال",    flag: "🇳🇵", desc: "عمالة ماهرة في قطاعات البناء والأمن والصناعة" },
  { name: "السودان",  flag: "🇸🇩", desc: "كفاءات في الطب والهندسة والتعليم والإدارة" },
];

export default function CountriesPage() {
  return (
    <div>
      <Helmet>
        <title>دول الاستقطاب — أفق لحلول الأعمال</title>
        <meta name="description" content="أفق لحلول الأعمال تستقطب الكفاءات من أبرز دول العمالة الماهرة حول العالم لدعم نمو شركتك في المملكة." />
        <link rel="canonical" href="https://ofoqhc.com/countries" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[52vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.92) 0%, rgba(43,39,63,0.50) 55%, transparent 100%), url('/images/hero-aramco-hq.jpg')",
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
            <span className="text-white/70">دول الاستقطاب</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-white"
          >
            نستقطب الكفاءات{" "}
            <br />
            <span className="text-ofoq-yellow">من حول العالم</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/55 text-base mt-3 max-w-lg"
          >
            نمتلك شبكة واسعة من الشراكات مع وكالات التوظيف في أبرز دول الاستقطاب
          </motion.p>
        </div>
      </section>

      {/* ══ الدول ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          <div className="mb-10">
            <p className="text-ofoq-green font-bold text-sm mb-2">شبكتنا الدولية</p>
            <h2 className="text-3xl font-black text-ofoq-navy">
              دول{" "}
              <span className="text-ofoq-green">الاستقطاب</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COUNTRIES.map((c, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 hover:shadow-lg transition-all group border border-gray-50 hover:border-ofoq-green/20"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{c.flag}</span>
                  <h3 className="font-black text-ofoq-navy text-lg">{c.name}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{c.desc}</p>
                <Link
                  to="/client/register"
                  className="flex items-center gap-1.5 text-xs font-bold text-ofoq-green hover:gap-2.5 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  اطلب استقطاب
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ قسم العملية ══════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,39,63,0.90), rgba(43,39,63,0.90)), url('/images/ofoq-brand-photo2.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 bottom-4 opacity-15 pointer-events-none">
          <WireframeCube className="w-64 h-44 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="text-center mb-12">
            <p className="text-ofoq-green font-bold text-sm mb-2">كيف تعمل؟</p>
            <h2 className="text-3xl font-black text-white">
              خطوات{" "}
              <span className="text-ofoq-yellow">الاستقطاب</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "١", t: "تحديد الاحتياج", d: "تحدد احتياجاتك من العمالة والتخصصات المطلوبة" },
              { n: "٢", t: "البحث والاختيار",  d: "نبحث لك في شبكتنا الدولية عن أفضل المرشحين" },
              { n: "٣", t: "استخراج التأشيرات", d: "نتولى جميع إجراءات التأشيرات والتصاريح" },
              { n: "٤", t: "الاستقدام والتسليم", d: "نسلّم لك الموظفين جاهزين للعمل" },
            ].map((step) => (
              <div key={step.n} className="bg-white/8 border border-white/15 rounded-3xl p-6 text-center hover:bg-white/12 transition-colors">
                <span className="w-12 h-12 rounded-full border-2 border-ofoq-green/40 flex items-center justify-center text-ofoq-green font-black text-lg mx-auto mb-4">
                  {step.n}
                </span>
                <h4 className="font-black text-white text-sm mb-2">{step.t}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-ofoq-green font-bold text-sm mb-2">ابدأ الآن</p>
          <h2 className="text-3xl font-black text-ofoq-navy mb-6">
            هل تحتاج إلى{" "}
            <span className="text-ofoq-green">عمالة متخصصة؟</span>
          </h2>
          <Link
            to="/client/register"
            className="inline-flex items-center gap-3 bg-ofoq-navy text-white font-bold text-sm px-4 py-3 rounded-full hover:bg-ofoq-navy-light transition-all"
          >
            <span className="w-9 h-9 rounded-full bg-ofoq-green flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </span>
            <span className="pl-2">قدّم طلبك الآن</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
