import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

export default function ServicesPage() {
  const { lang } = useLang();
  return <div className="bg-[#f4f2ed] text-[#2B273F]">
    <Helmet><title>الخدمات | OFOQ Business Solutions</title></Helmet>
    <section className="relative overflow-hidden bg-[#2B273F] px-6 py-24 text-white sm:px-10 sm:py-32">
      <WireframeCube color="#33B27C" className="absolute -left-8 top-8 h-64 w-80 opacity-40" />
      <div className="relative mx-auto max-w-7xl"><p className="mb-5 text-xs font-bold tracking-[.3em] text-[#E5FE04]">THE OFOQ CATALOG</p><h1 className="max-w-3xl text-5xl font-black sm:text-7xl">خدمات مصممة<br /><span className="text-[#33B27C]">لعملك بالكامل.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/65">من تأسيس الكيان إلى تشغيله يومياً، ننسّق التفاصيل عبر فريق واحد ومسار واضح.</p></div>
    </section>
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24"><div className="grid gap-4 md:grid-cols-2">
      {servicesCatalog.map((category, i) => <motion.div key={category.slug} initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .05 }}>
        <Link to={`/services/${category.slug}`} className="group grid min-h-64 grid-cols-[1fr_160px] overflow-hidden rounded-[2rem] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex flex-col justify-between p-7"><span className="text-sm font-bold text-[#33B27C]">0{i + 1}</span><div><h2 className="text-2xl font-black">{pick(category.title, lang)}</h2><p className="mt-3 text-sm leading-7 text-[#2B273F]/60">{pick(category.intro, lang)}</p></div></div>
          <img src={category.image} alt="" className="h-full w-full object-cover grayscale transition duration-700 group-hover:grayscale-0" />
        </Link>
      </motion.div>)}
    </div></main>
  </div>;
}