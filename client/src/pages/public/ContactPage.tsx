import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function ContactPage() {
  const { ui, lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";
  const C = ui.contact;

  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="bg-[#2B273F] text-white min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <Helmet>
        <title>{C.metaTitle}</title>
        <meta name="description" content={C.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/contact" />
      </Helmet>

      {/* ══ Hero ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[45vh] flex flex-col justify-end overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1726] to-[#2B273F]" />
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-[0.04] pointer-events-none">
          <svg viewBox="0 0 800 400" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <rect x="500" y="20" width="200" height="200" stroke="#33B27C" strokeWidth="1" />
            <rect x="560" y="80" width="200" height="200" stroke="#E5FE04" strokeWidth="1" />
            <rect x="620" y="140" width="200" height="200" stroke="#33B27C" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-16 w-full">
          <div className="flex items-center gap-2 text-white/30 text-xs mb-8">
            <Link to="/" className="hover:text-white transition-colors">{ui.category.home}</Link>
            <span>/</span>
            <span className="text-white/60">{C.badge}</span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-5"
          >
            {C.badge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease }}
            className="text-5xl sm:text-7xl font-black leading-tight max-w-2xl"
          >
            {C.heroTitle}
          </motion.h1>
        </div>
      </section>

      {/* ══ المحتوى ════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16">

          {/* معلومات التواصل */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6">
              {C.infoTitle}
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/50 text-base leading-8 mb-10 max-w-md">
              {C.heroSub}
            </motion.p>

            <div className="space-y-6">
              {[
                { label: C.phone, value: "+966 500 851 177", href: "tel:+966500851177", icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: C.emailLabel, value: "info@ofoqhc.com", href: "mailto:info@ofoqhc.com", icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: C.locationLabel, value: C.locationVal, href: "#", icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
                { label: C.hoursLabel, value: C.hoursVal, href: "#", icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )},
              ].map(({ label, value, href, icon }) => (
                <motion.a
                  key={label}
                  href={href}
                  variants={fadeUp}
                  className="flex items-start gap-4 group"
                >
                  <span className="w-10 h-10 rounded-full border border-white/12 flex items-center justify-center text-white/40 group-hover:border-[#33B27C] group-hover:text-[#33B27C] transition-all flex-shrink-0">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/30 mb-1">{label}</p>
                    <p className="text-white/70 text-sm group-hover:text-white transition-colors">{value}</p>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* استشارة مجانية */}
            <motion.div
              variants={fadeUp}
              className="mt-10 bg-white/[0.04] border border-white/8 rounded-2xl p-7"
            >
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#33B27C] mb-3">{C.consultTitle}</p>
              <p className="text-white/50 text-sm leading-7 mb-4">{C.consultDesc}</p>
              <p className="text-xs font-bold text-[#E5FE04]">{C.available}</p>
            </motion.div>
          </motion.div>

          {/* النموذج */}
          {status === "sent" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center bg-white/[0.03] border border-white/8 rounded-2xl p-14"
            >
              <div className="w-16 h-16 rounded-full bg-[#33B27C]/20 border border-[#33B27C]/40 flex items-center justify-center mb-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#33B27C" strokeWidth="2" className="w-8 h-8">
                  <path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-3">{C.successTitle}</h3>
              <p className="text-white/50 text-sm">{C.successDesc}</p>
            </motion.div>
          ) : (
            <motion.form
              initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <motion.p variants={fadeUp} className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-6">
                {C.formTitle}
              </motion.p>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: "name", label: C.nameLabel, placeholder: C.namePlaceholder, type: "text" },
                  { id: "company", label: C.companyLabel, placeholder: C.companyPlaceholder, type: "text" },
                ].map(({ id, label, placeholder, type }) => (
                  <motion.div key={id} variants={fadeUp}>
                    <label className="block text-[10px] font-bold uppercase tracking-[.2em] text-white/40 mb-2">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                      required
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#33B27C] transition-colors"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: "email", label: C.emailFormLabel, placeholder: "example@company.com", type: "email" },
                  { id: "phone", label: C.phoneFormLabel, placeholder: "+966 5X XXX XXXX", type: "tel" },
                ].map(({ id, label, placeholder, type }) => (
                  <motion.div key={id} variants={fadeUp}>
                    <label className="block text-[10px] font-bold uppercase tracking-[.2em] text-white/40 mb-2">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[id as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                      required
                      className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#33B27C] transition-colors"
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeUp}>
                <label className="block text-[10px] font-bold uppercase tracking-[.2em] text-white/40 mb-2">{C.serviceLabel}</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 text-white text-sm px-4 py-3 rounded-xl outline-none focus:border-[#33B27C] transition-colors"
                >
                  <option value="" className="bg-[#2B273F]">{C.serviceDefault}</option>
                  {C.services.map((s) => (
                    <option key={s} value={s} className="bg-[#2B273F]">{s}</option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={fadeUp}>
                <label className="block text-[10px] font-bold uppercase tracking-[.2em] text-white/40 mb-2">{C.messageLabel}</label>
                <textarea
                  rows={5}
                  placeholder={C.messagePlaceholder}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm px-4 py-3 rounded-xl outline-none focus:border-[#33B27C] transition-colors resize-none"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full flex items-center justify-center gap-3 bg-[#33B27C] text-white font-black text-sm py-4 rounded-full hover:bg-[#2a9668] transition-colors disabled:opacity-60"
                >
                  {status === "sending" ? ui.common.sending : ui.common.send}
                  {status !== "sending" && (
                    <svg viewBox="0 0 16 16" fill="none" className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}>
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {status === "error" && (
                  <p className="mt-3 text-red-400 text-xs text-center">{ui.common.error}</p>
                )}
              </motion.div>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
