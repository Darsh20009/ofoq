import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, FileSignature, Send, CheckSquare, Trash2, Download, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { contractsApi, crmApi } from "../../../api/client";
import { useLang } from "../../../i18n/LangContext";

async function downloadContractPdf(id: string, number: string) {
  const token = localStorage.getItem("ofoq_token");
  const res = await fetch(`/api/contracts/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) { return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${number}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

interface ContractForm {
  title: string;
  customerId: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  content: string;
}

export default function ContractsPage() {
  const { ui, lang } = useLang();
  const copy = ui.adminPages.contracts;
  const statusConfig = {
    draft: { label: copy.draft, color: "badge-gray" }, sent: { label: copy.sent, color: "badge-blue" },
    signed: { label: copy.signedStatus, color: "badge-green" }, expired: { label: copy.expired, color: "badge-red" },
    cancelled: { label: copy.cancelled, color: "badge-gray" },
  };
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContractForm>({
    defaultValues: { currency: "SAR" },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["contracts", search, status],
    queryFn: () => contractsApi.list({ search, status: status || undefined, limit: 50 }).then((r) => r.data),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers-mini"],
    queryFn: () => crmApi.customers.list({ limit: 200 }).then((r) => r.data),
  });

  const createMut = useMutation({
    mutationFn: (data: object) => contractsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.create); closeModal(); },
    onError: () => {},
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => contractsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.save); closeModal(); },
    onError: () => {},
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => contractsApi.send(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.send); },
    onError: () => {},
  });

  const signMut = useMutation({
    mutationFn: (id: string) => contractsApi.sign(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.certify); },
    onError: () => {},
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.deleteConfirm.replace("؟", "")); },
    onError: () => {},
  });

  const contracts: any[] = data?.data?.contracts || data?.contracts || [];
  const customers: any[] = customersData?.data?.customers || customersData?.customers || [];

  const stats = {
    total: contracts.length,
    draft: contracts.filter((c) => c.status === "draft").length,
    signed: contracts.filter((c) => c.status === "signed").length,
    totalValue: contracts.filter((c) => c.status !== "cancelled")
      .reduce((s: number, c: any) => s + (c.value || 0), 0),
  };

  function openCreate() {
    setEditing(null);
    reset({ currency: "SAR" });
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    reset({
      title: c.title,
      customerId: c.customerId?._id || c.customerId,
      value: c.value,
      currency: c.currency || "SAR",
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      content: c.content || "",
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditing(null); reset(); }

  function onSubmit(data: ContractForm) {
    if (editing) updateMut.mutate({ id: editing._id, data });
    else createMut.mutate(data);
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
           <h1 className="page-title">{copy.title}</h1>
           <p className="page-subtitle">{contracts.length} {copy.count}</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
           <Plus size={16} /> {copy.new}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
           { label: copy.total, value: stats.total, icon: FileText, color: "bg-blue-500" },
           { label: copy.drafts, value: stats.draft, icon: FileSignature, color: "bg-amber-500" },
           { label: copy.signed, value: stats.signed, icon: CheckSquare, color: "bg-ofoq-green" },
           { label: copy.totalValue, value: `${stats.totalValue.toLocaleString(lang)} ${lang === "id" ? "SAR" : "ر.س"}`, icon: FileText, color: "bg-navy-600" },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3">
            <div className={`stat-icon ${s.color}`}><s.icon size={18} className="text-white" /></div>
            <div>
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-lg font-bold text-navy-700">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
               placeholder={copy.search} className="input-field pr-9 text-sm" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field text-sm w-36">
             <option value="">{copy.allStatuses}</option>
             {Object.entries(statusConfig).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-ofoq-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16">
            <FileSignature size={40} className="text-gray-200 mx-auto mb-3" />
             <p className="text-gray-400">{copy.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                   <th>{copy.number}</th><th>{copy.contractTitle}</th><th>{copy.customer}</th>
                   <th>{copy.value}</th><th>{copy.endDate}</th><th>{copy.status}</th><th>{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((c: any, i: number) => {
                   const s = statusConfig[c.status as keyof typeof statusConfig] || { label: c.status, color: "badge-gray" };
                  return (
                    <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="group">
                      <td className="font-mono text-sm font-semibold text-navy-700">{c.contractNumber}</td>
                      <td className="max-w-40 truncate">{c.title}</td>
                      <td>{c.customerId?.name || c.customerId?.companyName || "—"}</td>
                      <td className="font-semibold">
                         {c.value ? `${c.value.toLocaleString(lang)} ${c.currency || "SAR"}` : "—"}
                      </td>
                      <td>
                        {c.endDate
                          ? format(new Date(c.endDate), "d MMM yyyy", { locale: arSA })
                          : "—"}
                      </td>
                      <td><span className={s.color}>{s.label}</span></td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit */}
                          <button onClick={() => openEdit(c)}
                             className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-600" title={copy.edit}>
                            <FileSignature size={14} />
                          </button>
                          {/* Send */}
                          {c.status === "draft" && (
                            <button onClick={() => sendMut.mutate(c._id)}
                               className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title={copy.send}>
                              <Send size={14} />
                            </button>
                          )}
                          {/* Sign */}
                           {c.status === "sent" && (
                             <button onClick={() => { if (confirm(copy.certify)) signMut.mutate(c._id); }}
                               className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title={copy.certify}>
                              <CheckSquare size={14} />
                            </button>
                          )}
                          {/* PDF */}
                          <button onClick={() => downloadContractPdf(c._id, c.contractNumber)}
                             className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600" title={copy.download}>
                            <Download size={14} />
                          </button>
                          {/* Delete */}
                          {c.status === "draft" && (
                             <button onClick={() => { if (confirm(copy.deleteConfirm)) deleteMut.mutate(c._id); }}
                               className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title={copy.deleteConfirm}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ─────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-bold text-navy-700">
                   {editing ? copy.editTitle : copy.new}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Title */}
                <div>
                   <label className="label">{copy.titleLabel} <span className="text-red-500">*</span></label>
                   <input {...register("title", { required: copy.required })} className="input-field" placeholder={copy.titleLabel} />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                {/* Customer */}
                <div>
                   <label className="label">{copy.customer} <span className="text-red-500">*</span></label>
                   <select {...register("customerId", { required: copy.required })} className="input-field">
                     <option value="">{copy.chooseCustomer}</option>
                    {customers.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name || c.companyName}</option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
                </div>

                {/* Value + Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                     <label className="label">{copy.value}</label>
                    <input {...register("value", { valueAsNumber: true })} type="number" min="0" step="0.01"
                      className="input-field" placeholder="0.00" />
                  </div>
                  <div>
                     <label className="label">{copy.currency}</label>
                    <select {...register("currency")} className="input-field">
                      <option value="SAR">ر.س</option>
                      <option value="USD">USD</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="label">{copy.startDate}</label>
                    <input {...register("startDate")} type="date" className="input-field" />
                  </div>
                  <div>
                     <label className="label">{copy.endDate}</label>
                    <input {...register("endDate")} type="date" className="input-field" />
                  </div>
                </div>

                {/* Content */}
                <div>
                   <label className="label">{copy.content}</label>
                  <textarea {...register("content")} rows={5}
                     className="input-field resize-none" placeholder={copy.content} />
                </div>

                <div className="flex gap-3 pt-2">
                   <button type="button" onClick={closeModal} className="btn-secondary flex-1">{copy.cancel}</button>
                  <button type="submit"
                    disabled={createMut.isPending || updateMut.isPending}
                    className="btn-primary flex-1">
                     {(createMut.isPending || updateMut.isPending) ? "..." : editing ? copy.save : copy.create}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
