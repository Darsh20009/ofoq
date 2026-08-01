import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Building2, Scale, BadgeCheck, Landmark, Users, MonitorSmartphone,
  TrendingUp, BarChart3, CheckCircle, ChevronLeft, Star,
  FileCheck, MessageSquare, Handshake, Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/client";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.5 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.5 5.5c-.5.4 7.4-5.4 7.4-16.6 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <path d="M16.365 1.43c0 1.14-.415 2.19-1.24 3.14-.995 1.14-2.196 1.8-3.5 1.7-.04-1.1.44-2.24 1.24-3.15.99-1.15 2.28-1.83 3.5-1.69zM20.6 17.3c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.93-1-4.02-.99-2.08.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.5 17.32-.35 13 1.09 9.99c.79-1.68 2.2-2.75 3.73-2.77 1.5-.02 2.92 1 3.83 1s2.62-1.23 4.42-1.05c.75.03 2.87.3 4.23 2.28-.11.07-2.53 1.48-2.5 4.4.03 3.5 3.07 4.66 3.1 4.68 0 0-.24 0 0 0"/>
    </svg>
  );
}

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

// ── 8 خدمات أفق ──────────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Building2,
    title: "تأسيس الشركات",
    desc: "إعداد عقود التأسيس وصياغتها بما يتوافق مع القوانين المحلية، واستخراج السجل التجاري والتراخيص اللازمة.",
    color: "from-blue-500/20 to-blue-600/10",
    accent: "text-blue-400",
  },
  {
    icon: Scale,
    title: "الخدمات القانونية",
    desc: "صياغة ومراجعة العقود، الاستشارات القانونية في القضايا التجارية والعمالية، والتمثيل أمام الجهات القضائية.",
    color: "from-purple-500/20 to-purple-600/10",
    accent: "text-purple-400",
  },
  {
    icon: BadgeCheck,
    title: "تسجيل العلامات التجارية",
    desc: "تسجيل وحماية علامتك التجارية، ومتابعة الإجراءات مع الجهات المختصة لضمان حقوقك الكاملة.",
    color: "from-amber-500/20 to-amber-600/10",
    accent: "text-amber-400",
  },
  {
    icon: Landmark,
    title: "الخدمات الحكومية",
    desc: "إنهاء الإجراءات الحكومية، استقطاب العمالة من سفارات المملكة، التراخيص التجارية والصناعية، الإقامات والتأشيرات.",
    color: "from-emerald-500/20 to-emerald-600/10",
    accent: "text-emerald-400",
  },
  {
    icon: Users,
    title: "إدارة الموارد البشرية",
    desc: "التوظيف واستقطاب الكفاءات، إدارة الرواتب والأجور، برامج التدريب وتطوير الأداء.",
    color: "from-ofoq-red/20 to-red-600/10",
    accent: "text-red-400",
  },
  {
    icon: MonitorSmartphone,
    title: "إدارة المنصات الحكومية",
    desc: "إدارة منصة قوى ومقيم والتأمينات الاجتماعية — تسجيل وتحديث بيانات الموظفين وتسهيل كل الإجراءات.",
    color: "from-cyan-500/20 to-cyan-600/10",
    accent: "text-cyan-400",
  },
  {
    icon: TrendingUp,
    title: "خدمات المستثمرين",
    desc: "استشارات قانونية ومالية لدعم قرارات الاستثمار، والمساعدة في فتح الحسابات البنكية وإتمام المعاملات.",
    color: "from-indigo-500/20 to-indigo-600/10",
    accent: "text-indigo-400",
  },
  {
    icon: BarChart3,
    title: "تأهيل الشركات للإدراج",
    desc: "التحضير للطرح العام (IPO)، تجهيز البيانات المالية والوثائق القانونية، والامتثال لمعايير سوق الأسهم.",
    color: "from-rose-500/20 to-rose-600/10",
    accent: "text-rose-400",
  },
];

// ── الباقات ──────────────────────────────────────────────────────────
const PACKAGES = [
  {
    name: "الباقة الفضية",
    nameEn: "Silver",
    color: "from-slate-400 to-slate-500",
    border: "border-slate-400/40",
    features: [
      "وزارة التجارة",
      "منصة سلامة",
      "التأمينات الاجتماعية",
      "خدمات التأمين الطبي",
      "خدمات الزكاة والضريبة",
    ],
    recommended: false,
  },
  {
    name: "الباقة الذهبية",
    nameEn: "Gold",
    color: "from-yellow-400 to-amber-500",
    border: "border-yellow-400/50",
    features: [
      "وزارة التجارة",
      "منصة أبشر ومقيم",
      "منصة سلامة",
      "التأمينات الاجتماعية",
      "خدمات التأمين الطبي",
      "خدمات الزكاة والضريبة",
      "خدمات الاستشارات",
    ],
    recommended: true,
  },
  {
    name: "الباقة البلاتينية",
    nameEn: "Platinum",
    color: "from-slate-200 to-slate-400",
    border: "border-slate-200/50",
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
    recommended: false,
  },
];

// ── دول الاستقطاب ────────────────────────────────────────────────────
const COUNTRIES = [
  { name: "باكستان",   flag: "🇵🇰" },
  { name: "الهند",     flag: "🇮🇳" },
  { name: "الأردن",    flag: "🇯🇴" },
  { name: "سريلانكا", flag: "🇱🇰" },
  { name: "مصر",       flag: "🇪🇬" },
  { name: "الفلبين",  flag: "🇵🇭" },
  { name: "بنجلاديش", flag: "🇧🇩" },
  { name: "أوغندا",   flag: "🇺🇬" },
  { name: "نيبال",    flag: "🇳🇵" },
  { name: "السودان",  flag: "🇸🇩" },
];

// ── خطوات الطلب ──────────────────────────────────────────────────────
const STEPS = [
  {
    n: "١",
    icon: FileCheck,
    title: "اختيار الخدمة وتقديم الطلب",
    desc: "اختر الخدمة واملأ البيانات المطلوبة ثم أرسل الطلب",
  },
  {
    n: "٢",
    icon: MessageSquare,
    title: "مراجعة وتدقيق الطلب",
    desc: "يقوم الفريق بمراجعة التفاصيل والتواصل معك عند الحاجة",
  },
  {
    n: "٣",
    icon: CheckCircle,
    title: "اتخاذ القرار",
    desc: "يتم إبلاغك بالموافقة أو الرفض مع توضيح الأسباب",
  },
  {
    n: "٤",
    icon: Handshake,
    title: "العرض المالي والموافقة",
    desc: "يُرسَل لك عرض السعر وبمجرد موافقتك يبدأ التنفيذ",
  },
  {
    n: "٥",
    icon: Sparkles,
    title: "تنفيذ الخدمة والإغلاق",
    desc: "تنفيذ الخدمة ثم إغلاق الطلب بعد التأكد من رضاك التام",
  },
];

// ── Partners logos (placeholder brand names) ──────────────────────────
const PARTNERS = ["Saudi Aramco", "STC", "SABIC", "Riyad Bank", "Vision 2030", "NEOM"];

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const [oauth, setOauth] = useState<{ google: boolean; apple: boolean }>({ google: false, apple: false });

  useEffect(() => {
    authApi.oauthStatus().then((r) => setOauth(r.data)).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>أفق لحلول الأعمال — شريكك الموثوق في السعودية</title>
        <meta name="description" content="أفق لحلول الأعمال — نقدم حلولاً شاملة لتأسيس الشركات، الخدمات القانونية، استقطاب العمالة، إدارة المنصات الحكومية وتأهيل الشركات للإدراج في سوق الأسهم." />
        <link rel="canonical" href="https://ofoqhc.com/" />
        <meta property="og:title" content="أفق لحلول الأعمال | شريكك الموثوق في السعودية" />
        <meta property="og:url" content="https://ofoqhc.com/" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════════
          Hero
      ══════════════════════════════════════════════════════════ */}
      <section
        className="min-h-screen flex items-center relative pt-20 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(8,13,42,.50),rgba(20,35,90,.70)), url('/images/hero-aramco-hq.jpg')" }}
      >
        {/* Glow orbs */}
        <div className="absolute top-32 left-16 w-80 h-80 rounded-full bg-ofoq-red/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-amber-400/8 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-ofoq-red/15 border border-ofoq-red/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-ofoq-red rounded-full animate-pulse" />
              <span className="text-red-200 text-sm font-medium">شريكك الاستراتيجي في المملكة العربية السعودية</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
              شريكك الموثوق
              <br />
              <span className="text-ofoq-red">لأعمالك</span> في السعودية
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/65 text-xl leading-relaxed mb-10 max-w-2xl">
              نقدم حلولاً شاملة لتسهيل أعمالك ونكون شريكًا استراتيجيًا في بناء مستقبل شركتك واستدامتها
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4">
              <Link to="/client/register" className="btn-yellow text-base px-8 py-4 shadow-ofoq-yellow">
                ابدأ طلبك الآن <ArrowLeft size={18} />
              </Link>
              <Link to="/services" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:border-white text-base px-8 py-4">
                استكشف خدماتنا
              </Link>
            </motion.div>

            {/* OAuth quick sign-in — only when not logged in */}
            {!isAuthenticated && (oauth.google || oauth.apple) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-5">
                <span className="text-white/35 text-xs whitespace-nowrap">أو سجّل بـ</span>
                <div className="flex items-center gap-2.5">
                  {oauth.google && (
                    <a href="/api/auth/google"
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                      <GoogleIcon /> Google
                    </a>
                  )}
                  {oauth.apple && (
                    <a href="/api/auth/apple"
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                      <AppleIcon /> Apple
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8">
              {["تأسيس الشركات", "خدمات قانونية", "موارد بشرية", "منصات حكومية"].map((s) => (
                <span key={s} className="flex items-center gap-1.5 text-white/50 text-sm">
                  <CheckCircle size={13} className="text-ofoq-red" /> {s}
                </span>
              ))}
            </motion.div>
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

      {/* ══════════════════════════════════════════════════════════
          خدماتنا
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="badge-red mb-4">خدماتنا</span>
            <h2 className="section-title mt-2">حلول متكاملة لكل احتياجاتك</h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              نقدم ٨ محاور رئيسية من الخدمات المتخصصة لدعم نمو عملك وتعزيز قدرتك التنافسية في السوق السعودي
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-default">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={s.accent} />
                  </div>
                  <h3 className="font-bold text-navy-700 text-base mb-2 leading-tight">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <Link to="/services" className={`${s.accent} text-xs font-semibold flex items-center gap-1 hover:gap-2 transition-all`}>
                    اعرف المزيد <ChevronLeft size={12} />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="btn-outline">
              استعرض جميع الخدمات <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          خطوات الطلب
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.80),rgba(28,43,110,.90)), url('/images/riyadh-itcc-tower.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-4">
              كيف تبدأ معنا؟
            </span>
            <h2 className="text-4xl font-black text-white mt-2">
              خطوات طلب الخدمة
            </h2>
            <p className="text-white/55 mt-3 text-lg">قدّم طلبك في دقائق محدودة من خلال اتباع الخطوات التالية</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[-50%] w-full h-[1px] bg-white/15 z-0" />
                  )}
                  <div className="glass rounded-2xl p-5 text-center relative z-10 hover:bg-white/10 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-ofoq-red/20 border-2 border-ofoq-red/40 flex items-center justify-center mx-auto mb-3">
                      <span className="text-ofoq-yellow font-black text-lg">{step.n}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-3">
                      <Icon size={16} className="text-white/70" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2 leading-tight">{step.title}</h4>
                    <p className="text-white/45 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/client/register" className="btn-yellow text-base px-10 py-4">
              ابدأ طلبك الآن <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          الباقات
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-16">
            <span className="badge-red mb-4">الباقات</span>
            <h2 className="section-title mt-2">
              اصنع مسار نجاحك
              <span className="block text-ofoq-red">اختر باقتك بما يناسب احتياجك</span>
            </h2>
            <p className="section-subtitle max-w-2xl mx-auto">
              اكتشف باقات أفق المصممة خصيصاً لدعم نمو أعمالك وإدارتها بثقة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-start">
            {PACKAGES.map((pkg, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className={`relative rounded-3xl overflow-hidden border-2 ${pkg.border} ${
                  pkg.recommended ? "shadow-2xl scale-[1.03]" : "shadow-lg"
                } bg-white`}>

                {pkg.recommended && (
                  <div className="absolute top-0 inset-x-0 flex justify-center">
                    <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-ofoq-navy text-xs font-black px-6 py-1.5 rounded-b-xl">
                      ⭐ موصى بها
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className={`bg-gradient-to-br ${pkg.color} p-6 ${pkg.recommended ? "pt-10" : "pt-6"}`}>
                  <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-1">{pkg.nameEn}</p>
                  <h3 className="text-white text-2xl font-black">{pkg.name}</h3>
                </div>

                {/* Features */}
                <div className="p-6 space-y-3">
                  {pkg.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle size={12} className="text-emerald-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="px-6 pb-6">
                  <Link to="/client/register"
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                      pkg.recommended
                        ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-ofoq-navy hover:opacity-90"
                        : "bg-ofoq-navy text-white hover:bg-navy-700"
                    }`}>
                    اشترك الآن <ArrowLeft size={15} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/packages" className="btn-outline">
              تفاصيل الباقات <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          دول الاستقطاب
      ══════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gray-50" id="countries">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-14">
            <span className="badge-red mb-4">دول الاستقطاب</span>
            <h2 className="section-title mt-2">نستقطب الكفاءات من حول العالم</h2>
            <p className="section-subtitle max-w-xl mx-auto">
              نمتلك شبكة واسعة من الشراكات مع وكالات التوظيف في أبرز دول الاستقطاب
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COUNTRIES.map((c, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{c.flag}</div>
                <p className="font-bold text-navy-700 text-sm mb-3">{c.name}</p>
                <Link to="/client/register"
                  className="text-xs text-ofoq-red font-semibold hover:underline">
                  اطلب الآن
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/countries" className="btn-outline">
              عرض جميع الدول <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          شركاء النجاح
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-16 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(8,13,42,.55),rgba(28,43,110,.65)), url('/images/ofoq-brand-photo2.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="text-center text-white/40 text-sm mb-8 uppercase tracking-widest">شركاء النجاح</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {PARTNERS.map((p) => (
              <div key={p} className="px-6 py-3 rounded-xl bg-white/8 border border-white/15 text-white/50 text-sm font-semibold hover:bg-white/15 hover:text-white/80 transition-all">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          لماذا أفق؟
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.72),rgba(28,43,110,.82)), url('/images/hero-riyadh-towers.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <span className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-sm font-medium mb-6">
                لماذا تختار أفق؟
              </span>
              <h2 className="text-4xl font-black text-white mt-2 mb-6 leading-tight">
                عندما تختار أفق فأنت تختار
                <br />
                <span className="text-ofoq-yellow">شريكاً استراتيجياً</span>
              </h2>
              <p className="text-white/55 text-lg leading-relaxed">
                نقدّر وقتك، ندعم طموحاتك، ونضعك على الطريق الصحيح لتحقيق أهدافك
              </p>
              <Link to="/client/register" className="btn-yellow mt-8 inline-flex">
                ابدأ رحلتك معنا <ArrowLeft size={16} />
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { title: "ندرك التغيرات المستمرة", desc: "نعتمد الديناميكية أساساً للعمل ونسخّر الأدوات المختلفة لتحقيق أهدافنا مع العميل كشركاء نجاح" },
                { title: "نفهم احتياجات القطاعات", desc: "نوفر مستشارين ومتخصصين في مجالات متعددة ونسعى لضمان توفير الكوادر المطلوبة بدقة وفاعلية" },
                { title: "نعتني بقيمكم وأهدافكم", desc: "لدينا القدرة على تحقيق أعلى مستويات الإنتاجية مع فهم دقيق لأهداف العميل وخططه المستقبلية" },
                { title: "خبرة واسعة في السوق", desc: "فريق متخصص يجمع بين الخبرة والكفاءة ويعمل بتناغم تام ينعكس على جودة الخدمات ورضا العملاء" },
              ].map((item, i) => (
                <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible"
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-ofoq-red/30 flex items-center justify-center mb-3">
                    <Star size={14} className="text-red-300" />
                  </div>
                  <h4 className="font-bold text-white mb-1.5 text-sm">{item.title}</h4>
                  <p className="text-white/45 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-24 relative bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(10,16,50,.82),rgba(28,43,110,.92)), url('/images/riyadh-evening.jpg')" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="inline-block px-5 py-2 rounded-full bg-ofoq-yellow/15 border border-ofoq-yellow/30 text-ofoq-yellow text-sm font-medium mb-6">
              لنبدأ معاً قصة نجاحك
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              نساعدك على تحقيق أهدافك
              <br />
              <span className="text-ofoq-yellow">بخطى واثقة</span>
            </h2>
            <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              تواصل معنا الآن وسيقوم فريقنا المتخصص بمساعدتك في اختيار أفضل الحلول المناسبة لعملك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/client/register" className="btn-yellow text-base px-10 py-4">
                ابدأ طلبك الآن <ArrowLeft size={18} />
              </Link>
              <Link to="/contact" className="btn-outline border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                تواصل معنا
              </Link>
            </div>

            {/* OAuth quick sign-in — bottom CTA */}
            {!isAuthenticated && (oauth.google || oauth.apple) && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className="text-white/35 text-xs">أو سجّل دخولك مباشرة بـ</span>
                {oauth.google && (
                  <a href="/api/auth/google"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                    <GoogleIcon /> Google
                  </a>
                )}
                {oauth.apple && (
                  <a href="/api/auth/apple"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                    <AppleIcon /> Apple
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
