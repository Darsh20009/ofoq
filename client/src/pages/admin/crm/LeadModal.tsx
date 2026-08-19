import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { crmApi } from "../../../api/client";
import type { Lead } from "../../../types";
import { useLang } from "../../../i18n/LangContext";
import PhoneInput from "../../../components/forms/PhoneInput";

// Map text status → numeric stage (schema requires number 1-6)
const STATUS_TO_STAGE: Record<string, number> = {
  new: 1, contacted: 2, qualified: 3,
  proposal: 4, negotiation: 5, won: 6, lost: 6,
};

interface Props {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSaved: () => void;
}

export default function LeadModal({ open, onClose, lead, onSaved }: Props) {
  const { ui, dir } = useLang();
  const copy = ui.adminPages.leads;
  const customerCopy = ui.adminPages.customers;
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  useEffect(() => {
    if (lead) {
      reset({
        ...lead,
        status: (lead as any).status || "new",
        estimatedValue: (lead as any).estimatedValue ?? (lead as any).budget ?? "",
        service: Array.isArray((lead as any).interestedServices)
          ? (lead as any).interestedServices.join(", ")
          : ((lead as any).service || ""),
      });
    } else {
      reset({ currency: "SAR", priority: "medium", status: "new", source: "website" });
    }
  }, [lead, reset]);

  const mut = useMutation({
    mutationFn: (data: any) => {
      // Convert status text → numeric stage
      const stage = STATUS_TO_STAGE[data.status] ?? 1;
      // Map service string → interestedServices array
      const interestedServices = data.service
        ? data.service.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];
      const payload = {
        ...data,
        stage,
        interestedServices,
        estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
      };
      delete payload.service;
      delete payload.budget;
      return lead ? crmApi.leads.update(lead._id, payload) : crmApi.leads.create(payload);
    },
    onSuccess: () => {
      toast.success(lead ? copy.updated : copy.created);
      onSaved();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.error || "حدث خطأ أثناء الحفظ");
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
            dir={dir}
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700 text-lg">
                {lead ? copy.formEdit : copy.formNew}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">{copy.name} *</label>
                  <input {...register("name", { required: true })} className="input-field" placeholder={copy.namePlaceholder} />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{copy.required}</p>}
                </div>
                <div>
                  <label className="label">{customerCopy.email}</label>
                  <input {...register("email")} type="email" className="input-field" placeholder="email@example.com" dir="ltr" />
                </div>
                <div>
                  <label className="label">{customerCopy.phone}</label>
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
                  <input {...register("company")} className="input-field" placeholder={copy.company} />
                </div>
                <div>
                  <label className="label">{copy.service}</label>
                  <input
                    {...register("service")}
                    className="input-field"
                    placeholder="تأشيرات، موارد بشرية، ..."
                  />
                  <p className="text-xs text-gray-400 mt-0.5">افصل بفاصلة لأكثر من خدمة</p>
                </div>
                <div>
                  <label className="label">{copy.stage}</label>
                  <select {...register("status")} className="input-field">
                    <option value="new">{copy.new}</option>
                    <option value="contacted">{copy.contacted}</option>
                    <option value="qualified">{copy.qualified}</option>
                    <option value="proposal">{copy.proposal}</option>
                    <option value="negotiation">{copy.negotiation}</option>
                    <option value="won">{copy.won}</option>
                    <option value="lost">{copy.lost}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.priority}</label>
                  <select {...register("priority")} className="input-field">
                    <option value="low">{copy.low}</option>
                    <option value="medium">{copy.medium}</option>
                    <option value="high">{copy.high}</option>
                    <option value="urgent">{copy.urgent}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.budget}</label>
                  <input {...register("estimatedValue")} type="number" className="input-field" placeholder="0" dir="ltr" />
                </div>
                <div>
                  <label className="label">{customerCopy.currency}</label>
                  <select {...register("currency")} className="input-field">
                    <option value="SAR">{copy.currencySar}</option>
                    <option value="USD">{copy.currencyUsd}</option>
                    <option value="AED">{copy.currencyAed}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.source}</label>
                  <select {...register("source")} className="input-field">
                    <option value="website">{copy.website}</option>
                    <option value="referral">{copy.referral}</option>
                    <option value="social">{copy.socialMedia}</option>
                    <option value="email">{copy.emailSource}</option>
                    <option value="cold_call">{copy.phoneSource}</option>
                    <option value="event">{copy.event}</option>
                    <option value="partner">شريك</option>
                    <option value="other">{copy.other}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.followUp}</label>
                  <input {...register("nextFollowUp")} type="date" className="input-field" dir="ltr" />
                </div>
                <div className="col-span-2">
                  <label className="label">{copy.notes}</label>
                  <textarea {...register("notes")} rows={3} className="input-field resize-none" placeholder={copy.notesPlaceholder} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? copy.saving : lead ? copy.update : copy.add}
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
