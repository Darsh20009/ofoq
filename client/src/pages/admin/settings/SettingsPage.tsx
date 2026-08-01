import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save, Globe, Mail, Bell, Shield, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cmsApi } from "../../../api/client";

const tabs = [
  { id: "general", label: "عام", icon: Globe },
  { id: "email", label: "البريد الإلكتروني", icon: Mail },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "security", label: "الأمان", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data } = useQuery({
    queryKey: ["settings", activeTab],
    queryFn: () => cmsApi.settings.list(activeTab).then((r) => r.data),
  });

  useEffect(() => {
    if (data?.data?.settings) {
      const vals: Record<string, string> = {};
      data.data.settings.forEach((s: { key: string; value: string }) => { vals[s.key] = s.value; });
      reset(vals);
    }
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (d: object) => cmsApi.settings.update(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("تم حفظ الإعدادات"); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">إعداد وتخصيص النظام</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200 pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
              activeTab === t.id
                ? "border-ofoq-green text-ofoq-green bg-emerald-50"
                : "border-transparent text-gray-500 hover:text-navy-700"
            }`}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="space-y-6">
        {activeTab === "general" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">الإعدادات العامة</h3>
            <div>
              <label className="label">اسم الشركة</label>
              <input {...register("app_name")} className="input-field" placeholder="أفق لحلول الأعمال" />
            </div>
            <div>
              <label className="label">الوصف المختصر</label>
              <textarea {...register("app_description")} rows={2} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">البريد الإلكتروني العام</label>
                <input {...register("contact_email")} type="email" className="input-field" dir="ltr" />
              </div>
              <div>
                <label className="label">رقم الهاتف</label>
                <input {...register("contact_phone")} className="input-field" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="label">العنوان</label>
              <input {...register("contact_address")} className="input-field" />
            </div>
            <div>
              <label className="label">الموقع الإلكتروني</label>
              <input {...register("app_url")} className="input-field" dir="ltr" placeholder="https://ofoq.sa" />
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">إعدادات البريد الإلكتروني</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              ⚠️ إعدادات الخادم تُعدَّل عبر متغيرات البيئة. يمكن هنا تخصيص قوالب البريد.
            </div>
            <div>
              <label className="label">اسم المرسل</label>
              <input {...register("email_from_name")} className="input-field" placeholder="أفق لحلول الأعمال" />
            </div>
            <div>
              <label className="label">توقيع البريد (HTML)</label>
              <textarea {...register("email_signature")} rows={4} className="input-field resize-none font-mono text-xs" dir="ltr" />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">إعدادات الإشعارات</h3>
            {[
              { key: "notify_new_lead", label: "إشعار عند إضافة فرصة جديدة" },
              { key: "notify_project_update", label: "إشعار عند تحديث مرحلة المشروع" },
              { key: "notify_invoice_paid", label: "إشعار عند تسديد الفاتورة" },
              { key: "notify_overdue_invoice", label: "تنبيه الفواتير المتأخرة" },
              { key: "notify_contact_request", label: "إشعار طلبات التواصل الجديدة" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                <input {...register(item.key)} type="checkbox"
                  className="w-4 h-4 rounded text-ofoq-green cursor-pointer" />
                <span className="text-sm text-navy-700 group-hover:text-ofoq-green transition-colors">{item.label}</span>
              </label>
            ))}
          </div>
        )}

        {activeTab === "security" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">إعدادات الأمان</h3>
            <div>
              <label className="label">مدة صلاحية الجلسة (ساعات)</label>
              <input {...register("session_timeout")} type="number" className="input-field" placeholder="24" dir="ltr" />
            </div>
            <div>
              <label className="label">الحد الأقصى لمحاولات تسجيل الدخول</label>
              <input {...register("max_login_attempts")} type="number" className="input-field" placeholder="5" dir="ltr" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input {...register("require_2fa_admin")} type="checkbox" className="w-4 h-4 rounded text-ofoq-green" />
              <span className="text-sm text-navy-700">إلزامية التحقق الثنائي للمدراء</span>
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saveMut.isPending} className="btn-primary">
            <Save size={16} />
            {saveMut.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </form>
    </div>
  );
}
