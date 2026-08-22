import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import { useLang } from "../../i18n/LangContext";

export default function ClientOAuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth, clearAuth } = useAuthStore();
  const { ui, dir } = useLang();
  const token = params.get("token");
  const redirectParam = params.get("redirect");
  const redirect = redirectParam?.startsWith("/client/") && !redirectParam.startsWith("//")
    ? redirectParam
    : "/client/dashboard";
  const error = params.get("error");

  useEffect(() => {
    if (error || !token) {
      navigate(`/client/login?error=${error || "oauth_failed"}`, { replace: true });
      return;
    }

    localStorage.setItem("ofoq_token", token);
    authApi.me()
      .then((res) => {
        const user = res.data.user;
        setAuth(user, token);
        const destination = user.role === "client"
          ? redirect
          : user.role === "employee"
            ? "/admin/employee/dashboard"
            : "/admin";
        navigate(destination, { replace: true });
      })
      .catch(() => {
        clearAuth();
        navigate("/client/login?error=oauth_failed", { replace: true });
      });
  }, [clearAuth, error, navigate, redirect, setAuth, token]);

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4" dir={dir}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-white">
        <div className="w-12 h-12 border-4 border-white/20 border-t-ofoq-green rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/70 text-sm">{ui.auth.oauthCompleting}</p>
        <Link to="/client/login" className="inline-block mt-5 text-white/50 hover:text-white text-xs">
          {ui.auth.backLogin}
        </Link>
      </motion.div>
    </div>
  );
}