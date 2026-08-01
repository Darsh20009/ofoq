import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Send, CheckCircle, Trash2, Edit2, FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { invoicesApi } from "../../../api/client";
import type { Invoice } from "../../../types";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: "مسودة",          color: "badge-gray"  },
  sent:      { label: "مُرسلة",          color: "badge-blue"  },
  viewed:    { label: "مُشاهَدة",        color: "badge-navy"  },
  paid:      { label: "مدفوعة",          color: "badge-green" },
  overdue:   { label: "متأخرة",          color: "badge-red"   },
  cancelled: { label: "ملغاة",           color: "badge-gray"  },
};

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: () =>
      invoicesApi.list({ search, status: status || undefined, limit: 50 }).then((r) => r.data),
  });

  const sendMut = useMutation({
    mutationFn: (id: string) => invoicesApi.send(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("تم إرسال الفاتورة للعميل"); },
  });

  const paidMut = useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("تم تسجيل الدفعة"); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); toast.success("تم الحذف"); },
  });

  const downloadPdf = async (id: string, number: string) => {
    try {
      const token = localStorage.getItem("ofoq_token");
      const res = await fetch(`/api/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error("تعذّر تحميل ملف PDF"); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${number}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("خطأ في تحميل PDF");
    }
  };

  const invoices: Invoice[] = data?.data?.invoices || [];
  const now = new Date();

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const overdue = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">الفواتير</h1>
          <p className="page-subtitle">{invoices.length} فاتورة</p>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> فاتورة جديدة
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-ofoq-green"><CheckCircle size={20} className="text-white" /></div>
          <div>
            <p className="text-xs text-gray-400">إجمالي المحصّل</p>
            <p className="text-xl font-bold text-navy-700">{totalRevenue.toLocaleString("ar")} ر.س</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-amber-500"><FileText size={20} className="text-white" /></div>
          <div>
            <p className="text-xs text-gray-400">في الانتظار</p>
            <p className="text-xl font-bold text-navy-700">{pending.toLocaleString("ar")} ر.س</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="stat-icon bg-red-500"><FileText size={20} className="text-white" /></div>
          <div>
            <p className="text-xs text-gray-400">فواتير متأخرة</p>
            <p className="text-xl font-bold text-navy-700">{overdue} فاتورة</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الفاتورة أو العميل..."
            className="input-field pr-10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field min-w-40">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
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
            <p className="text-gray-400">لا توجد فواتير</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>رقم الفاتورة</th>
                  <th>العميل</th>
                  <th>الإجمالي</th>
                  <th>تاريخ الاستحقاق</th>
                  <th>الحالة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const s = STATUS_CONFIG[inv.status] || { label: inv.status, color: "badge-gray" };
                  const isOverdue = new Date(inv.dueDate) < now && !["paid", "cancelled"].includes(inv.status);
                  return (
                    <motion.tr key={inv._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="group">
                      <td className="font-mono text-sm font-semibold text-navy-700">{inv.invoiceNumber}</td>
                      <td>{inv.customer?.name || "—"}</td>
                      <td className="font-bold text-navy-700">
                        {inv.total.toLocaleString("ar")} {inv.currency}
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
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="إرسال">
                              <Send size={14} />
                            </button>
                          )}
                          {["sent", "viewed", "overdue"].includes(inv.status) && (
                            <button onClick={() => paidMut.mutate(inv._id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600" title="تسجيل الدفع">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => downloadPdf(inv._id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600" title="تحميل PDF">
                            <Download size={14} />
                          </button>
                          <button onClick={() => { if (confirm("حذف الفاتورة؟")) deleteMut.mutate(inv._id); }}
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
    </div>
  );
}
