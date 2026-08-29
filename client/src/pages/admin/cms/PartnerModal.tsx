import { useEffect, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { cmsApi } from "../../../api/client";
import { useLang } from "../../../i18n/LangContext";
import type { Partner } from "../../../types";

type PartnerForm = {
  nameAr: string;
  nameEn: string;
  logo: string;
  descriptionAr: string;
  descriptionEn: string;
  partnershipAr: string;
  partnershipEn: string;
  servicesAr: string;
  servicesEn: string;
  order: string;
  isPublished: boolean;
};

const emptyForm: PartnerForm = {
  nameAr: "", nameEn: "", logo: "",
  descriptionAr: "", descriptionEn: "",
  partnershipAr: "", partnershipEn: "",
  servicesAr: "", servicesEn: "",
  order: "0", isPublished: true,
};

export default function PartnerModal({
  open,
  partner,
  onClose,
  onSaved,
}: {
  open: boolean;
  partner: Partner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang, dir } = useLang();
  const isArabic = lang === "ar" || lang === "ur";
  const [form, setForm] = useState<PartnerForm>(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setForm(partner ? {
      nameAr: partner.nameAr || "",
      nameEn: partner.nameEn || "",
      logo: partner.logo || "",
      descriptionAr: partner.descriptionAr || "",
      descriptionEn: partner.descriptionEn || "",
      partnershipAr: partner.partnershipAr || "",
      partnershipEn: partner.partnershipEn || "",
      servicesAr: partner.servicesAr || "",
      servicesEn: partner.servicesEn || "",
      order: String(partner.order || 0),
      isPublished: partner.isPublished === true,
    } : emptyForm);
    setLogoFile(null);
    setPreview(partner?.logo || "");
    setError("");
  }, [open, partner]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, saving]);

  useEffect(() => {
    if (!logoFile) return;
    const url = URL.createObjectURL(logoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  if (!open) return null;

  const text = {
    title: partner ? (isArabic ? "تعديل الشريك" : "Edit partner") : (isArabic ? "إضافة شريك" : "Add partner"),
    nameAr: isArabic ? "اسم الشريك بالعربية" : "Arabic name",
    nameEn: isArabic ? "اسم الشريك بالإنجليزية" : "English name",
    descriptionAr: isArabic ? "وصف الشركة بالعربية" : "Company description in Arabic",
    descriptionEn: isArabic ? "وصف الشركة بالإنجليزية" : "Company description in English",
    partnershipAr: isArabic ? "طبيعة الشراكة بالعربية" : "Partnership in Arabic",
    partnershipEn: isArabic ? "طبيعة الشراكة بالإنجليزية" : "Partnership in English",
    servicesAr: isArabic ? "خدمات أو نتائج أفق بالعربية" : "OFOQ services or results in Arabic",
    servicesEn: isArabic ? "خدمات أو نتائج أفق بالإنجليزية" : "OFOQ services or results in English",
    logo: isArabic ? "شعار الشريك" : "Partner logo",
    logoHint: isArabic ? "JPG أو PNG أو WEBP، حتى 5 ميجابايت. تزال الخلفية المتصلة بالحواف تلقائيًا." : "JPG, PNG, or WEBP up to 5 MB. Connected edge backgrounds are removed automatically.",
    order: isArabic ? "الترتيب" : "Order",
    visible: isArabic ? "ظاهر في الصفحة الرئيسية" : "Visible on the home page",
    save: isArabic ? "حفظ الشريك" : "Save partner",
    saving: isArabic ? "جارٍ الحفظ..." : "Saving...",
    cancel: isArabic ? "إلغاء" : "Cancel",
  };

  const change = <K extends keyof PartnerForm>(key: K, value: PartnerForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const required = [
      form.nameAr, form.nameEn, form.descriptionAr, form.descriptionEn,
      form.partnershipAr, form.partnershipEn, form.servicesAr, form.servicesEn,
    ];
    if (required.some((value) => !value.trim()) || (!form.logo && !logoFile)) {
      setError(isArabic ? "أكمل جميع الحقول وارفع شعار الشريك." : "Complete all fields and upload the partner logo.");
      return;
    }
    setSaving(true);
    try {
      let logo = form.logo;
      if (logoFile) {
        const uploadResponse = await cmsApi.partners.uploadLogo(logoFile);
        logo = uploadResponse.data?.url;
        if (!logo) throw new Error(isArabic ? "لم يرجع الخادم رابط الشعار." : "The server did not return a logo URL.");
      }
      const payload = {
        ...form,
        logo,
        order: Number(form.order) || 0,
      };
      if (partner) await cmsApi.partners.update(partner._id, payload);
      else await cmsApi.partners.create(payload);
      toast.success(isArabic ? "تم حفظ الشريك بنجاح." : "Partner saved successfully.");
      onSaved();
    } catch (requestError: any) {
      const message = requestError?.response?.data?.error || requestError?.message || (isArabic ? "تعذر حفظ الشريك." : "Could not save partner.");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" dir={dir}>
      <button type="button" aria-label={text.cancel} className="absolute inset-0 bg-navy-950/65 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div role="dialog" aria-modal="true" aria-labelledby="partner-form-title" className="relative max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4 sm:px-7">
          <h2 id="partner-form-title" className="text-lg font-bold text-navy-700">{text.title}</h2>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-navy-700">
            <X size={19} />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{text.nameAr}</label>
              <input value={form.nameAr} onChange={(e) => change("nameAr", e.target.value)} className="input-field" dir="rtl" required />
            </div>
            <div>
              <label className="label">{text.nameEn}</label>
              <input value={form.nameEn} onChange={(e) => change("nameEn", e.target.value)} className="input-field" dir="ltr" required />
            </div>
          </div>

          <div>
            <label className="label">{text.logo}</label>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-6 transition-colors hover:border-ofoq-green">
              {preview ? <img src={preview} alt="" className="h-24 max-w-[220px] object-contain" /> : <ImagePlus size={34} className="text-gray-300" />}
              <span className="text-center text-xs text-gray-500">{text.logoHint}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {[
            ["descriptionAr", text.descriptionAr, "rtl"],
            ["descriptionEn", text.descriptionEn, "ltr"],
            ["partnershipAr", text.partnershipAr, "rtl"],
            ["partnershipEn", text.partnershipEn, "ltr"],
            ["servicesAr", text.servicesAr, "rtl"],
            ["servicesEn", text.servicesEn, "ltr"],
          ].map(([key, label, fieldDir]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <textarea
                value={form[key as keyof PartnerForm] as string}
                onChange={(e) => change(key as keyof PartnerForm, e.target.value as never)}
                className="input-field resize-y"
                rows={3}
                dir={fieldDir}
                required
              />
            </div>
          ))}

          <div className="grid items-end gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{text.order}</label>
              <input type="number" min="0" max="9999" value={form.order} onChange={(e) => change("order", e.target.value)} className="input-field" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-semibold text-navy-700">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => change("isPublished", e.target.checked)} className="h-4 w-4 rounded text-ofoq-green" />
              {text.visible}
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row">
            <button type="button" onClick={onClose} disabled={saving} className="btn-ghost justify-center sm:w-32">{text.cancel}</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <><Loader2 size={17} className="animate-spin" /> {text.saving}</> : text.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}