import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";

interface Form { email: string; password: string; }

export default function ClientLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/client/dashboard";

  async function onSubmit(data: Form) {
    setLoading(true); setErr("");
    try {
      const res = await axios.post("/api/auth/login", data);
      const { token, user } = res.data;
      if (user.role !== "client") {
        setErr("هذه البوابة مخصصة للعملاء فقط. للدخول كمسؤول يرجى استخدام لوحة الإدارة.");
        setLoading(false); return;
      }
      setAuth({ id: user.id, name: user.name, email: user.email, role: user.role, lang: user.lang }, token);
      navigate(redirect, { replace: true });
    } catch (e: any) {
      setErr(e.response?.data?.error || "بريد إلكتروني أو كلمة مرور غير صحيحة");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1C1930] to-[#0f0d1f] flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-ofoq-navy p-8 text-center">
            <div className="flex justify-center mb-4">
              <OfoqLogo className="w-20 h-14" />
            </div>
            <h1 className="text-white text-xl font-bold">بوابة العملاء</h1>
            <p className="text-white/50 text-sm mt-1">سجّل دخولك لمتابعة طلباتك</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {err && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input type="email" dir="ltr"
                  {...register("email", { required: "البريد مطلوب" })}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${
                    errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"
                  }`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} dir="ltr"
                    {...register("password", { required: "كلمة المرور مطلوبة" })}
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

              <button type="submit" disabled={loading}
                className="w-full bg-ofoq-navy text-white py-3 rounded-xl font-semibold text-sm hover:bg-ofoq-red transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <><LogIn size={16} /> تسجيل الدخول</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              ليس لديك حساب؟{" "}
              <Link to="/client/register" className="text-ofoq-navy font-semibold hover:text-ofoq-red transition-colors">
                إنشاء حساب جديد
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
