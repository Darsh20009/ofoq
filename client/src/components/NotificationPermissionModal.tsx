import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, BellOff } from "lucide-react";
import api from "../api/client";
import toast from "react-hot-toast";

const STORAGE_KEY = "ofoq_notif_asked";

export default function NotificationPermissionModal() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show if: not asked before, notifications supported, not already granted/denied
    const asked = localStorage.getItem(STORAGE_KEY);
    if (asked) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") { localStorage.setItem(STORAGE_KEY, "1"); return; }

    // Delay slightly so it doesn't appear the moment admin logs in
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem(STORAGE_KEY, "1");

      if (permission === "granted" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const vapidRes = await api.get("/push/vapid-key");
        const vapidKey = vapidRes.data.publicKey;

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        await api.post("/push/subscribe", { subscription });
        toast.success("✅ سيتم إشعارك فور وصول أي تنبيه");
      }
    } catch {
      // silent — just close
    } finally {
      setLoading(false);
      setVisible(false);
    }
  };

  const handleDeny = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5"
          dir="rtl"
        >
          <button onClick={handleDeny} className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-ofoq-navy flex items-center justify-center flex-shrink-0">
              <Bell size={22} className="text-ofoq-yellow" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-navy-700 text-sm">تفعيل الإشعارات</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                تلقَّ تنبيهات فورية عند وصول استشارات جديدة، أو تحديث المشاريع، أو تسديد الفواتير.
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAllow}
              disabled={loading}
              className="flex-1 bg-ofoq-navy text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-navy-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Bell size={15} />
              )}
              تفعيل الآن
            </button>
            <button
              onClick={handleDeny}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
            >
              <BellOff size={14} />
              لاحقاً
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
