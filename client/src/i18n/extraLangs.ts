/* ── Additional languages (UI chrome) ─────────────────────────────
   These translate the shared UI (nav, footer, common actions, language
   names). Long-form page content falls back to English automatically
   via deep-merge in LangContext. RTL languages: ar, ur. */

export const LANGS = [
  { code: "ar", label: "العربية",   dir: "rtl" },
  { code: "en", label: "English",   dir: "ltr" },
  { code: "ur", label: "اردو",      dir: "rtl" },
  { code: "hi", label: "हिन्दी",     dir: "ltr" },
  { code: "id", label: "Indonesia", dir: "ltr" },
  { code: "de", label: "Deutsch",   dir: "ltr" },
  { code: "es", label: "Español",   dir: "ltr" },
] as const;

export type LangCode = (typeof LANGS)[number]["code"];

/* Partial overrides merged on top of the English pack */
export const extraLangs: Record<string, any> = {
  ur: {
    nav: { home: "ہوم", services: "ہماری خدمات", about: "ہمارے بارے میں", blog: "بلاگ", contact: "رابطہ کریں", getQuote: "قیمت حاصل کریں", switchLang: "Language" },
    footer: { tagline: "ہم جامع کاروباری حل فراہم کرتے ہیں جو کمپنیوں کو مؤثر طریقے سے اپنے اہداف حاصل کرنے کے قابل بناتے ہیں۔", quickLinks: "فوری روابط", contactUs: "رابطہ کریں", rights: "جملہ حقوق محفوظ ہیں۔", privacy: "رازداری کی پالیسی", terms: "شرائط و ضوابط", madeBy: "تیار کردہ", company: "اُفق برائے کاروباری حل" },
    common: { learnMore: "مزید جانیں", viewAll: "تمام خدمات دیکھیں", freeConsult: "مفت مشاورت حاصل کریں", contactToday: "آج ہی رابطہ کریں", readMore: "پڑھیں", required: "درکار", sending: "بھیجا جا رہا ہے...", send: "پیغام بھیجیں", available: "اس ہفتے دستیاب" },
    home: { heroCta1: "خدمت کی درخواست کریں", heroCta2: "خدمات دریافت کریں" },
  },
  hi: {
    nav: { home: "होम", services: "हमारी सेवाएँ", about: "हमारे बारे में", blog: "ब्लॉग", contact: "संपर्क करें", getQuote: "कोटेशन प्राप्त करें", switchLang: "Language" },
    footer: { tagline: "हम व्यापक व्यावसायिक समाधान प्रदान करते हैं जो कंपनियों को कुशलता से अपने लक्ष्य प्राप्त करने में सक्षम बनाते हैं।", quickLinks: "त्वरित लिंक", contactUs: "संपर्क करें", rights: "सर्वाधिकार सुरक्षित।", privacy: "गोपनीयता नीति", terms: "नियम और शर्तें", madeBy: "निर्मित", company: "OFOQ बिज़नेस सॉल्यूशंस" },
    common: { learnMore: "और जानें", viewAll: "सभी सेवाएँ देखें", freeConsult: "निःशुल्क परामर्श प्राप्त करें", contactToday: "आज ही संपर्क करें", readMore: "पढ़ें", required: "आवश्यक", sending: "भेजा जा रहा है...", send: "संदेश भेजें", available: "इस सप्ताह उपलब्ध" },
    home: { heroCta1: "सेवा का अनुरोध करें", heroCta2: "सेवाएँ देखें" },
  },
  id: {
    nav: { home: "Beranda", services: "Layanan Kami", about: "Tentang Kami", blog: "Blog", contact: "Hubungi Kami", getQuote: "Minta Penawaran", switchLang: "Language" },
    footer: { tagline: "Kami menyediakan solusi bisnis terpadu yang memberdayakan perusahaan untuk mencapai tujuan mereka secara efisien.", quickLinks: "Tautan Cepat", contactUs: "Hubungi Kami", rights: "Hak cipta dilindungi.", privacy: "Kebijakan Privasi", terms: "Syarat & Ketentuan", madeBy: "Dibuat oleh", company: "OFOQ Business Solutions" },
    common: { learnMore: "Pelajari Lebih Lanjut", viewAll: "Lihat Semua Layanan", freeConsult: "Dapatkan Konsultasi Gratis", contactToday: "Hubungi Kami Hari Ini", readMore: "Baca", required: "Wajib", sending: "Mengirim...", send: "Kirim Pesan", available: "Tersedia minggu ini" },
    home: { heroCta1: "Ajukan Layanan", heroCta2: "Jelajahi Layanan" },
  },
  de: {
    nav: { home: "Startseite", services: "Unsere Leistungen", about: "Über uns", blog: "Blog", contact: "Kontakt", getQuote: "Angebot anfordern", switchLang: "Language" },
    footer: { tagline: "Wir bieten umfassende Unternehmenslösungen, die Firmen befähigen, ihre Ziele effizient zu erreichen.", quickLinks: "Schnellzugriff", contactUs: "Kontakt", rights: "Alle Rechte vorbehalten.", privacy: "Datenschutz", terms: "AGB", madeBy: "Erstellt von", company: "OFOQ Business Solutions" },
    common: { learnMore: "Mehr erfahren", viewAll: "Alle Leistungen ansehen", freeConsult: "Kostenlose Beratung erhalten", contactToday: "Kontaktieren Sie uns heute", readMore: "Lesen", required: "Erforderlich", sending: "Wird gesendet...", send: "Nachricht senden", available: "Diese Woche verfügbar" },
    home: { heroCta1: "Service anfragen", heroCta2: "Leistungen entdecken" },
  },
  es: {
    nav: { home: "Inicio", services: "Nuestros Servicios", about: "Sobre Nosotros", blog: "Blog", contact: "Contáctanos", getQuote: "Solicitar Cotización", switchLang: "Language" },
    footer: { tagline: "Ofrecemos soluciones empresariales integrales que permiten a las empresas alcanzar sus objetivos con eficiencia.", quickLinks: "Enlaces Rápidos", contactUs: "Contáctanos", rights: "Todos los derechos reservados.", privacy: "Política de Privacidad", terms: "Términos y Condiciones", madeBy: "Hecho por", company: "OFOQ Business Solutions" },
    common: { learnMore: "Saber Más", viewAll: "Ver Todos los Servicios", freeConsult: "Obtén una Consulta Gratis", contactToday: "Contáctanos Hoy", readMore: "Leer", required: "Obligatorio", sending: "Enviando...", send: "Enviar Mensaje", available: "Disponible esta semana" },
    home: { heroCta1: "Solicitar Servicio", heroCta2: "Explorar Servicios" },
  },
};

/** Deep-merge `patch` over `base` (objects only; arrays/strings replaced). */
export function deepMerge<T>(base: T, patch: any): T {
  if (!patch) return base;
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const k of Object.keys(patch)) {
    const b = (base as any)?.[k];
    const p = patch[k];
    out[k] = p && typeof p === "object" && !Array.isArray(p) && b && typeof b === "object" && !Array.isArray(b)
      ? deepMerge(b, p)
      : p;
  }
  return out;
}
