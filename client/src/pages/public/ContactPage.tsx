import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { contactApi } from "../../api/client";
import WireframeCube from "../../components/WireframeCube";
import { Link, useSearchParams } from "react-router-dom";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { interest: searchParams.get("service") || "" },
  });
  useEffect(() => {
    const svc = searchParams.get("service");
    if (svc) setValue("interest", svc);
  }, [searchParams, setValue]);

  const mut = useMutation({
    mutationFn: (data: object) => contactApi.submit(data),
    onSuccess: () => setSubmitted(true),
  });

  return (
    <div>
      <Helmet>
        <title>تواصل معنا — أفق لحلول الأعمال</title>
        <meta name="description" content="تواصل مع فريق أفق لحلول الأعمال واحصل على استشارة مجانية. نرد خلال ٢٤ ساعة." />
        <link rel="canonical" href="https://ofoqhc.com/contact" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[55vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.92) 0%, rgba(43,39,63,0.50) 55%, rgba(0,0,0,0.15) 100%), url('/images/aramco-tower-sunset.jpg')",
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
            <span className="text-white/70">تواصل معنا</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight">
              تواصل
              <br />
              <span className="text-ofoq-yellow">معنا</span>
            </h1>
            <p className="text-white/50 text-sm mt-3">
              ترجى تعبئة هذا النموذج، وسيعود فريقنا للتواصل معك في أقرب وقت.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ المحتوى الرئيسي ═══════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* معلومات التواصل */}
            <div className="lg:col-span-4 space-y-4">
              {/* الخريطة */}
              <div className="rounded-3xl overflow-hidden h-48 bg-ofoq-navy/10">
                <iframe
                  title="موقع أفق لحلول الأعمال"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3713.3!2d39.17!3d21.53!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDMxJzQ4LjAiTiAzOcKwMTAnMTIuMCJF!5e0!3m2!1sar!2ssa!4v1"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* بيانات الاتصال */}
              <div className="bg-white rounded-3xl p-6 space-y-5">
                <a href="tel:+966500851177" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors flex-shrink-0">
                    <Phone size={16} className="text-ofoq-green group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">رقم الجوال</p>
                    <p className="font-bold text-ofoq-navy text-sm" dir="ltr">+966 500 851 177</p>
                  </div>
                </a>
                <a href="mailto:info@ofoqhc.com" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors flex-shrink-0">
                    <Mail size={16} className="text-ofoq-green group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">البريد الإلكتروني</p>
                    <p className="font-bold text-ofoq-navy text-sm">info@ofoqhc.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ofoq-green/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-ofoq-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">الموقع</p>
                    <p className="font-bold text-ofoq-navy text-sm">جدة — طريق الملك عبدالله</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-ofoq-green/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-ofoq-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">ساعات العمل</p>
                    <p className="font-bold text-ofoq-navy text-sm">الأحد–الخميس: ٩ص–٥م</p>
                  </div>
                </div>
              </div>

              {/* بطاقة الاستشارة */}
              <div className="relative bg-ofoq-navy rounded-3xl p-6 overflow-hidden">
                <div className="absolute left-0 bottom-0 opacity-15 pointer-events-none">
                  <WireframeCube className="w-40 h-30 text-ofoq-green" color="#33B27C" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-white mb-2">استشارة مجانية</h4>
                  <p className="text-white/55 text-sm leading-relaxed">
                    فريقنا متاح لتقديم استشارة مجانية حول احتياجات عملك.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-ofoq-yellow text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-ofoq-green animate-pulse" />
                    متاح الآن
                  </div>
                </div>
              </div>
            </div>

            {/* النموذج */}
            <div className="lg:col-span-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl p-12 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-ofoq-green/10 flex items-center justify-center mx-auto mb-6">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-ofoq-navy mb-2">تم الإرسال بنجاح!</h3>
                  <p className="text-gray-500 text-sm">سيتواصل معك فريقنا خلال ٢٤ ساعة.</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl p-6 sm:p-8"
                >
                  <h3 className="font-black text-ofoq-navy text-xl mb-8">نموذج التواصل</h3>
                  <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                      {/* الاسم */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">الاسم الكامل</label>
                        <input
                          {...register("name", { required: true })}
                          placeholder="محمد الأحمد"
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm placeholder-gray-300 transition-colors"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>}
                      </div>

                      {/* الشركة */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">الشركة / المؤسسة</label>
                        <input
                          {...register("company")}
                          placeholder="اسم الشركة"
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm placeholder-gray-300 transition-colors"
                        />
                      </div>

                      {/* البريد */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">البريد الإلكتروني</label>
                        <input
                          {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
                          type="email"
                          placeholder="email@example.com"
                          dir="ltr"
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm placeholder-gray-300 transition-colors"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">بريد إلكتروني غير صالح</p>}
                      </div>

                      {/* الجوال */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">رقم الجوال</label>
                        <input
                          {...register("phone")}
                          type="tel"
                          placeholder="+966 5X XXX XXXX"
                          dir="ltr"
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm placeholder-gray-300 transition-colors"
                        />
                      </div>

                      {/* قطاع المؤسسة */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">قطاع المؤسسة</label>
                        <select
                          {...register("sector")}
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">اختر القطاع</option>
                          <option>التجزئة</option>
                          <option>المقاولات</option>
                          <option>الخدمات المهنية</option>
                          <option>التقنية</option>
                          <option>الصحة</option>
                          <option>التعليم</option>
                          <option>أخرى</option>
                        </select>
                      </div>

                      {/* أنا مهتم بـ */}
                      <div className="mb-6">
                        <label className="block text-ofoq-navy font-bold text-sm mb-2">أنا مهتم بـ</label>
                        <select
                          {...register("interest")}
                          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm transition-colors appearance-none cursor-pointer"
                        >
                          <option value="">اختر الخدمة</option>
                          {searchParams.get("service") && (
                            <option value={searchParams.get("service")!}>{searchParams.get("service")}</option>
                          )}
                          <option>تأسيس الشركات</option>
                          <option>الخدمات القانونية</option>
                          <option>إدارة الموارد البشرية</option>
                          <option>المنصات الحكومية</option>
                          <option>خدمات المستثمرين</option>
                          <option>أخرى</option>
                        </select>
                      </div>
                    </div>

                    {/* الرسالة */}
                    <div className="mb-8">
                      <label className="block text-ofoq-navy font-bold text-sm mb-2">الرسالة</label>
                      <textarea
                        {...register("message")}
                        rows={4}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full bg-transparent border-b-2 border-gray-200 focus:border-ofoq-green outline-none py-2 text-ofoq-navy text-sm placeholder-gray-300 transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || mut.isPending}
                      className="inline-flex items-center gap-3 bg-ofoq-navy text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-ofoq-navy-light transition-colors disabled:opacity-50"
                    >
                      <span className="w-9 h-9 rounded-full bg-ofoq-green flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </span>
                      <span className="pl-2">
                        {mut.isPending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
                      </span>
                    </button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
