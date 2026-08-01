import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";

interface Form {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function ClientRegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const password = watch("password");

  async function onSubmit(data: Form) {
    setLoading(true); setErr("");
    try {
      const res = await axios.post("/api/auth/register", {
        fullName: data.fullName,
        email:    data.email,
        phone:    data.phone,
        password: data.password,
        lang:     "ar",
      });
      const { token, user } = res.data;
      setAuth({ id: user.id, name: user.name, email: user.email, role: user.role, lang: user.lang }, token);
      navigate("/client/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e.response?.data?.error || "خطأ في إنشاء الحساب. يرجى المحاولة مجدداً.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1C1930] to-[#0f0d1f] flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-ofoq-navy p-7 text-center">
            <div className="flex justify-center mb-3">
              <OfoqLogo className="w-16 h-11" />
            </div>
            <h1 className="text-white text-xl font-bold">إنشاء حساب جديد</h1>
            <p className="text-white/50 text-sm mt-1">انضم لبوابة عملاء أفق</p>
          </div>

          <div className="p-8">
            {err && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {err}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
                <input {...register("fullName", { required: "الاسم مطلوب", minLength: { value: 2, message: "الاسم قصير جداً" } })}
                  placeholder="محمد عبدالله"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${errors.fullName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input type="email" dir="ltr"
                  {...register("email", { required: "البريد مطلوب" })}
                  placeholder="example@email.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
                <input type="tel" dir="ltr"
                  {...register("phone", { required: "رقم الهاتف مطلوب" })}
                  placeholder="+966 5x xxx xxxx"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} dir="ltr"
                    {...register("password", { required: "كلمة المرور مطلوبة", minLength: { value: 6, message: "6 أحرف على الأقل" } })}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all pr-10 ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
                <input type={showPass ? "text" : "password"} dir="ltr"
                  {...register("confirmPassword", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: (v) => v === password || "كلمتا المرور غير متطابقتان",
                  })}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`} />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-ofoq-navy text-white py-3 rounded-xl font-semibold text-sm hover:bg-ofoq-red transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <><UserPlus size={16} /> إنشاء الحساب</>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              لديك حساب بالفعل؟{" "}
              <Link to="/client/login" className="text-ofoq-navy font-semibold hover:text-ofoq-red transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          © 2025 أفق لحلول الأعمال
        </p>
      </motion.div>
    </div>
  );
}
