import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, PlusCircle, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { clientApi } from "../../api/clientApi";

const STATUS_COLOR: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700",
  reviewing:   "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed:   "bg-emerald-100 text-emerald-700",
  rejected:    "bg-red-100 text-red-700",
};
const STATUS_AR: Record<string, string> = {
  new:         "جديد",
  reviewing:   "قيد المراجعة",
  approved:    "موافق عليه",
  in_progress: "قيد التنفيذ",
  completed:   "مُنجز",
  rejected:    "مرفوض",
};
const SERVICE_AR: Record<string, string> = {
  company_formation:   "تأسيس الشركات",
  legal_services:      "الخدمات القانونية",
  trademark:           "تسجيل العلامات التجارية",
  government_services: "الخدمات الحكومية",
  hr_management:       "إدارة الموارد البشرية",
  gov_platforms:       "إدارة المنصات الحكومية",
  investor_services:   "خدمات المستثمرين",
  ipo_preparation:     "تأهيل للإدراج",
};

export default function RequestsListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["client-requests"],
    queryFn:  () => clientApi.getRequests().then((r) => r.data.requests),
  });

  const requests = data || [];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ofoq-navy">طلباتي</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoading ? "جارٍ التحميل..." : `${requests.length} طلب`}
          </p>
        </div>
        <Link to="/client/requests/new"
          className="flex items-center gap-2 bg-ofoq-navy text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-ofoq-red transition-all shadow-sm">
          <PlusCircle size={16} /> طلب جديد
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-gray-400">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">لا توجد طلبات بعد</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">قدّم أول طلب خدمة وسيتواصل فريقنا معك خلال 24-48 ساعة</p>
          <Link to="/client/requests/new"
            className="inline-flex items-center gap-2 bg-ofoq-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ofoq-red transition-all">
            <PlusCircle size={15} /> تقديم طلب الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any, i: number) => (
            <motion.div key={req._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}>
              <Link to={`/client/requests/${req._id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-ofoq-navy/20 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-ofoq-navy/10 flex items-center justify-center shrink-0 text-xl">
                  {req.serviceType === "company_formation" ? "🏢"
                    : req.serviceType === "trademark" ? "™️"
                    : req.serviceType === "hr_management" ? "👥"
                    : req.serviceType === "legal_services" ? "⚖️"
                    : "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ofoq-navy truncate">{req.companyName}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {SERVICE_AR[req.serviceType] || req.serviceType} ·{" "}
                    {new Date(req.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"}`}>
                    {STATUS_AR[req.status] || req.status}
                  </span>
                  <ArrowLeft size={16} className="text-gray-300 group-hover:text-ofoq-navy transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
