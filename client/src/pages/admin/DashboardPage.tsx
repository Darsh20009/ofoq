import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, Users, FolderKanban, FileText,
  DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Target, CheckCircle2, Clock, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { analyticsApi } from "../../api/client";
import type { DashboardStats } from "../../types";
import { useAuthStore } from "../../store/authStore";

const COLORS = ["#C13229", "#1C2B6E", "#E5FE04", "#5774C8", "#F97316"];

function StatCard({
  title, value, sub, icon: Icon, color, trend, delay = 0,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string; trend?: { value: number; up: boolean }; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card flex items-center gap-4"
    >
      <div className={`stat-icon ${color}`}>
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
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: overview, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => analyticsApi.overview().then((r) => r.data.data),
  });
  const { data: revenue } = useQuery({
    queryKey: ["dashboard-revenue"],
    queryFn: () => analyticsApi.revenue({ months: 6 }).then((r) => r.data.data),
  });
  const { data: funnel } = useQuery({
    queryKey: ["dashboard-funnel"],
    queryFn: () => analyticsApi.leadsFunnel().then((r) => r.data.data),
  });
  const { data: byStage } = useQuery({
    queryKey: ["dashboard-stages"],
    queryFn: () => analyticsApi.projectsByStage().then((r) => r.data.data),
  });

  const stats: DashboardStats | null = overview?.stats || null;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "صباح الخير" : greetingHour < 17 ? "مساء الخير" : "مساء النور";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">
          {greeting}، {user?.name?.split(" ")[0]}
        </h1>
        <p className="page-subtitle">إليك ملخص أداء منظومة أفق اليوم</p>
      </div>

      {/* AI Insight Banner */}
      {overview?.insights && (
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-l from-ofoq-navy to-navy-800 rounded-2xl p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-ofoq-yellow/20 flex items-center justify-center flex-shrink-0">
            <Zap size={20} className="text-ofoq-yellow" />
          </div>
          <div>
            <p className="text-ofoq-yellow text-xs font-semibold mb-1">رؤية ذكية</p>
            <p className="text-white text-sm leading-relaxed">{overview.insights.summary}</p>
            {overview.insights.actions?.slice(0, 2).map((a: string, i: number) => (
              <p key={i} className="text-white/60 text-xs mt-1">• {a}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      {isLoading ? (
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
          <StatCard title="إجمالي المستخدمين" value={stats?.users.total || 0}
            sub={`${stats?.users.new || 0} جديد هذا الشهر`}
            icon={Users} color="bg-ofoq-navy" trend={{ value: 12, up: true }} delay={0} />
          <StatCard title="الفرص التجارية" value={stats?.leads.total || 0}
            sub={`معدل الإغلاق ${stats?.leads.wonRate || 0}%`}
             icon={Target} color="bg-ofoq-red" trend={{ value: 8, up: true }} delay={0.05} />
          <StatCard title="العملاء النشطون" value={stats?.customers.active || 0}
            sub={`من أصل ${stats?.customers.total || 0} عميل`}
            icon={CheckCircle2} color="bg-indigo-500" delay={0.1} />
          <StatCard title="المشاريع الجارية" value={stats?.projects.active || 0}
            sub={stats?.projects.overdue ? `${stats.projects.overdue} متأخرة` : "لا يوجد تأخير"}
            icon={FolderKanban} color="bg-orange-500"
            trend={stats?.projects.overdue ? { value: stats.projects.overdue, up: false } : undefined}
            delay={0.15} />
          <StatCard title="إيرادات الشهر" value={`${(stats?.revenue.month || 0).toLocaleString("ar")} ر.س`}
             icon={DollarSign} color="bg-ofoq-red" trend={{ value: 15, up: true }} delay={0.2} />
          <StatCard title="الفواتير المعلقة" value={stats?.invoices.pending || 0}
            sub={`${(stats?.invoices.overdue || 0)} متأخرة`}
            icon={Clock} color="bg-yellow-500" delay={0.25} />
          <StatCard title="إجمالي الإيرادات" value={`${(stats?.invoices.revenue || 0).toLocaleString("ar")} ر.س`}
            icon={TrendingUp} color="bg-purple-500" trend={{ value: 22, up: true }} delay={0.3} />
          <StatCard title="الفواتير المتأخرة" value={stats?.invoices.overdue || 0}
            icon={AlertTriangle} color="bg-red-500"
            trend={stats?.invoices.overdue ? { value: 3, up: false } : undefined} delay={0.35} />
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
              <h3 className="font-bold text-navy-700">منحنى الإيرادات</h3>
              <p className="text-xs text-gray-400 mt-0.5">آخر 6 أشهر</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue?.monthly || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#E5322A" stopOpacity={0.2} />
                   <stop offset="95%" stopColor="#E5322A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "Cairo" }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontFamily: "Cairo", fontSize: 12, borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}
                formatter={(v: number) => [`${v.toLocaleString("ar")} ر.س`, "الإيرادات"]}
              />
               <Area type="monotone" dataKey="revenue" stroke="#E5322A" strokeWidth={2.5}
                 fill="url(#rev)" dot={{ fill: "#E5322A", r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pipeline funnel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }} className="card"
        >
          <h3 className="font-bold text-navy-700 mb-6">توزيع الفرص</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={funnel?.stages || [{ name: "جاري التحميل", value: 1 }]}
                cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="count" nameKey="stage" paddingAngle={3}
              >
                {(funnel?.stages || []).map((_: unknown, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontFamily: "Cairo", fontSize: 12, borderRadius: 12 }}
                formatter={(v: number, n: string) => [v, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {(funnel?.stages || []).slice(0, 4).map((s: { stage: string; count: number }, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{s.stage}</span>
                </div>
                <span className="font-semibold text-navy-700">{s.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Projects by stage */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }} className="card"
      >
        <h3 className="font-bold text-navy-700 mb-6">مراحل المشاريع</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {(byStage?.stages || [
            { stage: "طلب", count: 0 }, { stage: "مراجعة", count: 0 },
            { stage: "عرض سعر", count: 0 }, { stage: "عقد", count: 0 },
            { stage: "دفع", count: 0 }, { stage: "تنفيذ", count: 0 },
            { stage: "إغلاق", count: 0 },
          ]).map((s: { stage: string; count: number }, i: number) => (
            <div key={i} className="text-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div
                className="w-10 h-10 rounded-full mx-auto flex items-center justify-center mb-2 font-bold text-white text-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              >
                {s.count}
              </div>
              <p className="text-xs text-gray-600 font-medium">{s.stage}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
