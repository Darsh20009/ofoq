import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { getCategory, getService, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";
import { useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServiceDetailPage() {
  const { categorySlug, serviceSlug } = useParams();
  const category = getCategory(categorySlug);
  const service = getService(categorySlug, serviceSlug);
  const { lang, ui } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const requestTypeByCategory: Record<string, string> = {
    formation: "company_formation",
    legal: "legal_services",
    government: "government_services",
    visas: "government_services",
    hr: "hr_management",
    business: "hr_management",
  };

  if (!category || !service) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <p className="text-5xl font-black text-[#33B27C]">404</p>
          <p className="mt-4 text-xl font-bold">
            {ui.detail.details}
          </p>
          <Link to="/services" className="mt-6 inline-block font-black text-[#33B27C] underline">
            {ui.detail.services}
          </Link>
        </div>
      </div>
    );
  }

  const rtl = lang === "ar" || lang === "ur";

  const T = {
    home: ui.detail.home,
    services: ui.detail.services,
    serviceBadge: ui.detail.badge,
    requestService: ui.detail.request,
    howWeWork: ui.detail.how,
    faqTitle: ui.detail.faq,
    windowTitle: ui.detail.window,
    suitableFor: ui.detail.suitable,
    requirements: ui.detail.requirements,
    relatedServices: ui.detail.related,
  };

  return (
    <div className="bg-[#F7F3EE] text-[#2B273F]">
      <Helmet>
        <title>{pick(service.title, lang)} | OFOQ</title>
      </Helmet>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2B273F] px-6 py-28 text-white sm:px-10 sm:py-36">
        {/* Category image */}
        <img
          src={category.image}
            alt={pick(service.title, lang)}
            loading="eager"
            decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/95 via-[#2B273F]/85 to-[#2B273F]" />

        <div className="relative mx-auto max-w-5xl">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-wrap items-center gap-2 text-sm text-white/40"
          >
            <Link to="/" className="transition-colors hover:text-[#E5FE04]">{T.home}</Link>
            <span>/</span>
            <Link to="/services" className="transition-colors hover:text-[#E5FE04]">{T.services}</Link>
            <span>/</span>
            <Link to={`/services/${category.slug}`} className="transition-colors hover:text-[#E5FE04]">
              {pick(category.title, lang)}
            </Link>
            <span>/</span>
            <span className="text-white/70">{pick(service.title, lang)}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.3em] text-[#E5FE04]"
          >
            <span className="h-px w-8 bg-[#E5FE04]" />
            {T.serviceBadge}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="max-w-3xl text-5xl font-black sm:text-6xl"
          >
            {pick(service.title, lang)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="mt-7 max-w-2xl text-lg leading-9 text-white/60"
          >
            {pick(service.desc, lang)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease }}
            className="mt-10"
          >
            <Link
              to={`/client/requests/new?service=${requestTypeByCategory[category.slug] || ""}`}
              className="group inline-flex items-center gap-3 rounded-full bg-[#E5FE04] px-8 py-4 font-black text-[#2B273F] shadow-lg transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2B273F] transition-colors group-hover:bg-[#33B27C]">
                <ArrowIcon className="h-4 w-4 text-[#E5FE04] group-hover:text-white" />
              </span>
              {T.requestService}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-12">

          {/* ── Left: steps + FAQ ─────────────────────── */}
          <div className="space-y-16">

            {/* Steps */}
            <section>
               <h2 className="mb-8 text-3xl font-black text-[#2B273F]">{T.howWeWork}</h2>
              <div className="space-y-3">
                {service.steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: rtl ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.55, ease }}
                     className="flex items-start gap-4 rounded-2xl bg-white border border-[#2B273F]/10 p-5 shadow-[0_6px_24px_rgba(43,39,63,.04)] transition-colors hover:border-[#33B27C]/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#33B27C] font-black text-white text-sm">
                      {i + 1}
                    </span>
                     <p className="pt-1 text-sm leading-7 font-bold text-[#2B273F]/70">{pick(step, lang)}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
               <h2 className="mb-8 text-3xl font-black text-[#2B273F]">{T.faqTitle}</h2>
              <div className="space-y-2">
                {service.faq.map((item, i) => (
                   <div key={i} className="overflow-hidden rounded-2xl border border-[#2B273F]/10 bg-white">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                       className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-start font-black transition-colors hover:bg-[#2B273F]/[.03]"
                    >
                       <span className="text-sm text-[#2B273F]/80">{pick(item.q, lang)}</span>
                      <motion.span
                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#33B27C] text-white text-xl"
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease }}
                        >
                           <p className="bg-[#2B273F]/[.02] px-6 pb-5 pt-3 text-sm leading-7 text-[#2B273F]/55">
                            {pick(item.a, lang)}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right: sidebar ────────────────────────── */}
          <aside className="space-y-4">
            {/* Duration card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
               className="relative overflow-hidden rounded-2xl bg-[#2B273F] border border-white/8 p-8 text-white shadow-xl"
            >
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#E5FE04] mb-5">
                {T.windowTitle}
              </p>
              <p className="text-3xl font-black leading-tight text-white">
                {pick(service.duration, lang)}
              </p>
            </motion.div>

            {/* Who it's for */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
               className="rounded-2xl border border-[#2B273F]/10 bg-white p-7"
            >
               <h3 className="mb-5 text-base font-black text-[#2B273F]">{T.suitableFor}</h3>
              <ul className="space-y-3">
                {service.beneficiaries.map((x, i) => (
                   <li key={i} className="flex items-start gap-3 text-sm text-[#2B273F]/60">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#33B27C] flex-shrink-0" />
                    {pick(x, lang)}
                  </li>
                ))}
              </ul>

               <h3 className="mb-5 mt-8 text-base font-black text-[#2B273F]">{T.requirements}</h3>
              <ul className="space-y-3">
                {service.requirements.map((x, i) => (
                   <li key={i} className="flex items-start gap-3 text-sm text-[#2B273F]/55">
                    <span className="mt-1 text-[#33B27C] flex-shrink-0">•</span>
                    {pick(x, lang)}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Request CTA */}
            <Link
              to={`/client/requests/new?service=${requestTypeByCategory[category.slug] || ""}`}
              className="group flex items-center justify-between rounded-2xl bg-[#33B27C] p-6 text-white transition-all hover:bg-[#2a9668]"
            >
              <span className="font-black">{T.requestService}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                <ArrowIcon />
              </span>
            </Link>
          </aside>
        </div>

        {/* ── Related services ──────────────────────── */}
        {category.services.filter((s) => s.slug !== service.slug).length > 0 && (
           <section className="mt-20 pt-12 border-t border-[#2B273F]/10">
             <h2 className="mb-8 text-2xl font-black text-[#2B273F]">{T.relatedServices}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.services
                .filter((s) => s.slug !== service.slug)
                .slice(0, 3)
                .map((s, i) => (
                  <motion.div
                    key={s.slug}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.5 }}
                  >
                    <Link
                      to={`/services/${category.slug}/${s.slug}`}
                       className="group flex flex-col rounded-2xl border border-[#2B273F]/10 bg-white p-6 transition-all hover:border-[#33B27C]/40"
                    >
                       <h3 className="font-black text-[#2B273F] group-hover:text-[#33B27C] transition-colors">{pick(s.title, lang)}</h3>
                       <p className="mt-2 text-xs leading-6 text-[#2B273F]/45">
                        {pick(s.desc, lang).split(".")[0]}.
                      </p>
                      <span className="mt-4 text-xs font-black text-[#33B27C]">
                        {ui.detail.details} →
                      </span>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
