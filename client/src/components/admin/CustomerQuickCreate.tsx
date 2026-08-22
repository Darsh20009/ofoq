import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { crmApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";
import PhoneInput from "../forms/PhoneInput";
import type { Customer } from "../../types";

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
};

export default function CustomerQuickCreate({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}) {
  const { lang, dir } = useLang();
  const isArabic = lang === "ar";
  const { register, handleSubmit, reset, control } = useForm<CustomerForm>({
    defaultValues: { name: "", email: "", phone: "", companyName: "" },
  });

  useEffect(() => {
    if (open) reset({ name: "", email: "", phone: "", companyName: "" });
  }, [open, reset]);

  const mutation = useMutation({
    mutationFn: (data: CustomerForm) =>
      crmApi.customers.create({
        ...data,
        name: data.name.trim(),
        email: data.email.trim(),
        companyName: data.companyName.trim() || undefined,
        phone: data.phone.trim() || undefined,
        tier: "standard",
        status: "active",
        currency: "SAR",
      }),
    onSuccess: (response) => {
      const customer = response.data?.customer;
      if (!customer?._id) {
        toast.error(isArabic ? "تم الحفظ لكن تعذر قراءة بيانات العميل" : "Customer was saved but could not be selected");
        return;
      }
      toast.success(isArabic ? "تم إنشاء العميل" : "Customer created");
      onCreated(customer);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || (isArabic ? "تعذر إنشاء العميل" : "Could not create customer"));
    },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" dir={dir}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="font-bold text-navy-700">{isArabic ? "إنشاء عميل جديد" : "Create new customer"}</h2>
              <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100" aria-label={isArabic ? "إغلاق" : "Close"}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 p-5">
              <div>
                <label className="label">{isArabic ? "اسم العميل" : "Customer name"} *</label>
                <input {...register("name", { required: true })} className="input-field" autoFocus />
              </div>
              <div>
                <label className="label">{isArabic ? "البريد الإلكتروني" : "Email"} *</label>
                <input {...register("email", { required: true })} type="email" className="input-field" dir="ltr" />
              </div>
              <div>
                <label className="label">{isArabic ? "رقم الهاتف" : "Phone"}</label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => <PhoneInput value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} />}
                />
              </div>
              <div>
                <label className="label">{isArabic ? "اسم الشركة" : "Company name"}</label>
                <input {...register("companyName")} className="input-field" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
                  {mutation.isPending ? (isArabic ? "جارٍ الإنشاء..." : "Creating...") : (isArabic ? "إنشاء واختيار العميل" : "Create and select")}
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