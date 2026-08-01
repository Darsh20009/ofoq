import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, Target, Heart, Users, Globe, TrendingUp, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

const TEAM = [
  { name: "أحمد العبدالله", role: "المؤسس والرئيس التنفيذي", initials: "أع" },
  { name: "سارة المحمد", role: "مديرة العمليات", initials: "سم" },
  { name: "خالد الرشيد", role: "مدير التقنية", initials: "خر" },
  { name: "نورة السعيد", role: "مديرة التسويق", initials: "نس" },
];

const VALUES = [
  { title: "النزاهة", desc: "نؤمن بالشفافية الكاملة في كل تعاملاتنا مع عملائنا وشركائنا.", icon: Heart },
  { title: "الابتكار", desc: "نسعى دائماً لتقديم حلول مبتكرة تتجاوز التوقعات وتفتح آفاقاً جديدة.", icon: TrendingUp },
  { title: "التميّز", desc: "لا نقبل بأقل من الأفضل في كل ما نُقدّمه، من الجودة إلى خدمة العملاء.", icon: Award },
  { title: "التأثير", desc: "نقيس نجاحنا بالتأثير الإيجابي الذي نحدثه في مسيرة عملائنا.", icon: Target },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>من نحن | أفق لحلول الأعمال — OFOQ Business Solutions</title>
        <meta name="description" content="تعرّف على قصة أفق لحلول الأعمال (OFOQ) — رؤيتنا ومهمتنا وفريقنا المتميز في تقديم حلول رقمية متكاملة للشركات السعودية والخليجية منذ 2020." />
        <meta name="keywords" content="من نحن أفق, about ofoq, فريق أفق, رؤية أفق, مهمة أفق, شركة أفق السعودية, OFOQ team, OFOQ about, أفق لحلول الأعمال" />
        <link rel="canonical" href="https://ofoqhc.com/about" />
        <meta property="og:title" content="من نحن | أفق لحلول الأعمال" />
        <meta property="og:description" content="تعرّف على قصة أفق لحلول الأعمال وفريقنا المتميز في التحول الرقمي." />
        <meta property="og:url" content="https://ofoqhc.com/about" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "من نحن — أفق لحلول الأعمال",
          "url": "https://ofoqhc.com/about",
          "description": "قصة أفق لحلول الأعمال ورحلتها في تقديم حلول رقمية متكاملة للشركات السعودية والخليجية.",
          "publisher": { "@type": "Organization", "name": "أفق لحلول الأعمال", "url": "https://ofoqhc.com" }
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.45),rgba(28,43,110,.62)), url('/images/riyadh-towers-palms.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="badge bg-ofoq-red/20 text-red-200 mb-4">من نحن</span>
              <h1 className="text-5xl font-black text-white mt-3 mb-5">
                رحلتنا نحو<br />
                <span className="text-ofoq-yellow">أفق أبعد</span>
              </h1>
              <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
                أفق لحلول الأعمال — شركة سعودية رائدة في مجال التحول الرقمي وحلول الأعمال، تأسست بهدف واحد: تمكين الشركات من تحقيق إمكاناتها الكاملة.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}>
              <h2 className="section-title mb-6">قصتنا</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  بدأت رحلة أفق من رؤية بسيطة: <strong className="text-navy-700">أن كل شركة تستحق شريكاً تقنياً حقيقياً</strong> يفهم تحدياتها ويعمل معها كفريق واحد.
                </p>
                <p>
                  على مدار السنوات الماضية، بنينا علاقات حقيقية مع أكثر من ٢٠٠ شركة في المملكة العربية السعودية والخليج، وساعدناهم في تحقيق أهداف كانوا يحلمون بها.
                </p>
                <p>
                  اليوم، نحمل معنا خبرة ثرية وفريقاً من الخبراء المتخصصين، ونواصل مسيرتنا نحو أفق أبعد — مستقبل أعمال أكثر ذكاءً وكفاءة واستدامة.
                </p>
              </div>
            </motion.div>
                <div className="grid grid-cols-2 gap-5">
              {[
                { icon: Award, val: "٢٠٠+", label: "مشروع ناجح" },
                { icon: Users, val: "٥٠+", label: "خبير متخصص" },
                { icon: Globe, val: "١٢+", label: "دولة نخدمها" },
                { icon: TrendingUp, val: "٩٨٪", label: "رضا العملاء" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                   className="card text-center group hover:shadow-ofoq-red transition-shadow">
                   <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-ofoq-red transition-colors">
                     <s.icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-3xl font-black text-navy-700 mb-1">{s.val}</p>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">قيمنا الجوهرية</h2>
            <p className="section-subtitle">المبادئ التي توجّه كل قرار وكل مشروع نعمل عليه</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card text-center group hover:shadow-ofoq transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-ofoq-navy flex items-center justify-center mx-auto mb-4 group-hover:bg-ofoq-green transition-colors">
                  <v.icon size={24} className="text-ofoq-yellow group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-navy-700 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="section-title">فريق القيادة</h2>
            <p className="section-subtitle">خبراء متخصصون يقودون مسيرة التحول الرقمي</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="card text-center group hover:shadow-ofoq transition-all hover:-translate-y-1">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-ofoq-navy to-navy-600 flex items-center justify-center mx-auto mb-4 shadow-ofoq group-hover:scale-105 transition-transform">
                  <span className="text-white font-bold text-xl">{member.initials}</span>
                </div>
                <h3 className="font-bold text-navy-700">{member.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-ofoq-navy">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4">انضم إلى عائلة أفق</h2>
          <p className="text-white/60 mb-8">كن جزءاً من قصة نجاح تُكتب يومياً مع عملاء يثقون بنا.</p>
          <Link to="/contact" className="btn-yellow text-base px-8 py-4">
            تواصل معنا اليوم <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
