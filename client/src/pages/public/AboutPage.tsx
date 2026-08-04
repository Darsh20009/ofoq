import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const VALUES = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
        <circle cx="24" cy="24" r="24" stroke="currentColor" strokeWidth="1" opacity=".25"/>
      </svg>
    ),
    title: "الموثوقية",
    desc: "نبني علاقات طويلة الأمد مع عملائنا قائمة على الثقة والشفافية التامة في كل تعامل.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <path d="M8 24 L24 8 L40 24 L24 40 Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 24 L24 16 L32 24 L24 32 Z" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
        <circle cx="24" cy="24" r="3" fill="currentColor"/>
      </svg>
    ),
    title: "القيمة",
    desc: "تحويل الأفكار والابتكار إلى نتائج أعمال قابلة للقياس ونمو متواصل.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <circle cx="16" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
        <circle cx="32" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
        <circle cx="24" cy="13" r="8" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: "تميّز الخدمة",
    desc: "تقديم نتائج تركز على العميل بعناية واحترافية واهتمام بالتفاصيل وبناء الثقة على المدى الطويل.",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
        <rect x="8" y="8" width="14" height="14" stroke="currentColor" strokeWidth="2"/>
        <rect x="26" y="8" width="14" height="14" stroke="currentColor" strokeWidth="2"/>
        <rect x="8" y="26" width="14" height="14" stroke="currentColor" strokeWidth="2"/>
        <rect x="26" y="26" width="14" height="14" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: "التكامل",
    desc: "نفهم احتياجات القطاعات المختلفة ونوفر مستشارين ومتخصصين في مجالات متعددة لتلبية متطلبات كل عميل.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <Helmet>
        <title>من نحن — أفق لحلول الأعمال</title>
        <meta name="description" content="تعرّف على شركة أفق لحلول الأعمال — شريكك الموثوق في تقديم الحلول المتكاملة لقطاع الأعمال في المملكة العربية السعودية." />
        <link rel="canonical" href="https://ofoqhc.com/about" />
      </Helmet>

      {/* ══ هيرو — صورة مع أوفرلاي ══════════════════════════════ */}
      <section
        className="relative min-h-[60vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.88) 0%, rgba(43,39,63,0.45) 50%, rgba(0,0,0,0.2) 100%), url('/images/riyadh-towers-palms.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* مكعبات */}
        <div className="absolute left-4 bottom-4 opacity-20 pointer-events-none">
          <WireframeCube className="w-64 h-44 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="absolute right-8 top-16 opacity-12 pointer-events-none">
          <WireframeCube className="w-40 h-28 text-ofoq-yellow" color="#E5FE04" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 relative z-10 w-full">
          {/* breadcrumb */}
          <div className="flex items-center gap-2 text-white/45 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">الرئيسية</Link>
            <span>/</span>
            <span className="text-white/70">من نحن</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
              عن{" "}
              <span className="text-ofoq-yellow">أفق</span>
            </h1>
            <div className="flex items-center gap-2 text-white/55 text-sm mt-3">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              من نحن
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ نبذة عنا ═══════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <p className="text-ofoq-green font-bold text-sm mb-3">نبذة عنا</p>
            <h2 className="text-3xl sm:text-4xl font-black text-ofoq-navy mb-6">
              أفق{" "}
              <span className="text-ofoq-green">لحلول الأعمال</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5 text-gray-600 leading-relaxed text-base"
            >
              <p>
                تأسست شركة أفق لحلول الأعمال لتكون شريكًا موثوقًا في تقديم الحلول المتكاملة التي تواكب تطلعات قطاع الأعمال في المملكة العربية السعودية. ومنذ انطلاقتنا، عملنا على تمكين الشركات من تحقيق أهدافها من خلال تقديم خدمات احترافية تدعم استقرار الأعمال ونموها المستدام.
              </p>
              <p>
                نؤمن في أفق أن رأس المال البشري هو المحرك الأساسي للتميّز، لذا نعتز بفريقنا الذي يجمع بين الخبرة والكفاءة، ويعمل بتناغم تام ينعكس على جودة الخدمات، وعلى رضا عملائنا، وعلى ثقة الشركاء بنا.
              </p>
              <p>
                في أفق، نواصل التقدّم برؤية طموحة وخطط مدروسة، لنكون الخيار الأول لحلول الأعمال في المملكة، وشريكًا استراتيجيًا في بناء مستقبل اقتصادي أكثر كفاءة واستدامة.
              </p>
              <p>
                خدمات أعمال <span className="font-bold text-ofoq-green">تعزز النمو</span> وتدعم التنمية المستدامة بما يتماشى مع رؤية المملكة.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
            >
              {/* بطاقة الرؤية */}
              <div className="relative bg-ofoq-navy rounded-3xl p-8 overflow-hidden min-h-[280px] flex flex-col justify-between">
                <div className="absolute left-0 bottom-0 opacity-15 pointer-events-none">
                  <WireframeCube className="w-48 h-36 text-ofoq-green" color="#33B27C" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">رؤيتنا</p>
                  <p className="text-white text-xl font-bold leading-relaxed">
                    اقتصاد مزدهر يسمو بخدمات أعمال مبتكرة ومتميّزة
                  </p>
                </div>
                <div className="relative z-10 border-t border-white/10 pt-5 mt-5">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">مهمتنا</p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    تمكين الشركات والمؤسسات من النمو وتعزيز الكفاءة من خلال خدمات موثوقة ومرنة ورقمية مصممة خصيصًا.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ صورة + قيمة ═════════════════════════════════════════ */}
      <section
        className="relative py-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(43,39,63,0.88), rgba(43,39,63,0.88)), url('/images/riyadh-itcc-tower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 top-10 opacity-12 pointer-events-none">
          <WireframeCube className="w-48 h-36 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(43,39,63,0.75), rgba(43,39,63,0.75)), url('/images/riyadh-towers-palms.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="p-7">
                  <div className="text-ofoq-green mb-4">{v.icon}</div>
                  <h3 className="text-xl font-black text-ofoq-yellow mb-3">{v.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ لماذا أفق — أبيض ════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-ofoq-green font-bold text-sm mb-2">السبب في اختيارنا</p>
            <h2 className="text-3xl sm:text-4xl font-black text-ofoq-navy">
              لماذا تختار{" "}
              <span className="text-ofoq-green">أفق؟</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                n: "١",
                t: "ندرك التغيرات المستمرة",
                d: "ندرك التغيرات المستمرة في سوق العمل ونعتمد الديناميكية أساساً للعمل لنسخّر الأدوات المختلفة لتحقيق أهداف العميل كشركاء نجاح.",
              },
              {
                n: "٢",
                t: "نفهم احتياجات القطاعات",
                d: "نفخر بتوفير مستشارين ومتخصصين في مجالات متعددة حيث نولي اهتماماً كبيراً لتلبية احتياجات عملائنا في كل قطاع.",
              },
              {
                n: "٣",
                t: "نعتني بقيمكم وأهدافكم",
                d: "لدينا القدرة على تحقيق أعلى مستويات الإنتاجية بالإضافة لفهم دقيق لأهداف العميل وطبيعة عمل عملائنا وخططهم الحالية والمستقبلية.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="border border-gray-100 rounded-3xl p-6 hover:border-ofoq-green/30 hover:shadow-md transition-all"
              >
                <span className="w-10 h-10 rounded-full border-2 border-ofoq-green/30 flex items-center justify-center text-ofoq-green font-black text-sm mb-4">
                  {item.n}
                </span>
                <h3 className="font-bold text-ofoq-navy text-base mb-3">{item.t}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(135deg, #2B273F 0%, #1A1730 100%)" }}
      >
        <div className="absolute left-0 bottom-0 opacity-12 pointer-events-none">
          <WireframeCube className="w-64 h-48 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10 text-center">
          <p className="text-white/40 text-sm mb-3">ابدأ رحلتك معنا اليوم</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            شريكك الأمثل{" "}
            <span className="text-ofoq-yellow">لأعمالك</span>
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
            <span className="pl-2">تواصل معنا</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
