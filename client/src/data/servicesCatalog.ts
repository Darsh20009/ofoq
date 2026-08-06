import { catalogSentence, catalogText } from "../i18n/catalogTranslations";

export type Bilingual = { ar: string; en: string; ur?: string; id?: string };

export type ServiceItem = {
  slug: string;
  title: Bilingual;
  desc: Bilingual;
  beneficiaries: Bilingual[];
  requirements: Bilingual[];
  duration: Bilingual;
  steps: Bilingual[];
  faq: { q: Bilingual; a: Bilingual }[];
};

export type ServiceCategory = {
  slug: string;
  title: Bilingual;
  intro: Bilingual;
  image: string;
  services: ServiceItem[];
};

const bi = (ar: string, en: string): Bilingual => ({
  ar,
  en,
  ur: catalogText(en, "ur"),
  id: catalogText(en, "id"),
});
const make = (
  slug: string,
  ar: string,
  en: string,
  context: string,
  duration = "3–7 أيام عمل / 3–7 business days",
): ServiceItem => ({
  slug,
  title: bi(ar, en),
  desc: {
    ar: `نتولى ${ar} باحترافية، مع متابعة دقيقة للمتطلبات والجهات ذات العلاقة في المملكة. ننسّق الخطوات نيابةً عنك ونبقيك على اطلاع حتى اكتمال المعاملة.`,
    en: `We manage ${en} with careful coordination across the relevant Saudi authorities. Our team handles the workflow on your behalf and keeps you informed until completion.`,
    ur: catalogSentence(`We manage ${en} with careful coordination across the relevant Saudi authorities. Our team handles the workflow on your behalf and keeps you informed until completion.`, "ur"),
    id: catalogSentence(`We manage ${en} with careful coordination across the relevant Saudi authorities. Our team handles the workflow on your behalf and keeps you informed until completion.`, "id"),
  },
  beneficiaries: [
    bi("الشركات الناشئة ورواد الأعمال", "Startups and founders"),
    bi("الشركات القائمة التي توسّع عملياتها", "Established companies scaling operations"),
    bi("المستثمرون والشركات الدولية في السعودية", "Investors and international companies in Saudi Arabia"),
  ],
  requirements: [
    bi("بيانات المنشأة والسجل التجاري إن وجد", "Company details and commercial registration, if available"),
    bi("هوية المفوض وبيانات التواصل", "Authorized representative ID and contact details"),
      {
        ar: `تفاصيل الطلب والوثائق الخاصة بخدمة ${ar}`,
        en: `Request details and documents related to ${en.toLowerCase()}`,
        ur: catalogSentence(`Request details and documents related to ${en}`, "ur"),
        id: catalogSentence(`Request details and documents related to ${en}`, "id"),
      },
    bi("تفويض إلكتروني عند الحاجة", "Electronic authorization where required"),
  ],
  duration: {
    ar: duration.split(" / ")[0],
    en: duration.split(" / ")[1] ?? duration,
    ur: duration.split(" / ")[0].replace(/أيام عمل|يوم عمل/g, "کاروباری دن"),
    id: (duration.split(" / ")[1] ?? duration).replace(/business days/g, "hari kerja"),
  },
  steps: [
    bi("جلسة فهم الاحتياج وتدقيق البيانات", "Discovery call and data review"),
    bi("إعداد المتطلبات والتفويضات اللازمة", "Prepare requirements and authorizations"),
    bi("رفع الطلب عبر القنوات الرسمية ومتابعته", "Submit through official channels and monitor progress"),
    bi("معالجة الملاحظات والتنسيق مع الجهة", "Resolve observations and coordinate with the authority"),
    bi("تسليم النتيجة وتوثيق الملفات", "Deliver the outcome and archive the file"),
  ],
  faq: [
    { q: bi("هل تتابعون الطلب حتى صدور النتيجة؟", "Do you follow the request through to completion?"), a: bi("نعم، يتولى مدير خدمة واحد متابعة الملف والتحديثات حتى الإغلاق.", "Yes. A dedicated service manager follows the file and updates you through closure.") },
    { q: bi("هل يمكن البدء عن بُعد؟", "Can we start remotely?"), a: bi("نعم، تبدأ معظم الخدمات بجلسة رقمية وتوقيع التفويضات إلكترونياً.", "Yes. Most services start with a remote session and electronic authorizations.") },
  ],
});

const categories: ServiceCategory[] = [
  {
    slug: "hr", title: bi("الموارد البشرية", "Human Resources"),
    intro: bi("من أول موظف إلى منظومة موارد بشرية ناضجة، نبني لك عمليات واضحة قابلة للنمو.", "From the first hire to a mature people operation, we build clear processes that scale."),
    image: "/images/ofoq-brand-photo2.jpg",
    services: [
      make("local-recruitment", "التوظيف المحلي", "Local recruitment", "التوظيف المحلي"),
      make("international-recruitment", "الاستقطاب الدولي", "International recruitment", "الاستقطاب الدولي", "15–30 يوم عمل / 15–30 business days"),
      make("executive-search", "البحث التنفيذي", "Executive search", "البحث التنفيذي", "15–25 يوم عمل / 15–25 business days"),
      make("job-description", "الوصف الوظيفي", "Job descriptions", "الوصف الوظيفي", "3–5 أيام عمل / 3–5 business days"),
      make("performance-management", "تقييم الأداء", "Performance evaluation", "تقييم الأداء", "10–15 يوم عمل / 10–15 business days"),
      make("policies-regulations", "اللوائح والسياسات", "Policies and regulations", "اللوائح والسياسات", "7–14 يوم عمل / 7–14 business days"),
      make("payroll-management", "إدارة الرواتب", "Payroll management", "إدارة الرواتب", "5–10 أيام عمل / 5–10 business days"),
      make("contract-management", "إدارة العقود", "Contract management", "إدارة العقود", "3–7 أيام عمل / 3–7 business days"),
    ],
  },
  {
    slug: "government", title: bi("الخدمات الحكومية", "Government Services"),
    intro: bi("ننجز معاملاتك الحكومية عبر قوى ومقيم ومدد والتأمينات وغيرها، بدقة ووضوح.", "We manage government transactions across Qiwa, Muqeem, Mudad, GOSI and more with clarity."),
    image: "/images/hero-aramco-hq.jpg",
    services: ["qiwa","muqeem","mudad","gosi","mhrsd","commerce","misa","municipalities"].map((s, i) => make(s, ["قوى","مقيم","مدد","التأمينات الاجتماعية","وزارة الموارد البشرية","وزارة التجارة","وزارة الاستثمار","البلديات"][i], ["Qiwa","Muqeem","Mudad","GOSI","Ministry of Human Resources","Ministry of Commerce","Ministry of Investment","Municipalities"][i], s)),
  },
  {
    slug: "visas", title: bi("خدمات التأشيرات", "Visa Services"),
    intro: bi("نرتب رحلة التأشيرة من الإصدار إلى السفر، مع تنسيق السفارات والتصديقات والفحص.", "We coordinate the visa journey from issuance to travel, including embassies, attestations and medical checks."),
    image: "/images/riyadh-towers-palms.jpg",
    services: ["visa-issuance","e-authorization","embassy-follow-up","attestations","medical-exam","biometrics","travel-procedures","professional-accreditation"].map((s, i) => make(s, ["إصدار التأشيرات","التفويض الإلكتروني","متابعة السفارات","التصديقات","الفحص الطبي","البصمة","إجراءات السفر","الاعتماد المهني"][i], ["Visa issuance","Electronic authorization","Embassy follow-up","Attestations","Medical examination","Biometrics","Travel procedures","Professional accreditation"][i], s, i === 0 ? "5–12 يوم عمل / 5–12 business days" : "3–10 أيام عمل / 3–10 business days")),
  },
  {
    slug: "contracts", title: bi("العقود والاتفاقيات", "Contracts & Agreements"),
    intro: bi("عقود واضحة ومراجعة عملية تحمي العلاقة التجارية وتسرّع اتخاذ القرار.", "Clear drafting and practical review that protects commercial relationships and speeds decisions."),
    image: "/images/riyadh-itcc-tower.jpg",
    services: ["employment-contracts","job-order-philippines","job-order-nepal","company-contracts","contract-review","contract-attestation"].map((s, i) => make(s, ["إعداد عقود العمل","Job Order للفلبين","Job Order لنيبال","عقود الشركات","مراجعة العقود","تصديق العقود"][i], ["Employment contracts","Job Order for the Philippines","Job Order for Nepal","Company contracts","Contract review","Contract attestation"][i], s, "3–10 أيام عمل / 3–10 business days")),
  },
  {
    slug: "formation", title: bi("تأسيس الشركات والاستثمار", "Company Formation & Investment"),
    intro: bi("من الفكرة إلى كيان عامل، ننسّق التأسيس والتراخيص وملفات الجهات الحكومية.", "From idea to operating entity, we coordinate formation, licensing and government files."),
    image: "/images/hero-riyadh-towers.jpg",
    services: ["company-formation","foreign-company-formation","investor-services","licenses","government-files","investment-ministry"].map((s, i) => make(s, ["تأسيس الشركات","تأسيس الشركات الأجنبية","خدمات المستثمرين","إصدار التراخيص","فتح الملفات الحكومية","خدمات وزارة الاستثمار"][i], ["Company formation","Foreign company formation","Investor services","Licensing","Government file opening","Ministry of Investment services"][i], s, i === 1 ? "15–30 يوم عمل / 15–30 business days" : "7–20 يوم عمل / 7–20 business days")),
  },
  {
    slug: "legal", title: bi("الخدمات القانونية", "Legal Services"),
    intro: bi("رأي قانوني عملي وصياغة دقيقة تساعدك على العمل بثقة والامتثال للأنظمة السعودية.", "Practical legal guidance and precise drafting to help you operate confidently and comply with Saudi regulations."),
    image: "/images/aramco-tower-sunset.jpg",
    services: ["contract-drafting","agreement-review","legal-consulting","trademarks","compliance-governance"].map((s, i) => make(s, ["صياغة العقود","مراجعة الاتفاقيات","الاستشارات القانونية","العلامات التجارية","الامتثال والحوكمة"][i], ["Contract drafting","Agreement review","Legal consulting","Trademarks","Compliance & governance"][i], s, "5–14 يوم عمل / 5–14 business days")),
  },
  {
    slug: "business", title: bi("حلول الأعمال", "Business Solutions"),
    intro: bi("خدمات تشغيلية مرنة تمنح فريقك مساحة أكبر للتركيز على النمو والعملاء.", "Flexible operational services that give your team more room to focus on growth and customers."),
    image: "/images/ofoq-brand-photo2.jpg",
    services: ["medical-insurance","hr-operations","management-consulting","operations-services","corporate-solutions"].map((s, i) => make(s, ["التأمين الطبي","تشغيل الموارد البشرية","الاستشارات الإدارية","خدمات التشغيل","حلول الشركات"][i], ["Medical insurance","HR operations","Management consulting","Operations services","Corporate solutions"][i], s, "7–21 يوم عمل / 7–21 business days")),
  },
  {
    slug: "marketing", title: bi("التسويق", "Marketing"),
    intro: bi("نحوّل حضورك إلى قصة واضحة وطلب قابل للقياس في السوق السعودي.", "We turn your presence into a clear story and measurable demand in the Saudi market."),
    image: "/images/hero-aramco-hq.jpg",
    services: [
      make("brand-strategy","استراتيجية العلامة التجارية","Brand strategy","brand strategy","10–20 يوم عمل / 10–20 business days"),
      make("content-production","إنتاج المحتوى","Content production","content production","7–14 يوم عمل / 7–14 business days"),
      make("social-media","إدارة وسائل التواصل","Social media management","social media"),
      make("search-marketing","التسويق عبر محركات البحث","Search engine marketing","search marketing","10–20 يوم عمل / 10–20 business days"),
      make("campaigns","الحملات الإعلانية","Paid campaigns","paid campaigns","7–14 يوم عمل / 7–14 business days"),
      make("market-research","أبحاث السوق","Market research","market research","10–20 يوم عمل / 10–20 business days"),
    ],
  },
];

export const servicesCatalog = categories;
export const getCategory = (slug?: string) => categories.find((category) => category.slug === slug);
export const getService = (categorySlug?: string, serviceSlug?: string) => getCategory(categorySlug)?.services.find((service) => service.slug === serviceSlug);
export const pick = (value: Bilingual, lang: string) => {
  if (lang === "ar") return value.ar;
  if (lang === "ur") return value.ur || catalogText(value.en, "ur");
  if (lang === "id") return value.id || catalogText(value.en, "id");
  return value.en;
};