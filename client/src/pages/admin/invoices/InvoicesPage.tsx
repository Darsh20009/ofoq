import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Send, CheckCircle, Trash2, FileText, Download, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { crmApi, invoicesApi } from "../../../api/client";
import type { Customer, Invoice } from "../../../types";
import { useLang } from "../../../i18n/LangContext";

export default function InvoicesPage() {
  const { ui, lang } = useLang();
  const copy = ui.adminPages.invoices;
  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: copy.draft, color: "badge-gray" }, sent: { label: copy.sent, color: "badge-blue" },
    viewed: { label: copy.viewed, color: "badge-navy" }, paid: { label: copy.paid, color: "badge-green" },
    overdue: { label: copy.overdueStatus, color: "badge-red" }, cancelled: { label: copy.cancelled, color: "badge-gray" },
  };
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: () =>
      invoicesApi.list({ search, status: status || undefined, limit: 50 }).then((r) => r.data),
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success(copy.send); },
  });

  const paidMut = useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success(copy.markPaid); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success(copy.deleteConfirm.replace("؟", "")); },
  });

  const downloadPdf = async (id: string, number: string) => {
    try {
      const token = localStorage.getItem("ofoq_token");
      const res = await fetch(`/api/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  };

  const invoices: Invoice[] = data?.invoices || [];
  const now = new Date();

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
           <h1 className="page-title">{copy.title}</h1>
           <p className="page-subtitle">{invoices.length} {copy.count}</p>
        </div>
         <button onClick={() => setCreateOpen(true)} className="btn-primary">
           <Plus size={16} /> {copy.new}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-ofoq-green"><CheckCircle size={20} className="text-white" /></div>
          <div>
             <p className="text-xs text-gray-400">{copy.collected}</p>
             <p className="text-xl font-bold text-navy-700">{totalRevenue.toLocaleString(lang)} {lang === "id" ? "SAR" : "ر.س"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-amber-500"><FileText size={20} className="text-white" /></div>
          <div>
             <p className="text-xs text-gray-400">{copy.pending}</p>
             <p className="text-xl font-bold text-navy-700">{pending.toLocaleString(lang)} {lang === "id" ? "SAR" : "ر.س"}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-red-500"><FileText size={20} className="text-white" /></div>
          <div>
             <p className="text-xs text-gray-400">{copy.overdue}</p>
             <p className="text-xl font-bold text-navy-700">{overdue} {copy.count}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
             placeholder={copy.search}
            className="input-field pr-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field min-w-40">
           <option value="">{copy.allStatuses}</option>
           {Object.entries(statusConfig).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 w-full rounded-xl" />)}
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
             <p className="text-gray-400">{copy.empty}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                   <th>{copy.number}</th><th>{copy.customer}</th><th>{copy.total}</th>
                   <th>{copy.dueDate}</th><th>{copy.status}</th><th>{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                   const s = statusConfig[inv.status] || { label: inv.status, color: "badge-gray" };
                  const isOverdue = new Date(inv.dueDate) < now && !["paid", "cancelled"].includes(inv.status);
                  return (
                    <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="group">
                      <td className="font-mono text-sm font-semibold text-navy-700">{inv.invoiceNumber}</td>
                      <td>{getCustomerName(inv)}</td>
                      <td className="font-bold text-navy-700">
                         {inv.total.toLocaleString(lang)} {inv.currency}
                      </td>
                      <td>
                        <span className={isOverdue ? "text-red-500 font-semibold" : "text-gray-600"}>
                          {format(new Date(inv.dueDate), "d MMM yyyy", { locale: arSA })}
                        </span>
                      </td>
                      <td><span className={s.color}>{s.label}</span></td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {inv.status === "draft" && (
                            <button onClick={() => sendMut.mutate(inv._id)}
                               className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title={copy.send}>
                              <Send size={14} />
                            </button>
                          )}
                          {["sent", "viewed", "overdue"].includes(inv.status) && (
                            <button onClick={() => paidMut.mutate(inv._id)}
                               className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title={copy.markPaid}>
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => downloadPdf(inv._id, inv.invoiceNumber)}
                             className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600" title={copy.download}>
                            <Download size={14} />
                          </button>
                           <button onClick={() => { if (confirm(copy.deleteConfirm)) deleteMut.mutate(inv._id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
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
      </div>

      <InvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["invoices"] });
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function getCustomerName(invoice: Invoice) {
  const customer = invoice.customerId || invoice.customer;
  return typeof customer === "object" && customer ? customer.name : "—";
}

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function InvoiceModal({ open, onClose, onSaved }: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { ui, dir, lang } = useLang();
  const copy = ui.adminPages.invoices;
  const isArabic = lang === "ar";
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [taxRate, setTaxRate] = useState(15);
  const [currency, setCurrency] = useState("SAR");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [notes, setNotes] = useState("");

  const { data: customerData, isLoading: customersLoading } = useQuery({
    queryKey: ["invoice-customers"],
    queryFn: () => crmApi.customers.list({ limit: 200 }).then((response) => response.data),
    enabled: open,
  });
  const customers: Customer[] = customerData?.customers || [];

  const subtotal = Math.max(0, quantity) * Math.max(0, unitPrice);
  const taxAmount = subtotal * Math.max(0, taxRate) / 100;
  const total = subtotal + taxAmount;

  const createMutation = useMutation({
    mutationFn: () => invoicesApi.create({
      customerId,
      type: "invoice",
      items: [{
        description: description.trim(),
        quantity: Math.max(1, quantity),
        unitPrice: Math.max(0, unitPrice),
        discount: 0,
        tax: Math.max(0, taxRate),
        total: subtotal,
      }],
      subtotal,
      discount: 0,
      tax: taxAmount,
      total,
      currency,
      dueDate: dueDate || undefined,
      notes: notes.trim() || undefined,
    }),
    onSuccess: () => {
      toast.success(isArabic ? "تم إنشاء الفاتورة كمسودة" : "Invoice draft created");
      setCustomerId("");
      setDescription("");
      setQuantity(1);
      setUnitPrice(0);
      setTaxRate(15);
      setCurrency("SAR");
      setDueDate(defaultDueDate());
      setNotes("");
      onSaved();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || (isArabic ? "تعذر إنشاء الفاتورة" : "Couldn't create invoice"));
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customerId) {
      toast.error(isArabic ? "اختر العميل أولاً" : "Select a customer first");
      return;
    }
    if (!description.trim()) {
      toast.error(isArabic ? "أدخل وصف بند الفاتورة" : "Enter an invoice item description");
      return;
    }
    if (unitPrice <= 0) {
      toast.error(isArabic ? "أدخل قيمة صحيحة للبند" : "Enter a valid item price");
      return;
    }
    createMutation.mutate();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-lg font-bold text-navy-700">{copy.new}</h2>
              <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 p-6">
              <div>
                <label className="label">{isArabic ? "العميل" : "Customer"} *</label>
                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  disabled={customersLoading}
                  className="input-field"
                  required
                >
                  <option value="">{customersLoading ? (isArabic ? "جارٍ تحميل العملاء..." : "Loading customers...") : (isArabic ? "اختر العميل..." : "Select a customer...")}</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}{customer.companyName ? ` — ${customer.companyName}` : ""}
                    </option>
                  ))}
                </select>
                {!customersLoading && customers.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">{isArabic ? "أضف عميلاً أولاً قبل إنشاء الفاتورة." : "Add a customer before creating an invoice."}</p>
                )}
              </div>

              <div>
                <label className="label">{isArabic ? "وصف الخدمة أو البند" : "Service or item description"} *</label>
                <input value={description} onChange={(event) => setDescription(event.target.value)}
                  className="input-field" placeholder={isArabic ? "مثال: رسوم تأسيس شركة" : "Example: Company formation fee"} required />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="label">{isArabic ? "الكمية" : "Quantity"}</label>
                  <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}
                    className="input-field" dir="ltr" required />
                </div>
                <div>
                  <label className="label">{isArabic ? "سعر الوحدة" : "Unit price"} *</label>
                  <input type="number" min="0" step="0.01" value={unitPrice || ""} onChange={(event) => setUnitPrice(Number(event.target.value))}
                    className="input-field" dir="ltr" required />
                </div>
                <div>
                  <label className="label">{isArabic ? "الضريبة %" : "Tax %"}</label>
                  <input type="number" min="0" max="100" value={taxRate} onChange={(event) => setTaxRate(Number(event.target.value))}
                    className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">{isArabic ? "العملة" : "Currency"}</label>
                  <select value={currency} onChange={(event) => setCurrency(event.target.value)} className="input-field" dir="ltr">
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{isArabic ? "تاريخ الاستحقاق" : "Due date"}</label>
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="input-field" dir="ltr" />
                </div>
                <div className="rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex justify-between text-gray-500"><span>{isArabic ? "المجموع الفرعي" : "Subtotal"}</span><span>{subtotal.toLocaleString(lang)} {currency}</span></div>
                  <div className="mt-1 flex justify-between text-gray-500"><span>{isArabic ? "الضريبة" : "Tax"}</span><span>{taxAmount.toLocaleString(lang)} {currency}</span></div>
                  <div className="mt-2 flex justify-between border-t pt-2 font-bold text-navy-700"><span>{copy.total}</span><span>{total.toLocaleString(lang)} {currency}</span></div>
                </div>
              </div>

              <div>
                <label className="label">{isArabic ? "ملاحظات داخلية" : "Internal notes"}</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="input-field resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending || customers.length === 0} className="btn-primary flex-1 justify-center">
                  {createMutation.isPending ? (isArabic ? "جارٍ الحفظ..." : "Saving...") : (isArabic ? "إنشاء مسودة الفاتورة" : "Create invoice draft")}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">{isArabic ? "إلغاء" : "Cancel"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
