import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

const ease = [0.22, 1, 0.36, 1] as const;

const ICON_PATHS = [
  "M3 13h10M4 13V6h8v7M6 6V3h4v3M2 13h12",
  "M3 13h10M4 13V4h8v9M6 7h4M6 10h4",
  "M8 2v12M3 5h10M3 11h10M4 2h8",
  "M3 13h10M4 13V3h8v10M6 6h4M6 9h4",
  "M3 13h10M4 13V5h8v8M6 3h4v2M6 8h4",
  "M8 2 13 5v6l-5 3-5-3V5zM8 6v5M6 8h4",
  "M3 13h10M5 10h6M6 7h4M7 4h2",
  "M3 4h10v8H3zM5 2v2M11 2v2M5 8h6",
];

function CategoryIcon({ index }: { index: number }) {
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center text-[#b39a72]">
      <svg viewBox="0 0 16 16" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d={ICON_PATHS[index % ICON_PATHS.length]} stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function ServicesPage() {
  const { lang, ui } = useLang();
  const isRtl = lang === "ar" || lang === "ur";

  return (
    <div className="min-h-screen bg-[#f7f3ee] text-[#071936]" dir={isRtl ? "rtl" : "ltr"}>
      <Helmet>
        <title>{ui.services.title}</title>
        <meta name="description" content={ui.services.heroSub} />
      </Helmet>

      <section className="relative isolate h-[430px] overflow-hidden border-b border-[#e4ddd4] pt-[66px] sm:h-[330px] sm:pt-[78px]">
        <picture>
          <source media="(max-width: 639px)" srcSet="/images/ofoq-hero-reference-mobile.webp" />
          <img
            src="/images/ofoq-hero-reference.webp"
            alt=""
            loading="eager"
            className={`absolute inset-0 h-full w-full object-cover ${isRtl ? "object-left" : "object-right"}`}
          />
        </picture>
        <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-transparent via-[#f7f3ee]/65 to-[#f7f3ee]`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7f3ee]/35 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-10">
          <div className={`w-full max-w-[540px] ${isRtl ? "ml-auto text-right" : "mr-auto text-left"}`}>
            <div className={`mb-5 flex items-center gap-2 text-[10px] font-semibold text-[#6d6862] ${isRtl ? "justify-end" : "justify-start"}`}>
              <Link to="/" className="transition-colors hover:text-[#071936]">{ui.category.home}</Link>
              <span>/</span>
              <span>{ui.category.services}</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
              className="mb-3 text-xs font-bold text-[#6a6259]"
            >
              {ui.services.areaBadge}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease }}
              className="text-4xl font-black leading-[1.15] text-[#071936] sm:text-6xl"
            >
              {ui.services.choose}
              <span className="block text-[#a17d4e]">{ui.services.yourService}</span>
            </motion.h1>
            <p className="mt-4 max-w-[420px] text-xs leading-6 text-[#69635c] sm:text-sm">
              {ui.services.heroSub}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {servicesCatalog.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ delay: (i % 4) * 0.06, duration: 0.55, ease }}
            >
              <Link
                to={`/services/${cat.slug}`}
                className="group relative flex min-h-[390px] flex-col overflow-hidden rounded-xl border border-[#e1dbd3] bg-[#fffdfa] shadow-[0_4px_18px_rgba(36,28,18,.06)] transition-all duration-500 hover:-translate-y-1 hover:border-[#b79a6e] hover:shadow-[0_10px_26px_rgba(36,28,18,.12)]"
              >
                <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-[#071936] px-1.5 text-[10px] font-bold text-white">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <CategoryIcon index={i} />
                  </div>
                  <h2 className="min-h-[48px] text-lg font-black leading-6 text-[#071936]">
                    {pick(cat.title, lang)}
                  </h2>
                  <p className="mt-2 line-clamp-2 min-h-[40px] text-[10px] leading-5 text-[#736b63]">
                    {pick(cat.intro, lang)}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {cat.services.slice(0, 3).map((service) => (
                      <li key={service.slug} className="flex items-start gap-2 text-[10px] leading-4 text-[#4d4a47]">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#b39a72]" />
                        <span className="line-clamp-1">{pick(service.title, lang)}</span>
                      </li>
                    ))}
                    {cat.services.length > 3 && (
                      <li className="pt-0.5 text-[9px] font-semibold text-[#9c8a70]">
                        +{cat.services.length - 3} {ui.services.more}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="relative h-[88px] shrink-0 overflow-hidden">
                  <img
                    src={cat.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover grayscale-[.2] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071936]/95 via-[#071936]/50 to-transparent" />
                  <span className="absolute inset-x-4 bottom-3 flex items-center justify-between text-[10px] font-bold text-white">
                    {ui.services.learnMore}
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/50 transition-colors group-hover:bg-[#c9a878] group-hover:text-[#071936]">
                      <svg viewBox="0 0 16 16" fill="none" className={`h-3 w-3 ${isRtl ? "rotate-180" : ""}`} aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="relative mt-8 overflow-hidden rounded-xl bg-[#071936] text-white"
        >
          <img
            src="/images/ofoq-hero-architecture.png"
            alt=""
            loading="lazy"
            className={`absolute inset-y-0 h-full w-[44%] object-cover opacity-35 ${isRtl ? "left-0" : "right-0"}`}
          />
          <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-[#071936]/30 via-[#071936]/90 to-[#071936]`} />
          <div className={`relative z-10 flex min-h-[160px] flex-col items-center justify-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-12 ${isRtl ? "sm:text-right" : "sm:text-left"}`}>
            <div>
              <p className="mb-1 text-[10px] font-semibold text-[#c9a878]">{ui.services.ctaBadge}</p>
              <h2 className="text-2xl font-black sm:text-3xl">{ui.services.ctaTitle}</h2>
              <p className="mt-2 max-w-md text-[10px] leading-5 text-white/60">{ui.services.heroSub}</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#c9a878] px-6 py-3 text-[11px] font-bold text-[#071936] transition-colors hover:bg-white"
            >
              {ui.home.contact}
              <span aria-hidden="true">{isRtl ? "←" : "→"}</span>
            </Link>
          </div>
        </motion.section>
      </section>
    </div>
  );
}