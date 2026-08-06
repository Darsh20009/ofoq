import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { projectsApi } from "../../../api/client";
import type { Project } from "../../../types";
import { useLang } from "../../../i18n/LangContext";

export default function ProjectModal({ open, onClose, project, onSaved }: {
  open: boolean; onClose: () => void; project: Project | null; onSaved: () => void;
}) {
  const { ui, dir } = useLang();
  const copy = ui.adminPages.projects;
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
    onSuccess: () => { toast.success(project ? copy.updated : copy.created); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{project ? copy.formEdit : copy.formNew}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d as Record<string, unknown>))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">{copy.name} (عربي) *</label>
                  <input {...register("title", { required: true })} className="input-field" placeholder={copy.namePlaceholder} />
                </div>
                <div>
                  <label className="label">{copy.stage}</label>
                  <select {...register("stage")} className="input-field">
                    {Object.keys(copy.stages).map((value) => <option key={value} value={value}>{copy.stages[value]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{copy.priority}</label>
                  <select {...register("priority")} className="input-field">
                    {Object.keys(copy.priorities).map((value) => <option key={value} value={value}>{copy.priorities[value]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{copy.startDate}</label>
                  <input {...register("startDate")} type="date" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">{copy.dueDate}</label>
                  <input {...register("dueDate")} type="date" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">{copy.budget}</label>
                  <input {...register("budget", { valueAsNumber: true })} type="number" className="input-field" placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label className="label">{copy.currency}</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.progressLabel}</label>
                  <input {...register("progress", { valueAsNumber: true, min: 0, max: 100 })}
                    type="number" min="0" max="100" className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="label">{copy.status}</label>
                  <select {...register("status")} className="input-field">
                    {Object.keys(copy.statuses).map((value) => <option key={value} value={value}>{copy.statuses[value]}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">{copy.description}</label>
                  <textarea {...register("description")} rows={3} className="input-field resize-none" placeholder={copy.descriptionPlaceholder} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? copy.saving : project ? copy.update : copy.create}
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
