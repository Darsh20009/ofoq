import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, Users, FolderKanban, FileText,
  DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Target, CheckCircle2, Zap, MessageSquare, Plus, RefreshCw, UserPlus, HeadphonesIcon,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { analyticsApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
import { useLang } from "../../i18n/LangContext";

const COLORS = ["#1C2B6E", "#33B27C", "#C13229", "#64748B", "#8B5CF6", "#0F766E"];

const MONTHS: Record<string, string[]> = {
  ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
  ur: ["جنوری","فروری","مارچ","اپریل","مئی","جون","جولائی","اگست","ستمبر","اکتوبر","نومبر","دسمبر"],
  id: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};

function StatCard({
  title, value, sub, icon: Icon, color, trend, delay = 0, href,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; trend?: { value: number; up: boolean }; delay?: number; href?: string;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`card flex items-center gap-4 ${href ? "cursor-pointer hover:border-navy-200 transition-colors" : ""}`}
    >
      <div className={`stat-icon ${color} rounded-xl`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-navy-700 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend.up ? "text-emerald-500" : "text-red-500"}`}>
          {trend.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}%
        </div>
      )}
    </motion.div>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { lang, ui, t, dir } = useLang();
  const copy = ui.adminPages.dashboard;

  const { data: overview, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => analyticsApi.overview().then((r) => r.data),
    staleTime: 2 * 60 * 1000,   // 2 min cache
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  });

  const { data: revenueRaw } = useQuery({
    queryKey: ["dashboard-revenue"],
    queryFn: () => analyticsApi.revenue({ period: 6 }).then((r) => r.data.revenue || []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: funnelRaw } = useQuery({
    queryKey: ["dashboard-funnel"],
    queryFn: () => analyticsApi.leadsFunnel().then((r) => r.data.funnel || []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: stagesRaw } = useQuery({
    queryKey: ["dashboard-stages"],
    queryFn: () => analyticsApi.projectsByStage().then((r) => r.data.stages || []),
    staleTime: 5 * 60 * 1000,
  });

  // ── Transform server responses to chart-friendly shapes ───────────
  const revenueChartData = (revenueRaw || []).map((r: { _id: { year: number; month: number }; total: number }) => ({
    month: (MONTHS[lang] || MONTHS.en)[(r._id?.month ?? 1) - 1],
    revenue: r.total || 0,
  }));

  const funnelChartData = (funnelRaw || []).map((f: { _id: string; count: number }) => ({
    stage: f._id || "—",
    count: f.count || 0,
  }));

  const stagesData = (stagesRaw || []).map((s: { _id: string; count: number }) => ({
    stage: s._id || "—",
    count: s.count || 0,
  }));

  // ── Data from overview ─────────────────────────────────────────────
  const leads     = overview?.leads     || {};
  const customers = overview?.customers || {};
  const projects  = overview?.projects  || {};
  const revenue   = overview?.revenue   || {};
  const tasks     = overview?.tasks     || {};
  const team      = overview?.team      || {};
  const recentLeads    = overview?.recentLeads    || [];
  const recentProjects = overview?.recentProjects || [];
  const insights       = overview?.insights       || [];

  const wonRate = leads.total ? Math.round((leads.won / leads.total) * 100) : 0;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? copy.morning : greetingHour < 17 ? copy.afternoon : copy.evening;

  return (
    <div className="space-y-6 animate-fade-in" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ofoq-green mb-2">
            OFOQ / {lang === "ar" ? "لوحة العمل" : "WORKSPACE"}
          </p>
          <h1 className="page-title">
            {greeting}، {user?.name?.split(" ")[0]}
          </h1>
          <p className="page-subtitle">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/projects" className="btn-primary py-2.5">
            <Plus size={16} /> {lang === "ar" ? "مشروع جديد" : "New project"}
          </Link>
          <button onClick={() => refetch()} className="btn-ghost border border-gray-200 bg-white">
            <RefreshCw size={16} /> {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Operational summary */}
      {insights?.summary && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-navy-700 bg-[#1C2B6E] p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-[#E5FE04]" />
          </div>
          <div>
            <p className="text-[#E5FE04] text-xs font-semibold mb-1">{copy.smartInsight}</p>
            <p className="text-white text-sm leading-relaxed">{insights.summary}</p>
            {insights.actions?.slice(0, 2).map((a: string, i: number) => (
              <p key={i} className="text-white/60 text-xs mt-1">• {a}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick access */}
      <section className="card border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-navy-700">{lang === "ar" ? "الوصول السريع" : "Quick access"}</h2>
            <p className="text-xs text-gray-400 mt-1">{lang === "ar" ? "ابدأ من العمليات الأكثر استخدامًا" : "Start with the operations your team uses most"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { href: "/admin/crm/customers", label: t.admin.customers, icon: Users },
            { href: "/admin/projects", label: t.admin.projects, icon: FolderKanban },
            { href: "/admin/invoices", label: t.admin.invoices, icon: FileText },
            { href: "/admin/service-requests", label: ui.client.newRequest, icon: MessageSquare },
            { href: "/admin/users", label: t.admin.users, icon: UserPlus },
            { href: "/admin/support", label: ui.client.support, icon: HeadphonesIcon },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} to={href} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-2 py-3 text-center text-xs font-semibold text-navy-700 transition-colors hover:border-ofoq-green/40 hover:bg-emerald-50">
              <Icon size={18} className="text-ofoq-green" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats grid */}
      {isError ? (
        <div className="card border-red-100 bg-red-50/60 flex flex-col items-center justify-center gap-3 py-10 text-center">
          <AlertTriangle size={28} className="text-red-500" />
          <div>
            <p className="font-semibold text-red-700">{lang === "ar" ? "تعذر تحميل ملخص اللوحة" : "Dashboard summary could not be loaded"}</p>
            <p className="text-sm text-red-600/80 mt-1">{lang === "ar" ? "تحقق من الاتصال ثم حاول مرة أخرى." : "Check the connection and try again."}</p>
          </div>
          <button onClick={() => refetch()} className="btn-ghost border border-red-200 text-red-700">{lang === "ar" ? "إعادة المحاولة" : "Try again"}</button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard href="/admin/users"
             title={copy.team} value={team.total || 0}
             sub={copy.activeUsers}
            icon={Users} color="bg-ofoq-navy" delay={0} />
          <StatCard href="/admin/crm/leads"
             title={copy.leads} value={leads.total || 0}
             sub={`${leads.thisMonth || 0} ${copy.newThisMonth} — ${copy.closeRate} ${wonRate}%`}
            icon={Target} color="bg-ofoq-red"
            trend={wonRate ? { value: wonRate, up: wonRate > 20 } : undefined} delay={0.05} />
          <StatCard href="/admin/crm/customers"
             title={copy.activeCustomers} value={customers.active || 0}
             sub={`${copy.fromTotal} ${customers.total || 0} — ${customers.newThisMonth || 0} ${copy.newCustomer}`}
            icon={CheckCircle2} color="bg-indigo-500" delay={0.1} />
          <StatCard href="/admin/projects"
             title={copy.activeProjects} value={projects.active || 0}
             sub={tasks.overdue ? `${tasks.overdue} ${copy.overdueTasks}` : `${projects.completed || 0} ${copy.completed}`}
            icon={FolderKanban} color="bg-orange-500"
            trend={tasks.overdue ? { value: tasks.overdue, up: false } : undefined} delay={0.15} />
          <StatCard href="/admin/invoices"
             title={copy.revenueThisMonth} value={`${(revenue.thisMonth || 0).toLocaleString(lang)} ${lang === "id" ? "SAR" : "ر.س"}`}
             sub={copy.paidInvoices}
            icon={DollarSign} color="bg-ofoq-red" delay={0.2} />
          <StatCard href="/admin/invoices"
             title={copy.totalRevenue} value={`${(revenue.total || 0).toLocaleString(lang)} ${lang === "id" ? "SAR" : "ر.س"}`}
             sub={copy.allPaidInvoices}
            icon={TrendingUp} color="bg-purple-500" delay={0.25} />
          <StatCard href="/admin/projects"
             title={copy.totalProjects} value={projects.total || 0}
             sub={`${projects.completed || 0} ${copy.completed}`}
            icon={FileText} color="bg-teal-500" delay={0.3} />
          <StatCard href="/admin/contact"
             title={copy.contactRequests} value="—"
             sub={copy.viewConsultations}
            icon={MessageSquare} color="bg-yellow-500" delay={0.35} />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="card lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="font-bold text-navy-700">{copy.revenueCurve}</h3>
               <p className="text-xs text-gray-400 mt-0.5">{copy.lastSixMonths}</p>
            </div>
          </div>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C13229" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C13229" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ fontFamily: "Cairo", fontSize: 12, borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}
                   formatter={(v: number) => [`${v.toLocaleString(lang)} ${lang === "id" ? "SAR" : "ر.س"}`, copy.revenue]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C13229" strokeWidth={2.5}
                  fill="url(#rev)" dot={{ fill: "#C13229", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
                 <p>{copy.noRevenue}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Pipeline funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }} className="card"
        >
           <h3 className="font-bold text-navy-700 mb-4">{copy.pipeline}</h3>
          {funnelChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={funnelChartData}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                    dataKey="count" nameKey="stage" paddingAngle={3}
                  >
                    {funnelChartData.map((_: unknown, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontFamily: "Cairo", fontSize: 12, borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {funnelChartData.slice(0, 5).map((s: { stage: string; count: number }, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{s.stage}</span>
                    </div>
                    <span className="font-semibold text-navy-700">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm text-center">
              <div>
                <Target size={32} className="mx-auto mb-2 text-gray-300" />
                 <p>{copy.noLeads}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Projects by stage */}
      {stagesData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
           <h3 className="font-bold text-navy-700 mb-4">{copy.projectStages}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {stagesData.map((s: { stage: string; count: number }, i: number) => (
              <div key={i} className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 font-bold text-white text-sm"
                  style={{ background: COLORS[i % COLORS.length] }}>
                  {s.count}
                </div>
                <p className="text-xs text-gray-600 font-medium">{s.stage}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        {recentLeads.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="card">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-navy-700">{copy.recentLeads}</h3>
               <Link to="/admin/crm/leads" className="text-xs text-ofoq-green hover:underline">{copy.viewAll}</Link>
            </div>
            <div className="space-y-3">
              {recentLeads.slice(0, 4).map((lead: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-ofoq-red/10 flex items-center justify-center flex-shrink-0">
                    <Target size={14} className="text-ofoq-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-700 truncate">{lead.name || lead.companyName || "—"}</p>
                    <p className="text-xs text-gray-400">{lead.status}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                     {new Date(lead.createdAt).toLocaleDateString(lang === "ar" || lang === "ur" ? `${lang}-SA` : lang)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent projects */}
        {recentProjects.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-navy-700">{copy.recentProjects}</h3>
               <Link to="/admin/projects" className="text-xs text-ofoq-green hover:underline">{copy.viewAll}</Link>
            </div>
            <div className="space-y-3">
              {recentProjects.slice(0, 4).map((proj: any, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={14} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-navy-700 truncate">{proj.name || "—"}</p>
                    <p className="text-xs text-gray-400">{proj.stage || proj.status}</p>
                  </div>
                  <div className="w-16">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-ofoq-green rounded-full" style={{ width: `${proj.progress || 0}%` }} />
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-0.5">{proj.progress || 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tasks overdue alert */}
      {tasks.overdue > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="card border border-red-100 bg-red-50 flex items-center gap-4">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">
             <strong>{tasks.overdue}</strong> {copy.overdueAlert}
          </p>
          <Link to="/admin/projects" className="text-xs font-semibold text-red-600 hover:underline flex-shrink-0">
             {copy.viewTasks}
          </Link>
        </motion.div>
      )}
    </div>
  );
}
