import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { contactApi } from "../../api/client";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

export default function ContactPage() {
  const { t } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const mut = useMutation({
    mutationFn: (data: object) => contactApi.submit(data),
    onSuccess: () => setSubmitted(true),
    onError: () => {},
  });

  return (
    <>
      <Helmet>
        <title>{t.contact.metaTitle}</title>
        <meta name="description" content="تواصل مع فريق أفق لحلول الأعمال (OFOQ) واحصل على استشارة مجانية. نرد خلال 24 ساعة." />
        <link rel="canonical" href="https://ofoqhc.com/contact" />
        <meta property="og:title" content={t.contact.metaTitle} />
        <meta property="og:url" content="https://ofoqhc.com/contact" />
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(12,19,56,.48),rgba(28,43,110,.72)), url('/images/aramco-tower-sunset.jpg')" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-red/20 text-red-200 mb-4">{t.contact.badge}</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
              {t.contact.heroTitle}
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {t.contact.heroSub}
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
                <h3 className="font-bold text-navy-700 text-lg mb-5">{t.contact.infoTitle}</h3>
                <div className="space-y-4">
                  <a href="tel:+966XXXXXXXXX" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors">
                      <Phone size={18} className="text-ofoq-green group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.contact.phone}</p>
                      <p className="font-semibold text-navy-700 text-sm">{t.contact.phoneVal}</p>
                    </div>
                  </a>
                  <a href="mailto:info@ofoq.sa" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center group-hover:bg-ofoq-green transition-colors">
                      <Mail size={18} className="text-ofoq-green group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.contact.emailLabel}</p>
                      <p className="font-semibold text-navy-700 text-sm" dir="ltr">{t.contact.emailVal}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center">
                      <MapPin size={18} className="text-ofoq-green" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.contact.locationLabel}</p>
                      <p className="font-semibold text-navy-700 text-sm">{t.contact.locationVal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ofoq-green/10 flex items-center justify-center">
                      <Clock size={18} className="text-ofoq-green" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{t.contact.hoursLabel}</p>
                      <p className="font-semibold text-navy-700 text-sm">{t.contact.hoursVal}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-ofoq-navy text-white">
                <h4 className="font-bold mb-2">{t.contact.consultTitle}</h4>
                <p className="text-white/60 text-sm leading-relaxed">{t.contact.consultDesc}</p>
                <div className="mt-4 flex items-center gap-2 text-ofoq-yellow text-sm font-semibold">
                  <CheckCircle size={16} />
                  {t.contact.available}
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
                  <h3 className="text-2xl font-bold text-navy-700 mb-2">{t.contact.successTitle}</h3>
                  <p className="text-gray-500">{t.contact.successDesc}</p>
                </motion.div>
              ) : (
                <div className="card">
                  <h3 className="font-bold text-navy-700 text-lg mb-6">{t.contact.formTitle}</h3>
                  <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">{t.contact.nameLabel}</label>
                        <input {...register("name", { required: true })} className="input-field" placeholder={t.contact.namePlaceholder} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{t.contact.required}</p>}
                      </div>
                      <div>
                        <label className="label">{t.contact.companyLabel}</label>
                        <input {...register("company")} className="input-field" placeholder={t.contact.companyPlaceholder} />
                      </div>
                      <div>
                        <label className="label">{t.contact.emailFormLabel}</label>
                        <input {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
                          type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{t.contact.emailError}</p>}
                      </div>
                      <div>
                        <label className="label">{t.contact.phoneFormLabel}</label>
                        <input {...register("phone")} className="input-field" placeholder="+966 5X XXX XXXX" dir="ltr" />
                      </div>
                    </div>
                    <div>
                      <label className="label">{t.contact.serviceLabel}</label>
                      <select {...register("service")} className="input-field">
                        <option value="">{t.contact.serviceDefault}</option>
                        {t.contact.services.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">{t.contact.messageLabel}</label>
                      <textarea
                        {...register("message", { required: true, minLength: 10 })}
                        rows={5} className="input-field resize-none"
                        placeholder={t.contact.messagePlaceholder}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{t.contact.messageError}</p>}
                    </div>
                    <button type="submit" disabled={mut.isPending} className="btn-primary w-full justify-center py-4 text-base">
                      {mut.isPending ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t.common.sending}
                        </span>
                      ) : (
                        <>{t.common.send} <Send size={16} /></>
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
