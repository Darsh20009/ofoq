import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { crmApi } from "../../../api/client";
import type { Lead } from "../../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSaved: () => void;
}

export default function LeadModal({ open, onClose, lead, onSaved }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (lead) reset(lead);
    else reset({ currency: "SAR", priority: "medium", stage: "new", source: "website" });
  }, [lead, reset]);

  const mut = useMutation({
    mutationFn: (data: object) =>
      lead ? crmApi.leads.update(lead._id, data) : crmApi.leads.create(data),
    onSuccess: () => {
      toast.success(lead ? "تم تحديث الفرصة" : "تم إضافة الفرصة");
      onSaved();
    },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700 text-lg">
                {lead ? "تعديل الفرصة" : "إضافة فرصة جديدة"}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">الاسم *</label>
                  <input {...register("name", { required: true })} className="input-field" placeholder="اسم العميل المحتمل" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">مطلوب</p>}
                </div>
                <div>
                  <label className="label">البريد الإلكتروني *</label>
                  <input {...register("email", { required: true })} type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
                </div>
                <div>
                  <label className="label">رقم الهاتف</label>
                  <input {...register("phone")} className="input-field" placeholder="+966 5X XXX XXXX" dir="ltr" />
                </div>
                <div>
                  <label className="label">الشركة</label>
                  <input {...register("company")} className="input-field" placeholder="اسم الشركة" />
                </div>
                <div>
                  <label className="label">الخدمة المطلوبة</label>
                  <input {...register("service")} className="input-field" placeholder="تطوير موقع، تسويق..." />
                </div>
                <div>
                  <label className="label">المرحلة</label>
                  <select {...register("stage")} className="input-field">
                    <option value="new">جديد</option>
                    <option value="contacted">تم التواصل</option>
                    <option value="qualified">مؤهّل</option>
                    <option value="proposal">عرض سعر</option>
                    <option value="negotiation">تفاوض</option>
                    <option value="won">مُغلق (فوز)</option>
                    <option value="lost">مُغلق (خسارة)</option>
                  </select>
                </div>
                <div>
                  <label className="label">الأولوية</label>
                  <select {...register("priority")} className="input-field">
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>
                <div>
                  <label className="label">الميزانية</label>
                  <input {...register("budget", { valueAsNumber: true })} type="number" className="input-field" placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label className="label">العملة</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار (USD)</option>
                    <option value="AED">درهم (AED)</option>
                  </select>
                </div>
                <div>
                  <label className="label">المصدر</label>
                  <select {...register("source")} className="input-field">
                    <option value="website">الموقع الإلكتروني</option>
                    <option value="referral">إحالة</option>
                    <option value="social_media">وسائل التواصل</option>
                    <option value="email">البريد الإلكتروني</option>
                    <option value="phone">الهاتف</option>
                    <option value="event">فعالية</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="label">موعد المتابعة</label>
                  <input {...register("followUpDate")} type="date" className="input-field" dir="ltr" />
                </div>
                <div className="col-span-2">
                  <label className="label">ملاحظات</label>
                  <textarea {...register("notes")} rows={3} className="input-field resize-none" placeholder="ملاحظات إضافية..." />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "جاري الحفظ..." : lead ? "تحديث" : "إضافة"}
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
