import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import WireframeCube from "../../components/WireframeCube";
import { servicesCatalog, pick } from "../../data/servicesCatalog";
import { useLang } from "../../i18n/LangContext";

const reveal = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: .7 } } };

export default function HomePage() {
  const { lang } = useLang();
  return <div className="bg-[#f4f2ed] text-[#2B273F]">
    <Helmet><title>أفق لحلول الأعمال | OFOQ Business Solutions</title></Helmet>
    <section className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-[#2B273F]">
      <img src="/images/hero-riyadh-towers.jpg" alt="Riyadh skyline" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(43,39,63,.98),rgba(43,39,63,.6),rgba(43,39,63,.25))]" />
      <WireframeCube color="#33B27C" className="absolute -bottom-10 -left-8 h-[420px] w-[560px] opacity-35" />
      <WireframeCube color="#E5FE04" className="absolute right-[7%] top-[12%] h-44 w-56 rotate-12 opacity-60" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-80px)] max-w-7xl items-end px-6 pb-16 pt-28 sm:px-10 lg:pb-24">
        <motion.div initial="hidden" animate="show" variants={reveal} className="max-w-3xl">
          <p className="mb-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[.28em] text-[#E5FE04]"><span className="h-px w-12 bg-[#E5FE04]" /> OFOQ / Saudi business concierge</p>
          <h1 className="max-w-2xl text-5xl font-black leading-[1.08] text-white sm:text-7xl lg:text-8xl">نرتّب التفاصيل،<br /><span className="text-[#33B27C]">لتتفرغ للنمو.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-white/70">شريكك الموثوق في الموارد البشرية، الخدمات الحكومية، التأشيرات وتأسيس الشركات في المملكة.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/contact" className="rounded-full bg-[#E5FE04] px-7 py-4 font-black text-[#2B273F] transition-transform hover:-translate-y-1">اطلب خدمة</Link>
            <Link to="/services" className="rounded-full border border-white/30 px-7 py-4 font-black text-white transition-colors hover:border-[#33B27C] hover:bg-[#33B27C]">استكشف الخدمات</Link>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-7 right-6 text-[10px] tracking-[.3em] text-white/40 sm:right-10">RIYADH · JEDDAH · KSA</div>
    </section>
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:py-28">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={reveal} className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <p className="text-xs font-black uppercase tracking-[.25em] text-[#33B27C]">A trusted back-office partner</p>
        <h2 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">نحمل عنك الأعمال التي لا يجب أن تعطل رؤيتك.</h2>
      </motion.div>
    </section>
    <section className="bg-[#e9e7e1] px-6 py-20 sm:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between"><div><p className="mb-3 text-xs font-bold tracking-[.2em] text-[#33B27C]">WHAT WE HANDLE</p><h2 className="text-4xl font-black">مجالاتنا الرئيسية</h2></div><WireframeCube color="#2B273F" className="hidden h-24 w-32 opacity-30 sm:block" /></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {servicesCatalog.map((category, i) => <motion.div key={category.slug} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .06 }}>
            <Link to={`/services/${category.slug}`} className="group relative block min-h-56 overflow-hidden rounded-[2rem] bg-[#2B273F] p-6 text-white">
              <img src={category.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 transition duration-700 group-hover:scale-110 group-hover:opacity-40" />
              <div className="relative z-10 flex h-full flex-col justify-between"><span className="text-xs text-[#E5FE04]">0{i + 1}</span><h3 className="text-2xl font-black">{pick(category.title, lang)}</h3></div>
            </Link>
          </motion.div>)}
        </div>
      </div>
    </section>
  </div>;
}