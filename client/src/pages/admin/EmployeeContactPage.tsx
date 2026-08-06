import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Send, CheckCircle2, Clock3, MessageSquare } from "lucide-react";
import { contactApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useLang } from "../../i18n/LangContext";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  interest: string;
  message: string;
};

export default function EmployeeContactPage() {
  const { user } = useAuthStore();
  const { t, dir, lang } = useLang();
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: "",
      interest: "",
      message: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: ContactForm) => contactApi.submit(data),
    onSuccess: () => {
      setSubmitted(true);
      reset({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", company: "", interest: "", message: "" });
    },
  });

  const isArabic = lang === "ar" || lang === "ur";
  const services = isArabic
    ? ["الاستشارات الاستراتيجية", "التحول الرقمي", "تحليل البيانات", "تطوير البرمجيات", "التسويق الرقمي", "أخرى"]
    : ["Strategic consulting", "Digital transformation", "Data analytics", "Software development", "Digital marketing", "Other"];

  return (
    <div dir={dir} className="mx-auto max-w-5xl space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C2B6E] to-[#0C1338] px-5 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -left-10 -top-12 h-40 w-40 rounded-full border-[24px] border-[#33B27C]/10" />
        <div className="relative max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-[#33B27C]">
            <MessageSquare size={18} />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">
              {t.contact.badge}
            </span>
          </div>
          <h1 className="text-2xl font-black leading-tight sm:text-3xl">{t.contact.heroTitle}</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/65">{t.contact.heroSub}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-4">
          <div className="card space-y-4">
            <h2 className="font-bold text-navy-700">{t.contact.infoTitle}</h2>
            <a href={`tel:${t.contact.phoneVal.replace(/\s/g, "")}`} className="flex min-w-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ofoq-green/10 text-ofoq-green"><Phone size={17} /></span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-400">{t.contact.phone}</span>
                <span className="block truncate text-sm font-bold text-navy-700" dir="ltr">{t.contact.phoneVal}</span>
              </span>
            </a>
            <a href={`mailto:${t.contact.emailVal}`} className="flex min-w-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-gray-50">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ofoq-green/10 text-ofoq-green"><Mail size={17} /></span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-400">{t.contact.emailLabel}</span>
                <span className="block truncate text-sm font-bold text-navy-700">{t.contact.emailVal}</span>
              </span>
            </a>
            <div className="flex items-center gap-3 rounded-xl p-2">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ofoq-green/10 text-ofoq-green"><MapPin size={17} /></span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-400">{t.contact.locationLabel}</span>
                <span className="block text-sm font-bold leading-6 text-navy-700">{t.contact.locationVal}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl p-2">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ofoq-green/10 text-ofoq-green"><Clock3 size={17} /></span>
              <span className="min-w-0">
                <span className="block text-xs text-gray-400">{t.contact.hoursLabel}</span>
                <span className="block text-sm font-bold text-navy-700">{t.contact.hoursVal}</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#1C2B6E] p-5 text-white">
            <h2 className="font-black">{t.contact.consultTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-white/65">{t.contact.consultDesc}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#E5FE04]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#33B27C]" />
              {t.contact.available}
            </div>
          </div>
        </aside>

        <section className="card lg:col-span-8">
          {submitted ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-3 py-10 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ofoq-green/10 text-ofoq-green">
                <CheckCircle2 size={34} />
              </div>
              <h2 className="text-xl font-black text-navy-700">{t.contact.successTitle}</h2>
              <p className="mt-2 max-w-md text-sm leading-7 text-gray-500">{t.contact.successDesc}</p>
              <button onClick={() => setSubmitted(false)} className="btn-secondary mt-6 text-sm">
                {isArabic ? "إرسال رسالة أخرى" : "Send another message"}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-black text-navy-700">{t.contact.formTitle}</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {isArabic ? "املأ النموذج وسيتواصل معك الفريق قريباً." : "Complete the form and our team will get back to you soon."}
                </p>
              </div>
              <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.nameLabel}</span>
                    <input {...register("name", { required: true, minLength: 2 })} className="input-field w-full" placeholder={t.contact.namePlaceholder} />
                    {errors.name && <span className="mt-1 block text-xs text-red-500">{t.contact.required}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.emailFormLabel}</span>
                    <input {...register("email", { required: true, pattern: /^\S+@\S+$/ })} type="email" dir="ltr" className="input-field w-full" placeholder="email@example.com" />
                    {errors.email && <span className="mt-1 block text-xs text-red-500">{t.contact.emailError}</span>}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.phoneFormLabel}</span>
                    <input {...register("phone")} type="tel" dir="ltr" className="input-field w-full" placeholder="+966 5X XXX XXXX" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.companyLabel}</span>
                    <input {...register("company")} className="input-field w-full" placeholder={t.contact.companyPlaceholder} />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.serviceLabel}</span>
                  <select {...register("interest")} className="input-field w-full">
                    <option value="">{t.contact.serviceDefault}</option>
                    {services.map((service) => <option key={service} value={service}>{service}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-navy-700">{t.contact.messageLabel}</span>
                  <textarea {...register("message", { required: true, minLength: 10 })} rows={5} className="input-field w-full resize-y" placeholder={t.contact.messagePlaceholder} />
                  {errors.message && <span className="mt-1 block text-xs text-red-500">{t.contact.messageError}</span>}
                </label>
                {submitMutation.isError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {t.contact.submitError}
                  </p>
                )}
                <button type="submit" disabled={submitMutation.isPending} className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto">
                  <Send size={16} />
                  {submitMutation.isPending ? t.common.sending : t.common.send}
                </button>
              </form>
            </>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2 text-xs text-gray-400">
        <span>{isArabic ? "تحتاج مساعدة سريعة؟" : "Need quick help?"}</span>
        <Link to="/support" className="font-semibold text-ofoq-green hover:underline">
          {isArabic ? "افتح مركز الدعم" : "Open support center"}
        </Link>
      </div>
    </div>
  );
}