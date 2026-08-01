import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit2, Star } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { crmApi } from "../../../api/client";
import type { Customer } from "../../../types";

const TIER_COLORS: Record<string, string> = {
  bronze: "badge-gray",
  silver: "badge-navy",
  gold: "badge-yellow",
  platinum: "badge-green",
};
const TIER_LABELS: Record<string, string> = {
  bronze: "برونزي", silver: "فضي", gold: "ذهبي", platinum: "بلاتيني",
};

export default function CustomersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => crmApi.customers.list({ search }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => crmApi.customers.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success("تم الحذف"); },
  });

  const customers: Customer[] = data?.data?.customers || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">العملاء</h1>
          <p className="page-subtitle">{customers.length} عميل مسجّل</p>
        </div>
        <button onClick={() => { setEditCustomer(null); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> إضافة عميل
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد أو الشركة..."
            className="input-field pr-10" />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card skeleton h-40" />)}
        </div>
      ) : customers.length === 0 ? (
        <div className="card py-16 text-center">
          <Star size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">لا يوجد عملاء بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ofoq-navy flex items-center justify-center text-white font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-700">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.company || c.email}</p>
                  </div>
                </div>
                <span className={TIER_COLORS[c.tier] || "badge-gray"}>{TIER_LABELS[c.tier]}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>📧 {c.email}</p>
                {c.phone && <p>📱 {c.phone}</p>}
                {c.industry && <p>🏢 {c.industry}</p>}
                <p className="font-semibold text-navy-700 pt-1">
                  💰 {c.totalRevenue.toLocaleString("ar")} {c.currency}
                </p>
              </div>
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditCustomer(c); setModalOpen(true); }}
                  className="btn-ghost text-xs flex-1 justify-center">
                  <Edit2 size={13} /> تعديل
                </button>
                <button onClick={() => { if (confirm("حذف العميل؟")) deleteMut.mutate(c._id); }}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)}
        customer={editCustomer}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["customers"] }); setModalOpen(false); }} />
    </div>
  );
}

function CustomerModal({ open, onClose, customer, onSaved }: {
  open: boolean; onClose: () => void; customer: Customer | null; onSaved: () => void;
}) {
  const { register, handleSubmit, reset } = useForm();
  useEffect(() => {
    if (customer) reset(customer);
    else reset({ currency: "SAR", tier: "bronze", status: "active" });
  }, [customer, reset]);

  const mut = useMutation({
    mutationFn: (data: object) =>
      customer ? crmApi.customers.update(customer._id, data) : crmApi.customers.create(data),
    onSuccess: () => { toast.success(customer ? "تم التحديث" : "تمت الإضافة"); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{customer ? "تعديل عميل" : "إضافة عميل"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">الاسم *</label>
                  <input {...register("name", { required: true })} className="input-field" />
                </div>
                <div>
                  <label className="label">البريد *</label>
                  <input {...register("email", { required: true })} type="email" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">الهاتف</label>
                  <input {...register("phone")} className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">الشركة</label>
                  <input {...register("company")} className="input-field" />
                </div>
                <div>
                  <label className="label">القطاع</label>
                  <input {...register("industry")} className="input-field" />
                </div>
                <div>
                  <label className="label">التصنيف</label>
                  <select {...register("tier")} className="input-field">
                    <option value="bronze">برونزي</option>
                    <option value="silver">فضي</option>
                    <option value="gold">ذهبي</option>
                    <option value="platinum">بلاتيني</option>
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select {...register("status")} className="input-field">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
                <div>
                  <label className="label">الدولة</label>
                  <input {...register("country")} className="input-field" placeholder="السعودية" />
                </div>
                <div>
                  <label className="label">العملة</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "..." : customer ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from "react";
