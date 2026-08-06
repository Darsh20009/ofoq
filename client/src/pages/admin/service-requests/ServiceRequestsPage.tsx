import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  FolderOpen, Loader2, RefreshCw, ArrowLeft, Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { clientApi } from "../../../api/clientApi";
import { useLang } from "../../../i18n/LangContext";

const STATUS_OPTIONS = [
  { value: "", color: "" },
  { value: "new", color: "bg-blue-100 text-blue-700" },
  { value: "reviewing", color: "bg-yellow-100 text-yellow-700" },
  { value: "approved", color: "bg-green-100 text-green-700" },
  { value: "in_progress", color: "bg-purple-100 text-purple-700" },
  { value: "completed", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", color: "bg-red-100 text-red-700" },
];

export default function ServiceRequestsPage() {
  const { ui, lang, dir } = useLang();
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-service-requests", statusFilter, page],
    queryFn:  () => clientApi.adminGetRequests({ status: statusFilter || undefined, page }).then((r) => r.data),
  });

  const requests = data?.requests || [];
  const total    = data?.total || 0;
  const pages    = data?.pages || 1;
  const statusLabels = ui.client.status;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ofoq-navy">{ui.client.requests}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isLoading ? ui.client.loading : `${total} ${ui.client.requestCount}`}
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> {ui.adminPages.adminPortal.refresh}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUS_OPTIONS.slice(1).map((s) => {
          const count = requests.filter((r: any) => r.status === s.value).length;
          return (
            <button key={s.value} onClick={() => { setStatusFilter(statusFilter === s.value ? "" : s.value); setPage(1); }}
              className={`p-3 rounded-xl border text-center transition-all ${
                statusFilter === s.value ? "border-ofoq-navy bg-ofoq-navy/5" : "border-gray-100 bg-white hover:border-ofoq-navy/30"
              }`}>
              <p className="text-sm font-bold text-ofoq-navy">{data ? requests.filter((r: any) => r.status === s.value).length : "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.value ? statusLabels[s.value] || s.value : ui.client.requests}</p>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        {STATUS_OPTIONS.map((s) => (
          <button key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === s.value
                ? "bg-ofoq-navy text-white"
                : `${s.color || "bg-gray-100 text-gray-600"} hover:opacity-80`
            }`}>
            {s.value ? statusLabels[s.value] || s.value : ui.client.requests}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-300" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
           <p className="text-gray-400 text-sm">
             {ui.client.noRequests}{statusFilter ? ` · ${statusLabels[statusFilter] || statusFilter}` : ""}
           </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">{ui.request.company}</th>
                <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3 hidden sm:table-cell">{ui.request.service}</th>
                <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3">{ui.adminPages.adminPortal.statusLabel}</th>
                <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3 hidden md:table-cell">{ui.request.submitted}</th>
                <th className="text-right text-xs font-semibold text-gray-400 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any, i: number) => {
                const sOpt = STATUS_OPTIONS.find((s) => s.value === req.status);
                return (
                  <motion.tr key={req._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ofoq-navy text-sm">{req.companyName}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{req.contactEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden sm:table-cell">
                      {ui.client.services[req.serviceType] || req.serviceType}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sOpt?.color || "bg-gray-100 text-gray-600"}`}>
                        {sOpt?.value ? statusLabels[sOpt.value] || sOpt.value : req.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 hidden md:table-cell">
                      {new Date(req.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang)}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/service-requests/${req._id}`}
                        className="flex items-center gap-1 text-xs text-ofoq-navy hover:text-ofoq-red transition-colors font-medium">
                        {ui.detail.details} <ArrowLeft size={12} />
                      </Link>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    p === page ? "bg-ofoq-navy text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
