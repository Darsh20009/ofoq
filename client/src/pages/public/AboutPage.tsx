import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Target, Repeat2, LayoutGrid, Heart, ArrowLeft } from "lucide-react";
import OfoqLogo from "../../components/OfoqLogo";

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const WHY = [
  {
    icon: Repeat2,
    title: "ندرك التغيرات المستمرة",
    desc: "ندرك التغيرات المستمرة في سوق العمل ونعتمد الديناميكية أساساً للعمل لنسخّر الأدوات المختلفة لتحقيق أهدافنا مع العميل كشركاء نجاح.",
  },
  {
    icon: LayoutGrid,
    title: "نفهم احتياجات القطاعات",
    desc: "نفخر بتوفير مستشارين ومتخصصين في مجالات متعددة، حيث نولي اهتماماً كبيراً لتلبية احتياجات عملائنا في كل قطاع ونسعى لضمان توفير الكوادر المطلوبة بدقة وفاعلية.",
  },
  {
    icon: Heart,
    title: "نعتني بقيمكم وأهدافكم",
    desc: "لدينا القدرة على تحقيق أعلى مستويات الإنتاجية بالإضافة لفهم دقيق لأهداف العميل وطبيعة عمل عملائنا وخططهم الحالية والمستقبلية.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>من نحن — أفق لحلول الأعمال</title>
        <meta name="description" content="تعرّف على شركة أفق لحلول الأعمال — شريكك الموثوق في تقديم الحلول المتكاملة لقطاع الأعمال في المملكة العربية السعودية." />
        <link rel="canonical" href="https://ofoqhc.com/about" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.50),rgba(28,43,110,.68)), url('/images/riyadh-towers-palms.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge bg-ofoq-red/20 text-red-200 mb-4">من نحن</span>
              <h1 className="text-5xl font-black text-white mt-3 mb-5">
                أفق لحلول الأعمال
                <br />
                <span className="text-ofoq-yellow">شريكك الموثوق</span>
              </h1>
              <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
                تأسست أفق لحلول الأعمال لتكون شريكًا موثوقًا في تقديم الحلول المتكاملة التي تواكب تطلعات قطاع الأعمال في المملكة العربية السعودية
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
              <h2 className="section-title mb-6">قصتنا</h2>
              <div className="space-y-5 text-gray-600 leading-relaxed text-base">
                <p>
                  تأسست شركة أفق لحلول الأعمال لتكون شريكًا موثوقًا في تقديم الحلول المتكاملة التي تواكب تطلعات قطاع الأعمال في المملكة العربية السعودية. ومنذ انطلاقتنا، عملنا على تمكين الشركات من تحقيق أهدافها من خلال تقديم خدمات احترافية تدعم استقرار الأعمال ونموها المستدام.
                </p>
                <p>
                  نؤمن في أفق أن رأس المال البشري هو المحرك الأساسي للتميّز، لذا نعتز بفريقنا الذي يجمع بين الخبرة والكفاءة، ويعمل بتناغم تام ينعكس على جودة الخدمات، وعلى رضا عملائنا، وعلى ثقة الشركاء بنا.
                </p>
                <p>
                  في أفق، نواصل التقدّم برؤية طموحة وخطط مدروسة، لنكون الخيار الأول لحلول الأعمال في المملكة، وشريكًا استراتيجيًا في بناء مستقبل اقتصادي أكثر كفاءة واستدامة.
                </p>
              </div>
            </motion.div>

            {/* Vision card */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-ofoq-navy rounded-3xl p-10 text-white relative overflow-hidden">
                {/* BG circles */}
                <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-ofoq-red/10 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-ofoq-yellow/8 translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-yellow/20 flex items-center justify-center">
                      <Target size={20} className="text-ofoq-yellow" />
                    </div>
                    <h3 className="text-lg font-black text-ofoq-yellow">رؤيتنا</h3>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed mb-8">
                    نتطلع لأن نكون الشركة الرائدة محلياً في تقديم حلول الأعمال في المملكة، وشريكًا استراتيجيًا في بناء مستقبل اقتصادي أكثر كفاءة واستدامة.
                  </p>
                  <div className="border-t border-white/10 pt-6 flex items-center gap-3">
                    <OfoqLogo className="w-16 h-12" />
                    <div>
                      <p className="font-bold text-white">أفق لحلول الأعمال</p>
                      <p className="text-white/40 text-xs">OFOQ Business Solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why choose OFOQ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <h2 className="section-title">لماذا تختار أفق؟</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              عندما تختار أفق فأنت تختار شريكاً استراتيجياً يقدّر وقتك، يدعم طموحاتك، ويضعك على الطريق الصحيح لتحقيق أهدافك
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {WHY.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-ofoq-navy flex items-center justify-center mb-5 group-hover:bg-ofoq-red transition-colors">
                    <Icon size={24} className="text-ofoq-yellow group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-xl text-navy-700 mb-3">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.80),rgba(28,43,110,.90)), url('/images/hero-riyadh-towers.jpg')" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="w-16 h-16 rounded-2xl bg-ofoq-yellow/15 flex items-center justify-center mx-auto mb-6">
              <Target size={30} className="text-ofoq-yellow" />
            </div>
            <blockquote className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">
              "نواصل التقدّم برؤية طموحة وخطط مدروسة،
              <br />
              <span className="text-ofoq-yellow">لنكون الخيار الأول لحلول الأعمال"</span>
            </blockquote>
            <p className="text-white/50 text-lg">— فريق أفق لحلول الأعمال</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">هل أنت مستعد للبدء معنا؟</h2>
          <p className="text-white/55 mb-8 text-lg">تواصل مع فريقنا اليوم ودعنا نساعدك في بناء مستقبل شركتك</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/client/register" className="btn-yellow text-base px-8 py-4">
              ابدأ طلبك الآن <ArrowLeft size={18} />
            </Link>
            <Link to="/contact" className="btn-outline border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
