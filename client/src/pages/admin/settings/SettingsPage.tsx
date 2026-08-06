import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Save, Globe, Mail, Bell, Shield, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { cmsApi } from "../../../api/client";
import { useLang } from "../../../i18n/LangContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const qc = useQueryClient();
  const { ui } = useLang();
  const copy = ui.adminPages.adminPortal;
  const { register, handleSubmit, reset } = useForm();
  const tabs = [
    { id: "general", label: copy.generalTab, icon: Globe },
    { id: "email", label: copy.emailTab, icon: Mail },
    { id: "notifications", label: copy.notificationsTab, icon: Bell },
    { id: "security", label: copy.securityTab, icon: Shield },
  ];

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success(copy.saveChanges); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{copy.settingsTitle}</h1>
        <p className="page-subtitle">{copy.settingsSubtitle}</p>
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
            <h3 className="font-bold text-navy-700 mb-4">{copy.generalSettings}</h3>
            <div>
              <label className="label">{copy.companyName}</label>
              <input {...register("app_name")} className="input-field" placeholder="OFOQ" />
            </div>
            <div>
              <label className="label">{copy.shortDescription}</label>
              <textarea {...register("app_description")} rows={2} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">{copy.publicEmail}</label>
                <input {...register("contact_email")} type="email" className="input-field" dir="ltr" />
              </div>
              <div>
                <label className="label">{copy.phoneNumber}</label>
                <input {...register("contact_phone")} className="input-field" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="label">{copy.address}</label>
              <input {...register("contact_address")} className="input-field" />
            </div>
            <div>
              <label className="label">{copy.website}</label>
              <input {...register("app_url")} className="input-field" dir="ltr" placeholder="https://ofoq.sa" />
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">{copy.emailSettings}</h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
              ⚠️ {copy.serverNotice}
            </div>
            <div>
              <label className="label">{copy.senderName}</label>
              <input {...register("email_from_name")} className="input-field" placeholder={copy.companyBrand} />
            </div>
            <div>
              <label className="label">{copy.emailSignature}</label>
              <textarea {...register("email_signature")} rows={4} className="input-field resize-none font-mono text-xs" dir="ltr" />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="card space-y-4">
            <h3 className="font-bold text-navy-700 mb-4">{copy.notificationsTitle}</h3>
            {[
              { key: "notify_new_lead", label: copy.notificationNewLead },
              { key: "notify_project_update", label: copy.notificationProjectUpdate },
              { key: "notify_invoice_paid", label: copy.notificationInvoicePaid },
              { key: "notify_overdue_invoice", label: copy.notificationOverdueInvoice },
              { key: "notify_contact_request", label: copy.notificationContactRequest },
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
            <h3 className="font-bold text-navy-700 mb-4">{copy.securityTitle}</h3>
            <div>
              <label className="label">{copy.sessionExpiry}</label>
              <input {...register("session_timeout")} type="number" className="input-field" placeholder="24" dir="ltr" />
            </div>
            <div>
              <label className="label">{copy.loginAttempts}</label>
              <input {...register("max_login_attempts")} type="number" className="input-field" placeholder="5" dir="ltr" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input {...register("require_2fa_admin")} type="checkbox" className="w-4 h-4 rounded text-ofoq-green" />
              <span className="text-sm text-navy-700">{copy.requireTwoFactor}</span>
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <button type="submit" disabled={saveMut.isPending} className="btn-primary">
            <Save size={16} />
            {saveMut.isPending ? copy.saving : copy.saveChanges}
          </button>
        </div>
      </form>
    </div>
  );
}
