import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Building2, Scale, BadgeCheck, Landmark, Users,
  MonitorSmartphone, TrendingUp, BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cmsApi } from "../../api/client";
import type { BlogPost } from "../../types";
import WireframeCube from "../../components/WireframeCube";

/* ── زر CTA بأسلوب تسامي ── */
function ArrowPill({
  to,
  children,
  dark = false,
}: {
  to: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-4 rounded-full pr-7 pl-2.5 py-2.5 font-bold text-base transition-all hover:gap-5 ${
        dark
          ? "bg-gray-100 text-ofoq-navy hover:bg-gray-200"
          : "bg-gray-100/95 text-ofoq-navy hover:bg-white"
      }`}
    >
      <span className="w-11 h-11 rounded-full bg-ofoq-green flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </span>
      <span className="pl-2">{children}</span>
    </Link>
  );
}

/* ── الخدمات ── */
const SERVICES = [
  {
    num: "١",
    icon: Building2,
    title: "تأسيس الشركات",
    desc: "إعداد عقود التأسيس وصياغتها بما يتوافق مع القوانين المحلية، واستخراج السجل التجاري والتراخيص اللازمة.",
    dark: false,
  },
  {
    num: "٢",
    icon: Scale,
    title: "الخدمات القانونية",
    desc: "صياغة ومراجعة العقود، الاستشارات القانونية في القضايا التجارية والعمالية، والتمثيل أمام الجهات القضائية.",
    dark: true,
  },
  {
    num: "٣",
    icon: BadgeCheck,
    title: "تسجيل العلامات التجارية",
    desc: "تسجيل وحماية علامتك التجارية، ومتابعة الإجراءات مع الجهات المختصة لضمان حقوقك الكاملة.",
    dark: false,
  },
  {
    num: "٤",
    icon: Landmark,
    title: "الخدمات الحكومية",
    desc: "إنهاء الإجراءات الحكومية، استقطاب العمالة من سفارات المملكة، التراخيص التجارية والصناعية.",
    dark: true,
  },
  {
    num: "٥",
    icon: Users,
    title: "إدارة الموارد البشرية",
    desc: "التوظيف واستقطاب الكفاءات، إدارة الرواتب والأجور، برامج التدريب وتطوير الأداء.",
    dark: false,
  },
  {
    num: "٦",
    icon: MonitorSmartphone,
    title: "إدارة المنصات الحكومية",
    desc: "إدارة منصة قوى ومقيم والتأمينات الاجتماعية — تسجيل وتحديث بيانات الموظفين.",
    dark: true,
  },
  {
    num: "٧",
    icon: TrendingUp,
    title: "خدمات المستثمرين",
    desc: "استشارات قانونية ومالية لدعم قرارات الاستثمار والمساعدة في فتح الحسابات البنكية.",
    dark: false,
  },
  {
    num: "٨",
    icon: BarChart3,
    title: "تأهيل الشركات للإدراج",
    desc: "التحضير للطرح العام (IPO)، تجهيز البيانات المالية والوثائق القانونية، والامتثال لمعايير سوق الأسهم.",
    dark: true,
  },
];

/* ── الإحصائيات ── */
const STATS = [
  { val: "+٥٠٠", label: "عميل راضٍ" },
  { val: "+٨",   label: "سنوات خبرة" },
  { val: "+١٠٠٠", label: "معاملة منجزة" },
  { val: "٩٨٪",  label: "معدل رضا العملاء" },
];

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55 } }),
};

export default function HomePage() {
  /* جلب أحدث المقالات */
  const { data: blogData } = useQuery({
    queryKey: ["home-blog"],
    queryFn: () => cmsApi.blog.list({ isPublished: true, limit: 3 }).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
  const posts: BlogPost[] = blogData?.data?.posts ?? [];

  /* شريحة الخدمات */
  const [activeService, setActiveService] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const goPrev = () => setActiveService((p) => Math.max(0, p - 1));
  const goNext = () => setActiveService((p) => Math.min(SERVICES.length - 1, p + 1));

  /* تمرير الشريحة */
  useEffect(() => {
    if (!sliderRef.current) return;
    const card = sliderRef.current.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    const width = card.offsetWidth;
    sliderRef.current.scrollTo({ left: activeService * width, behavior: "smooth" });
  }, [activeService]);

  const svc = SERVICES[activeService];

  return (
    <div dir="rtl">
      <Helmet>
        <title>أفق لحلول الأعمال — شريكك الموثوق في السعودية</title>
        <meta
          name="description"
          content="أفق لحلول الأعمال — حلول شاملة لتأسيس الشركات، الخدمات القانونية، استقطاب العمالة، وإدارة المنصات الحكومية في المملكة."
        />
        <link rel="canonical" href="https://ofoqhc.com/" />
      </Helmet>

      {/* ══════════════════════════════════════════════════════════
          ١. الهيرو — خلفية داكنة صلبة
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "linear-gradient(155deg, #2B273F 0%, #1A1730 60%, #2B273F 100%)" }}
      >
        {/* ضوء خلفي */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-ofoq-green/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-ofoq-yellow/5 blur-[80px] pointer-events-none" />

        {/* مكعب ثلاثي الأبعاد — يمين */}
        <div className="absolute left-0 bottom-16 opacity-15 pointer-events-none">
          <WireframeCube className="w-64 h-44 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="absolute left-40 top-24 opacity-10 pointer-events-none rotate-12">
          <WireframeCube className="w-40 h-28 text-ofoq-yellow" color="#E5FE04" />
        </div>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-32 relative z-10 w-full">
          {/* العنوان الكبير */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.15] mb-6 text-white"
          >
            خدمات ترتقي
            <br />
            <span className="text-ofoq-green">بالشركات</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
          >
            أفق الشريك الأمثل لتمكين الجهات من تحقيق مساهمتها الفعّالة في بناء اقتصاد مزدهر
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <ArrowPill to="/services">تعرفوا على خدماتنا</ArrowPill>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors py-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              تواصل معنا
            </Link>
          </motion.div>

          {/* إحصائيات */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-10"
          >
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-black text-ofoq-yellow mb-1">{s.val}</p>
                <p className="text-white/50 text-sm">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ٢. الرؤية — صورة + نص
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[55vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.82) 0%, rgba(43,39,63,0.35) 60%, transparent 100%), url('/images/riyadh-itcc-tower.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 bottom-4 opacity-20 pointer-events-none">
          <WireframeCube className="w-56 h-40 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="absolute right-10 top-10 opacity-15 pointer-events-none">
          <WireframeCube className="w-32 h-24 text-ofoq-yellow" color="#E5FE04" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 relative z-10 w-full">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-3">
              رؤيتنا
            </h2>
            <p className="text-white/70 text-lg max-w-xl leading-relaxed">
              اقتصاد مزدهر يسمو بخدمات أعمال مبتكرة ومتميّزة
            </p>
            <div className="mt-6 flex items-center gap-2 text-white/50 text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              من نحن
            </div>
          </motion.div>
        </div>
      </section>

      {/* مهمتنا — خلفية بيضاء */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-ofoq-navy mb-4">
              مهمتنا
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-3">
              تمكين الشركات والمؤسسات من النمو وتعزيز الكفاءة من خلال تقديم خدمات أعمال موثوقة، مرنة، ورقمية مصممة خصيصًا لتلبية احتياجاتها.
            </p>
            <p className="text-gray-500 text-base leading-relaxed">
              من إدارة الرواتب والمدفوعات المؤتمنة إلى خدمات التأسيس وتهيئة الأعمال للشركات الدولية، نقدم أفق تجربة موحّدة عبر لوحة بيانات ذكية، مدعومة بالذكاء الاصطناعي في كل مرحلة.
            </p>
            <div className="mt-8">
              <ArrowPill to="/about" dark>الدخول إلى مركز أفق للأعمال</ArrowPill>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ٣. الخدمات — شريحة متحركة بأسلوب تسامي
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          {/* رأس القسم + أسهم */}
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-black text-ofoq-navy"
            >
              خدماتنا
            </motion.h2>
            <div className="flex items-center gap-2">
              <button
                onClick={goNext}
                disabled={activeService >= SERVICES.length - 1}
                className="w-11 h-11 rounded-full border-2 border-ofoq-navy/20 flex items-center justify-center text-ofoq-navy hover:border-ofoq-navy transition-colors disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              <button
                onClick={goPrev}
                disabled={activeService <= 0}
                className="w-11 h-11 rounded-full bg-ofoq-green flex items-center justify-center text-white hover:bg-ofoq-green-dark transition-colors disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* بطاقة الخدمة النشطة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* البطاقة الرئيسية */}
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={`rounded-3xl p-8 relative overflow-hidden min-h-[320px] flex flex-col justify-between ${
                svc.dark ? "bg-ofoq-navy text-white" : "bg-white text-ofoq-navy"
              }`}
            >
              <div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 ${
                    svc.dark ? "bg-white/10 text-white/70" : "bg-ofoq-navy/8 text-ofoq-navy"
                  }`}
                >
                  الخدمات {svc.num}
                </span>
                <h3
                  className={`text-2xl sm:text-3xl font-black mb-4 ${
                    svc.dark ? "text-ofoq-yellow" : "text-ofoq-green"
                  }`}
                >
                  {svc.title}
                </h3>
                <p className={`text-base leading-relaxed max-w-sm ${svc.dark ? "text-white/70" : "text-gray-600"}`}>
                  {svc.desc}
                </p>
              </div>

              <div className="flex items-end justify-between mt-8">
                <Link
                  to="/services"
                  className={`flex items-center gap-1.5 text-sm font-bold transition-all hover:gap-3 ${
                    svc.dark ? "text-ofoq-yellow" : "text-ofoq-green"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  للمزيد
                </Link>
                <div className={`opacity-20 ${svc.dark ? "text-ofoq-green" : "text-ofoq-navy"}`}>
                  <WireframeCube className="w-28 h-20" color={svc.dark ? "#33B27C" : "#2B273F"} />
                </div>
              </div>
            </motion.div>

            {/* قائمة الخدمات الأخرى */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-2">
              {SERVICES.filter((_, i) => i !== activeService).slice(0, 4).map((s, i) => {
                const Icon = s.icon;
                const origIdx = SERVICES.findIndex((x) => x.num === s.num);
                return (
                  <button
                    key={s.num}
                    onClick={() => setActiveService(origIdx)}
                    className="bg-white rounded-2xl p-4 text-right hover:shadow-md transition-all border border-gray-100 hover:border-ofoq-green/30 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-ofoq-green/10 flex items-center justify-center mb-2 group-hover:bg-ofoq-green transition-colors">
                      <Icon size={17} className="text-ofoq-green group-hover:text-white transition-colors" />
                    </div>
                    <p className="font-bold text-ofoq-navy text-sm leading-tight">{s.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* رابط كل الخدمات */}
          <div className="mt-8 flex items-center justify-start">
            <ArrowPill to="/services" dark>استعرض جميع الخدمات</ArrowPill>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ٤. جميع خدمات أعمالك — قسم أبيض
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-ofoq-navy leading-tight mb-6">
                جميع خدمات أعمالك في{" "}
                <span className="text-ofoq-green">مكان واحد</span>{" "}
                ضمن تجربة رقمية سلسة وسريعة.
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-4">
                توفّر بوابة «مركز أفق للأعمال» للشركات داخل المملكة وخارجها منظومة متكاملة من الخدمات، تدعم تأسيس أعمالكم وتشغيلها وتوسيع نطاقها.
              </p>
              <p className="text-gray-400 text-base leading-relaxed">
                من إدارة الرواتب والمدفوعات المؤتمنة إلى خدمات التأسيس وتهيئة الأعمال للشركات الدولية، نقدم تجربة موحّدة عبر لوحة بيانات ذكية مدعومة في كل مرحلة.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ArrowPill to="/client/login" dark>الدخول إلى مركز أفق للأعمال</ArrowPill>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-ofoq-navy text-sm font-medium transition-colors py-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  اكتشف المزيد
                </Link>
              </div>
            </motion.div>

            {/* كرت المزايا */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
            >
              <div className="relative rounded-3xl bg-ofoq-navy p-8 overflow-hidden">
                <div className="absolute left-0 bottom-0 opacity-15">
                  <WireframeCube className="w-48 h-36 text-ofoq-green" color="#33B27C" />
                </div>
                <div className="relative z-10 space-y-5">
                  {[
                    { n: "١", t: "تأسيس سريع", d: "نؤسس شركتك خلال أيام قليلة" },
                    { n: "٢", t: "حماية قانونية كاملة", d: "فريق قانوني متخصص يحمي مصالحك" },
                    { n: "٣", t: "إدارة رقمية متكاملة", d: "لوحة تحكم تجمع كل خدماتك في مكان واحد" },
                    { n: "٤", t: "دعم مستمر ٢٤/٧", d: "فريقنا دائماً متاح لمساعدتك" },
                  ].map((item) => (
                    <div key={item.n} className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full border border-ofoq-green/40 flex items-center justify-center text-ofoq-green font-bold text-xs flex-shrink-0">
                        {item.n}
                      </span>
                      <div>
                        <p className="font-bold text-white text-sm">{item.t}</p>
                        <p className="text-white/50 text-xs mt-0.5">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ٥. الأخبار — مقالات المدونة
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-ofoq-green text-sm font-bold mb-1">من مدونتنا</p>
              <h2 className="text-3xl sm:text-4xl font-black text-ofoq-navy">
                آخر{" "}
                <span className="text-ofoq-green">الأخبار</span>
              </h2>
            </div>
            <Link
              to="/blog"
              className="hidden sm:flex items-center gap-1.5 text-ofoq-navy/60 hover:text-ofoq-navy text-sm font-medium transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
              جميع المقالات
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden">
                  <div className="h-44 bg-ofoq-navy/5 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <motion.article
                  key={post._id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-44 bg-gradient-to-br from-ofoq-navy to-ofoq-navy-light overflow-hidden">
                    {post.coverImage && (
                      <img
                        src={`/uploads/${post.coverImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ofoq-navy/50 to-transparent" />
                  </div>
                  <div className="p-5">
                    <p className="text-ofoq-green text-xs font-bold mb-2">
                      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="font-bold text-ofoq-navy text-sm leading-tight mb-2 line-clamp-2 group-hover:text-ofoq-green transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{post.excerpt}</p>
                    )}
                    <Link
                      to="/blog"
                      className="mt-3 flex items-center gap-1 text-xs text-ofoq-green font-bold hover:gap-2 transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                      اقرأ المزيد
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ٦. فرص العمل / CTA
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: "linear-gradient(135deg, #2B273F 0%, #1A1730 100%)" }}
      >
        <div className="absolute left-0 bottom-0 opacity-12 pointer-events-none">
          <WireframeCube className="w-72 h-52 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
          <div className="text-center">
            <p className="text-white/45 text-sm mb-4">النجاح رحلة.. تبدأ مع خدماتنا</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
              لخدمات تسمو بأعمالكم{" "}
              <br />
              <span className="text-ofoq-yellow">نحن هنا</span> للمساعدة
            </h2>
            <ArrowPill to="/contact">تواصل معنا</ArrowPill>
          </div>
        </div>
      </section>
    </div>
  );
}
