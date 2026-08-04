import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";
import { getCategory, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

export default function ServiceCategoryPage() {
  const { categorySlug } = useParams(); const category = getCategory(categorySlug); const { lang } = useLang();
  if (!category) return <div className="p-20 text-center">Service not found</div>;
  return <div className="bg-[#f4f2ed] text-[#2B273F]"><Helmet><title>{pick(category.title, lang)} | OFOQ</title></Helmet>
    <section className="relative overflow-hidden bg-[#2B273F] px-6 py-24 text-white sm:px-10"><img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><WireframeCube color="#E5FE04" className="absolute -right-10 top-3 h-56 w-72 opacity-50" /><div className="relative mx-auto max-w-7xl"><Link to="/services" className="text-sm text-white/50 hover:text-[#E5FE04]">الخدمات /</Link><h1 className="mt-8 text-5xl font-black sm:text-7xl">{pick(category.title, lang)}</h1><p className="mt-5 max-w-xl text-lg text-white/65">{pick(category.intro, lang)}</p></div></section>
    <main className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:py-24"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{category.services.map((service, i) => <motion.div key={service.slug} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .04 }}><Link to={`/services/${category.slug}/${service.slug}`} className="group flex min-h-52 flex-col justify-between rounded-[1.75rem] border border-[#2B273F]/10 bg-white p-6 transition hover:border-[#33B27C] hover:bg-[#2B273F] hover:text-white"><span className="text-xs font-bold text-[#33B27C]">0{i + 1}</span><div><h2 className="text-xl font-black">{pick(service.title, lang)}</h2><p className="mt-3 text-sm leading-6 opacity-55">{pick(service.desc, lang).split(".")[0]}.</p><span className="mt-5 inline-block text-xs font-bold text-[#33B27C]">التفاصيل ←</span></div></Link></motion.div>)}</div></main>
  </div>;
}