import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Star, TrendingUp, Users, Award, Globe, Zap, Shield, BarChart3, ChevronLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { cmsApi, servicesApi } from "../../api/client";

const STATS = [
  { value: "٢٠٠+", label: "مشروع منجز",       icon: Award },
  { value: "٩٨٪",  label: "رضا العملاء",       icon: Star },
  { value: "٥٠+",  label: "خبير متخصص",        icon: Users },
  { value: "١٢+",  label: "دولة نخدمها",       icon: Globe },
];

const SERVICES_ICONS = [TrendingUp, Globe, BarChart3, Shield, Zap, Users];

const WHY_US = [
  { title: "خبرة لا تُضاهى",   desc: "أكثر من ١٠ سنوات في تقديم حلول الأعمال الرقمية لكبرى الشركات.",              icon: Award },
  { title: "تقنيات متطورة",    desc: "نوظّف أحدث أدوات الذكاء الاصطناعي وتحليل البيانات لتحقيق نتائج قياسية.",     icon: Zap },
  { title: "شراكة حقيقية",    desc: "لسنا مجرد مزود خدمة، بل شريك استراتيجي يتفهّم أهدافك ويعمل لتحقيقها.",      icon: Users },
  { title: "نتائج مضمونة",    desc: "نعمل بمبدأ النتائج القابلة للقياس — إذا لم تنجح، نعمل حتى تنجح.",             icon: CheckCircle },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function HomePage() {
  const { data: servicesData } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => servicesApi.list({ isActive: true, limit: 6 }).then((r) => r.data),
  });
  const { data: testimonialsData } = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: () => cmsApi.testimonials.list().then((r) => r.data),
  });

  const services     = servicesData?.data?.services || [];
  const testimonials = testimonialsData?.data?.testimonials || [];

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>أفق لحلول الأعمال | OFOQ — نظام إداري متكامل للشركات السعودية</title>
        <meta name="description" content="أفق (OFOQ) — منصة إدارة أعمال متكاملة للشركات السعودية والخليجية: CRM، مشاريع، فواتير إلكترونية، عقود، ذكاء اصطناعي. شريكك في التحول الرقمي. ابدأ مجاناً الآن." />
        <meta name="keywords" content="أفق لحلول الأعمال, ofoq, ofoqhc, OFOQ Business Solutions, نظام إداري, CRM سعودي, إدارة مشاريع, فواتير إلكترونية, تحول رقمي سعودي, برامج الشركات السعودية" />
        <link rel="canonical" href="https://ofoqhc.com/" />
        <meta property="og:title" content="أفق لحلول الأعمال | OFOQ — نظام إداري متكامل" />
        <meta property="og:description" content="منصة إدارة أعمال متكاملة للشركات السعودية: CRM، مشاريع، فواتير، عقود، تحليلات. ابدأ مجاناً." />
        <meta property="og:url" content="https://ofoqhc.com/" />
      </Helmet>

      {/* ── Hero — Aramco HQ Sunset ──────────────────────────── */}
      <section
        className="min-h-screen flex items-center relative pt-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(8,13,42,.45),rgba(20,35,90,.65)), url('/images/hero-aramco-hq.jpg')" }}
      >
        <div className="absolute top-32 left-16 w-72 h-72 rounded-full bg-ofoq-red/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-56 h-56 rounded-full bg-ofoq-yellow/8 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-ofoq-red/15 border border-ofoq-red/30 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-ofoq-red rounded-full animate-pulse" />
              <span className="text-red-200 text-sm font-medium">شريكك الاستراتيجي في التحول الرقمي</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6"
            >
              نبني مستقبل
              <br />
              <span className="text-ofoq-red">أعمالك</span> معك
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/65 text-xl leading-relaxed mb-10 max-w-2xl"
            >
              حلول رقمية متكاملة تُمكّن الشركات من تحقيق أهدافها بكفاءة ودقة — من الاستراتيجية إلى التنفيذ، من البيانات إلى النتائج.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/contact" className="btn-yellow text-base px-8 py-4 shadow-ofoq-yellow">
                احصل على استشارة مجانية
                <ArrowLeft size={18} />
              </Link>
              <Link to="/services" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white text-base px-8 py-4">
                استكشف خدماتنا
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-white/55 text-sm mt-8"
            >
              موثوق من قِبَل أكثر من ٢٠٠ شركة في المملكة العربية السعودية والخليج
            </motion.p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs">مرّر للأسفل</span>
          <div className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-ofoq-navy/5 flex items-center justify-center mx-auto mb-3 group-hover:bg-ofoq-red/10 transition-colors">
                  <stat.icon size={24} className="text-ofoq-red" />
                </div>
                <p className="text-4xl font-black text-ofoq-navy mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="badge-red mb-4">خدماتنا</span>
            <h2 className="section-title mt-2">حلول شاملة لكل احتياجاتك</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              نقدم منظومة متكاملة من الخدمات الرقمية المصممة لتسريع نمو أعمالك وتحقيق ميزة تنافسية مستدامة
            </p>
          </motion.div>

          {services.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "الاستشارات الاستراتيجية",      desc: "نساعدك في رسم خارطة طريق واضحة نحو أهدافك الكبرى." },
                { title: "التحول الرقمي",                desc: "نُحوّل عملياتك التقليدية إلى منظومة رقمية متكاملة وذكية." },
                { title: "تحليل البيانات والذكاء الاصطناعي", desc: "نحوّل بياناتك الخام إلى قرارات استراتيجية دقيقة." },
                { title: "تطوير البرمجيات",              desc: "حلول برمجية مخصصة بالكامل لاحتياجات عملك الفريدة." },
                { title: "التسويق الرقمي",               desc: "استراتيجيات تسويق متكاملة تضعك في المقدمة." },
                { title: "الأمن السيبراني",              desc: "نحمي أصولك الرقمية من كل التهديدات الحديثة." },
              ].map((s, i) => {
                const Icon = SERVICES_ICONS[i % SERVICES_ICONS.length];
                return (
                  <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="card-hover group">
                    <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mb-4 group-hover:bg-ofoq-red transition-colors">
                      <Icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-navy-700 text-lg mb-2">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                    <Link to="/services" className="text-ofoq-red text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      اعرف المزيد <ChevronLeft size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s: { _id: string; title: { ar: string }; description?: { ar?: string }; icon?: string }, i: number) => {
                const Icon = SERVICES_ICONS[i % SERVICES_ICONS.length];
                return (
                  <motion.div key={s._id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="card-hover group">
                    <div className="w-12 h-12 rounded-xl bg-ofoq-red/10 flex items-center justify-center mb-4 group-hover:bg-ofoq-red transition-colors">
                      <Icon size={22} className="text-ofoq-red group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-navy-700 text-lg mb-2">{s.title.ar}</h3>
                    {s.description?.ar && (
                      <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.description.ar}</p>
                    )}
                    <Link to="/services" className="text-ofoq-red text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                      اعرف المزيد <ChevronLeft size={14} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/services" className="btn-outline">
              استعرض جميع الخدمات <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── OFOQ Brand Photo Section ─────────────────────────── */}
      <section
        className="relative py-28 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: "url('/images/ofoq-brand-photo2.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-ofoq-navy/95 via-ofoq-navy/80 to-ofoq-navy/40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-xl mr-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block bg-ofoq-red/20 border border-ofoq-red/30 rounded-full px-4 py-1.5 text-red-300 text-sm font-medium mb-6">
                OFOQ FOR BUSINESS SOLUTIONS
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                هوية راسخة،<br />
                <span className="text-ofoq-yellow">مستقبل واعد</span>
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-8">
                نحن أكثر من مجرد شركة تقنية — نحن شريك نمو استراتيجي يُساعد مؤسستك على اقتناص الفرص وتحقيق القفزة النوعية في عالم الأعمال الرقمي.
              </p>
              <Link to="/about" className="btn-yellow inline-flex">
                تعرّف على قصتنا <ArrowLeft size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Why Us — Riyadh skyline background ───────────────── */}
      <section
        className="py-24 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.68),rgba(28,43,110,.78)), url('/images/hero-riyadh-towers.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">لماذا أفق؟</span>
              <h2 className="text-4xl font-black text-white mt-2 mb-6 leading-tight">
                نُعيد تعريف معنى<br />
                <span className="text-ofoq-yellow">الشراكة الحقيقية</span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                لا نقدم خدمات فقط — نبني علاقات شراكة قائمة على الثقة والنتائج والرؤية المشتركة.
              </p>
              <Link to="/contact" className="btn-yellow mt-8 inline-flex">
                ابدأ رحلتك معنا <ArrowLeft size={16} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {WHY_US.map((item, i) => (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-ofoq-red/20 flex items-center justify-center mb-3">
                    <item.icon size={20} className="text-red-300" />
                  </div>
                  <h4 className="font-bold text-white mb-1.5">{item.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ITCC Tower strip ─────────────────────────────────── */}
      <section
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.30),rgba(28,43,110,.55)), url('/images/riyadh-itcc-tower.jpg')" }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-white/90 text-2xl sm:text-3xl font-black">
              نخدم الشركات من <span className="text-ofoq-yellow">الرياض</span> إلى العالم
            </p>
            <p className="text-white/55 text-sm mt-2">المملكة العربية السعودية • الخليج • الشرق الأوسط</p>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="text-center mb-16">
              <span className="badge-red mb-4">شهادات العملاء</span>
              <h2 className="section-title mt-2">ماذا يقول عملاؤنا</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((t: { _id: string; author: { name: string; company: string; position?: string }; content: { ar: string }; rating: number }, i: number) => (
                <motion.div key={t._id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} className="card-hover">
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, j) => (
                      <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">"{t.content?.ar}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-ofoq-navy flex items-center justify-center text-white font-bold">
                      {t.author?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-navy-700 text-sm">{t.author?.name}</p>
                      <p className="text-gray-400 text-xs">{t.author?.position ? `${t.author.position}، ` : ""}{t.author?.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.78),rgba(28,43,110,.88)), url('/images/riyadh-evening.jpg')" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-block px-5 py-2 rounded-full bg-ofoq-yellow/15 border border-ofoq-yellow/30 text-ofoq-yellow text-sm font-medium mb-6">
              هل أنت مستعد؟
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">ابدأ رحلة تحولك الرقمي اليوم</h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              استشارة مجانية، خطة عمل واضحة، ونتائج قابلة للقياس. تواصل معنا الآن ودعنا نبني المستقبل معاً.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-yellow text-base px-8 py-4">
                احصل على استشارة مجانية <ArrowLeft size={18} />
              </Link>
              <Link to="/about" className="btn-outline border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                تعرّف علينا
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
