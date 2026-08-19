import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Plus, Search, FileSignature, Send, CheckSquare, Trash2, Download, X, FileText, Eye, Stamp } from "lucide-react";
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
}

interface ContractSection {
  title: string;
  content: string;
}

interface ApprovalField {
  type: "signature" | "stamp";
  label: string;
  party: "company" | "client" | "witness";
  required: boolean;
}

const CONTRACT_DRAFT_KEY = "ofoq_contract_editor_draft";

export default function ContractsPage() {
  const { ui, lang, dir } = useLang();
  const copy = ui.adminPages.contracts;
  const isArabic = lang === "ar";
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
  const [viewing, setViewing] = useState<any>(null);
  const [sections, setSections] = useState<ContractSection[]>([]);
  const [approvalFields, setApprovalFields] = useState<ApprovalField[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<ContractForm>({
    defaultValues: { currency: "SAR" },
  });
  const watchedForm = watch();
  const [draftSaved, setDraftSaved] = useState(false);

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
    onSuccess: () => {
      localStorage.removeItem(CONTRACT_DRAFT_KEY);
      setDraftSaved(false);
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success(copy.create);
      closeModal();
    },
    onError: (error: any) => {
      saveDraftLocally();
      toast.error(`${error?.response?.data?.error || (isArabic ? "تعذر إنشاء العقد" : "Couldn't create contract")} — ${isArabic ? "تم حفظ نسخة مسودة لاسترجاعها" : "A draft backup was saved for recovery"}`);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => contractsApi.update(id, data),
    onSuccess: () => {
      localStorage.removeItem(CONTRACT_DRAFT_KEY);
      setDraftSaved(false);
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success(copy.save);
      closeModal();
    },
    onError: (error: any) => {
      saveDraftLocally();
      toast.error(`${error?.response?.data?.error || (isArabic ? "تعذر حفظ العقد" : "Couldn't save contract")} — ${isArabic ? "تم حفظ نسخة مسودة لاسترجاعها" : "A draft backup was saved for recovery"}`);
    },
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => contractsApi.send(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["contracts"] }); toast.success(copy.send); },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر إرسال العقد" : "Couldn't send contract")),
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
    const saved = readDraftLocally();
    if (saved && !saved.editingId) {
      reset(saved.form);
      setSections(saved.sections);
      setApprovalFields(saved.approvalFields);
      setDraftSaved(true);
      toast.success(isArabic ? "تم استرجاع المسودة المحفوظة" : "Saved draft restored");
    } else {
      reset({ currency: "SAR" });
      setSections([{ title: isArabic ? "نطاق الخدمات" : "Scope of services", content: "" }]);
      setApprovalFields([
        { type: "signature", label: isArabic ? "توقيع الطرف الأول (أفق)" : "First party signature (OFOQ)", party: "company", required: true },
        { type: "signature", label: isArabic ? "توقيع الطرف الثاني (العميل)" : "Second party signature (client)", party: "client", required: true },
      ]);
      setDraftSaved(false);
    }
    setShowModal(true);
  }

  function openEdit(c: any) {
    setEditing(c);
    const saved = readDraftLocally();
    if (saved?.editingId === c._id) {
      reset(saved.form);
      setSections(saved.sections);
      setApprovalFields(saved.approvalFields);
      setDraftSaved(true);
      toast.success(isArabic ? "تم استرجاع آخر نسخة محفوظة من العقد" : "Last saved contract draft restored");
    } else {
      reset({
        title: c.title,
        customerId: c.customerId?._id || c.customerId,
        value: c.value,
        currency: c.currency || "SAR",
        startDate: c.startDate ? c.startDate.slice(0, 10) : "",
        endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      });
      setSections(
        Array.isArray(c.sections) && c.sections.length
          ? c.sections.map((section: any) => ({ title: section.title || "", content: section.content || "" }))
          : [{ title: isArabic ? "بنود العقد" : "Contract terms", content: c.content || c.termsAr || c.terms || "" }]
      );
      setApprovalFields(
        Array.isArray(c.approvalFields) && c.approvalFields.length
          ? c.approvalFields.map((field: any) => ({
            type: field.type === "stamp" ? "stamp" : "signature",
            label: field.label || "",
            party: ["company", "client", "witness"].includes(field.party) ? field.party : "company",
            required: Boolean(field.required),
          }))
          : [
            { type: "signature", label: isArabic ? "توقيع الطرف الأول (أفق)" : "First party signature (OFOQ)", party: "company", required: true },
            { type: "signature", label: isArabic ? "توقيع الطرف الثاني (العميل)" : "Second party signature (client)", party: "client", required: true },
          ]
      );
      setDraftSaved(false);
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setSections([]);
    setApprovalFields([]);
    setDraftSaved(false);
    reset();
  }

  function saveDraftLocally() {
    if (typeof window === "undefined") return;
    const snapshot = {
      editingId: editing?._id || null,
      form: watchedForm,
      sections,
      approvalFields,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CONTRACT_DRAFT_KEY, JSON.stringify(snapshot));
    setDraftSaved(true);
  }

  function readDraftLocally(): {
    editingId: string | null;
    form: ContractForm;
    sections: ContractSection[];
    approvalFields: ApprovalField[];
  } | null {
    try {
      const raw = localStorage.getItem(CONTRACT_DRAFT_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw);
      if (!saved?.form || !Array.isArray(saved.sections) || !Array.isArray(saved.approvalFields)) return null;
      return saved;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (!showModal) return;
    const timer = window.setTimeout(() => saveDraftLocally(), 500);
    return () => window.clearTimeout(timer);
  }, [
    showModal,
    editing?._id,
    watchedForm.title,
    watchedForm.customerId,
    watchedForm.value,
    watchedForm.currency,
    watchedForm.startDate,
    watchedForm.endDate,
    sections,
    approvalFields,
  ]);

  function onSubmit(data: ContractForm) {
    const cleanSections = sections
      .map((section) => ({ title: section.title.trim(), content: section.content.trim() }))
      .filter((section) => section.title && section.content);
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      toast.error(isArabic ? "يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء" : "The end date must be after the start date");
      return;
    }
    const cleanApprovals = approvalFields
      .map((field) => ({ ...field, label: field.label.trim() }))
      .filter((field) => field.label);
    const payload = {
      ...data,
      status: "draft",
      value: Number(data.value) || 0,
      sections: cleanSections,
      approvalFields: cleanApprovals,
      // Keeps existing documents and external consumers compatible.
      content: cleanSections.map((section) => `${section.title}\n${section.content}`).join("\n\n"),
    };
    if (editing) updateMut.mutate({ id: editing._id, data: payload });
    else createMut.mutate(payload);
  }

  function onInvalid() {
    saveDraftLocally();
    toast.error(isArabic
      ? "أدخل عنوان العقد واختر العميل. تم حفظ بقية البيانات كمسودة."
      : "Enter a contract title and select a customer. The remaining data was saved as a draft.");
  }

  function updateSection(index: number, key: keyof ContractSection, value: string) {
    setSections((current) => current.map((section, i) => i === index ? { ...section, [key]: value } : section));
  }

  function updateApproval(index: number, patch: Partial<ApprovalField>) {
    setApprovalFields((current) => current.map((field, i) => i === index ? { ...field, ...patch } : field));
  }

  return (
    <div className="space-y-6" dir={dir}>
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
                           <button onClick={() => setViewing(c)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title={isArabic ? "معاينة العقد" : "Preview contract"}>
                             <Eye size={14} />
                           </button>
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-bold text-navy-700">
                   {editing ? copy.editTitle : copy.new}
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
               {draftSaved && (
                 <div className="mx-6 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                   {isArabic
                     ? "تم حفظ نسخة مسودة احتياطية تلقائياً. ستبقى حتى ينجح الحفظ."
                     : "A backup draft was saved automatically and will remain until saving succeeds."}
                 </div>
               )}

               <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="p-6 space-y-4">
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

                {/* Contract sections */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-navy-700">{isArabic ? "أقسام ومحتوى العقد" : "Contract sections and content"}</h4>
                      <p className="text-xs text-gray-400 mt-1">{isArabic ? "أضف بنوداً مستقلة لتظهر مرتبة في المعاينة وملف PDF." : "Add separate clauses, ordered in the preview and PDF."}</p>
                    </div>
                    <button type="button" onClick={() => setSections((current) => [...current, { title: "", content: "" }])}
                      className="btn-secondary text-sm whitespace-nowrap">
                      <Plus size={15} /> {isArabic ? "إضافة قسم" : "Add section"}
                    </button>
                  </div>
                  {sections.map((section, index) => (
                    <div key={index} className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ofoq-navy text-xs font-bold text-white">{index + 1}</span>
                        <input value={section.title} onChange={(event) => updateSection(index, "title", event.target.value)}
                          className="input-field flex-1 bg-white" placeholder={isArabic ? "عنوان القسم، مثال: نطاق الخدمات" : "Section title, e.g. Scope of services"} />
                        {sections.length > 1 && (
                          <button type="button" onClick={() => setSections((current) => current.filter((_, i) => i !== index))}
                            className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" title={isArabic ? "حذف القسم" : "Delete section"}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <textarea value={section.content} onChange={(event) => updateSection(index, "content", event.target.value)} rows={4}
                        className="input-field resize-y bg-white" placeholder={isArabic ? "اكتب محتوى هذا القسم..." : "Write this section's content..."} />
                    </div>
                  ))}
                </div>

                {/* Signatures and stamps */}
                <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-navy-700">{isArabic ? "أماكن التوقيع والختم" : "Signature and stamp areas"}</h4>
                      <p className="text-xs text-gray-400 mt-1">{isArabic ? "يمكن إضافة أكثر من توقيع أو ختم وفق أطراف العقد." : "Add as many signature or stamp areas as the contract needs."}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setApprovalFields((current) => [...current, { type: "signature", label: isArabic ? "توقيع إضافي" : "Additional signature", party: "witness", required: false }])}
                        className="btn-secondary text-sm"><FileSignature size={15} /> {isArabic ? "توقيع" : "Signature"}</button>
                      <button type="button" onClick={() => setApprovalFields((current) => [...current, { type: "stamp", label: isArabic ? "ختم جهة" : "Organization stamp", party: "company", required: false }])}
                        className="btn-secondary text-sm"><Stamp size={15} /> {isArabic ? "ختم" : "Stamp"}</button>
                    </div>
                  </div>
                  {approvalFields.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{isArabic ? "لا توجد أماكن اعتماد مضافة." : "No approval areas have been added."}</p>
                  ) : approvalFields.map((field, index) => (
                    <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[auto_1fr_9rem_auto] sm:items-center">
                      <span className={`inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${field.type === "stamp" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                        {field.type === "stamp" ? <Stamp size={13} /> : <FileSignature size={13} />}
                        {field.type === "stamp" ? (isArabic ? "ختم" : "Stamp") : (isArabic ? "توقيع" : "Signature")}
                      </span>
                      <input value={field.label} onChange={(event) => updateApproval(index, { label: event.target.value })}
                        className="input-field bg-white" placeholder={isArabic ? "وصف مكان الاعتماد" : "Approval area label"} />
                      <select value={field.party} onChange={(event) => updateApproval(index, { party: event.target.value as ApprovalField["party"] })}
                        className="input-field bg-white">
                        <option value="company">{isArabic ? "أفق / الشركة" : "OFOQ / Company"}</option>
                        <option value="client">{isArabic ? "العميل" : "Client"}</option>
                        <option value="witness">{isArabic ? "شاهد / طرف إضافي" : "Witness / other party"}</option>
                      </select>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-1 text-xs text-gray-500">
                          <input type="checkbox" checked={field.required} onChange={(event) => updateApproval(index, { required: event.target.checked })} />
                          {isArabic ? "مطلوب" : "Required"}
                        </label>
                        <button type="button" onClick={() => setApprovalFields((current) => current.filter((_, i) => i !== index))}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500" title={isArabic ? "حذف" : "Delete"}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
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

      <ContractPreview
        contract={viewing}
        onClose={() => setViewing(null)}
        isArabic={isArabic}
        onDownload={downloadContractPdf}
      />
    </div>
  );
}

function ContractPreview({ contract, onClose, isArabic, onDownload }: {
  contract: any;
  onClose: () => void;
  isArabic: boolean;
  onDownload: (id: string, number: string) => void;
}) {
  if (!contract) return null;
  const sections = Array.isArray(contract.sections) && contract.sections.length
    ? [...contract.sections].sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    : [{ title: isArabic ? "بنود العقد" : "Contract terms", content: contract.content || contract.termsAr || contract.terms || "—" }];
  const approvals = Array.isArray(contract.approvalFields) && contract.approvalFields.length
    ? contract.approvalFields
    : [
      { type: "signature", label: isArabic ? "توقيع الطرف الأول" : "First party signature" },
      { type: "signature", label: isArabic ? "توقيع الطرف الثاني" : "Second party signature" },
    ];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.98, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 12 }}
          onClick={(event) => event.stopPropagation()}
          className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
            <div>
              <p className="text-xs font-semibold text-ofoq-green">{contract.contractNumber}</p>
              <h2 className="text-lg font-bold text-navy-700">{contract.title}</h2>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => onDownload(contract._id, contract.contractNumber)} className="btn-secondary text-sm">
                <Download size={15} /> PDF
              </button>
              <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
          </div>
          <div className="space-y-6 p-6">
            <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-3">
              <div><p className="text-gray-400">{isArabic ? "العميل" : "Customer"}</p><p className="mt-1 font-semibold text-navy-700">{contract.customerId?.companyName || contract.customerId?.name || "—"}</p></div>
              <div><p className="text-gray-400">{isArabic ? "تاريخ البدء" : "Start date"}</p><p className="mt-1 font-semibold text-navy-700">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—"}</p></div>
              <div><p className="text-gray-400">{isArabic ? "تاريخ النهاية" : "End date"}</p><p className="mt-1 font-semibold text-navy-700">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"}</p></div>
            </div>
            <div className="space-y-5">
              {sections.map((section: any, index: number) => (
                <section key={index}>
                  <h3 className="border-b-2 border-ofoq-green pb-2 font-bold text-navy-700">{index + 1}. {section.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{section.content}</p>
                </section>
              ))}
            </div>
            <div>
              <h3 className="mb-3 font-bold text-navy-700">{isArabic ? "التوقيعات والأختام" : "Signatures and stamps"}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {approvals.map((field: any, index: number) => (
                  <div key={index} className="min-h-28 rounded-xl border border-dashed border-gray-300 p-4 text-center">
                    {field.type === "stamp"
                      ? <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-gray-400 text-xs text-gray-400">{isArabic ? "ختم" : "Stamp"}</div>
                      : <div className="h-14" />}
                    <p className="border-t border-gray-400 pt-2 text-sm text-gray-600">{field.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
