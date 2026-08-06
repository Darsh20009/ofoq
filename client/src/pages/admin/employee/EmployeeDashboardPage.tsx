import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle, Clock, FolderKanban, CreditCard, Calendar, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import { arSA } from "date-fns/locale";
import { projectsApi } from "../../../api/client";
import { useAuthStore } from "../../../store/authStore";
import { useLang } from "../../../i18n/LangContext";

export default function EmployeeDashboardPage() {
  const { user } = useAuthStore();
  const { ui, lang } = useLang();
  const copy = ui.adminPages.adminPortal;
  const now = new Date();

  const { data: projectsData } = useQuery({
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
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2B6E] to-[#0C1338]" />
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 160">
          <defs>
            <pattern id="dash-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#33B27C" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dash-grid)" />
          <circle cx="550" cy="-30" r="150" fill="none" stroke="#33B27C" strokeWidth="40" opacity="0.15"/>
        </svg>
        <div className="relative px-6 py-5 flex items-center gap-4">
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
            <p className="text-[#33B27C] text-xs">{user?.position || copy.roleEmployee}{user?.department ? ` • ${user.department}` : ""}</p>
          </div>
          <div className="mr-auto">
            <p className="text-white/40 text-xs text-left">
              {format(now, lang === "ar" || lang === "ur" ? "EEEE، d MMMM yyyy" : "EEEE, d MMMM yyyy", { locale: dateLocale })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: copy.activeProjects, value: myProjects.length, icon: FolderKanban, color: "bg-blue-500" },
          { label: copy.completedProjects, value: completedProjects.length, icon: CheckCircle, color: "bg-ofoq-green" },
          { label: copy.overdueProjects, value: overdueProjects.length, icon: AlertTriangle, color: "bg-red-500" },
          { label: copy.totalProjects, value: projects.length, icon: Clock, color: "bg-amber-500" },
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

      {/* Projects */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-navy-700 flex items-center gap-2">
            <FolderKanban size={18} className="text-ofoq-green" />
            {copy.myProjects}
          </h3>
            <Link to="/projects" className="text-xs text-ofoq-green hover:underline">{copy.viewAll}</Link>
        </div>
        {myProjects.length === 0 ? (
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
      <div className="grid grid-cols-2 gap-4">
        <Link to="/employee/card"
          className="card hover:shadow-ofoq-green/20 hover:shadow-lg transition-all group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-[#1C2B6E] flex items-center justify-center">
            <CreditCard size={18} className="text-[#33B27C]" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{copy.myCard}</p>
            <p className="text-xs text-gray-400">{copy.barcodePreview}</p>
          </div>
        </Link>
        <Link to="/profile"
          className="card hover:shadow-lg transition-all group cursor-pointer flex items-center gap-3 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Calendar size={18} className="text-gray-500" />
          </div>
          <div>
            <p className="font-bold text-navy-700 text-sm">{copy.myProfile}</p>
            <p className="text-xs text-gray-400">{copy.accountSettings}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
