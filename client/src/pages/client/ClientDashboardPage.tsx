import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FolderOpen, Clock, CheckCircle2, PlusCircle, MessageCircle, Loader2, ArrowUpRight,
  BookOpen, HelpCircle, UserRound, ArrowLeft, Headphones, LayoutDashboard,
} from "lucide-react";
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
  const newRequests = requests.filter((r: any) => r.status === "new");
  const ongoing = requests.filter((r: any) => ["reviewing", "approved", "in_progress"].includes(r.status));
  const rejected = requests.filter((r: any) => r.status === "rejected");
  const chartTotal = Math.max(requests.length, 1);
  const newStop = (newRequests.length / chartTotal) * 360;
  const activeStop = newStop + (ongoing.length / chartTotal) * 360;
  const completedStop = activeStop + (completed.length / chartTotal) * 360;
  const chartBackground = requests.length
    ? `conic-gradient(#6d73dd 0deg ${newStop}deg, #c59650 ${newStop}deg ${activeStop}deg, #33a878 ${activeStop}deg ${completedStop}deg, #d46464 ${completedStop}deg 360deg)`
    : "conic-gradient(#e6e3df 0deg 360deg)";

  return (
    <div className="mx-auto max-w-[1480px] space-y-6" dir={dir}>
      {/* Welcome banner */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[22px] border border-[#071a32]/10 bg-[#071a32] text-white shadow-[0_12px_28px_rgba(7,26,50,.08)]"
      >
        <div className="grid min-h-[250px] md:grid-cols-[1.08fr_.92fr]">
          <div className={`relative z-10 flex flex-col justify-center px-7 py-9 sm:px-10 ${dir === "rtl" ? "text-right" : "text-left"}`}>
            <p className="text-xs font-bold text-[#e0b875]">{ui.client.portal}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-[2.6rem]">
              {ui.client.welcome}، {user?.name?.split(" ")[0] || ui.client.client}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
              {ui.client.dashboardSub}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/client/requests/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#c59650] px-4 py-3 text-sm font-bold text-[#071a32] transition-colors hover:bg-[#e0b875]"
              >
                <PlusCircle size={17} />
                {ui.client.newRequest}
              </Link>
              <Link
                to="/client/support"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-[#e0b875] hover:text-[#e0b875]"
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
              <div className="absolute inset-0 bg-[#071a32]/45" />
            <div className={`absolute bottom-7 flex items-center gap-2 text-xs font-bold text-white/80 ${dir === "rtl" ? "right-7" : "left-7"}`}>
              <span className="h-2 w-2 rounded-full bg-[#c59650]" />
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
          { label: ui.client.newRequests, value: newRequests.length, icon: PlusCircle, color: "text-[#6D73DD]" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-[#e8e0d6] bg-[#fffdfa] p-5 shadow-[0_5px_18px_rgba(7,26,50,.04)] transition-transform hover:-translate-y-0.5">
            <div className="mb-5 flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4efe8] ${s.color}`}>
                <s.icon size={19} />
              </div>
              <span className="h-px w-8 bg-[#071a32]/10" />
            </div>
            <p className="text-3xl font-black text-[#071a32]">{s.value}</p>
            <p className="mt-1 text-xs text-[#071a32]/55">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick services */}
      <section className="rounded-xl border border-[#e8e0d6] bg-[#fffdfa] p-5 shadow-[0_5px_18px_rgba(7,26,50,.04)] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#071a32]">{ui.footer.services}</h2>
          <Link to="/services" className="inline-flex items-center gap-1 text-xs font-bold text-[#8b806f] transition-colors hover:text-[#071a32]">
            {ui.category.details}
            <ArrowUpRight size={14} className={dir === "rtl" ? "rotate-[-90deg]" : ""} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { href: "/client/requests/new", icon: PlusCircle, label: ui.client.newRequest, accent: "text-[#c59650]" },
            { href: "/client/support", icon: MessageCircle, label: ui.client.supportAction, accent: "text-[#071a32]" },
            { href: "/services", icon: BookOpen, label: ui.footer.services, accent: "text-[#6d73dd]" },
            { href: "/client/requests", icon: FolderOpen, label: ui.client.requests, accent: "text-[#33a878]" },
            { href: "/client/support", icon: HelpCircle, label: ui.client.support, accent: "text-[#c59650]" },
          ].map(({ href, icon: Icon, label, accent }) => (
            <Link key={`${href}-${label}`} to={href} className="group flex min-h-[82px] flex-col items-center justify-center gap-2 rounded-lg border border-[#eee7de] bg-[#fffdfa] px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-[#c59650]/60 hover:shadow-sm">
              <Icon size={21} className={`${accent} transition-transform group-hover:scale-110`} />
              <span className="text-xs font-semibold text-[#344052]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Overview and recent requests */}
      <div className="grid gap-6 xl:grid-cols-[.95fr_1.35fr]">
        <section className="rounded-xl border border-[#e8e0d6] bg-[#fffdfa] p-5 shadow-[0_5px_18px_rgba(7,26,50,.04)] sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#071a32]">{ui.client.dashboard}</h2>
            <span className="text-xs text-[#8b806f]">{ui.client.total}</span>
          </div>
          <div className="flex items-center justify-center py-2">
            <div
              className="flex h-44 w-44 items-center justify-center rounded-full"
              style={{ background: chartBackground }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#fffdfa]">
                <span className="text-3xl font-black text-[#071a32]">{requests.length}</span>
                <span className="text-xs text-[#8b806f]">{ui.client.total}</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-4">
            <div><span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-[#6d73dd]" /><strong className="block text-[#071a32]">{newRequests.length}</strong><span className="text-[#8b806f]">{ui.client.newRequests}</span></div>
            <div><span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-[#c59650]" /><strong className="block text-[#071a32]">{ongoing.length}</strong><span className="text-[#8b806f]">{ui.client.active}</span></div>
            <div><span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-[#33a878]" /><strong className="block text-[#071a32]">{completed.length}</strong><span className="text-[#8b806f]">{ui.client.completed}</span></div>
            <div><span className="mx-auto mb-1 block h-2 w-2 rounded-full bg-[#d46464]" /><strong className="block text-[#071a32]">{rejected.length}</strong><span className="text-[#8b806f]">{ui.client.status.rejected}</span></div>
          </div>
        </section>

        <section className="rounded-xl border border-[#e8e0d6] bg-[#fffdfa] p-5 shadow-[0_5px_18px_rgba(7,26,50,.04)] sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-black text-[#071a32]">{ui.client.latest}</h2>
            <Link to="/client/requests" className="inline-flex items-center gap-1 text-sm font-bold text-[#8b806f] transition-colors hover:text-[#33a878]">
              {ui.category.details}
              <ArrowUpRight size={15} className={dir === "rtl" ? "rotate-[-90deg]" : ""} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center border border-dashed border-[#ded7ce] p-8 text-center">
              <FolderOpen size={40} className="mb-3 text-[#c7c0b6]" />
              <p className="font-medium text-[#556070]">{ui.client.noRequests}</p>
              <p className="mb-4 mt-1 text-sm text-[#9a9288]">{ui.client.noRequestsSub}</p>
              <Link to="/client/requests/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#071a32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#c59650] hover:text-[#071a32]">
                <PlusCircle size={14} /> {ui.client.submitNow}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.slice(0, 5).map((req: any, i: number) => (
                <motion.div key={req._id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/client/requests/${req._id}`}
                    className="block rounded-lg border border-[#eee7de] p-4 transition-colors hover:border-[#33a878]/60 hover:bg-[#fcfaf6]">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#071a32]">{req.companyName}</p>
                        <p className="mt-0.5 text-xs text-[#9a9288]">{new Date(req.createdAt).toLocaleDateString(lang)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600"}`}>
                        {ui.client.status[req.status] || req.status}
                      </span>
                    </div>
                    <StatusProgress status={req.status} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Support footer */}
      <section className="relative overflow-hidden rounded-xl bg-[#071a32] px-6 py-8 text-white shadow-[0_12px_28px_rgba(7,26,50,.1)] sm:px-9">
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold text-[#e0b875]">{ui.client.support}</p>
            <h2 className="text-xl font-black">{ui.client.supportAction}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/65">{ui.client.supportSub}</p>
          </div>
          <Link to="/client/support" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#c59650] px-5 py-3 text-sm font-bold text-[#071a32] transition-colors hover:bg-[#e0b875]">
            <Headphones size={17} />
            {ui.client.support}
          </Link>
        </div>
        <div className="pointer-events-none absolute -bottom-14 end-6 opacity-[.08]">
          <LayoutDashboard size={190} />
        </div>
      </section>
    </div>
  );
}
