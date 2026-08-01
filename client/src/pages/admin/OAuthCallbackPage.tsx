import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";

// Landing point for Google/Apple OAuth redirects. The server issues our own
// JWT and hands it here via a query param; we exchange it for the user
// profile and drop straight into the dashboard.
export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      toast.error("تعذّر تسجيل الدخول عبر هذه الطريقة");
      navigate("/admin/login", { replace: true });
      return;
    }
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }

    localStorage.setItem("ofoq_token", token);
    authApi.me()
      .then((res) => {
        setAuth(res.data.user, token);
        toast.success(`مرحباً، ${res.data.user.name || res.data.user.fullName}!`);
        navigate("/admin", { replace: true });
      })
      .catch(() => {
        toast.error("تعذّر إكمال تسجيل الدخول");
        navigate("/admin/login", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center" dir="rtl">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 border-4 border-white/20 border-t-ofoq-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/70 text-sm">جاري إتمام تسجيل الدخول...</p>
      </motion.div>
    </div>
  );
}
