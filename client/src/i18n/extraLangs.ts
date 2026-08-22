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
    nav: { home: "ہوم", services: "ہماری خدمات", about: "ہمارے بارے میں", packages: "پیکیجز", countries: "بھرتی کے ممالک", blog: "بلاگ", contact: "رابطہ کریں", getQuote: "قیمت حاصل کریں", switchLang: "انگریزی میں جائیں" },
    footer: { tagline: "ہم جامع کاروباری حل فراہم کرتے ہیں جو کمپنیوں کو مؤثر طریقے سے اپنے اہداف حاصل کرنے کے قابل بناتے ہیں۔", quickLinks: "فوری روابط", contactUs: "رابطہ کریں", phone: "+966 500 851 177", email: "info@ofoqhc.com", location: "سعودی عرب — جدہ — شاہ عبداللہ روڈ", rights: "جملہ حقوق محفوظ ہیں۔", privacy: "رازداری کی پالیسی", terms: "شرائط و ضوابط", madeBy: "تیار کردہ", company: "اُفق برائے کاروباری حل" },
    common: { learnMore: "مزید جانیں", viewAll: "تمام خدمات دیکھیں", freeConsult: "مفت مشاورت حاصل کریں", contactToday: "آج ہی رابطہ کریں", readMore: "پڑھیں", required: "درکار", sending: "بھیجا جا رہا ہے...", send: "پیغام بھیجیں", available: "اس ہفتے دستیاب" },
    home: { metaTitle: "اُفق برائے کاروباری حل | OFOQ — سعودی کمپنیوں کے لیے مربوط انتظامی نظام", heroBadge: "ڈیجیٹل تبدیلی میں آپ کا اسٹریٹجک ساتھی", heroTitle1: "ہم بناتے ہیں", heroTitle2: "آپ کے کاروبار", heroTitle3: "کا مستقبل", heroSub: "مربوط ڈیجیٹل حل جو کمپنیوں کو درستگی کے ساتھ اپنے اہداف حاصل کرنے کے قابل بناتے ہیں — حکمتِ عملی سے نفاذ تک، ڈیٹا سے نتائج تک۔", heroCta1: "مفت مشاورت حاصل کریں", heroCta2: "ہماری خدمات دیکھیں", heroTrust: "سعودی عرب اور خلیج میں 200 سے زائد کمپنیوں کا اعتماد", scrollDown: "نیچے اسکرول کریں", stat0: "مکمل شدہ منصوبے", stat1: "کلائنٹ اطمینان", stat2: "ماہرین", stat3: "خدمت یافتہ ممالک", stat0v: "200+", stat1v: "98%", stat2v: "50+", stat3v: "12+", servicesBadge: "ہماری خدمات", servicesTitle: "ہر ضرورت کے لیے جامع حل", servicesSub: "ہم ڈیجیٹل خدمات کا ایک مربوط مجموعہ پیش کرتے ہیں جو آپ کے کاروبار کی ترقی کو تیز اور پائیدار مسابقتی برتری فراہم کرتا ہے۔", brandBadge: "OFOQ برائے کاروباری حل", brandTitle1: "مستحکم شناخت،", brandTitle2: "روشن مستقبل", brandDesc: "ہم صرف ایک ٹیک کمپنی نہیں — ہم ایک اسٹریٹجک گروتھ پارٹنر ہیں جو آپ کی تنظیم کو مواقع سے فائدہ اٹھانے اور ڈیجیٹل چھلانگ لگانے میں مدد دیتا ہے۔", brandCta: "ہماری کہانی جانیں", whyBadge: "کیوں OFOQ؟", whyTitle: "حقیقی شراکت کی نئی تعریف", whySub: "ہم صرف خدمات فراہم نہیں کرتے — ہم اعتماد، نتائج اور مشترکہ وژن پر مبنی شراکتیں بناتے ہیں۔", whyCta: "اپنا سفر شروع کریں", whyReason0t: "بے مثال مہارت", whyReason0d: "10 سال سے زائد کا تجربہ اور بڑی کمپنیوں کے لیے ڈیجیٹل کاروباری حل۔", whyReason1t: "جدید ٹیکنالوجی", whyReason1d: "ہم جدید AI اور ڈیٹا اینالٹکس ٹولز استعمال کرتے ہیں تاکہ ریکارڈ نتائج حاصل ہوں۔", whyReason2t: "حقیقی شراکت", whyReason2d: "ہم صرف سروس فراہم کنندہ نہیں — ہم ایک اسٹریٹجک ساتھی ہیں جو آپ کے اہداف سمجھتا اور انہیں حاصل کرنے کے لیے کام کرتا ہے۔", whyReason3t: "ضمانت شدہ نتائج", whyReason3d: "ہم قابلِ پیمائش نتائج کے اصول پر کام کرتے ہیں — اگر کامیابی نہ ہو تو ہم تب تک کام کرتے ہیں جب تک ہو نہ جائے۔", strip1: "ہم کمپنیوں کی خدمت کرتے ہیں", strip2: "ریاض سے", strip3: "دنیا تک", stripSub: "سعودی عرب • خلیج • مشرقِ وسطیٰ", testimBadge: "گاہکوں کی آراء", testimTitle: "ہمارے کلائنٹس کیا کہتے ہیں", ctaBadge: "کیا آپ تیار ہیں؟", ctaTitle: "آج ہی اپنی ڈیجیٹل تبدیلی کا آغاز کریں", ctaSub: "مفت مشاورت، واضح منصوبہ اور قابلِ پیمائش نتائج۔ ابھی رابطہ کریں اور آئیے مستقبل مل کر بنائیں۔", ctaBtn2: "ہمارے بارے میں", svc0t: "اسٹریٹجک مشاورت", svc0d: "ہم آپ کو اپنے بڑے اہداف تک پہنچنے کے لیے واضح روڈ میپ بنانے میں مدد دیتے ہیں۔", svc1t: "ڈیجیٹل تبدیلی", svc1d: "ہم آپ کے روایتی عمل کو ایک سمارٹ، مربوط ڈیجیٹل نظام میں بدلتے ہیں۔", svc2t: "ڈیٹا اینالٹکس اور AI", svc2d: "ہم آپ کے خام ڈیٹا کو درست اسٹریٹجک فیصلوں میں بدلتے ہیں۔", svc3t: "سافٹ ویئر ڈیولپمنٹ", svc3d: "آپ کی منفرد کاروباری ضروریات کے مطابق مکمل کسٹم سافٹ ویئر حل۔", svc4t: "ڈیجیٹل مارکیٹنگ", svc4d: "مربوط مارکیٹنگ حکمتِ عملیاں جو آپ کو سب سے آگے رکھتی ہیں۔", svc5t: "سائبر سیکیورٹی", svc5d: "ہم آپ کے ڈیجیٹل اثاثوں کو جدید خطرات سے محفوظ رکھتے ہیں۔" },
  },
  hi: {
    nav: { home: "होम", services: "हमारी सेवाएँ", about: "हमारे बारे में", blog: "ब्लॉग", contact: "संपर्क करें", getQuote: "कोटेशन प्राप्त करें", switchLang: "Language" },
    footer: { tagline: "हम व्यापक व्यावसायिक समाधान प्रदान करते हैं जो कंपनियों को कुशलता से अपने लक्ष्य प्राप्त करने में सक्षम बनाते हैं।", quickLinks: "त्वरित लिंक", contactUs: "संपर्क करें", rights: "सर्वाधिकार सुरक्षित।", privacy: "गोपनीयता नीति", terms: "नियम और शर्तें", madeBy: "निर्मित", company: "OFOQ बिज़नेस सॉल्यूशंस" },
    common: { learnMore: "और जानें", viewAll: "सभी सेवाएँ देखें", freeConsult: "निःशुल्क परामर्श प्राप्त करें", contactToday: "आज ही संपर्क करें", readMore: "पढ़ें", required: "आवश्यक", sending: "भेजा जा रहा है...", send: "संदेश भेजें", available: "इस सप्ताह उपलब्ध" },
    home: { heroCta1: "सेवा का अनुरोध करें", heroCta2: "सेवाएँ देखें" },
  },
  id: {
    nav: { home: "Beranda", services: "Layanan Kami", about: "Tentang Kami", packages: "Paket", countries: "Negara Perekrutan", blog: "Blog", contact: "Hubungi Kami", getQuote: "Minta Penawaran", switchLang: "Beralih ke bahasa Inggris" },
    footer: { tagline: "Kami menyediakan solusi bisnis terpadu yang memberdayakan perusahaan untuk mencapai tujuan mereka secara efisien.", quickLinks: "Tautan Cepat", contactUs: "Hubungi Kami", phone: "+966 500 851 177", email: "info@ofoqhc.com", location: "Arab Saudi — Jeddah — King Abdullah Road", rights: "Hak cipta dilindungi.", privacy: "Kebijakan Privasi", terms: "Syarat & Ketentuan", madeBy: "Dibuat oleh", company: "OFOQ Business Solutions" },
    common: { learnMore: "Pelajari Lebih Lanjut", viewAll: "Lihat Semua Layanan", freeConsult: "Dapatkan Konsultasi Gratis", contactToday: "Hubungi Kami Hari Ini", readMore: "Baca", required: "Wajib", sending: "Mengirim...", send: "Kirim Pesan", available: "Tersedia minggu ini" },
    home: { metaTitle: "OFOQ Business Solutions | Platform Manajemen Bisnis Terpadu", heroBadge: "Mitra strategis Anda dalam transformasi digital", heroTitle1: "Kami membangun masa depan", heroTitle2: "bisnis Anda", heroTitle3: "bersama", heroSub: "Solusi digital terpadu yang memberdayakan perusahaan untuk mencapai tujuan mereka dengan presisi — dari strategi hingga eksekusi, dari data hingga hasil.", heroCta1: "Dapatkan Konsultasi Gratis", heroCta2: "Jelajahi Layanan Kami", heroTrust: "Dipercaya oleh lebih dari 200 perusahaan di Arab Saudi dan Teluk", scrollDown: "Gulir ke bawah", stat0: "Proyek Selesai", stat1: "Kepuasan Klien", stat2: "Spesialis Ahli", stat3: "Negara Dilayani", stat0v: "200+", stat1v: "98%", stat2v: "50+", stat3v: "12+", servicesBadge: "Layanan Kami", servicesTitle: "Solusi Komprehensif untuk Setiap Kebutuhan", servicesSub: "Kami menawarkan portofolio layanan digital terpadu yang dirancang untuk mempercepat pertumbuhan bisnis Anda dan mencapai keunggulan kompetitif yang berkelanjutan.", brandBadge: "OFOQ UNTUK SOLUSI BISNIS", brandTitle1: "Identitas yang Kokoh,", brandTitle2: "Masa Depan yang Menjanjikan", brandDesc: "Kami lebih dari sekadar perusahaan teknologi — kami adalah mitra pertumbuhan strategis yang membantu organisasi Anda meraih peluang dan melangkah ke era digital.", brandCta: "Kenali Kisah Kami", whyBadge: "Mengapa OFOQ?", whyTitle: "Mendefinisikan Ulang Kemitraan Sejati", whySub: "Kami tidak hanya memberikan layanan — kami membangun kemitraan yang berlandaskan kepercayaan, hasil, dan visi bersama.", whyCta: "Mulai Perjalanan Anda", whyReason0t: "Keahlian yang Tak Tertandingi", whyReason0d: "Lebih dari 10 tahun menghadirkan solusi bisnis digital untuk perusahaan besar.", whyReason1t: "Teknologi Canggih", whyReason1d: "Kami memanfaatkan alat AI dan analitik data terbaru untuk mencapai hasil yang luar biasa.", whyReason2t: "Kemitraan Sejati", whyReason2d: "Kami bukan sekadar penyedia layanan — kami adalah mitra strategis yang memahami tujuan Anda dan bekerja untuk mencapainya.", whyReason3t: "Hasil Terjamin", whyReason3d: "Kami bekerja berdasarkan hasil yang terukur — jika belum berhasil, kami terus bekerja sampai berhasil.", strip1: "Melayani perusahaan dari", strip2: "Riyadh", strip3: "ke seluruh dunia", stripSub: "Arab Saudi • Teluk • Timur Tengah", testimBadge: "Testimoni Klien", testimTitle: "Apa Kata Klien Kami", ctaBadge: "Apakah Anda siap?", ctaTitle: "Mulai Transformasi Digital Anda Hari Ini", ctaSub: "Konsultasi gratis, rencana aksi yang jelas, dan hasil yang terukur. Hubungi kami sekarang dan mari bangun masa depan bersama.", ctaBtn2: "Pelajari Tentang Kami", svc0t: "Konsultasi Strategis", svc0d: "Kami membantu Anda menyusun roadmap yang jelas menuju tujuan terbesar Anda.", svc1t: "Transformasi Digital", svc1d: "Kami mengubah proses tradisional Anda menjadi ekosistem digital terpadu yang cerdas.", svc2t: "Analitik Data & AI", svc2d: "Kami mengubah data mentah Anda menjadi keputusan strategis yang presisi.", svc3t: "Pengembangan Perangkat Lunak", svc3d: "Solusi perangkat lunak kustom sepenuhnya yang disesuaikan dengan kebutuhan unik bisnis Anda.", svc4t: "Pemasaran Digital", svc4d: "Strategi pemasaran terpadu yang menempatkan Anda di garis depan.", svc5t: "Keamanan Siber", svc5d: "Kami melindungi aset digital Anda dari semua ancaman modern." },
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
    // CMS content may contain empty/null values for fields that were never
    // edited. Do not let those values erase a complete static translation
    // section and crash pages that read nested copy.
    if (p === null || p === undefined) continue;
    out[k] = p && typeof p === "object" && !Array.isArray(p) && b && typeof b === "object" && !Array.isArray(b)
      ? deepMerge(b, p)
      : p;
  }
  return out;
}
