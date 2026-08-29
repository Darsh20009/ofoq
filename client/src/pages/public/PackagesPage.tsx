import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

const PACKAGE_FEATURES = [
  [0, 1, 2, 3, 4],
  [0, 5, 1, 2, 3, 4, 6],
  [0, 7, 5, 8, 1, 2, 3, 9, 10, 6],
];

const COMPARISON_ROWS = [
  { index: 0, silver: true, gold: true, platinum: true },
  { index: 1, silver: true, gold: true, platinum: true },
  { index: 2, silver: true, gold: true, platinum: true },
  { index: 3, silver: true, gold: true, platinum: true },
  { index: 4, silver: true, gold: true, platinum: true },
  { index: 5, silver: false, gold: true, platinum: true },
  { index: 6, silver: false, gold: true, platinum: true },
  { index: 7, silver: false, gold: false, platinum: true },
  { index: 8, silver: false, gold: false, platinum: true },
  { index: 9, silver: false, gold: false, platinum: true },
  { index: 10, silver: false, gold: false, platinum: true },
];

const PACKAGE_META = [
  { nameEn: "Silver" },
  { nameEn: "Gold" },
  { nameEn: "Platinum" },
] as const;

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <span aria-hidden="true" className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${muted ? "border-[#d5cec6] text-[#b4aaa0]" : "border-[#b9a47f] text-[#9e865f]"}`}>
      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
        <path d="m3.2 8.2 3 3 6.6-6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const paths = [
    "M3 4h10M3 8h10M3 12h10",
    "M4 2v12M12 2v12M2 5h12M2 11h12",
    "M8 2v12M3 5h10M3 11h10",
    "M4 3h8v10H4zM6 6h4M6 9h4",
    "M3 4h10v8H3zM5 2v2M11 2v2",
    "M8 2 13 5v6l-5 3-5-3V5zM8 6v5",
    "M3 12h10M5 9h6M7 6h2M8 3v3",
  ];
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-[#9c8a70]">
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d={paths[index % paths.length]} stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function PackagesPage() {
  const { ui, dir, lang } = useLang();
  const isRtl = lang === "ar" || lang === "ur";

  const packages = PACKAGE_META.map((pkg, index) => ({
    ...pkg,
    tierIndex: index,
    name: ui.packages.names[index],
    tagline: ui.packages.taglines[index],
    badge: ui.packages.badges[index] || null,
    features: PACKAGE_FEATURES[index].map((featureIndex) => ({
      index: featureIndex,
      label: ui.packages.features[featureIndex],
    })),
  }));
  const displayedPackages = isRtl ? [...packages].reverse() : packages;
  const availabilityLabels: Record<string, [string, string]> = {
    ar: ["متاحة", "غير متاحة"],
    en: ["Included", "Not included"],
    ur: ["دستیاب", "دستیاب نہیں"],
    id: ["Tersedia", "Tidak tersedia"],
    de: ["Enthalten", "Nicht enthalten"],
    es: ["Incluido", "No incluido"],
  };
  const [includedLabel, excludedLabel] = availabilityLabels[lang] ?? availabilityLabels.en;

  return (
    <div dir={dir} className="min-h-screen bg-[#f7f3ee] text-[#071936]">
      <Helmet>
        <title>{ui.packages.title}</title>
        <meta name="description" content={ui.packages.heroSub} />
        <link rel="canonical" href="https://ofoqhc.com/packages" />
      </Helmet>

      <section className="relative isolate h-[300px] overflow-hidden border-b border-[#e4ddd4] pt-[66px] sm:h-[330px] sm:pt-[78px]">
        <img
          src="/images/ofoq-hero-reference.webp"
          alt=""
          loading="eager"
          className={`absolute inset-0 h-full w-full object-cover ${isRtl ? "object-left" : "object-right"}`}
        />
        <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-transparent via-[#f7f3ee]/65 to-[#f7f3ee]`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f7f3ee]/35 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-10">
          <div className={`w-full max-w-[530px] ${isRtl ? "ml-auto text-right" : "mr-auto text-left"}`}>
            <div className={`mb-5 flex items-center gap-2 text-[10px] font-semibold text-[#6d6862] ${isRtl ? "justify-end" : "justify-start"}`}>
              <Link to="/" className="transition-colors hover:text-[#071936]">{ui.category.home}</Link>
              <span>/</span>
              <span>{ui.packages.badge}</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-3 text-xs font-bold text-[#6a6259]"
            >
              {ui.packages.badge}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="text-4xl font-black leading-[1.15] text-[#071936] sm:text-6xl"
            >
              {ui.packages.heroTitle}{" "}
              <span className="text-[#a17d4e]">{ui.packages.heroHighlight}</span>
            </motion.h1>
            <p className="mt-4 max-w-[360px] text-xs leading-6 text-[#69635c] sm:text-sm">
              {ui.packages.heroSub}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-10 sm:py-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {displayedPackages.map((pkg, i) => (
            <motion.div
              key={pkg.nameEn}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -40px 0px" }}
              transition={{ delay: i * 0.08, duration: 0.55 }}
              className={`relative flex min-h-[330px] flex-col overflow-hidden rounded-xl border bg-[#fffdfa] shadow-[0_4px_18px_rgba(36,28,18,.06)] ${
                pkg.tierIndex === 1
                  ? "border-[#c9a878] shadow-[0_5px_22px_rgba(162,125,78,.14)]"
                  : "border-[#e1dbd3]"
              }`}
            >
              {pkg.badge && (
                <span className={`absolute top-3 rounded px-2.5 py-1 text-[9px] font-bold text-white ${isRtl ? "right-3" : "left-3"} ${pkg.tierIndex === 2 ? "bg-[#071936]" : "bg-[#a17d4e]"}`}>
                  {pkg.badge}
                </span>
              )}

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="mb-5 text-center">
                  <p className="mb-1 text-[10px] font-medium text-[#a59b91]">{pkg.nameEn}</p>
                  <h3 className="text-xl font-black text-[#071936]">{pkg.name}</h3>
                  <p className="mt-1 text-[10px] text-[#82786d]">{pkg.tagline}</p>
                </div>

                <ul className="flex-1 space-y-2.5">
                  {pkg.features.map((feature) => (
                    <li key={feature.index} className="flex items-center gap-2 text-[11px] font-medium text-[#4d4a47]">
                      <FeatureIcon index={feature.index} />
                      <span>{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/client/register"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-[11px] font-bold transition-colors ${
                    pkg.tierIndex === 1
                      ? "bg-[#a17d4e] text-white hover:bg-[#896941]"
                      : "bg-[#071936] text-white hover:bg-[#102b57]"
                  }`}
                >
                  <span aria-hidden="true">{isRtl ? "←" : "→"}</span>
                  {ui.packages.subscribe}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <h2 className="mb-3 text-right text-base font-black text-[#071936]">{ui.packages.compare}</h2>
          <div className="overflow-hidden rounded-lg border border-[#e0d9d0] bg-[#fffdfa] shadow-[0_3px_14px_rgba(36,28,18,.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="text-[11px] text-white">
                    <th className="w-[43%] bg-[#071936] px-4 py-2.5 text-right font-bold">{ui.packages.service}</th>
                    <th className="bg-[#071936] px-3 py-2.5 text-center font-bold">{ui.packages.silver}</th>
                    <th className="bg-[#cba674] px-3 py-2.5 text-center font-bold">{ui.packages.gold}</th>
                    <th className="bg-[#b4b4b1] px-3 py-2.5 text-center font-bold">{ui.packages.platinum}</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.index} className="border-b border-[#eee9e3] last:border-0">
                      <td className="px-4 py-2 text-right text-[10px] font-medium text-[#4d4a47]">{ui.packages.features[row.index]}</td>
                      {[row.silver, row.gold, row.platinum].map((included, index) => (
                        <td key={index} className="border-r border-[#eee9e3] px-3 py-2 text-center last:border-0">
                          <span className="sr-only">{included ? includedLabel : excludedLabel}</span>
                          {included ? <CheckIcon muted={index === 0} /> : <span aria-hidden="true" className="text-[#c5beb6]">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-5 overflow-hidden rounded-xl bg-[#071936] text-white"
        >
          <img
            src="/images/ofoq-smart-portal-dashboard.png"
            alt=""
            loading="lazy"
            className={`absolute inset-y-0 h-full w-[42%] object-cover opacity-35 ${isRtl ? "left-0" : "right-0"}`}
          />
          <div className={`absolute inset-0 ${isRtl ? "bg-gradient-to-r" : "bg-gradient-to-l"} from-[#071936]/40 via-[#071936]/90 to-[#071936]`} />
          <div className="relative z-10 flex min-h-[150px] flex-col items-center justify-center gap-4 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-12 sm:text-right">
            <div className={isRtl ? "sm:mr-auto" : "sm:ml-auto"}>
              <p className="mb-1 text-[9px] font-semibold text-[#c9a878]">{ui.packages.help}</p>
              <h2 className="text-2xl font-black sm:text-3xl">{ui.packages.helpTitle}</h2>
              <p className="mt-2 max-w-md text-[10px] leading-5 text-white/60">{ui.packages.heroSub}</p>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#c9a878] px-6 py-3 text-[11px] font-bold text-[#071936] transition-colors hover:bg-white"
            >
              {ui.packages.contact}
              <span aria-hidden="true">{isRtl ? "←" : "→"}</span>
            </Link>
          </div>
        </motion.section>
      </section>
    </div>
  );
}