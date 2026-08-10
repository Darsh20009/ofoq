import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { getCategory, pick } from "../../data/servicesCatalog";
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

export default function ServiceCategoryPage() {
  const { categorySlug } = useParams();
  const category = getCategory(categorySlug);
  const { lang, ui } = useLang();
  const [view, setView] = useState<"grid" | "list">("grid");

  if (!category) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <p className="text-5xl font-black text-[#33B27C]">404</p>
          <p className="mt-4 text-xl font-bold">
            {ui.detail.details}
          </p>
          <Link to="/services" className="mt-6 inline-block font-black text-[#33B27C] underline">
            {ui.category.services}
          </Link>
        </div>
      </div>
    );
  }

  const rtl = lang === "ar" || lang === "ur";

  return (
    <div className="bg-[#2B273F] text-white">
      <Helmet>
        <title>{pick(category.title, lang)} | OFOQ</title>
      </Helmet>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2B273F] px-6 py-28 text-white sm:px-10 sm:py-36">
        {/* Background image */}
        <img
          src={category.image}
            alt={pick(category.title, lang)}
            loading="eager"
            decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/90 via-[#2B273F]/80 to-[#2B273F]" />

        <div className="relative mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-wrap items-center gap-2 text-sm text-white/40"
          >
            <Link to="/" className="transition-colors hover:text-[#E5FE04]">
              {ui.category.home}
            </Link>
            <span>/</span>
            <Link to="/services" className="transition-colors hover:text-[#E5FE04]">
              {ui.category.services}
            </Link>
            <span>/</span>
            <span className="text-white">{pick(category.title, lang)}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.3em] text-[#E5FE04]"
          >
            <span className="h-px w-8 bg-[#E5FE04]" />
            {ui.category.badge}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="max-w-3xl text-5xl font-black sm:text-7xl"
          >
            {pick(category.title, lang)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="mt-6 max-w-xl text-lg leading-8 text-white/60"
          >
            {pick(category.intro, lang)}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.35 }}
            className="mt-5 text-sm text-white/35"
          >
            {category.services.length}&nbsp;
            {ui.category.available}
          </motion.p>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
        {/* View toggle */}
        <div className="mb-10 flex items-center justify-between">
          <p className="text-sm text-white/40">
            {category.services.length}&nbsp;
            {ui.category.service}
          </p>
          <div className="flex rounded-full border border-white/15 p-1 text-xs font-black">
            <button
              onClick={() => setView("grid")}
              className={`rounded-full px-4 py-2 transition-colors ${view === "grid" ? "bg-white text-[#2B273F]" : "text-white/45 hover:text-white"}`}
            >
              {ui.category.grid}
            </button>
            <button
              onClick={() => setView("list")}
              className={`rounded-full px-4 py-2 transition-colors ${view === "list" ? "bg-white text-[#2B273F]" : "text-white/45 hover:text-white"}`}
            >
              {ui.category.list}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {category.services.map((service, i) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.55, ease }}
                >
                  <Link
                    to={`/services/${category.slug}/${service.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-400 hover:border-[#33B27C]/40 hover:bg-white/[0.06]"
                  >
                    <span className="mb-auto text-[11px] font-black text-[#E5FE04]">
                      0{i + 1}
                    </span>
                    <div className="mt-8">
                      <h2 className="text-xl font-black text-white">{pick(service.title, lang)}</h2>
                      <p className="mt-3 text-sm leading-7 text-white/40">
                        {pick(service.desc, lang).split(".")[0]}.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-black text-[#33B27C] transition-colors group-hover:text-white">
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-[#33B27C]/30 transition-colors group-hover:bg-[#33B27C] group-hover:border-[#33B27C]">
                        <ArrowIcon className="h-3 w-3" />
                      </span>
                      {ui.category.details}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-[#2B273F]/10"
            >
              {category.services.map((service, i) => (
                <motion.div
                  key={service.slug}
                  initial={{ opacity: 0, x: rtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.5 }}
                >
                  <Link
                    to={`/services/${category.slug}/${service.slug}`}
                    className="group flex items-center justify-between gap-6 py-6 border-b border-white/8 transition-colors hover:text-[#33B27C]"
                  >
                    <div className="flex items-center gap-6">
                      <span className="w-8 shrink-0 text-sm font-black text-[#33B27C]/40 transition-colors group-hover:text-[#33B27C]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="text-lg font-black text-white group-hover:text-[#33B27C] transition-colors">{pick(service.title, lang)}</h2>
                        <p className="mt-1 text-sm text-white/35">
                          {pick(service.desc, lang).split(".")[0]}.
                        </p>
                      </div>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 text-white/30 transition-all group-hover:border-[#33B27C] group-hover:bg-[#33B27C] group-hover:text-white">
                      <ArrowIcon />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── CTA strip ─────────────────────────────────── */}
      <div className="border-t border-white/8 px-6 py-14 sm:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xl font-black text-white">{ui.category.need}</p>
            <p className="mt-2 text-sm text-white/45">{ui.category.needDesc}</p>
          </div>
          <Link
            to="/client/requests/new"
            className="group flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-black text-white transition-all hover:border-[#33B27C] hover:bg-[#33B27C]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
              <ArrowIcon />
            </span>
            {ui.category.request}
          </Link>
        </div>
      </div>
    </div>
  );
}
