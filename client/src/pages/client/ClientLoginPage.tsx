import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";
import { authApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.5 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.5 5.5c-.5.4 7.4-5.4 7.4-16.6 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.415 2.19-1.24 3.14-.995 1.14-2.196 1.8-3.5 1.7-.04-1.1.44-2.24 1.24-3.15.99-1.15 2.28-1.83 3.5-1.69zM20.6 17.3c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.93-1-4.02-.99-2.08.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.5 17.32-.35 13 1.09 9.99c.79-1.68 2.2-2.75 3.73-2.77 1.5-.02 2.92 1 3.83 1s2.62-1.23 4.42-1.05c.75.03 2.87.3 4.23 2.28-.11.07-2.53 1.48-2.5 4.4.03 3.5 3.07 4.66 3.1 4.68 0 0-.24 0 0 0" />
    </svg>
  );
}

interface Form { email: string; password: string; }

export default function ClientLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<{ google: boolean; apple: boolean }>({ google: false, apple: false });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/client/dashboard";
  const { ui, dir } = useLang();

  useEffect(() => {
    authApi.oauthStatus()
      .then((res) => setOauthStatus(res.data))
      .catch(() => {});
  }, []);

  async function onSubmit(data: Form) {
    setLoading(true); setErr("");
    try {
      const res = await axios.post("/api/auth/login", data);
      const { token, user } = res.data;
      if (user.role !== "client") {
        setErr(ui.auth.invalid);
        setLoading(false); return;
      }
      setAuth({ id: user.id, name: user.name, email: user.email, role: user.role, lang: user.lang }, token);
      navigate(redirect, { replace: true });
    } catch (e: any) {
      setErr(e.response?.data?.error || ui.auth.invalid);
    } finally { setLoading(false); }
  }

  const hasOAuth = oauthStatus.google || oauthStatus.apple;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1C1930] to-[#0f0d1f] flex items-center justify-center p-4" dir={dir}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-ofoq-navy p-8 text-center">
            <div className="flex justify-center mb-4">
              <OfoqLogo className="w-20 h-14" />
            </div>
            <h1 className="text-white text-xl font-bold">{ui.auth.clientTitle}</h1>
            <p className="text-white/50 text-sm mt-1">{ui.auth.clientSubtitle}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {err && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {err}
              </div>
            )}

            {/* OAuth Buttons */}
            {hasOAuth && (
              <div className="mb-5 space-y-2.5">
                {oauthStatus.google && (
                  <a href="/api/auth/google"
                    className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 shadow-sm">
                    <GoogleIcon />
                    Continue with Google
                  </a>
                )}
                {oauthStatus.apple && (
                  <a href="/api/auth/apple"
                    className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-gray-900 bg-gray-900 hover:bg-black transition-all text-sm font-medium text-white shadow-sm">
                    <AppleIcon />
                    Continue with Apple
                  </a>
                )}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{ui.auth.email}</label>
                <input type="email" dir="ltr"
                  {...register("email", { required: ui.request.required })}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${
                    errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{ui.auth.password}</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} dir="ltr"
                    {...register("password", { required: ui.request.required })}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all pr-10 ${
                      errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                    }`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="flex justify-end">
                <Link to="/client/forgot-password" className="text-xs text-ofoq-navy hover:text-ofoq-red transition-colors">
                  {ui.auth.forgot}
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-ofoq-navy text-white py-3 rounded-xl font-semibold text-sm hover:bg-ofoq-red transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <><LogIn size={16} /> {ui.auth.login}</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              {ui.auth.noAccount}{" "}
              <Link to="/client/register" className="text-ofoq-navy font-semibold hover:text-ofoq-red transition-colors">
                {ui.auth.create}
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          © 2025 أفق لحلول الأعمال — جميع الحقوق محفوظة
        </p>
      </motion.div>
    </div>
  );
}
