import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;

function ArrowIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ServicesPage() {
  const { lang } = useLang();
  const rtl = lang === "ar" || lang === "ur";

  const T = {
    pageTitle: rtl ? "الخدمات | OFOQ" : "Services | OFOQ",
    heroBadge: "THE OFOQ CATALOG",
    heroTitle1: rtl ? "خدمات مصممة" : "Services designed",
    heroTitle2: rtl ? "لعملك بالكامل." : "for your business.",
    heroSub: rtl
      ? "من تأسيس الكيان إلى تشغيله يومياً، ننسّق التفاصيل عبر فريق واحد ومسار واضح."
      : "From entity formation to daily operations, we coordinate details through one team and a clear path.",
    viewServices: rtl ? "عرض الخدمات" : "View services",
    moreLabel: rtl ? "خدمات أخرى" : "more",
  };

  return (
    <div className="bg-white text-[#2B273F]">
      <Helmet><title>{T.pageTitle}</title></Helmet>

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#2B273F] px-6 py-28 text-white sm:px-10 sm:py-36">
        <WireframeCube color="#33B27C" className="absolute -left-10 bottom-0 h-80 w-[420px] opacity-30" />
        <WireframeCube color="#E5FE04" className="absolute right-0 top-0 h-52 w-64 opacity-25" />

        <div className="relative mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-5 flex items-center gap-3 text-[11px] font-black uppercase tracking-[.3em] text-[#E5FE04]"
          >
            <span className="h-px w-10 bg-[#E5FE04]" />
            {T.heroBadge}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.1, ease }}
            className="max-w-3xl text-5xl font-black sm:text-7xl"
          >
            {T.heroTitle1}
            <br />
            <span className="text-[#33B27C]">{T.heroTitle2}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease }}
            className="mt-7 max-w-xl text-lg leading-8 text-white/60"
          >
            {T.heroSub}
          </motion.p>
        </div>
      </section>

      {/* ── Categories grid ───────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
        <div className="grid gap-5 md:grid-cols-2">
          {servicesCatalog.map((category, i) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -60px 0px" }}
              transition={{ delay: i * 0.05, duration: 0.65, ease }}
            >
              <Link
                to={`/services/${category.slug}`}
                className="group flex overflow-hidden rounded-[2rem] border border-[#2B273F]/10 bg-white transition-all duration-500 hover:border-transparent hover:shadow-2xl"
              >
                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-8">
                  <div>
                    <span className="mb-6 block text-sm font-black text-[#33B27C]">0{i + 1}</span>
                    <h2 className="text-2xl font-black">{pick(category.title, lang)}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#2B273F]/55">
                      {pick(category.intro, lang)}
                    </p>

                    {/* Sub-services list */}
                    <ul className="mt-5 space-y-2">
                      {category.services.slice(0, 5).map((s) => (
                        <li
                          key={s.slug}
                          className="flex items-center gap-2.5 text-xs text-[#2B273F]/45"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#33B27C]" />
                          {pick(s.title, lang)}
                        </li>
                      ))}
                      {category.services.length > 5 && (
                        <li className="text-[11px] text-[#2B273F]/30">
                          +{category.services.length - 5} {T.moreLabel}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* CTA row */}
                  <div className="mt-7 flex items-center gap-3 text-sm font-black text-[#33B27C]">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#33B27C] text-white transition-transform duration-300 group-hover:scale-110">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                    {T.viewServices}
                  </div>
                </div>

                {/* Image panel */}
                <div className="hidden w-52 shrink-0 overflow-hidden sm:block">
                  <img
                    src={category.image}
                    alt=""
                    className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
