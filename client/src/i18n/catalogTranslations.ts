type CatalogLang = "ar" | "en" | "ur" | "id";

const urdu: Record<string, string> = {
  "Human Resources": "انسانی وسائل",
  "Government Services": "سرکاری خدمات",
  "Visa Services": "ویزا خدمات",
  "Contracts & Agreements": "معاہدے اور اتفاقات",
  "Company Formation & Investment": "کمپنی کی تشکیل اور سرمایہ کاری",
  "Legal Services": "قانونی خدمات",
  "Business Solutions": "کاروباری حل",
  "Marketing": "مارکیٹنگ",
  "From the first hire to a mature people operation, we build clear processes that scale.": "پہلی بھرتی سے لے کر مکمل انسانی وسائل کے نظام تک، ہم قابلِ توسیع اور واضح طریقہ کار بناتے ہیں۔",
  "We manage government transactions across Qiwa, Muqeem, Mudad, GOSI and more with clarity.": "ہم قویٰ، مقیم، مدد، سوشل انشورنس اور دیگر سرکاری پلیٹ فارمز پر آپ کے معاملات واضح انداز میں مکمل کرتے ہیں۔",
  "We coordinate the visa journey from issuance to travel, including embassies, attestations and medical checks.": "ہم ویزا جاری ہونے سے سفر تک سفارت خانوں، تصدیقات اور طبی معائنے سمیت پورے عمل کو منظم کرتے ہیں۔",
  "Clear drafting and practical review that protects commercial relationships and speeds decisions.": "واضح مسودہ نویسی اور عملی جائزہ جو تجارتی تعلقات کا تحفظ کرے اور فیصلوں کو تیز بنائے۔",
  "From idea to operating entity, we coordinate formation, licensing and government files.": "خیال سے فعال ادارے تک ہم کمپنی کی تشکیل، لائسنس اور سرکاری فائلوں کا انتظام کرتے ہیں۔",
  "Practical legal guidance and precise drafting to help you operate confidently and comply with Saudi regulations.": "عملی قانونی رہنمائی اور درست مسودہ نویسی کے ذریعے آپ سعودی قوانین کی پابندی اعتماد کے ساتھ کر سکتے ہیں۔",
  "Flexible operational services that give your team more room to focus on growth and customers.": "لچک دار عملی خدمات جو آپ کی ٹیم کو ترقی اور صارفین پر توجہ دینے کے لیے زیادہ وقت فراہم کرتی ہیں۔",
  "We turn your presence into a clear story and measurable demand in the Saudi market.": "ہم سعودی مارکیٹ میں آپ کی موجودگی کو واضح کہانی اور قابلِ پیمائش طلب میں تبدیل کرتے ہیں۔",
  "Local recruitment": "مقامی بھرتی",
  "International recruitment": "بین الاقوامی بھرتی",
  "Executive search": "اعلیٰ عہدوں کی تلاش",
  "Job descriptions": "ملازمت کی تفصیلات",
  "Performance evaluation": "کارکردگی کا جائزہ",
  "Policies and regulations": "پالیسیز اور ضوابط",
  "Payroll management": "تنخواہوں کا انتظام",
  "Contract management": "معاہدوں کا انتظام",
  "Qiwa": "قویٰ",
  "Muqeem": "مقیم",
  "Mudad": "مدد",
  "GOSI": "سوشل انشورنس",
  "Ministry of Human Resources": "وزارتِ انسانی وسائل",
  "Ministry of Commerce": "وزارتِ تجارت",
  "Ministry of Investment": "وزارتِ سرمایہ کاری",
  "Municipalities": "بلدیاتی خدمات",
  "Visa issuance": "ویزا کا اجراء",
  "Electronic authorization": "الیکٹرانک اجازت",
  "Embassy follow-up": "سفارت خانے کی پیروی",
  "Attestations": "تصدیقات",
  "Medical examination": "طبی معائنہ",
  "Biometrics": "بایومیٹرکس",
  "Travel procedures": "سفری کارروائیاں",
  "Professional accreditation": "پیشہ ورانہ منظوری",
  "Employment contracts": "ملازمت کے معاہدے",
  "Job Order for the Philippines": "فلپائن کے لیے جاب آرڈر",
  "Job Order for Nepal": "نیپال کے لیے جاب آرڈر",
  "Company contracts": "کمپنی کے معاہدے",
  "Contract review": "معاہدے کا جائزہ",
  "Contract attestation": "معاہدے کی تصدیق",
  "Company formation": "کمپنی کی تشکیل",
  "Foreign company formation": "غیر ملکی کمپنی کی تشکیل",
  "Investor services": "سرمایہ کار خدمات",
  "Licensing": "لائسنسنگ",
  "Government file opening": "سرکاری فائل کھولنا",
  "Ministry of Investment services": "وزارتِ سرمایہ کاری کی خدمات",
  "Contract drafting": "معاہدوں کی مسودہ نویسی",
  "Agreement review": "معاہدے کا جائزہ",
  "Legal consulting": "قانونی مشاورت",
  "Trademarks": "ٹریڈ مارکس",
  "Compliance & governance": "تعمیل اور گورننس",
  "Medical insurance": "طبی بیمہ",
  "HR operations": "انسانی وسائل کا انتظام",
  "Management consulting": "انتظامی مشاورت",
  "Operations services": "آپریشنز خدمات",
  "Corporate solutions": "کارپوریٹ حل",
  "Brand strategy": "برانڈ حکمتِ عملی",
  "Content production": "مواد کی تیاری",
  "Social media management": "سوشل میڈیا کا انتظام",
  "Search engine marketing": "سرچ انجن مارکیٹنگ",
  "Paid campaigns": "معاوضہ شدہ مہمات",
  "Market research": "مارکیٹ تحقیق",
  "Startups and founders": "اسٹارٹ اپس اور بانیان",
  "Established companies scaling operations": "توسیع کرتی ہوئی قائم شدہ کمپنیاں",
  "Investors and international companies in Saudi Arabia": "سعودی عرب میں سرمایہ کار اور بین الاقوامی کمپنیاں",
  "Company details and commercial registration, if available": "کمپنی کی تفصیلات اور دستیاب ہو تو تجارتی رجسٹریشن",
  "Authorized representative ID and contact details": "مجاز نمائندے کی شناخت اور رابطے کی تفصیلات",
  "Electronic authorization where required": "ضرورت کے مطابق الیکٹرانک اجازت",
  "Discovery call and data review": "ضرورت سمجھنے کی گفتگو اور معلومات کا جائزہ",
  "Prepare requirements and authorizations": "ضروریات اور اجازت نامے تیار کرنا",
  "Submit through official channels and monitor progress": "سرکاری ذرائع سے درخواست جمع کرنا اور پیش رفت دیکھنا",
  "Resolve observations and coordinate with the authority": "اعتراضات حل کرنا اور متعلقہ ادارے سے رابطہ کرنا",
  "Deliver the outcome and archive the file": "نتیجہ فراہم کرنا اور فائل محفوظ کرنا",
  "Do you follow the request through to completion?": "کیا آپ درخواست مکمل ہونے تک اس کی پیروی کرتے ہیں؟",
  "Yes. A dedicated service manager follows the file and updates you through closure.": "جی ہاں، مخصوص سروس مینیجر فائل کی پیروی کرتا ہے اور تکمیل تک آپ کو باقاعدہ معلومات دیتا ہے۔",
  "Can we start remotely?": "کیا ہم آن لائن آغاز کر سکتے ہیں؟",
  "Yes. Most services start with a remote session and electronic authorizations.": "جی ہاں، زیادہ تر خدمات آن لائن نشست اور الیکٹرانک اجازت سے شروع ہوتی ہیں۔",
  "business days": "کاروباری دن",
};

const indonesian: Record<string, string> = {
  "Human Resources": "Sumber Daya Manusia",
  "Government Services": "Layanan Pemerintah",
  "Visa Services": "Layanan Visa",
  "Contracts & Agreements": "Kontrak & Perjanjian",
  "Company Formation & Investment": "Pendirian Perusahaan & Investasi",
  "Legal Services": "Layanan Hukum",
  "Business Solutions": "Solusi Bisnis",
  "Marketing": "Pemasaran",
  "From the first hire to a mature people operation, we build clear processes that scale.": "Dari perekrutan pertama hingga sistem SDM yang matang, kami membangun proses yang jelas dan dapat berkembang.",
  "We manage government transactions across Qiwa, Muqeem, Mudad, GOSI and more with clarity.": "Kami mengelola transaksi pemerintah melalui Qiwa, Muqeem, Mudad, GOSI, dan platform lainnya dengan jelas.",
  "We coordinate the visa journey from issuance to travel, including embassies, attestations and medical checks.": "Kami mengoordinasikan proses visa dari penerbitan hingga perjalanan, termasuk kedutaan, legalisasi, dan pemeriksaan medis.",
  "Clear drafting and practical review that protects commercial relationships and speeds decisions.": "Penyusunan dan peninjauan praktis yang melindungi hubungan komersial serta mempercepat pengambilan keputusan.",
  "From idea to operating entity, we coordinate formation, licensing and government files.": "Dari ide hingga entitas yang beroperasi, kami mengoordinasikan pendirian, perizinan, dan berkas pemerintah.",
  "Practical legal guidance and precise drafting to help you operate confidently and comply with Saudi regulations.": "Panduan hukum praktis dan penyusunan yang tepat agar Anda beroperasi dengan percaya diri sesuai peraturan Arab Saudi.",
  "Flexible operational services that give your team more room to focus on growth and customers.": "Layanan operasional yang fleksibel agar tim Anda lebih fokus pada pertumbuhan dan pelanggan.",
  "We turn your presence into a clear story and measurable demand in the Saudi market.": "Kami mengubah kehadiran Anda menjadi cerita yang jelas dan permintaan yang terukur di pasar Saudi.",
  "Local recruitment": "Rekrutmen lokal",
  "International recruitment": "Rekrutmen internasional",
  "Executive search": "Pencarian eksekutif",
  "Job descriptions": "Deskripsi pekerjaan",
  "Performance evaluation": "Evaluasi kinerja",
  "Policies and regulations": "Kebijakan dan peraturan",
  "Payroll management": "Manajemen penggajian",
  "Contract management": "Manajemen kontrak",
  "Qiwa": "Qiwa",
  "Muqeem": "Muqeem",
  "Mudad": "Mudad",
  "GOSI": "Asuransi sosial",
  "Ministry of Human Resources": "Kementerian Sumber Daya Manusia",
  "Ministry of Commerce": "Kementerian Perdagangan",
  "Ministry of Investment": "Kementerian Investasi",
  "Municipalities": "Layanan pemerintah kota",
  "Visa issuance": "Penerbitan visa",
  "Electronic authorization": "Otorisasi elektronik",
  "Embassy follow-up": "Tindak lanjut kedutaan",
  "Attestations": "Legalisasi",
  "Medical examination": "Pemeriksaan medis",
  "Biometrics": "Biometrik",
  "Travel procedures": "Prosedur perjalanan",
  "Professional accreditation": "Akreditasi profesional",
  "Employment contracts": "Kontrak kerja",
  "Job Order for the Philippines": "Job Order untuk Filipina",
  "Job Order for Nepal": "Job Order untuk Nepal",
  "Company contracts": "Kontrak perusahaan",
  "Contract review": "Peninjauan kontrak",
  "Contract attestation": "Legalisasi kontrak",
  "Company formation": "Pendirian perusahaan",
  "Foreign company formation": "Pendirian perusahaan asing",
  "Investor services": "Layanan investor",
  "Licensing": "Perizinan",
  "Government file opening": "Pembukaan berkas pemerintah",
  "Ministry of Investment services": "Layanan Kementerian Investasi",
  "Contract drafting": "Penyusunan kontrak",
  "Agreement review": "Peninjauan perjanjian",
  "Legal consulting": "Konsultasi hukum",
  "Trademarks": "Merek dagang",
  "Compliance & governance": "Kepatuhan & tata kelola",
  "Medical insurance": "Asuransi kesehatan",
  "HR operations": "Operasional SDM",
  "Management consulting": "Konsultasi manajemen",
  "Operations services": "Layanan operasional",
  "Corporate solutions": "Solusi korporat",
  "Brand strategy": "Strategi merek",
  "Content production": "Produksi konten",
  "Social media management": "Manajemen media sosial",
  "Search engine marketing": "Pemasaran mesin pencari",
  "Paid campaigns": "Kampanye berbayar",
  "Market research": "Riset pasar",
  "Startups and founders": "Startup dan pendiri",
  "Established companies scaling operations": "Perusahaan mapan yang memperluas operasi",
  "Investors and international companies in Saudi Arabia": "Investor dan perusahaan internasional di Arab Saudi",
  "Company details and commercial registration, if available": "Detail perusahaan dan pendaftaran komersial jika tersedia",
  "Authorized representative ID and contact details": "Identitas dan detail kontak perwakilan resmi",
  "Electronic authorization where required": "Otorisasi elektronik bila diperlukan",
  "Discovery call and data review": "Panggilan konsultasi dan peninjauan data",
  "Prepare requirements and authorizations": "Menyiapkan persyaratan dan otorisasi",
  "Submit through official channels and monitor progress": "Mengajukan melalui kanal resmi dan memantau proses",
  "Resolve observations and coordinate with the authority": "Menyelesaikan catatan dan berkoordinasi dengan instansi",
  "Deliver the outcome and archive the file": "Menyerahkan hasil dan mengarsipkan berkas",
  "Do you follow the request through to completion?": "Apakah Anda mengikuti permintaan hingga selesai?",
  "Yes. A dedicated service manager follows the file and updates you through closure.": "Ya. Manajer layanan khusus mengikuti berkas dan memberi kabar hingga selesai.",
  "Can we start remotely?": "Bisakah kami memulai secara jarak jauh?",
  "Yes. Most services start with a remote session and electronic authorizations.": "Ya. Sebagian besar layanan dimulai melalui sesi jarak jauh dan otorisasi elektronik.",
  "business days": "hari kerja",
};

export function catalogText(text: string, lang: CatalogLang): string {
  if (lang === "ur") return urdu[text] || text;
  if (lang === "id") return indonesian[text] || text;
  return text;
}

export function localizedDuration(ar: string, en: string, lang: CatalogLang): string {
  if (lang === "ur") return `${ar.replace(/أيام عمل|يوم عمل/g, "کاروباری دن")}`;
  if (lang === "id") return `${en.replace(/business days/g, "hari kerja")}`;
  return lang === "ar" ? ar : en;
}

/** Translates the reusable sentences generated for every service item. */
export function catalogSentence(text: string, lang: CatalogLang): string {
  const dictionary = lang === "ur" ? urdu : lang === "id" ? indonesian : null;
  if (!dictionary) return text;
  if (text.startsWith("We manage ")) {
    const service = text.slice("We manage ".length).split(" with careful")[0];
    const intro = lang === "ur"
      ? "ہم"
      : "Kami mengelola";
    const rest = lang === "ur"
      ? "کی خدمات کو متعلقہ سعودی اداروں کے ساتھ احتیاط سے منظم کرتے ہیں۔ ہماری ٹیم آپ کی جانب سے کارروائی مکمل کرتی ہے اور تکمیل تک آپ کو باخبر رکھتی ہے۔"
      : " dengan koordinasi yang cermat bersama instansi terkait di Arab Saudi. Tim kami menangani proses atas nama Anda dan memberi kabar hingga selesai.";
    return `${intro} ${catalogText(service, lang)} ${rest}`;
  }
  if (text.startsWith("Request details and documents related to ")) {
    const service = text.replace("Request details and documents related to ", "").replace(/\.$/, "");
    return lang === "ur"
      ? `${catalogText(service, lang)} سے متعلق درخواست کی تفصیلات اور دستاویزات`
      : `${catalogText(service, lang)} terkait dengan permintaan dan dokumen`;
  }
  return dictionary[text] || text;
}