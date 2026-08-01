import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Clock, CheckCircle2, PlusCircle, MessageCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { clientApi } from "../../api/clientApi";
import { useAuthStore } from "../../store/authStore";

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
const STATUS_STEPS = ["new", "reviewing", "approved", "in_progress", "completed"];

function StatusProgress({ status }: { status: string }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
            i < idx ? "bg-emerald-500 border-emerald-500 text-white"
            : i === idx ? "bg-ofoq-navy border-ofoq-navy text-white"
            : "bg-gray-100 border-gray-200 text-gray-400"
          }`}>
            {i < idx ? "✓" : i + 1}
          </div>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 w-5 rounded ${i < idx ? "bg-emerald-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClientDashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["client-requests"],
    queryFn:  () => clientApi.getRequests().then((r) => r.data.requests),
  });

  const requests = data || [];
  const active    = requests.filter((r: any) => !["completed", "rejected"].includes(r.status));
  const completed = requests.filter((r: any) => r.status === "completed");

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-ofoq-navy">
          أهلاً، {user?.name?.split(" ")[0] || "العميل"} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">تابع طلباتك وتواصل مع فريقنا من هنا</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: requests.length, icon: FolderOpen, color: "bg-ofoq-navy" },
          { label: "طلبات نشطة",     value: active.length,   icon: Clock,       color: "bg-amber-500" },
          { label: "مُنجزة",          value: completed.length, icon: CheckCircle2, color: "bg-emerald-500" },
          { label: "طلبات جديدة",     value: requests.filter((r: any) => r.status === "new").length, icon: PlusCircle, color: "bg-blue-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={18} className="text-white" />
            </div>
            <p className="text-2xl font-bold text-ofoq-navy">{s.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/client/requests/new"
          className="flex items-center gap-2 bg-ofoq-navy text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ofoq-red transition-all shadow-sm">
          <PlusCircle size={16} /> طلب خدمة جديد
        </Link>
        <Link to="/client/support"
          className="flex items-center gap-2 bg-white text-ofoq-navy border border-ofoq-navy/20 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-ofoq-navy hover:text-white transition-all">
          <MessageCircle size={16} /> تواصل مع الدعم
        </Link>
      </div>

      {/* Recent Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-ofoq-navy">آخر الطلبات</h2>
          <Link to="/client/requests" className="text-sm text-ofoq-navy/70 hover:text-ofoq-red transition-colors">
            عرض الكل ←
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">لا توجد طلبات بعد</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">ابدأ بتقديم طلبك الأول وسيتواصل فريقنا معك</p>
            <Link to="/client/requests/new"
              className="inline-flex items-center gap-2 bg-ofoq-navy text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-ofoq-red transition-all">
              <PlusCircle size={14} /> تقديم طلب الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((req: any, i: number) => (
              <motion.div key={req._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link to={`/client/requests/${req._id}`}
                  className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-ofoq-navy/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-ofoq-navy text-sm">{req.companyName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{new Date(req.createdAt).toLocaleDateString("ar-SA")}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_AR[req.status] || req.status}
                    </span>
                  </div>
                  <StatusProgress status={req.status} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
