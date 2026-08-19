import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Trash2, Edit2, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { crmApi } from "../../../api/client";
import type { Lead } from "../../../types";
import LeadModal from "./LeadModal";
import { useLang } from "../../../i18n/LangContext";

export default function LeadsPage() {
  const { ui, lang } = useLang();
  const copy = ui.adminPages.leads;
  const stageLabels: Record<string, { label: string; color: string }> = {
    new: { label: copy.new, color: "badge-blue" }, contacted: { label: copy.contacted, color: "badge-navy" },
    qualified: { label: copy.qualified, color: "badge-green" }, proposal: { label: copy.proposal, color: "badge-yellow" },
    negotiation: { label: copy.negotiation, color: "badge-yellow" }, won: { label: copy.won, color: "badge-green" },
    lost: { label: copy.lost, color: "badge-red" },
  };
  const priorityLabels: Record<string, string> = { low: copy.low, medium: copy.medium, high: copy.high, urgent: copy.urgent };
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search, stage, page],
    queryFn: () =>
      crmApi.leads.list({ search, stage: stage || undefined, page, limit: 15 })
        .then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => crmApi.leads.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["leads"] }); toast.success(copy.deleted); },
  });

  const convertMut = useMutation({
    mutationFn: (id: string) => crmApi.leads.convert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["customers"] });
       toast.success(copy.convert);
    },
  });

  // crmApi already resolves Axios' response body in the query function.
  // The API returns { leads, total, page, pages }, not a nested data payload.
  const leads: Lead[] = data?.leads || [];
  const pagination = data
    ? { total: data.total || 0, page: data.page || 1, pages: data.pages || 1 }
    : null;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
           <h1 className="page-title">{copy.title}</h1>
           <p className="page-subtitle">{pagination?.total || 0} {copy.count}</p>
        </div>
        <button onClick={() => { setEditLead(null); setModalOpen(true); }} className="btn-primary">
           <Plus size={16} /> {copy.add}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
             placeholder={copy.search}
            className="input-field pr-10"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <select
            value={stage}
            onChange={(e) => { setStage(e.target.value); setPage(1); }}
            className="input-field pr-10 min-w-44"
          >
             <option value="">{copy.allStages}</option>
             {Object.entries(stageLabels).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-gray-300" />
            </div>
             <p className="text-gray-400 font-medium">{copy.empty}</p>
             <p className="text-gray-300 text-sm mt-1">{copy.emptySub}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                   <th>{copy.name}</th><th>{copy.company}</th><th>{copy.stage}</th><th>{copy.priority}</th>
                   <th>{copy.budget}</th><th>{copy.source}</th><th>{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const stageMeta = stageLabels[lead.stage] || { label: lead.stage, color: "badge-gray" };
                  return (
                    <motion.tr
                      key={lead._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group"
                    >
                      <td>
                        <div>
                          <p className="font-semibold text-navy-700">{lead.name}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                          {lead.phone && <p className="text-xs text-gray-400">{lead.phone}</p>}
                        </div>
                      </td>
                      <td className="text-gray-600">{lead.company || "—"}</td>
                      <td>
                        <span className={stageMeta.color}>{stageMeta.label}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          lead.priority === "urgent" ? "badge-red" :
                          lead.priority === "high" ? "badge-yellow" :
                          lead.priority === "medium" ? "badge-navy" : "badge-gray"
                        }`}>
                           {priorityLabels[lead.priority]}
                        </span>
                      </td>
                      <td className="font-medium">
                         {(lead.estimatedValue ?? lead.budget)
                           ? `${Number(lead.estimatedValue ?? lead.budget).toLocaleString(lang)} ${lead.currency}`
                           : "—"}
                      </td>
                      <td className="text-gray-500 text-xs">{lead.source}</td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditLead(lead); setModalOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          {lead.stage === "won" && (
                            <button
                              onClick={() => convertMut.mutate(lead._id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600"
                               title={copy.convert}
                            >
                              <UserCheck size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                               if (confirm(copy.deleteConfirm))
                                deleteMut.mutate(lead._id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
               {copy.page} {pagination.page} / {pagination.pages} ({pagination.total} {copy.result})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        lead={editLead}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["leads"] }); setModalOpen(false); }}
      />
    </div>
  );
}

function Target({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
