import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { contactApi } from "../../api/client";
import { Helmet } from "react-helmet-async";

const SERVICES = [
  "الاستشارات الاستراتيجية", "التحول الرقمي", "تحليل البيانات",
  "تطوير البرمجيات", "التسويق الرقمي", "الأمن السيبراني", "أخرى",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mut = useMutation({
    mutationFn: (data: object) => contactApi.submit(data),
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error("حدث خطأ، يرجى المحاولة مجدداً"),
  });

  return (
    <>
      <Helmet>
        <title>تواصل معنا | أفق لحلول الأعمال — استشارة مجانية</title>
        <meta name="description" content="تواصل مع فريق أفق لحلول الأعمال (OFOQ) واحصل على استشارة مجانية. نرد خلال 24 ساعة. البريد: info@ofoqhc.com — خدمة الشركات السعودية والخليجية." />
        <meta name="keywords" content="تواصل مع أفق, contact ofoq, استشارة مجانية, بريد أفق, رقم أفق, دعم أفق, ofoq contact, ofoq email, ofoq support, ofoqhc.com" />
        <link rel="canonical" href="https://ofoqhc.com/contact" />
        <meta property="og:title" content="تواصل معنا | أفق لحلول الأعمال" />
        <meta property="og:description" content="تواصل مع فريق أفق واحصل على استشارة مجانية لتحويل أعمالك رقمياً." />
        <meta property="og:url" content="https://ofoqhc.com/contact" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "تواصل معنا — أفق لحلول الأعمال",
          "url": "https://ofoqhc.com/contact",
          "description": "تواصل مع فريق أفق لحلول الأعمال للحصول على استشارة مجانية.",
          "mainEntity": {
            "@type": "Organization",
            "name": "أفق لحلول الأعمال",
            "email": "info@ofoqhc.com",
            "telephone": "+966-XX-XXX-XXXX",
            "address": { "@type": "PostalAddress", "addressCountry": "SA", "addressLocality": "الرياض" }
          }
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(12,19,56,.48),rgba(28,43,110,.72)), url('/images/aramco-tower-sunset.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">تواصل معنا</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
              نحن هنا لمساعدتك
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              تواصل مع فريقنا واحصل على استشارة مجانية. سنردّ عليك خلال 24 ساعة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="font-bold text-navy-700 text-lg mb-5">معلومات التواصل</h3>
                <div className="space-y-4">
                  <a href="tel:+966XXXXXXXXX" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors">
                      <Phone size={18} className="text-ofoq-green group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">الهاتف</p>
                      <p className="font-semibold text-navy-700 text-sm">+966 XX XXX XXXX</p>
                    </div>
                  </a>
                  <a href="mailto:info@ofoq.sa" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors">
                      <Mail size={18} className="text-ofoq-green group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">البريد الإلكتروني</p>
                      <p className="font-semibold text-navy-700 text-sm" dir="ltr">info@ofoq.sa</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center">
                      <MapPin size={18} className="text-ofoq-green" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">الموقع</p>
                      <p className="font-semibold text-navy-700 text-sm">المملكة العربية السعودية</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center">
                      <Clock size={18} className="text-ofoq-green" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">ساعات العمل</p>
                      <p className="font-semibold text-navy-700 text-sm">الأحد – الخميس، ٩ص – ٦م</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-ofoq-navy text-white">
                <h4 className="font-bold mb-2">استشارة مجانية</h4>
                <p className="text-white/60 text-sm leading-relaxed">
                  احجز جلسة استشارية مجانية لمدة ٣٠ دقيقة مع أحد خبرائنا وناقش تحديات أعمالك.
                </p>
                <div className="mt-4 flex items-center gap-2 text-ofoq-yellow text-sm font-semibold">
                  <CheckCircle size={16} />
                  متاح هذا الأسبوع
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="card text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-ofoq-green/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-ofoq-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-700 mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-gray-500">
                    شكراً لتواصلك معنا. سيقوم فريقنا بالرد عليك خلال ٢٤ ساعة.
                  </p>
                </motion.div>
              ) : (
                <div className="card">
                  <h3 className="font-bold text-navy-700 text-lg mb-6">أرسل لنا رسالة</h3>
                  <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">الاسم الكامل *</label>
                        <input {...register("name", { required: true })} className="input-field" placeholder="اسمك الكريم" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">مطلوب</p>}
                      </div>
                      <div>
                        <label className="label">الشركة</label>
                        <input {...register("company")} className="input-field" placeholder="اسم شركتك" />
                      </div>
                      <div>
                        <label className="label">البريد الإلكتروني *</label>
                        <input {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
                          type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">بريد غير صحيح</p>}
                      </div>
                      <div>
                        <label className="label">رقم الهاتف</label>
                        <input {...register("phone")} className="input-field" placeholder="+966 5X XXX XXXX" dir="ltr" />
                      </div>
                    </div>
                    <div>
                      <label className="label">الخدمة المطلوبة</label>
                      <select {...register("service")} className="input-field">
                        <option value="">اختر الخدمة...</option>
                        {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">الرسالة *</label>
                      <textarea
                        {...register("message", { required: true, minLength: 10 })}
                        rows={5} className="input-field resize-none"
                        placeholder="أخبرنا عن مشروعك أو ما تحتاجه..."
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">الرسالة مطلوبة (١٠ أحرف على الأقل)</p>}
                    </div>
                    <button type="submit" disabled={mut.isPending} className="btn-primary w-full justify-center py-4 text-base">
                      {mut.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          جاري الإرسال...
                        </span>
                      ) : (
                        <>إرسال الرسالة <Send size={16} /></>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
