import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, Building2, Briefcase, FileText, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { clientApi } from "../../api/clientApi";

const SERVICES = [
  { value: "company_formation",   label: "تأسيس الشركات",            icon: "🏢" },
  { value: "legal_services",      label: "الخدمات القانونية",         icon: "⚖️" },
  { value: "trademark",           label: "تسجيل العلامات التجارية",   icon: "™️" },
  { value: "government_services", label: "الخدمات الحكومية",          icon: "🏛️" },
  { value: "hr_management",       label: "إدارة الموارد البشرية",      icon: "👥" },
  { value: "gov_platforms",       label: "إدارة المنصات الحكومية",     icon: "💻" },
  { value: "investor_services",   label: "خدمات المستثمرين",           icon: "📈" },
  { value: "ipo_preparation",     label: "تأهيل للإدراج في سوق الأسهم", icon: "📊" },
];

const PACKAGES = [
  { value: "silver",   label: "فضية",    color: "from-gray-400 to-gray-500" },
  { value: "gold",     label: "ذهبية",   color: "from-yellow-400 to-amber-500" },
  { value: "platinum", label: "بلاتينية", color: "from-slate-500 to-slate-700" },
];

const COUNTRIES = [
  "المملكة العربية السعودية","الإمارات","قطر","الكويت","البحرين","عُمان",
  "اليمن","مصر","الأردن","العراق","تركيا","أثيوبيا","أوغندا","الفلبين","الهند","الباكستان","أخرى",
];

const STEPS = [
  { label: "معلومات الشركة", icon: Building2 },
  { label: "بيانات التواصل", icon: Briefcase },
  { label: "تفاصيل الخدمة",  icon: FileText },
  { label: "المراجعة",        icon: CheckCircle2 },
];

interface Form {
  companyName: string; commercialReg: string; businessActivity: string;
  contactEmail: string; contactPhone: string;
  serviceType: string; countryOfRecruitment: string; packageType: string; additionalNotes: string;
}

export default function ServiceRequestPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedService = params.get("service") || "";
  const initialService = SERVICES.some((s) => s.value === requestedService) ? requestedService : "";
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Form>({
    defaultValues: { serviceType: initialService },
  });
  const all = watch();

  async function onSubmit(data: Form) {
    setSubmitting(true);
    try {
      const res = await clientApi.createRequest(data);
      const id = res.data.request._id;
      toast.success("تم تقديم طلبك بنجاح! سيتواصل معك فريقنا قريباً.");
      navigate(`/client/requests/${id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || "خطأ في إرسال الطلب");
    } finally { setSubmitting(false); }
  }

  function next() { setStep((s) => Math.min(s + 1, 3)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ofoq-navy">طلب خدمة جديد</h1>
        <p className="text-gray-500 text-sm mt-1">أكمل النموذج وسيتواصل فريقنا معك خلال 24-48 ساعة</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-ofoq-navy" : "text-gray-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                i < step  ? "bg-emerald-500 border-emerald-500 text-white"
                : i === step ? "bg-ofoq-navy border-ofoq-navy text-white"
                : "border-gray-200 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Company info */}
          {step === 0 && (
            <motion.div key="0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">معلومات الشركة</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم الشركة <span className="text-red-500">*</span></label>
                <input {...register("companyName", { required: "اسم الشركة مطلوب" })}
                  placeholder="شركة ..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.companyName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم السجل التجاري (اختياري)</label>
                <input {...register("commercialReg")} dir="ltr" placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">النشاط التجاري <span className="text-red-500">*</span></label>
                <input {...register("businessActivity", { required: "النشاط مطلوب" })}
                  placeholder="مثال: تجارة، استشارات، تقنية..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.businessActivity ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.businessActivity && <p className="mt-1 text-xs text-red-500">{errors.businessActivity.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 1: Contact */}
          {step === 1 && (
            <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">بيانات التواصل</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني للتواصل <span className="text-red-500">*</span></label>
                <input type="email" dir="ltr" {...register("contactEmail", { required: "البريد مطلوب" })}
                  placeholder="contact@company.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.contactEmail ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف <span className="text-red-500">*</span></label>
                <input type="tel" dir="ltr" {...register("contactPhone", { required: "رقم الهاتف مطلوب" })}
                  placeholder="+966 5x xxx xxxx"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.contactPhone ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 2: Service details */}
          {step === 2 && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">تفاصيل الخدمة</h2>

              {/* Service type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الخدمة المطلوبة <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map((s) => (
                    <button key={s.value} type="button"
                      onClick={() => setValue("serviceType", s.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium text-right transition-all ${
                        all.serviceType === s.value
                          ? "border-ofoq-navy bg-ofoq-navy text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-ofoq-navy/40"
                      }`}>
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
                {!all.serviceType && <p className="mt-1.5 text-xs text-red-500">يرجى اختيار نوع الخدمة</p>}
              </div>

              {/* Package */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الباقة (اختياري)</label>
                <div className="grid grid-cols-3 gap-2">
                  {PACKAGES.map((pk) => (
                    <button key={pk.value} type="button"
                      onClick={() => setValue("packageType", all.packageType === pk.value ? "" : pk.value)}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                        all.packageType === pk.value
                          ? "border-ofoq-navy bg-ofoq-navy text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-ofoq-navy/40"
                      }`}>
                      {pk.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">دولة الاستقدام (إن انطبق)</label>
                <select {...register("countryOfRecruitment")}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30">
                  <option value="">اختر الدولة...</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ملاحظات إضافية (اختياري)</label>
                <textarea {...register("additionalNotes")} rows={3}
                  placeholder="أي تفاصيل إضافية تودّ إضافتها..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-ofoq-navy text-lg mb-4">مراجعة الطلب</h2>
              <div className="space-y-3">
                {[
                  ["اسم الشركة",       all.companyName],
                  ["السجل التجاري",    all.commercialReg || "—"],
                  ["النشاط التجاري",   all.businessActivity],
                  ["بريد التواصل",     all.contactEmail],
                  ["هاتف التواصل",     all.contactPhone],
                  ["نوع الخدمة",       SERVICES.find((s) => s.value === all.serviceType)?.label || all.serviceType],
                  ["الباقة",           PACKAGES.find((p) => p.value === all.packageType)?.label || "—"],
                  ["دولة الاستقدام",   all.countryOfRecruitment || "—"],
                  ["ملاحظات",          all.additionalNotes || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400 text-sm w-36 shrink-0">{k}</span>
                    <span className="text-ofoq-navy text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prev} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={16} /> السابق
          </button>

          {step < 3 ? (
            <button type="button" onClick={() => {
              if (step === 2 && !all.serviceType) return;
              next();
            }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ofoq-navy text-white text-sm font-semibold hover:bg-ofoq-red transition-all">
              التالي <ChevronLeft size={16} />
            </button>
          ) : (
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-all">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              إرسال الطلب
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
