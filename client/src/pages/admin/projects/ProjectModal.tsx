import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { crmApi, projectsApi, usersApi } from "../../../api/client";
import type { Customer, Project } from "../../../types";
import { useLang } from "../../../i18n/LangContext";
import CustomerQuickCreate from "../../../components/admin/CustomerQuickCreate";

type ProjectForm = {
  name: string;
  customerId: string;
  manager: string;
  stage: string;
  priority: string;
  startDate?: string;
  dueDate?: string;
  budget?: number;
  currency: string;
  progress: number;
  status: string;
  description?: string;
};

function relatedId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: string })._id);
  }
  return "";
}

export default function ProjectModal({ open, onClose, project, onSaved }: {
  open: boolean; onClose: () => void; project: Project | null; onSaved: () => void;
}) {
  const { ui, dir, lang } = useLang();
  const copy = ui.adminPages.projects;
  const { register, handleSubmit, reset } = useForm<ProjectForm>();
  const [formError, setFormError] = useState("");
  const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
  const projectRecord = project as (Project & {
    name?: string;
    customerId?: Customer | string;
  }) | null;

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ["project-customers"],
    queryFn: () => crmApi.customers.list({ status: "active", limit: 200 }).then((response) => response.data),
    enabled: open,
  });
  const { data: usersData, isLoading: managersLoading } = useQuery({
    queryKey: ["project-managers"],
    queryFn: () => usersApi.list({ status: "active", limit: 200 }).then((response) => response.data),
    enabled: open,
  });
  const customers: Customer[] = customersData?.customers || [];
  const managers = (usersData?.users || []).filter((user: { role?: string }) =>
    ["super_admin", "admin", "manager", "employee"].includes(user.role || "")
  );

  useEffect(() => {
    setFormError("");
    if (projectRecord) {
      reset({
        name: projectRecord.name || projectRecord.title?.ar || "",
        customerId: relatedId(projectRecord.customerId || projectRecord.customer),
        manager: relatedId(projectRecord.manager),
        stage: projectRecord.stage,
        priority: projectRecord.priority,
        dueDate: projectRecord.dueDate?.split("T")[0],
        startDate: projectRecord.startDate?.split("T")[0],
        budget: projectRecord.budget,
        currency: projectRecord.currency,
        progress: projectRecord.progress,
        status: projectRecord.status,
        description: typeof projectRecord.description === "string" ? projectRecord.description : projectRecord.description?.ar,
      });
    } else {
      reset({ name: "", customerId: "", manager: "", currency: "SAR", priority: "medium", stage: "request", progress: 0, status: "active", description: "" });
    }
  }, [open, projectRecord, reset]);

  const mut = useMutation({
    mutationFn: (data: ProjectForm) => {
      const payload = {
        ...data,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        startDate: data.startDate || undefined,
        dueDate: data.dueDate || undefined,
        budget: Number.isFinite(data.budget) ? data.budget : undefined,
      };
      return projectRecord ? projectsApi.update(projectRecord._id, payload) : projectsApi.create(payload);
    },
    onSuccess: () => { toast.success(project ? copy.updated : copy.created); onSaved(); },
    onError: (error: any) => {
      setFormError(error?.response?.data?.error || (lang === "ar" ? "تعذر حفظ المشروع. تحقق من البيانات وحاول مجددًا." : "Couldn't save the project. Check the details and try again."));
    },
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
            <form onSubmit={handleSubmit((data) => { setFormError(""); mut.mutate(data); })} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">{copy.name} *</label>
                  <input {...register("name", { required: true })} className="input-field" placeholder={copy.namePlaceholder} />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label className="label mb-1">{ui.adminPages.invoices.customer} *</label>
                    <button type="button" onClick={() => setQuickCustomerOpen(true)} className="text-xs font-semibold text-ofoq-green hover:underline">
                      {lang === "ar" ? "+ إنشاء عميل جديد" : "+ Create customer"}
                    </button>
                  </div>
                  <select {...register("customerId", { required: true })} className="input-field" disabled={customersLoading}>
                    <option value="">
                      {customersLoading ? (lang === "ar" ? "جارٍ تحميل العملاء..." : "Loading customers...") : (lang === "ar" ? "اختر العميل..." : "Select customer...")}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}{customer.companyName ? ` - ${customer.companyName}` : ""}
                      </option>
                    ))}
                  </select>
                  {!customersLoading && customers.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">{lang === "ar" ? "أنشئ عميلاً جديدًا من الرابط أعلاه للمتابعة." : "Create a customer using the link above to continue."}</p>
                  )}
                </div>
                <div>
                  <label className="label">{lang === "ar" ? "مدير المشروع" : "Project manager"} *</label>
                  <select {...register("manager", { required: true })} className="input-field" disabled={managersLoading}>
                    <option value="">
                      {managersLoading ? (lang === "ar" ? "جارٍ تحميل الموظفين..." : "Loading team members...") : (lang === "ar" ? "اختر مدير المشروع..." : "Select project manager...")}
                    </option>
                    {managers.map((manager: { _id: string; fullName?: string; name?: string; email?: string }) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.fullName || manager.name || manager.email}
                      </option>
                    ))}
                  </select>
                  {!managersLoading && managers.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">{lang === "ar" ? "لا يوجد موظفون نشطون يمكن تعيينهم." : "No active team members are available."}</p>
                  )}
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
              {formError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending || customersLoading || managersLoading || customers.length === 0 || managers.length === 0} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? copy.saving : project ? copy.update : copy.create}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">{copy.cancel}</button>
              </div>
            </form>
            <CustomerQuickCreate
              open={quickCustomerOpen}
              onClose={() => setQuickCustomerOpen(false)}
              onCreated={(customer) => {
                reset((current) => ({ ...current, customerId: customer._id }));
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
