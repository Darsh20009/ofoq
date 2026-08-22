import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, FolderKanban, CreditCard, User, AlertTriangle, HeadphonesIcon, ClipboardList, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { arSA } from "date-fns/locale";
import { projectsApi } from "../../../api/client";
import { useAuthStore } from "../../../store/authStore";
import { useLang } from "../../../i18n/LangContext";

export default function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const { ui, lang, dir } = useLang();
  const copy = ui.adminPages.adminPortal;
  const now = new Date();

  const { data: projectsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["employee-projects"],
    queryFn: () => projectsApi.list({ limit: 20 }).then((r) => r.data),
  });

  const projects: any[] = projectsData?.data?.projects || projectsData?.projects || [];

  // Aggregate tasks across all projects (simplified)
  const myProjects = projects.filter(
    (p) => p.status === "active" || p.status === "on_hold"
  );
  const completedProjects = projects.filter((p) => p.status === "completed");
  const overdueProjects = myProjects.filter(
    (p) => p.dueDate && isAfter(now, new Date(p.dueDate))
  );

  const greeting = () => {
    const hour = now.getHours();
    if (hour < 12) return copy.employeeDashboardGreetingMorning;
    if (hour < 17) return copy.employeeDashboardGreetingAfternoon;
    return copy.employeeDashboardGreetingEvening;
  };
  const stageLabels: Record<string, string> = {
    request: copy.stageRequest, review: copy.stageReview, quotation: copy.stageQuotation,
    contract: copy.stageContract, payment: copy.stagePayment, execution: copy.stageExecution, closed: copy.stageClosed,
  };
  const dateLocale = lang === "ar" || lang === "ur" ? arSA : undefined;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-navy-700 bg-[#1C2B6E]"
      >
        <div className="px-6 py-5 flex flex-wrap items-center gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-[#33B27C]/40" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-[#33B27C]/20 flex items-center justify-center text-2xl font-bold text-[#33B27C]">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-white/60 text-sm">{greeting()}،</p>
            <h1 className="text-white text-xl font-bold">{user?.name}</h1>
            <p className="text-[#A7E8C7] text-xs">{user?.position || copy.roleEmployee}{user?.department ? ` • ${user.department}` : ""}</p>
          </div>
          <div className="ms-auto">
            <p className="text-white/50 text-xs">
              {format(now, lang === "ar" || lang === "ur" ? "EEEE، d MMMM yyyy" : "EEEE, d MMMM yyyy", { locale: dateLocale })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {isError ? (
        <div className="card border-red-100 bg-red-50/60 flex flex-wrap items-center gap-3">
          <AlertTriangle size={22} className="text-red-500" />
          <p className="flex-1 text-sm text-red-700">{lang === "ar" ? "تعذر تحميل مشاريعك." : "Your projects could not be loaded."}</p>
          <button onClick={() => refetch()} className="btn-ghost border border-red-200 text-red-700">
            <RefreshCw size={15} /> {lang === "ar" ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: copy.activeProjects, value: myProjects.length, icon: FolderKanban, color: "bg-blue-500" },
          { label: copy.completedProjects, value: completedProjects.length, icon: CheckCircle, color: "bg-ofoq-green" },
          { label: copy.overdueProjects, value: overdueProjects.length, icon: AlertTriangle, color: "bg-red-500" },
          { label: copy.totalProjects, value: projects.length, icon: FolderKanban, color: "bg-slate-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="card flex items-center gap-3">
            <div className={`stat-icon ${s.color}`}><s.icon size={18} className="text-white" /></div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-navy-700">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-700 flex items-center gap-2">
            <FolderKanban size={18} className="text-ofoq-green" />
            {copy.myProjects}
          </h3>
            <Link to="/projects" className="text-xs text-ofoq-green hover:underline">{copy.viewAll}</Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => <div key={index} className="skeleton h-14 w-full rounded-xl" />)}
          </div>
        ) : myProjects.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">{copy.noActiveProjects}</p>
        ) : (
          <div className="space-y-3">
            {myProjects.slice(0, 5).map((p: any) => {
              const isOverdue = p.dueDate && isAfter(now, new Date(p.dueDate));
              return (
                <div key={p._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: isOverdue ? "#ef4444" : "#33B27C" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-700 truncate">
                      {p.title?.ar || p.title || "—"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stageLabels[p.stage] || p.stage}
                      {p.dueDate && ` • ${format(new Date(p.dueDate), "d MMM", { locale: arSA })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue && (
                      <span className="badge-red text-[10px]">{copy.overdue}</span>
                    )}
                    <div className="w-14 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-ofoq-green transition-all"
                        style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400 w-7 text-left">{p.progress || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/employee/card"
           className="card hover:border-ofoq-green/40 transition-colors group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-[#1C2B6E] flex items-center justify-center">
             <CreditCard size={18} className="text-[#33B27C]" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{copy.myCard}</p>
            <p className="text-xs text-gray-400">{copy.barcodePreview}</p>
          </div>
        </Link>
         <Link to="/profile"
           className="card hover:border-navy-200 transition-colors group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
             <User size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{copy.myProfile}</p>
            <p className="text-xs text-gray-400">{copy.accountSettings}</p>
          </div>
        </Link>
        <Link to="/service-requests"
          className="card hover:border-ofoq-green/40 transition-colors group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <ClipboardList size={18} className="text-ofoq-green" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{ui.client.newRequest}</p>
            <p className="text-xs text-gray-400">{ui.client.requests}</p>
          </div>
        </Link>
        <Link to="/support"
          className="card hover:border-navy-200 transition-colors group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <HeadphonesIcon size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{ui.client.support}</p>
            <p className="text-xs text-gray-400">{ui.client.supportSub}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
