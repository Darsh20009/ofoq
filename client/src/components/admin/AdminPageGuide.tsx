import { useEffect, useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";

type Guide = { title: string; intro: string; steps: string[] };

const GUIDES: Record<string, { ar: Guide; en: Guide }> = {
  dashboard: {
    ar: { title: "دليل لوحة التحكم", intro: "من هنا تتابع أهم أرقام ونشاطات العمل بسرعة.", steps: ["راجع الإحصائيات لمعرفة حالة العملاء والمشاريع والإيرادات.", "استخدم الوصول السريع للانتقال إلى العملاء أو المشاريع أو المستندات.", "افتح الإشعارات لمتابعة الطلبات والتحديثات الجديدة."] },
    en: { title: "Dashboard guide", intro: "Use this page to follow the most important business activity.", steps: ["Review the statistics for customers, projects, and revenue.", "Use Quick access to open customers, projects, or documents.", "Check notifications for new requests and updates."] },
  },
  quotations: {
    ar: { title: "دليل عروض الأسعار", intro: "اتبع هذه الخطوات من إنشاء العرض حتى تحويله إلى فاتورة.", steps: ["اضغط «عرض سعر جديد» وأدخل العميل والبنود والسعر، ثم احفظه كمسودة.", "من زر «إرسال العرض» أرسل المسودة للعميل، وستصبح حالتها «مرسل».", "بعد موافقة العميل اضغط «اعتماد العرض»، ثم اضغط «تحويل إلى فاتورة» لإنشاء فاتورة مسودة.", "من صفحة الفواتير أرسل الفاتورة للعميل، ثم سجّل الدفع عند استلامه."] },
    en: { title: "Quotations guide", intro: "Follow these steps from creating a quotation to converting it into an invoice.", steps: ["Click New quotation, enter the customer, items, and price, then save it as a draft.", "Use Send quotation to send the draft to the customer; its status becomes Sent.", "After approval, use Accept quotation, then Convert to invoice to create an invoice draft.", "Open Invoices to send the invoice and record payment when received."] },
  },
  invoices: {
    ar: { title: "دليل الفواتير", intro: "أنشئ الفاتورة وأرسلها وسجّل الدفع من نفس الصفحة.", steps: ["أنشئ فاتورة جديدة واحفظها كمسودة.", "اضغط «إرسال الفاتورة» لتصبح الحالة «مرسلة» ويصل إشعار للعميل.", "بعد الدفع اضغط «تسجيل الدفع» لتحديث حالة الفاتورة."] },
    en: { title: "Invoices guide", intro: "Create, send, and record payments from this page.", steps: ["Create a new invoice and save it as a draft.", "Click Send invoice to change the status to Sent and notify the customer.", "After payment, click Record payment to update the invoice status."] },
  },
  projects: {
    ar: { title: "دليل المشاريع", intro: "تابع مراحل تنفيذ كل مشروع في مكان واحد.", steps: ["أنشئ مشروعًا واربطه بالعميل والمسؤول.", "حدّث المرحلة ونسبة الإنجاز كلما تقدم العمل.", "استخدم عرض الجدول أو كانبان لمتابعة المشاريع، واحذف المشروع فقط عند التأكد."] },
    en: { title: "Projects guide", intro: "Track every project and its progress in one place.", steps: ["Create a project and link it to a customer and manager.", "Update its stage and progress as work moves forward.", "Use table or Kanban view to follow projects, and delete only when confirmed."] },
  },
};

function guideKey(pathname: string) {
  if (pathname.includes("/quotations")) return "quotations";
  if (pathname.includes("/invoices")) return "invoices";
  if (pathname.includes("/projects")) return "projects";
  return "dashboard";
}

export default function AdminPageGuide() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const key = guideKey(pathname);
  const guide = GUIDES[key][lang === "ar" ? "ar" : "en"];
  const storageKey = `ofoq-admin-guide-${key}`;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(localStorage.getItem(storageKey) !== "seen");
  }, [storageKey]);

  const close = () => {
    localStorage.setItem(storageKey, "seen");
    setOpen(false);
  };

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-[#D9DCE8] bg-white px-3 py-2 text-xs font-bold text-[#1C2B6E] hover:bg-[#F7F8FC]"
      >
        <HelpCircle size={15} />
        {lang === "ar" ? "كيف أستخدم هذه الصفحة؟" : "How to use this page"}
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-[#D9DCE8] bg-[#F7F8FC] p-4 text-[#1C2B6E]" dir={lang === "ar" ? "rtl" : "ltr"}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-black">{guide.title}</h2>
              <p className="mt-1 text-xs text-gray-600">{guide.intro}</p>
            </div>
            <button type="button" onClick={close} className="rounded-md p-1 text-gray-500 hover:bg-white" aria-label={lang === "ar" ? "إغلاق" : "Close"}>
              <X size={16} />
            </button>
          </div>
          <ol className="mt-3 grid gap-2 text-xs text-gray-700 md:grid-cols-2">
            {guide.steps.map((step, index) => (
              <li key={step} className="flex gap-2 rounded-lg bg-white px-3 py-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1C2B6E] text-[10px] font-bold text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}