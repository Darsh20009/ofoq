import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { projectsApi } from "../../../api/client";
import type { Project } from "../../../types";

export default function ProjectModal({ open, onClose, project, onSaved }: {
  open: boolean; onClose: () => void; project: Project | null; onSaved: () => void;
}) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (project) {
      reset({
        ...project,
        title: project.title?.ar || "",
        dueDate: project.dueDate?.split("T")[0],
        startDate: project.startDate?.split("T")[0],
      });
    } else {
      reset({ currency: "SAR", priority: "medium", stage: "request", progress: 0, status: "active" });
    }
  }, [project, reset]);

  const mut = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const payload = { ...data, title: { ar: data.title as string } };
      return project ? projectsApi.update(project._id, payload) : projectsApi.create(payload);
    },
    onSuccess: () => { toast.success(project ? "تم التحديث" : "تمت الإضافة"); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{project ? "تعديل المشروع" : "مشروع جديد"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d as Record<string, unknown>))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">اسم المشروع (عربي) *</label>
                  <input {...register("title", { required: true })} className="input-field" placeholder="اسم المشروع" />
                </div>
                <div>
                  <label className="label">المرحلة</label>
                  <select {...register("stage")} className="input-field">
                    <option value="request">طلب</option>
                    <option value="review">مراجعة</option>
                    <option value="quotation">عرض سعر</option>
                    <option value="contract">عقد</option>
                    <option value="payment">دفع</option>
                    <option value="execution">تنفيذ</option>
                    <option value="closed">إغلاق</option>
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
                  <label className="label">تاريخ البداية</label>
                  <input {...register("startDate")} type="date" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">تاريخ التسليم</label>
                  <input {...register("dueDate")} type="date" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">الميزانية</label>
                  <input {...register("budget", { valueAsNumber: true })} type="number" className="input-field" placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label className="label">العملة</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div>
                  <label className="label">نسبة التقدم (%)</label>
                  <input {...register("progress", { valueAsNumber: true, min: 0, max: 100 })}
                    type="number" min="0" max="100" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select {...register("status")} className="input-field">
                    <option value="active">نشط</option>
                    <option value="on_hold">معلّق</option>
                    <option value="cancelled">ملغي</option>
                    <option value="completed">مكتمل</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">الوصف</label>
                  <textarea {...register("description")} rows={3} className="input-field resize-none" placeholder="وصف المشروع..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "جاري الحفظ..." : project ? "تحديث" : "إنشاء مشروع"}
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
