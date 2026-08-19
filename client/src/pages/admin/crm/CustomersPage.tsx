import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit2, Star } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { crmApi } from "../../../api/client";
import type { Customer } from "../../../types";
import { useLang } from "../../../i18n/LangContext";
import PhoneInput from "../../../components/forms/PhoneInput";

const TIER_COLORS: Record<string, string> = {
  bronze: "badge-gray",
  silver: "badge-navy",
  gold: "badge-yellow",
  platinum: "badge-green",
};
export default function CustomersPage() {
  const { ui, lang } = useLang();
  const copy = ui.adminPages.customers;
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); toast.success(copy.deleteConfirm.replace("؟", "")); },
  });

  // crmApi already returns the Axios response body.
  // The API shape is { customers, total, page, pages }.
  const customers: Customer[] = data?.customers || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
           <h1 className="page-title">{copy.title}</h1>
           <p className="page-subtitle">{customers.length} {copy.count}</p>
        </div>
        <button onClick={() => { setEditCustomer(null); setModalOpen(true); }} className="btn-primary">
           <Plus size={16} /> {copy.add}
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
             placeholder={copy.search}
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
           <p className="text-gray-400">{copy.empty}</p>
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
                    <p className="text-xs text-gray-400">{c.companyName || c.company || c.email}</p>
                  </div>
                </div>
                 <span className={TIER_COLORS[c.tier] || "badge-gray"}>{copy[c.tier as "bronze" | "silver" | "gold" | "platinum"] || c.tier}</span>
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p>📧 {c.email}</p>
                {c.phone && <p>📱 {c.phone}</p>}
                {c.industry && <p>🏢 {c.industry}</p>}
                <p className="font-semibold text-navy-700 pt-1">
                   💰 {c.totalRevenue.toLocaleString(lang)} {c.currency}
                </p>
              </div>
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditCustomer(c); setModalOpen(true); }}
                  className="btn-ghost text-xs flex-1 justify-center">
                   <Edit2 size={13} /> {copy.edit}
                </button>
                 <button onClick={() => { if (confirm(copy.deleteConfirm)) deleteMut.mutate(c._id); }}
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
  const { ui } = useLang();
  const copy = ui.adminPages.customers;
  const { register, handleSubmit, reset, control } = useForm();
  useEffect(() => {
    if (customer) {
      reset({
        ...customer,
        companyName: customer.companyName || customer.company || "",
      });
    } else {
      reset({ currency: "SAR", tier: "standard", status: "active" });
    }
  }, [customer, reset]);

  const mut = useMutation({
    mutationFn: (data: object) =>
      customer ? crmApi.customers.update(customer._id, data) : crmApi.customers.create(data),
    onSuccess: () => { toast.success(customer ? copy.update : copy.save); onSaved(); },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "حدث خطأ أثناء حفظ العميل");
    },
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
               <h2 className="font-bold text-navy-700">{customer ? `${copy.edit} ${copy.title.slice(0, -1)}` : copy.add}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="label">{copy.name} *</label>
                  <input {...register("name", { required: true })} className="input-field" />
                </div>
                <div>
                   <label className="label">{copy.email} *</label>
                  <input {...register("email", { required: true })} type="email" className="input-field" dir="ltr" />
                </div>
                <div>
                   <label className="label">{copy.phone}</label>
                   <Controller
                     name="phone"
                     control={control}
                     render={({ field }) => (
                       <PhoneInput
                         value={field.value || ""}
                         onChange={field.onChange}
                         onBlur={field.onBlur}
                       />
                     )}
                   />
                </div>
                <div>
                    <label className="label">{copy.company}</label>
                  <input {...register("companyName")} className="input-field" />
                </div>
                <div>
                   <label className="label">{copy.industry}</label>
                  <input {...register("industry")} className="input-field" />
                </div>
                <div>
                   <label className="label">{copy.tier}</label>
                  <select {...register("tier")} className="input-field">
                      <option value="standard">{copy.bronze || "قياسي"}</option>
                     <option value="silver">{copy.silver}</option>
                     <option value="gold">{copy.gold}</option>
                     <option value="platinum">{copy.platinum}</option>
                  </select>
                </div>
                <div>
                   <label className="label">{copy.status}</label>
                  <select {...register("status")} className="input-field">
                     <option value="active">{copy.active}</option>
                     <option value="inactive">{copy.inactive}</option>
                  </select>
                </div>
                <div>
                   <label className="label">{copy.country}</label>
                   <input {...register("country")} className="input-field" placeholder={copy.country} />
                </div>
                <div>
                   <label className="label">{copy.currency}</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                   {mut.isPending ? "..." : customer ? copy.update : copy.save}
                </button>
                 <button type="button" onClick={onClose} className="btn-ghost">{copy.cancel}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

