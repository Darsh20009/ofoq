import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useLang } from "../../i18n/LangContext";
import type { Lang } from "../../i18n/LangContext";
import { cmsApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";
import type { Partner } from "../../types";

type Service = {
  number: string;
  href: string;
  ar: string;
  en: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
};

const services: Service[] = [
  { number: "01", href: "/services/hr", ar: "الموارد البشرية", en: "Human resources", descriptionAr: "إدارة مواردك البشرية لدعم نمو أعمالك.", descriptionEn: "Human resource management that supports your growth.", icon: "people" },
  { number: "02", href: "/services/formation", ar: "تأسيس الشركات", en: "Company formation", descriptionAr: "من الفكرة إلى كيان عامل، ننسّق خطوات التأسيس.", descriptionEn: "From idea to operating entity, we coordinate every step.", icon: "building" },
  { number: "03", href: "/services/visas", ar: "خدمات التأشيرات", en: "Visa services", descriptionAr: "حلول متكاملة لتأشيرات المستثمرين والموظفين.", descriptionEn: "Integrated solutions for investor and employee visas.", icon: "passport" },
  { number: "04", href: "/services/government", ar: "الخدمات الحكومية", en: "Government services", descriptionAr: "نتابع معاملاتك الحكومية بوضوح وسرعة.", descriptionEn: "We manage your government transactions clearly and quickly.", icon: "government" },
  { number: "05", href: "/services/contracts", ar: "العقود والاتفاقيات", en: "Contracts & agreements", descriptionAr: "نصيغ ونراجع عقودك لحماية علاقاتك التجارية.", descriptionEn: "We draft and review contracts that protect your commercial relationships.", icon: "contract" },
  { number: "06", href: "/services/legal", ar: "الخدمات القانونية", en: "Legal services", descriptionAr: "إرشاد قانوني عملي يساعدك على العمل بثقة وامتثال.", descriptionEn: "Practical legal guidance to help you operate with confidence and compliance.", icon: "legal" },
  { number: "07", href: "/services/business", ar: "حلول الأعمال", en: "Business solutions", descriptionAr: "خدمات تشغيلية مرنة تمنح فريقك مساحة أكبر للنمو.", descriptionEn: "Flexible operational services that give your team more room to grow.", icon: "briefcase" },
  { number: "08", href: "/services/marketing", ar: "التسويق", en: "Marketing", descriptionAr: "نبني حضورًا واضحًا وطلبًا قابلًا للقياس لعلامتك.", descriptionEn: "We build a clear presence and measurable demand for your brand.", icon: "marketing" },
];

type HomePageCopy = {
  stats: string[];
  servicesEyebrow: string;
  learnMore: string;
  nextServices: string;
  portalEyebrow: string;
  portalTitle: string;
  portalDescription: string;
  portalFeatures: string[];
  openPortal: string;
  portalImageAlt: string;
  joinEyebrow: string;
  joinTitle: string;
  joinDescription: string;
  joinCta: string;
  partnersTitle: string;
  partnersHint: string;
  partnersLoading: string;
  partnersFallback: string;
  partnersEmpty: string;
  viewPartnerDetails: (name: string) => string;
  close: string;
  closePartnerDetails: string;
  partnershipsEyebrow: string;
  partnership: string;
  delivered: string;
};

const homePageCopy: Record<Lang, HomePageCopy> = {
  ar: {
    stats: ["نسبة رضا العملاء", "معاملة مكتملة", "عميل وثق بنا", "سنوات من الخبرة"], servicesEyebrow: "خدمات أفق", learnMore: "اعرف أكثر ←", nextServices: "الخدمات التالية",
    portalEyebrow: "بوابة أفق الذكية", portalTitle: "لإدارة أعمالك بسهولة", portalDescription: "منصة رقمية متكاملة تمنحك رؤية واضحة وتحكمًا كاملًا في خدماتك ومعاملاتك.", portalFeatures: ["متابعة الطلبات والمعاملات أولًا بأول", "مستنداتك وفواتيرك في مكان واحد", "تقارير ذكية تساعدك على اتخاذ القرار"], openPortal: "الدخول إلى البوابة", portalImageAlt: "لوحة بوابة أفق الذكية",
    joinEyebrow: "كن جزءًا من أفق", joinTitle: "شريكك في رحلة النمو", joinDescription: "انضم إلى أكثر من 1,250 عميلًا يثقون بأفق لإدارة أعمالهم بثقة ووضوح.", joinCta: "ابدأ معنا الآن",
    partnersTitle: "شركاؤنا", partnersHint: "اضغط على الشعار للتعرّف على تفاصيل الشراكة", partnersLoading: "جارٍ تحديث الشركاء...", partnersFallback: "نعرض البيانات المحفوظة", partnersEmpty: "سيتم عرض الشركاء هنا قريبًا.", viewPartnerDetails: (name) => `عرض تفاصيل ${name}`, close: "إغلاق", closePartnerDetails: "إغلاق نافذة الشريك", partnershipsEyebrow: "شراكات أفق", partnership: "طبيعة الشراكة", delivered: "ما قدمته أفق",
  },
  en: {
    stats: ["Client satisfaction", "Completed transactions", "Trusted clients", "Years of experience"], servicesEyebrow: "OFOQ SERVICES", learnMore: "Learn more →", nextServices: "Next services",
    portalEyebrow: "OFOQ SMART PORTAL", portalTitle: "Manage your business with ease", portalDescription: "An integrated digital platform giving you complete visibility and control over your services and transactions.", portalFeatures: ["Track requests and transactions in real time", "Keep documents and invoices in one place", "Smart reports to help you decide"], openPortal: "Open the portal", portalImageAlt: "OFOQ smart portal dashboard",
    joinEyebrow: "BE PART OF OFOQ", joinTitle: "Your partner for the growth journey", joinDescription: "Join more than 1,250 clients who trust OFOQ to manage their business with confidence and clarity.", joinCta: "Start with us",
    partnersTitle: "Our partners", partnersHint: "Select a logo to explore our partnership", partnersLoading: "Updating partners...", partnersFallback: "Showing saved partners", partnersEmpty: "Partners will appear here soon.", viewPartnerDetails: (name) => `View ${name} details`, close: "Close", closePartnerDetails: "Close partner details", partnershipsEyebrow: "OFOQ PARTNERSHIPS", partnership: "The partnership", delivered: "What OFOQ delivered",
  },
  ur: {
    stats: ["صارفین کا اطمینان", "مکمل شدہ معاملات", "قابلِ اعتماد کلائنٹس", "سالوں کا تجربہ"], servicesEyebrow: "اُفق خدمات", learnMore: "مزید جانیں ←", nextServices: "اگلی خدمات",
    portalEyebrow: "اُفق اسمارٹ پورٹل", portalTitle: "اپنے کاروبار کو آسانی سے منظم کریں", portalDescription: "ایک مربوط ڈیجیٹل پلیٹ فارم جو آپ کو اپنی خدمات اور معاملات پر مکمل بصیرت اور کنٹرول دیتا ہے۔", portalFeatures: ["درخواستوں اور معاملات کو بروقت ٹریک کریں", "دستاویزات اور انوائس ایک جگہ رکھیں", "بہتر فیصلوں کے لیے اسمارٹ رپورٹس"], openPortal: "پورٹل کھولیں", portalImageAlt: "اُفق اسمارٹ پورٹل ڈیش بورڈ",
    joinEyebrow: "اُفق کا حصہ بنیں", joinTitle: "ترقی کے سفر میں آپ کے ساتھی", joinDescription: "1,250 سے زیادہ کلائنٹس میں شامل ہوں جو اعتماد اور وضاحت کے ساتھ کاروبار چلانے کے لیے اُفق پر بھروسا کرتے ہیں۔", joinCta: "آج ہی شروع کریں",
    partnersTitle: "ہمارے شراکت دار", partnersHint: "شراکت کی تفصیلات دیکھنے کے لیے لوگو منتخب کریں", partnersLoading: "شراکت دار اپ ڈیٹ ہو رہے ہیں...", partnersFallback: "محفوظ شدہ شراکت دار دکھائے جا رہے ہیں", partnersEmpty: "شراکت دار جلد یہاں دکھائی دیں گے۔", viewPartnerDetails: (name) => `${name} کی تفصیلات دیکھیں`, close: "بند کریں", closePartnerDetails: "شراکت دار کی تفصیلات بند کریں", partnershipsEyebrow: "اُفق شراکت داریاں", partnership: "شراکت داری", delivered: "اُفق نے کیا فراہم کیا",
  },
  hi: {
    stats: ["ग्राहक संतुष्टि", "पूर्ण लेनदेन", "विश्वसनीय ग्राहक", "वर्षों का अनुभव"], servicesEyebrow: "OFOQ सेवाएँ", learnMore: "और जानें →", nextServices: "अगली सेवाएँ",
    portalEyebrow: "OFOQ स्मार्ट पोर्टल", portalTitle: "अपने व्यवसाय को आसानी से प्रबंधित करें", portalDescription: "एक एकीकृत डिजिटल प्लेटफ़ॉर्म जो आपकी सेवाओं और लेनदेन पर पूरी दृश्यता और नियंत्रण देता है।", portalFeatures: ["अनुरोधों और लेनदेन को रियल टाइम में ट्रैक करें", "दस्तावेज़ और इनवॉइस एक जगह रखें", "निर्णय में मदद करने वाली स्मार्ट रिपोर्ट"], openPortal: "पोर्टल खोलें", portalImageAlt: "OFOQ स्मार्ट पोर्टल डैशबोर्ड",
    joinEyebrow: "OFOQ का हिस्सा बनें", joinTitle: "विकास की यात्रा में आपका साथी", joinDescription: "1,250 से अधिक ग्राहकों से जुड़ें जो अपने व्यवसाय को भरोसे और स्पष्टता के साथ प्रबंधित करने के लिए OFOQ पर विश्वास करते हैं।", joinCta: "हमारे साथ शुरू करें",
    partnersTitle: "हमारे साझेदार", partnersHint: "हमारी साझेदारी देखने के लिए लोगो चुनें", partnersLoading: "साझेदार अपडेट हो रहे हैं...", partnersFallback: "सहेजे गए साझेदार दिखाए जा रहे हैं", partnersEmpty: "साझेदार जल्द ही यहाँ दिखाई देंगे।", viewPartnerDetails: (name) => `${name} का विवरण देखें`, close: "बंद करें", closePartnerDetails: "साझेदार का विवरण बंद करें", partnershipsEyebrow: "OFOQ साझेदारियाँ", partnership: "साझेदारी", delivered: "OFOQ ने क्या प्रदान किया",
  },
  id: {
    stats: ["Kepuasan klien", "Transaksi selesai", "Klien tepercaya", "Tahun pengalaman"], servicesEyebrow: "LAYANAN OFOQ", learnMore: "Pelajari lebih lanjut →", nextServices: "Layanan berikutnya",
    portalEyebrow: "PORTAL CERDAS OFOQ", portalTitle: "Kelola bisnis Anda dengan mudah", portalDescription: "Platform digital terpadu yang memberi Anda visibilitas dan kendali penuh atas layanan serta transaksi Anda.", portalFeatures: ["Lacak permintaan dan transaksi secara real time", "Simpan dokumen dan faktur di satu tempat", "Laporan cerdas untuk membantu pengambilan keputusan"], openPortal: "Buka portal", portalImageAlt: "Dasbor portal cerdas OFOQ",
    joinEyebrow: "JADI BAGIAN DARI OFOQ", joinTitle: "Mitra Anda dalam perjalanan pertumbuhan", joinDescription: "Bergabunglah dengan lebih dari 1.250 klien yang mempercayai OFOQ untuk mengelola bisnis mereka dengan yakin dan jelas.", joinCta: "Mulai bersama kami",
    partnersTitle: "Mitra kami", partnersHint: "Pilih logo untuk menjelajahi kemitraan kami", partnersLoading: "Memperbarui mitra...", partnersFallback: "Menampilkan mitra tersimpan", partnersEmpty: "Mitra akan segera tampil di sini.", viewPartnerDetails: (name) => `Lihat detail ${name}`, close: "Tutup", closePartnerDetails: "Tutup detail mitra", partnershipsEyebrow: "KEMITRAAN OFOQ", partnership: "Kemitraan", delivered: "Yang OFOQ berikan",
  },
  de: {
    stats: ["Kundenzufriedenheit", "Abgeschlossene Vorgänge", "Vertrauensvolle Kunden", "Jahre Erfahrung"], servicesEyebrow: "OFOQ-LEISTUNGEN", learnMore: "Mehr erfahren →", nextServices: "Nächste Leistungen",
    portalEyebrow: "OFOQ SMART-PORTAL", portalTitle: "Verwalten Sie Ihr Unternehmen mühelos", portalDescription: "Eine integrierte digitale Plattform, die Ihnen vollständige Transparenz und Kontrolle über Ihre Leistungen und Vorgänge gibt.", portalFeatures: ["Anfragen und Vorgänge in Echtzeit verfolgen", "Dokumente und Rechnungen an einem Ort verwalten", "Intelligente Berichte für Ihre Entscheidungen"], openPortal: "Portal öffnen", portalImageAlt: "OFOQ Smart-Portal-Dashboard",
    joinEyebrow: "WERDEN SIE TEIL VON OFOQ", joinTitle: "Ihr Partner auf dem Wachstumskurs", joinDescription: "Schließen Sie sich mehr als 1.250 Kunden an, die OFOQ bei der klaren und sicheren Verwaltung ihres Unternehmens vertrauen.", joinCta: "Mit uns starten",
    partnersTitle: "Unsere Partner", partnersHint: "Wählen Sie ein Logo, um unsere Partnerschaft zu entdecken", partnersLoading: "Partner werden aktualisiert...", partnersFallback: "Gespeicherte Partner werden angezeigt", partnersEmpty: "Partner werden bald hier angezeigt.", viewPartnerDetails: (name) => `Details zu ${name} anzeigen`, close: "Schließen", closePartnerDetails: "Partnerdetails schließen", partnershipsEyebrow: "OFOQ-PARTNERSCHAFTEN", partnership: "Die Partnerschaft", delivered: "Was OFOQ geleistet hat",
  },
  es: {
    stats: ["Satisfacción del cliente", "Transacciones completadas", "Clientes de confianza", "Años de experiencia"], servicesEyebrow: "SERVICIOS OFOQ", learnMore: "Saber más →", nextServices: "Siguientes servicios",
    portalEyebrow: "PORTAL INTELIGENTE OFOQ", portalTitle: "Gestione su negocio con facilidad", portalDescription: "Una plataforma digital integrada que le brinda visibilidad y control total sobre sus servicios y transacciones.", portalFeatures: ["Siga solicitudes y transacciones en tiempo real", "Guarde documentos y facturas en un solo lugar", "Informes inteligentes para ayudarle a decidir"], openPortal: "Abrir el portal", portalImageAlt: "Panel del portal inteligente OFOQ",
    joinEyebrow: "SEA PARTE DE OFOQ", joinTitle: "Su aliado en el camino del crecimiento", joinDescription: "Únase a más de 1.250 clientes que confían en OFOQ para gestionar su negocio con confianza y claridad.", joinCta: "Empiece con nosotros",
    partnersTitle: "Nuestros socios", partnersHint: "Seleccione un logotipo para conocer nuestra alianza", partnersLoading: "Actualizando socios...", partnersFallback: "Mostrando socios guardados", partnersEmpty: "Los socios aparecerán aquí pronto.", viewPartnerDetails: (name) => `Ver detalles de ${name}`, close: "Cerrar", closePartnerDetails: "Cerrar detalles del socio", partnershipsEyebrow: "ALIANZAS OFOQ", partnership: "La alianza", delivered: "Lo que OFOQ entregó",
  },
};

function LineIcon({ type, className = "" }: { type: string; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "people") return <svg viewBox="0 0 48 48" className={className} {...common}><circle cx="18" cy="16" r="5" /><circle cx="31" cy="18" r="4" /><path d="M7 36c1-7 5-10 11-10s10 3 11 10M27 28c6-4 12 0 14 7" /></svg>;
  if (type === "passport") return <svg viewBox="0 0 48 48" className={className} {...common}><rect x="10" y="6" width="28" height="36" rx="3" /><circle cx="24" cy="20" r="5" /><path d="M17 32h14M17 37h9M24 15v10M19 20h10" /></svg>;
  if (type === "government") return <svg viewBox="0 0 48 48" className={className} {...common}><path d="m7 18 17-9 17 9M10 20h28M13 20v15M21 20v15M29 20v15M37 20v15M8 39h32M6 43h36" /></svg>;
  if (type === "contract") return <svg viewBox="0 0 48 48" className={className} {...common}><path d="M12 6h18l7 7v29H12zM30 6v9h7M18 23h13M18 29h13M18 35h8" /><path d="m29 35 3 3 6-7" /></svg>;
  if (type === "legal") return <svg viewBox="0 0 48 48" className={className} {...common}><path d="M24 8v31M16 40h16M12 12h24M8 15l-6 12h12zM36 15l-6 12h12zM2 27c1 4 11 4 12 0M30 27c1 4 11 4 12 0" /></svg>;
  if (type === "briefcase") return <svg viewBox="0 0 48 48" className={className} {...common}><rect x="6" y="14" width="36" height="26" rx="3" /><path d="M17 14v-4h14v4M6 24h36M21 24v4h6v-4" /></svg>;
  if (type === "marketing") return <svg viewBox="0 0 48 48" className={className} {...common}><path d="M8 27h8l20 9V12l-20 9H8zM16 27l3 12h6l-3-12M36 20c4 2 5 7 0 10" /></svg>;
  return <svg viewBox="0 0 48 48" className={className} {...common}><path d="M7 40V18l10-5v27M17 40V10l11-5v35M28 40V21l13-6v25M5 43h38" /><path d="M12 23h1M12 29h1M22 16h1M22 22h1M34 27h1M34 33h1" /></svg>;
}

export default function HomePage() {
  const { ui, lang, dir } = useLang();
  const pageCopy = homePageCopy[lang];
  const useArabicContent = lang === "ar";
  const copy = {
    titleOne: ui.home.hero1,
    titleTwo: ui.home.hero2,
    description: ui.home.heroSub,
    explore: ui.home.explore,
    watch: ui.home.aboutCta,
    allServices: ui.home.servicesAll,
    servicesTitleOne: ui.home.servicesTitle1,
    servicesTitleTwo: ui.home.servicesTitle2,
    servicesDescription: ui.home.aboutDesc,
  };
  const featuredServices = services;

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={copy.description} />
        <link rel="preload" as="image" href="/images/ofoq-hero-reference.webp" media="(min-width: 640px)" />
        <link rel="preload" as="image" href="/images/ofoq-hero-reference-mobile.webp" media="(max-width: 639px)" />
      </Helmet>
      <main dir={dir} className="relative overflow-hidden bg-[#F4F1EC] text-[#071936]">
        <section className="relative min-h-[620px] overflow-visible bg-[#F4F1EC] pt-16 sm:min-h-[625px] sm:pt-[78px] lg:min-h-[535px]">
          <div className="absolute inset-0 bg-[#F4F1EC]" />
          <div className="pointer-events-none absolute left-[-14%] top-[7%] h-[430px] w-[430px] rounded-full border border-[#071936]/[.035] sm:h-[620px] sm:w-[620px]" />
          <div className="pointer-events-none absolute left-[4%] top-[26%] h-[260px] w-[260px] rounded-full border border-[#C13229]/[.07]" />
          <picture className="pointer-events-none absolute inset-0">
            <source media="(max-width: 639px)" srcSet="/images/ofoq-hero-reference-mobile.webp" />
            <img
              src="/images/ofoq-hero-reference.webp"
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </picture>

          <div className="relative z-10 mx-auto grid min-h-[510px] max-w-[1480px] items-center gap-3 px-5 pb-24 pt-10 [direction:ltr] sm:min-h-[470px] sm:grid-cols-[1.02fr_.98fr] sm:px-10 sm:pb-24 sm:pt-0 lg:min-h-[440px] lg:px-16">
            <div dir={dir} className="order-1 z-10 text-right sm:col-start-2 sm:order-2 sm:pr-8 lg:pr-16 xl:pr-24">
              <h1 className="max-w-[540px] text-[2.15rem] font-black leading-[1.12] tracking-[-.045em] sm:text-[clamp(2.5rem,5vw,4.55rem)]">
                <span className="block whitespace-nowrap">{copy.titleOne}</span>
                <span className="block whitespace-nowrap">{copy.titleTwo}</span>
              </h1>
              <p className="mt-4 max-w-[345px] text-xs font-semibold leading-7 text-[#061a36] sm:mt-5 sm:max-w-[430px] sm:text-base sm:leading-8">{copy.description}</p>
              <div className="mt-6 flex flex-col items-start gap-4 sm:mt-7 sm:flex-row sm:items-center sm:justify-end sm:gap-5 sm:[direction:ltr]">
                <Link to="/services" className="inline-flex items-center gap-3 rounded-md bg-[#071936] px-5 py-3 text-xs font-bold text-white shadow-[0_12px_24px_rgba(7,25,54,.16)] transition-colors hover:bg-[#102b57] sm:text-sm">
                  {copy.explore}<span className="text-lg text-[#C5B278]">←</span>
                </Link>
                <Link to="/about" className="inline-flex items-center gap-3 text-xs font-bold text-[#071936]/75 sm:text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C13229] text-[10px] text-[#C13229] sm:h-9 sm:w-9 sm:text-xs">▶</span>{copy.watch}
                </Link>
              </div>
            </div>
          </div>
          <div dir="rtl" className="absolute bottom-[-14px] left-1/2 z-20 grid w-[85%] max-w-[1120px] -translate-x-1/2 grid-cols-4 overflow-hidden rounded-[16px] bg-[#071936] text-white shadow-[0_-8px_30px_rgba(7,25,54,.16)] sm:bottom-[-18px] sm:rounded-[20px]">
            {[
              { value: "98%", label: pageCopy.stats[0], icon: "★" },
              { value: "25,000+", label: pageCopy.stats[1], icon: "✓" },
              { value: "1,250+", label: pageCopy.stats[2], icon: "♧" },
              { value: "8+", label: pageCopy.stats[3], icon: "◉" },
            ].map((stat, index) => (
              <div key={stat.value} className={`flex min-w-0 items-center justify-center gap-1 px-0.5 py-1.5 sm:gap-3 sm:px-5 sm:py-5 ${index > 0 ? "border-r border-white/10" : ""}`}>
                <span className="text-[10px] text-[#C5B278] sm:text-2xl">{stat.icon}</span>
                <div className="min-w-0"><strong className="block text-[10px] font-black sm:text-xl">{stat.value}</strong><span className="block truncate text-[5px] text-white/60 sm:text-[10px]">{stat.label}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative isolate overflow-hidden pb-10 pt-14 text-white sm:pb-16 sm:pt-14">
          <picture className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[150px] sm:h-[190px]">
            <source media="(max-width: 639px)" srcSet="/images/ofoq-hero-reference-mobile.webp" />
            <img
              src="/images/ofoq-hero-reference.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-bottom"
            />
          </picture>
          <div className="pointer-events-none absolute inset-0 z-0 rounded-tl-[58px] bg-[#071936] sm:rounded-tl-[128px]" />
          <div className="relative z-10 mx-auto grid max-w-[1480px] gap-8 px-5 [direction:ltr] sm:gap-10 sm:px-10 lg:grid-cols-[.62fr_1.85fr] lg:items-start lg:px-16">
            <div dir={dir} className={dir === "rtl" ? "text-right" : "text-left"}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#C5B278] sm:mb-4 sm:text-xs">{pageCopy.servicesEyebrow}</p>
              <h2 className="text-[2.25rem] font-black leading-[1.15] tracking-[-.03em] sm:text-[3.25rem]"><span className="block">{copy.servicesTitleOne}</span><span className="block text-[#C5B278]">{copy.servicesTitleTwo}</span></h2>
              <p className="mt-4 max-w-xs text-xs leading-6 text-white/60 sm:mt-5 sm:text-sm sm:leading-7">{copy.servicesDescription}</p>
              <Link to="/services" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#C13229] sm:mt-7 sm:text-sm">{copy.allServices}<span>←</span></Link>
            </div>

            <div dir={dir} className="flex snap-x gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3">
              {featuredServices.map((service, index) => {
                const title = useArabicContent ? service.ar : service.en;
                const description = useArabicContent ? service.descriptionAr : service.descriptionEn;
                const active = index === 0;
                return (
                  <Link to={service.href} key={service.href} className={`group relative flex h-[230px] min-w-[190px] snap-start flex-col rounded-lg border p-3.5 transition-transform hover:-translate-y-1 sm:h-[250px] sm:min-w-[225px] sm:rounded-xl sm:p-5 ${active ? "border-[#C5B278] bg-[#F4F1EC] text-[#071936] shadow-[0_12px_25px_rgba(0,0,0,.12)]" : "border-white/10 bg-[#102d56] text-white"}`}>
                    <span className={`text-[10px] font-bold sm:text-xs ${active ? "text-[#C13229]" : "text-[#C5B278]"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <LineIcon type={service.icon} className={`mb-3 mt-4 h-8 w-8 sm:mb-3 sm:mt-5 sm:h-9 sm:w-9 ${active ? "text-[#C13229]" : "text-[#C5B278]"}`} />
                    <h3 className="min-h-[2.5rem] text-sm font-black sm:text-base">{title}</h3>
                    <p className={`mt-2 min-h-10 line-clamp-2 text-[10px] leading-5 sm:text-[11px] sm:leading-5 ${active ? "text-[#071936]/60" : "text-white/55"}`}>{description}</p>
                    <span className={`mt-auto block pt-3 text-[9px] font-bold sm:text-[10px] ${active ? "text-[#C13229]" : "text-white/70"}`}>{pageCopy.learnMore}</span>
                  </Link>
                );
              })}
              <button aria-label={pageCopy.nextServices} className="my-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-lg text-white/80 transition-colors hover:border-[#C5B278] hover:text-[#C5B278] sm:h-10 sm:w-10">‹</button>
            </div>
          </div>
        </section>

        <section className="bg-[#071936] px-5 pb-16 text-white sm:px-10 sm:pb-24 lg:px-16">
          <div className="mx-auto grid max-w-[1380px] items-center gap-8 overflow-hidden rounded-[24px] border border-white/10 bg-[#122846] px-6 py-8 [direction:ltr] sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:px-14 lg:py-10">
            <div dir={dir} className="order-2 text-right lg:order-2">
              <p className="mb-3 text-xs font-bold text-[#C5B278]">{pageCopy.portalEyebrow}</p>
              <h2 className="max-w-lg text-3xl font-black leading-[1.35] sm:text-4xl">
                {pageCopy.portalTitle}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/60">
                {pageCopy.portalDescription}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-white/75">
                {pageCopy.portalFeatures.map((item) => (
                  <li key={item} className="flex items-center justify-end gap-3">
                    <span>{item}</span><span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#C5B278] text-[10px] text-[#C5B278]">✓</span>
                  </li>
                ))}
              </ul>
              <Link to="/client/login" className="mt-7 inline-flex rounded-lg bg-[#C5B278] px-5 py-3 text-sm font-bold text-[#071936] transition-colors hover:bg-white">
                {pageCopy.openPortal}
              </Link>
            </div>
            <div className="order-1 flex justify-center lg:order-1 lg:justify-start">
              <div className="relative w-full max-w-[580px] overflow-hidden rounded-[18px]">
                <div className="aspect-[856/538] overflow-hidden rounded-[14px]">
                  <img src="/images/ofoq-smart-portal-dashboard.png" alt={pageCopy.portalImageAlt} loading="lazy" decoding="async" className="h-full w-full object-contain object-center" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <PartnersSection dir={dir} useArabicContent={useArabicContent} copy={pageCopy} />

        <section className="bg-[#071936] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16">
          <div className="relative mx-auto min-h-[235px] max-w-[1380px] overflow-hidden rounded-[24px] border border-white/10 bg-[#102d56]">
            <img src="/images/riyadh-district-dark.png" alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-l from-[#071936]/95 via-[#071936]/75 to-[#071936]/25" />
            <div className="relative grid min-h-[235px] items-center gap-8 px-6 py-8 [direction:ltr] sm:px-12 lg:grid-cols-[1fr_1.2fr] lg:px-16">
              <div className="hidden justify-center lg:flex">
                <OfoqOutlineMark />
              </div>
              <div dir={dir} className="text-right">
                <p className="mb-2 text-xs font-bold text-[#C5B278]">{pageCopy.joinEyebrow}</p>
                <h2 className="text-2xl font-black text-white sm:text-3xl">{pageCopy.joinTitle}</h2>
                <p className="mt-3 max-w-lg text-xs leading-6 text-white/65 sm:text-sm sm:leading-7">
                  {pageCopy.joinDescription}
                </p>
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#C13229] px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-[#d34a42] sm:text-sm">
                  {pageCopy.joinCta} <span>←</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

const fallbackPartners: Partner[] = [
  ["jaan", "جان", "Jaan", "/images/partner-01.png"],
  ["osten", "أوستن", "Osten", "/images/partner-02.png"],
  ["mabaat", "مبات", "Mabaat", "/images/partner-03.png"],
  ["protime", "بروتايم", "Protime", "/images/partner-04.png"],
  ["golden-lines", "جولدن لاينز للمصاعد", "Golden Lines Lifts", "/images/partner-05.png"],
  ["lens", "شركة عدسات للصيانة والتشغيل", "Lens Maintenance and Operation Company", "/images/partner-06.png"],
  ["almaskan", "المسكن الوافي", "Almaskan Alwafi", "/images/partner-07.png"],
  ["aljounah", "الجونة", "Aljounah", "/images/partner-08.png"],
  ["calma", "كالما", "Calma", "/images/partner-09.png"],
  ["ibtikarat", "ابتكارات", "Ibtikarat", "/images/partner-10.png"],
].map(([id, nameAr, nameEn, logo], index) => ({
  _id: `fallback-${id}`,
  nameAr,
  nameEn,
  logo,
  descriptionAr: `${nameAr} من شركاء أفق الذين نعتز بدعم رحلتهم وتطوير أعمالهم.`,
  descriptionEn: `${nameEn} is an OFOQ partner whose business journey we are proud to support.`,
  partnershipAr: "شراكة أعمال تركز على تيسير الإجراءات وبناء أساس تشغيلي واضح للنمو.",
  partnershipEn: "A business partnership focused on simpler processes and a clear foundation for growth.",
  servicesAr: "خدمات تأسيس وتشغيل واستشارات أعمال وفق احتياج الشريك.",
  servicesEn: "Formation, operations, and business advisory services tailored to the partner.",
  order: index + 1,
  isPublished: true,
  createdAt: "",
  updatedAt: "",
}));

function PartnersSection({ dir, useArabicContent, copy }: { dir: "rtl" | "ltr"; useArabicContent: boolean; copy: HomePageCopy }) {
  const [selected, setSelected] = useState<Partner | null>(null);
  const [paused, setPaused] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { data, isError, isLoading } = useQuery({
    queryKey: ["public-partners"],
    queryFn: () => cmsApi.partners.list().then((response) => response.data),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
  const partners: Partner[] = isError
    ? fallbackPartners
    : Array.isArray(data?.partners)
      ? data.partners
      : fallbackPartners;
  const copyCount = Math.max(2, Math.ceil(1600 / Math.max(144, partners.length * 144)) + 1);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <section className="bg-[#071936] px-5 pb-10 sm:px-10 sm:pb-14 lg:px-16">
      <div className="mx-auto max-w-[1380px] overflow-hidden rounded-2xl bg-[#F4F1EC] py-6 text-[#071936] sm:py-7" dir={dir}>
        <div className="mb-5 flex items-center justify-between gap-4 px-5 sm:px-10">
          <div>
            <p className="text-xs font-black text-[#071936]">{copy.partnersTitle}</p>
            <p className="mt-1 text-[10px] text-[#071936]/50">
              {copy.partnersHint}
            </p>
          </div>
          {isLoading && (
            <span className="rounded-full bg-[#071936]/5 px-3 py-1 text-[10px] font-bold text-[#071936]/55">
              {copy.partnersLoading}
            </span>
          )}
          {isError && (
            <span className="rounded-full bg-[#C5B278]/15 px-3 py-1 text-[10px] font-bold text-[#7b6a37]">
              {copy.partnersFallback}
            </span>
          )}
        </div>
        {partners.length > 0 ? (
          <div
            className="partners-marquee overflow-x-auto touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onPointerDown={() => setPaused(true)}
            onPointerUp={() => setPaused(false)}
          >
            <div
              className={`partners-marquee-track flex w-max items-center ${paused ? "[animation-play-state:paused]" : ""}`}
              dir="ltr"
              style={{
                "--partners-copy-shift": `${100 / copyCount}%`,
                animationDuration: `${Math.max(12, partners.length * 2.5)}s`,
              } as React.CSSProperties}
            >
              {Array.from({ length: copyCount }, (_, copyIndex) => (
                <div key={copyIndex} className="partners-marquee-copy flex shrink-0 items-center gap-6 sm:gap-10" aria-hidden={copyIndex !== 0}>
                  {partners.map((partner) => (
                    <button
                      key={`${copyIndex}-${partner._id}`}
                      type="button"
                      tabIndex={copyIndex !== 0 ? -1 : 0}
                      onClick={() => setSelected(partner)}
                      className="group flex h-20 w-36 shrink-0 items-center justify-center rounded-lg px-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C13229] focus-visible:ring-offset-2 sm:w-44"
                      aria-label={copy.viewPartnerDetails(useArabicContent ? partner.nameAr : partner.nameEn)}
                    >
                      <img
                        src={partner.logo}
                        alt=""
                        loading="lazy"
                        className="max-h-14 max-w-full object-contain transition duration-300 group-hover:scale-105 group-focus:scale-105"
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-[#071936]/50">{copy.partnersEmpty}</p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6" dir={dir}>
          <button type="button" className="absolute inset-0 bg-[#071936]/80 backdrop-blur-sm" aria-label={copy.close} onClick={() => setSelected(null)} />
          <article role="dialog" aria-modal="true" aria-labelledby="partner-dialog-title" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[24px] bg-[#F4F1EC] shadow-2xl">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelected(null)}
              className="absolute end-4 top-4 z-10 rounded-full border border-[#071936]/10 bg-white/80 p-2 text-[#071936] hover:bg-white"
              aria-label={copy.closePartnerDetails}
            >
              <X size={19} />
            </button>
            <div className="grid gap-0 md:grid-cols-[.8fr_1.2fr]">
              <div className="flex min-h-56 flex-col items-center justify-center gap-8 bg-white p-8 md:min-h-full">
                <img src={selected.logo} alt={useArabicContent ? selected.nameAr : selected.nameEn} className="max-h-28 max-w-[220px] object-contain" />
                <div className="h-px w-28 bg-[#071936]/10" />
                <OfoqLogo className="h-16 w-28 text-[#071936]" />
              </div>
              <div className="p-6 pt-16 sm:p-9 sm:pt-16">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C13229]">{copy.partnershipsEyebrow}</p>
                <h2 id="partner-dialog-title" className="mt-2 text-2xl font-black text-[#071936] sm:text-3xl">
                  {useArabicContent ? selected.nameAr : selected.nameEn}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#071936]/65">{useArabicContent ? selected.descriptionAr : selected.descriptionEn}</p>
                <div className="mt-6 space-y-5 border-t border-[#071936]/10 pt-6">
                  <div>
                    <h3 className="text-xs font-black text-[#071936]">{copy.partnership}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#071936]/60">{useArabicContent ? selected.partnershipAr : selected.partnershipEn}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#071936]">{copy.delivered}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#071936]/60">{useArabicContent ? selected.servicesAr : selected.servicesEn}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}

function OfoqOutlineMark() {
  return (
    <svg viewBox="0 0 210 148" className="h-40 w-56 opacity-25" fill="none" aria-hidden="true">
      <rect x="6" y="5" width="58" height="90" rx="11" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M73 10v80M73 10h52M73 47h39" stroke="#C13229" strokeWidth="9" strokeLinecap="square" />
      <rect x="72" y="103" width="26" height="38" rx="6" stroke="#FFFFFF" strokeWidth="5" />
      <rect x="102" y="103" width="26" height="38" rx="6" stroke="#FFFFFF" strokeWidth="5" />
    </svg>
  );
}