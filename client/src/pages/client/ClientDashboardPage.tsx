import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Clock, CheckCircle2, PlusCircle, MessageCircle, Loader2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { clientApi } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";
import { useAuthStore } from "../../store/authStore";

const STATUS_COLOR: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700",
  reviewing:   "bg-yellow-100 text-yellow-700",
  approved:    "bg-green-100 text-green-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed:   "bg-emerald-100 text-emerald-700",
  rejected:    "bg-red-100 text-red-700",
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
  const { dir, ui, lang } = useLang();
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["client-requests"],
    queryFn:  () => clientApi.getRequests().then((r) => r.data.requests),
  });

  const requests = data || [];
  const active    = requests.filter((r: any) => !["completed", "rejected"].includes(r.status));
  const completed = requests.filter((r: any) => r.status === "completed");

  return (
    <div className="space-y-8" dir={dir}>
      {/* Welcome banner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] border border-[#2B273F]/10 bg-[#211d36] text-white"
      >
        <div className="grid min-h-[280px] md:grid-cols-[1.15fr_.85fr]">
          <div className={`relative z-10 flex flex-col justify-center px-7 py-9 sm:px-10 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <p className="text-xs font-bold text-[#E5FE04]">{ui.client.portal}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              {ui.client.welcome}، {user?.name?.split(" ")[0] || ui.client.client}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              {ui.client.dashboardSub}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/client/requests/new"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E5FE04] px-4 py-3 text-sm font-bold text-[#211d36] transition-colors hover:bg-white"
              >
                <PlusCircle size={17} />
                {ui.client.newRequest}
              </Link>
              <Link
                to="/client/support"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-white"
              >
                <MessageCircle size={17} />
                {ui.client.supportAction}
              </Link>
            </div>
          </div>
          <div className="relative hidden overflow-hidden md:block">
            <img
              src="/images/ofoq-brand-photo2.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
            />
            <div className="absolute inset-0 bg-[#211d36]/45" />
            <div className={`absolute bottom-7 flex items-center gap-2 text-xs font-bold text-white/80 ${dir === "rtl" ? "right-7" : "left-7"}`}>
              <span className="h-2 w-2 rounded-full bg-[#E5FE04]" />
              {ui.client.portal}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { label: ui.client.total, value: requests.length, icon: FolderOpen, color: "text-[#2B273F]" },
          { label: ui.client.active, value: active.length, icon: Clock, color: "text-[#C5B278]" },
          { label: ui.client.completed, value: completed.length, icon: CheckCircle2, color: "text-[#33B27C]" },
          { label: ui.client.newRequests, value: requests.filter((r: any) => r.status === "new").length, icon: PlusCircle, color: "text-[#6D73DD]" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border border-[#2B273F]/10 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <s.icon size={20} className={s.color} />
              <span className="h-px w-8 bg-[#2B273F]/10" />
            </div>
            <p className="text-3xl font-black text-[#2B273F]">{s.value}</p>
            <p className="mt-1 text-xs text-[#2B273F]/55">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="border border-[#2B273F]/10 bg-white p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#2B273F]">{ui.client.latest}</h2>
          <Link to="/client/requests" className="inline-flex items-center gap-1 text-sm font-bold text-[#2B273F]/60 transition-colors hover:text-[#33B27C]">
            {ui.category.details}
            <ArrowUpRight size={15} className={dir === "rtl" ? "rotate-[-90deg]" : ""} />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="border border-dashed border-gray-200 p-10 text-center">
            <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{ui.client.noRequests}</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">{ui.client.noRequestsSub}</p>
            <Link to="/client/requests/new"
              className="inline-flex items-center gap-2 bg-[#211d36] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#33B27C]">
              <PlusCircle size={14} /> {ui.client.submitNow}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.slice(0, 5).map((req: any, i: number) => (
              <motion.div key={req._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Link to={`/client/requests/${req._id}`}
                  className="block border border-[#2B273F]/10 p-5 transition-colors hover:border-[#33B27C]/60">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-ofoq-navy text-sm">{req.companyName}</p>
                       <p className="text-gray-400 text-xs mt-0.5">{new Date(req.createdAt).toLocaleDateString(lang)}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"}`}>
                       {ui.client.status[req.status] || req.status}
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
