import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Eye, EyeOff, Layers3, Plus, Star, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { servicesApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useLang } from "../../i18n/LangContext";

type ServiceForm = {
  title: string;
  titleAr: string;
  slug: string;
  category: string;
  categoryAr: string;
  shortDesc: string;
  shortDescAr: string;
  description: string;
  descriptionAr: string;
  pricingType: "fixed" | "hourly" | "custom" | "package";
  basePrice: string;
  isActive: boolean;
  isFeatured: boolean;
  order: string;
};

const initialForm: ServiceForm = {
  title: "", titleAr: "", slug: "", category: "", categoryAr: "",
  shortDesc: "", shortDescAr: "", description: "", descriptionAr: "",
  pricingType: "custom", basePrice: "", isActive: true, isFeatured: false, order: "0",
};

export default function ServicesManagementPage() {
  const { lang, dir } = useLang();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isArabic = lang === "ar";
  const canDelete = ["super_admin", "admin"].includes(user?.role || "");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<ServiceForm>(initialForm);

  const text = {
    title: isArabic ? "إدارة الخدمات" : "Services",
    subtitle: isArabic ? "أضف الخدمات وحدّثها وتحكم في ظهورها على الموقع." : "Create, update, and control which services appear on your website.",
    create: isArabic ? "خدمة جديدة" : "New service",
    edit: isArabic ? "تعديل الخدمة" : "Edit service",
    save: isArabic ? "حفظ الخدمة" : "Save service",
    cancel: isArabic ? "إلغاء" : "Cancel",
    active: isArabic ? "نشطة" : "Active",
    hidden: isArabic ? "مخفية" : "Hidden",
    featured: isArabic ? "مميزة" : "Featured",
    empty: isArabic ? "لا توجد خدمات مضافة حتى الآن." : "No services have been added yet.",
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-services"],
    queryFn: () => servicesApi.list({ all: true }).then((response) => response.data),
  });
  const services: any[] = data?.services || [];

  const saveMutation = useMutation({
    mutationFn: (payload: object) => editing ? servicesApi.update(editing._id, payload) : servicesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success(isArabic ? "تم حفظ الخدمة." : "Service saved.");
      closeModal();
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر حفظ الخدمة." : "Could not save service.")),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success(isArabic ? "تم إخفاء الخدمة من الموقع." : "The service has been hidden.");
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر إخفاء الخدمة." : "Could not hide service.")),
  });

  function change<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function closeModal() {
    setOpen(false);
    setEditing(null);
    setForm(initialForm);
  }
  function startCreate() {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  }
  function startEdit(service: any) {
    setEditing(service);
    setForm({
      title: service.title || "", titleAr: service.titleAr || "", slug: service.slug || "",
      category: service.category || "", categoryAr: service.categoryAr || "",
      shortDesc: service.shortDesc || "", shortDescAr: service.shortDescAr || "",
      description: service.description || "", descriptionAr: service.descriptionAr || "",
      pricingType: service.pricingType || "custom",
      basePrice: service.basePrice === undefined || service.basePrice === null ? "" : String(service.basePrice),
      isActive: Boolean(service.isActive), isFeatured: Boolean(service.isFeatured),
      order: String(service.order || 0),
    });
    setOpen(true);
  }
  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (![form.title, form.titleAr, form.category, form.categoryAr, form.shortDesc, form.shortDescAr].every((value) => value.trim())) {
      toast.error(isArabic ? "أدخل الاسم والتصنيف والوصف المختصر باللغتين." : "Enter name, category, and short description in both languages.");
      return;
    }
    saveMutation.mutate({
      ...form,
      basePrice: form.basePrice === "" ? undefined : Number(form.basePrice),
      order: Number(form.order) || 0,
      currency: "SAR",
      images: editing?.images || [],
      workflow: editing?.workflow || [],
      industries: editing?.industries || [],
      tags: editing?.tags || [],
    });
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{text.title}</h1>
          <p className="page-subtitle">{text.subtitle}</p>
        </div>
        <button onClick={startCreate} className="btn-primary"><Plus size={16} /> {text.create}</button>
      </div>

      {isError ? (
        <div className="card border-red-100 bg-red-50 text-sm text-red-700">{isArabic ? "تعذر تحميل الخدمات." : "Services could not be loaded."}</div>
      ) : isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, index) => <div key={index} className="skeleton h-20 rounded-xl" />)}</div>
      ) : services.length === 0 ? (
        <div className="card py-16 text-center">
          <Layers3 size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm text-gray-500">{text.empty}</p>
          <button onClick={startCreate} className="btn-ghost mt-3 text-ofoq-green">{text.create}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <article key={service._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700"><Layers3 size={20} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-bold text-navy-700">{isArabic ? service.titleAr : service.title}</h2>
                  <span className={service.isActive ? "badge-green" : "badge-gray"}>{service.isActive ? text.active : text.hidden}</span>
                  {service.isFeatured && <span className="badge-navy"><Star size={12} /> {text.featured}</span>}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-gray-500">{isArabic ? service.shortDescAr : service.shortDesc}</p>
                <p className="mt-1 text-xs text-gray-400">{isArabic ? service.categoryAr : service.category} · /{service.slug}</p>
              </div>
              <div className="flex gap-1 self-end sm:self-auto">
                <button onClick={() => startEdit(service)} className="btn-ghost px-3"><Edit2 size={16} /> <span className="hidden sm:inline">{text.edit}</span></button>
                {canDelete && service.isActive && (
                  <button onClick={() => { if (confirm(isArabic ? "إخفاء هذه الخدمة من الموقع؟" : "Hide this service from the website?")) deleteMutation.mutate(service._id); }} className="btn-ghost px-3 text-red-600" aria-label={text.hidden}><Trash2 size={16} /></button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end bg-black/40 sm:items-center sm:justify-center sm:p-6">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white sm:max-w-3xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <div>
                <h2 className="font-bold text-navy-700">{editing ? text.edit : text.create}</h2>
                <p className="mt-1 text-xs text-gray-400">{isArabic ? "الخدمات النشطة فقط هي التي تظهر عبر واجهة الخدمات." : "Only active services are exposed through the services API."}</p>
              </div>
              <button onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label={text.cancel}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label={isArabic ? "اسم الخدمة بالعربية" : "Service name in Arabic"} value={form.titleAr} onChange={(value) => change("titleAr", value)} />
                <TextField label={isArabic ? "اسم الخدمة بالإنجليزية" : "Service name in English"} value={form.title} onChange={(value) => change("title", value)} direction="ltr" />
                <TextField label={isArabic ? "التصنيف بالعربية" : "Category in Arabic"} value={form.categoryAr} onChange={(value) => change("categoryAr", value)} />
                <TextField label={isArabic ? "التصنيف بالإنجليزية" : "Category in English"} value={form.category} onChange={(value) => change("category", value)} direction="ltr" />
                <TextField label={isArabic ? "معرّف الرابط" : "URL identifier"} value={form.slug} onChange={(value) => change("slug", value)} direction="ltr" placeholder="company-formation" />
                <TextField label={isArabic ? "ترتيب الظهور" : "Display order"} value={form.order} onChange={(value) => change("order", value)} type="number" />
                <TextField label={isArabic ? "وصف مختصر بالعربية" : "Short description in Arabic"} value={form.shortDescAr} onChange={(value) => change("shortDescAr", value)} />
                <TextField label={isArabic ? "وصف مختصر بالإنجليزية" : "Short description in English"} value={form.shortDesc} onChange={(value) => change("shortDesc", value)} direction="ltr" />
                <TextField label={isArabic ? "التفاصيل بالعربية" : "Details in Arabic"} value={form.descriptionAr} onChange={(value) => change("descriptionAr", value)} multiline />
                <TextField label={isArabic ? "التفاصيل بالإنجليزية" : "Details in English"} value={form.description} onChange={(value) => change("description", value)} direction="ltr" multiline />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className="label">{isArabic ? "طريقة التسعير" : "Pricing method"}</span>
                  <select className="input-field" value={form.pricingType} onChange={(event) => change("pricingType", event.target.value as ServiceForm["pricingType"])}>
                    <option value="custom">{isArabic ? "حسب الطلب" : "Custom"}</option><option value="fixed">{isArabic ? "سعر ثابت" : "Fixed"}</option><option value="hourly">{isArabic ? "بالساعة" : "Hourly"}</option><option value="package">{isArabic ? "باقة" : "Package"}</option>
                  </select>
                </label>
                <TextField label={isArabic ? "السعر الابتدائي (ر.س)" : "Starting price (SAR)"} value={form.basePrice} onChange={(value) => change("basePrice", value)} type="number" />
              </div>
              <div className="flex flex-wrap gap-5 border-y border-gray-100 py-4">
                <Toggle label={isArabic ? "عرض الخدمة بالموقع" : "Show on website"} checked={form.isActive} onChange={(value) => change("isActive", value)} icon={form.isActive ? Eye : EyeOff} />
                <Toggle label={isArabic ? "إبراز الخدمة" : "Feature this service"} checked={form.isFeatured} onChange={(value) => change("isFeatured", value)} icon={Star} />
              </div>
              <div className="flex justify-end gap-3"><button type="button" onClick={closeModal} className="btn-ghost">{text.cancel}</button><button type="submit" disabled={saveMutation.isPending} className="btn-primary">{saveMutation.isPending ? (isArabic ? "جاري الحفظ..." : "Saving...") : text.save}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, multiline = false, direction, placeholder, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; direction?: "ltr" | "rtl"; placeholder?: string; type?: string;
}) {
  const classes = `input-field ${direction === "ltr" ? "text-left" : ""}`;
  return <label><span className="label">{label}</span>{multiline
    ? <textarea className={`${classes} min-h-24 resize-y`} dir={direction} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    : <input className={classes} dir={direction} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />}</label>;
}

function Toggle({ label, checked, onChange, icon: Icon }: {
  label: string; checked: boolean; onChange: (value: boolean) => void; icon: React.ComponentType<{ size?: number }>;
}) {
  return <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-navy-700">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="flex h-5 w-9 items-center rounded-full bg-gray-200 p-0.5 transition-colors peer-checked:bg-ofoq-green"><span className="h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" /></span>
    <Icon size={16} className={checked ? "text-ofoq-green" : "text-gray-400"} />{label}
  </label>;
}