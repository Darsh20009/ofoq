import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { cmsApi } from "../../../api/client";
import { useLang } from "../../../i18n/LangContext";
import type { Country } from "../../../types";

type CatalogCountry = Pick<Country, "code" | "nameAr" | "nameEn" | "flag">;

export default function CountryModal({
  open,
  country,
  catalog,
  onClose,
  onSaved,
}: {
  open: boolean;
  country: Country | null;
  catalog: CatalogCountry[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang, dir } = useLang();
  const isArabic = lang === "ar" || lang === "ur";
  const [code, setCode] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [order, setOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCode(country?.code || "");
    setDescriptionAr(country?.descriptionAr || "");
    setDescriptionEn(country?.descriptionEn || "");
    setOrder(String(country?.order || 0));
    setIsPublished(country ? country.isPublished : true);
    setError("");
  }, [open, country]);

  if (!open) return null;

  const selected = catalog.find((item) => item.code === code);
  const text = {
    title: country ? (isArabic ? "تعديل الدولة" : "Edit country") : (isArabic ? "إضافة دولة" : "Add country"),
    country: isArabic ? "اختر الدولة من القائمة" : "Choose a country from the list",
    descriptionAr: isArabic ? "الوصف بالعربية" : "Description in Arabic",
    descriptionEn: isArabic ? "الوصف بالإنجليزية" : "Description in English",
    order: isArabic ? "الترتيب على الخريطة" : "Map order",
    visible: isArabic ? "إظهار الدولة على الخريطة" : "Show country on the map",
    save: isArabic ? "حفظ الدولة" : "Save country",
    saving: isArabic ? "جارٍ الحفظ..." : "Saving...",
    cancel: isArabic ? "إلغاء" : "Cancel",
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!country && !code) {
      setError(isArabic ? "اختر دولة من القائمة أولًا." : "Choose a country first.");
      return;
    }
    setSaving(true);
    try {
      const payload = { descriptionAr, descriptionEn, order: Number(order) || 0, isPublished };
      if (country) await cmsApi.countries.update(country._id, payload);
      else await cmsApi.countries.create({ code, ...payload });
      toast.success(isArabic ? "تم حفظ الدولة." : "Country saved.");
      onSaved();
    } catch (requestError: any) {
      const message = requestError?.response?.data?.error || (isArabic ? "تعذر حفظ الدولة." : "Could not save country.");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" dir={dir}>
      <button type="button" aria-label={text.cancel} className="absolute inset-0 bg-navy-950/65 backdrop-blur-sm" onClick={() => !saving && onClose()} />
      <div role="dialog" aria-modal="true" className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-7">
          <h2 className="text-lg font-bold text-navy-700">{text.title}</h2>
          <button type="button" onClick={onClose} disabled={saving} className="rounded-xl p-2 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div>
            <label className="label">{text.country}</label>
            {country ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold text-navy-700">
                <span className="text-2xl">{country.flag}</span>
                <span>{isArabic ? country.nameAr : country.nameEn}</span>
                <span className="ms-auto text-xs text-gray-400">{country.code}</span>
              </div>
            ) : (
              <select value={code} onChange={(event) => setCode(event.target.value)} className="input-field" required>
                <option value="">{isArabic ? "اختر الدولة..." : "Select country..."}</option>
                {catalog.map((item) => <option key={item.code} value={item.code}>{item.flag} {isArabic ? item.nameAr : item.nameEn}</option>)}
              </select>
            )}
          </div>
          {selected && !country && <p className="text-xs text-gray-400">{selected.flag} {isArabic ? selected.nameAr : selected.nameEn}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{text.descriptionAr}</label>
              <textarea value={descriptionAr} onChange={(event) => setDescriptionAr(event.target.value)} className="input-field resize-y" rows={4} dir="rtl" />
            </div>
            <div>
              <label className="label">{text.descriptionEn}</label>
              <textarea value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} className="input-field resize-y" rows={4} dir="ltr" />
            </div>
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <div>
              <label className="label">{text.order}</label>
              <input type="number" min="0" max="9999" value={order} onChange={(event) => setOrder(event.target.value)} className="input-field" dir="ltr" />
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-semibold text-navy-700">
              <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} className="h-4 w-4 rounded text-ofoq-green" />
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