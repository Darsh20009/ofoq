import { useEffect, useState } from "react";
import { qiroxOwnerApi } from "../../api/qiroxOwnerApi";

export default function PlatformMaintenancePage() {
  const [message, setMessage] = useState("الموقع موقوف مؤقتاً لانتهاء الاشتراك أو لعدم سداد الرسوم. يرجى التواصل مع الإدارة.");

  useEffect(() => {
    let active = true;
    qiroxOwnerApi.publicStatus()
      .then((status) => {
        const language = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "ar";
        if (active) setMessage(language === "en" ? status.messageEn : status.messageAr);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const english = document.documentElement.lang.toLowerCase().startsWith("en");
  return (
    <main dir={english ? "ltr" : "rtl"} className="min-h-screen bg-[#f7f7f8] px-5 py-10 text-[#182132]">
      <section className="mx-auto mt-[12vh] max-w-xl rounded-xl border border-gray-200 bg-white p-8 text-center sm:p-12">
        <div className="mx-auto mb-6 h-1 w-14 rounded bg-[#7562a8]" />
        <h1 className="mb-3 text-2xl font-bold">{english ? "Website under maintenance" : "الموقع تحت الصيانة"}</h1>
        <p className="leading-8 text-gray-600">{message}</p>
      </section>
    </main>
  );
}
