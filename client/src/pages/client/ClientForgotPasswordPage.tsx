import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";

export default function ClientForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch {
      // نُظهر رسالة النجاح دائماً لأسباب أمنية
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1C1930] to-[#0f0d1f] flex items-center justify-center p-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-ofoq-navy p-8 text-center">
            <div className="flex justify-center mb-4">
              <OfoqLogo className="w-20 h-14" />
            </div>
            <h1 className="text-white text-xl font-bold">نسيت كلمة المرور؟</h1>
            <p className="text-white/50 text-sm mt-1">أدخل بريدك وسنرسل لك رابط الاسترداد</p>
          </div>

          <div className="p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-green-600" />
                </div>
                <h2 className="text-ofoq-navy font-bold text-lg mb-2">تحقق من بريدك الإلكتروني</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  إذا كان البريد <span className="font-medium text-ofoq-navy" dir="ltr">{email}</span> مسجّلاً لدينا،
                  ستصلك رسالة بها رابط إعادة التعيين خلال دقائق.
                </p>
                <p className="text-gray-400 text-xs mb-6">تحقق من مجلد Spam إذا لم تجد الرسالة</p>
                <Link to="/client/login"
                  className="inline-flex items-center gap-2 text-ofoq-navy text-sm font-semibold hover:text-ofoq-red transition-colors">
                  <ArrowRight size={14} />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 focus:border-ofoq-navy transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-ofoq-navy hover:bg-ofoq-red disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري الإرسال...</>
                  ) : "إرسال رابط الاسترداد"}
                </button>

                <div className="text-center">
                  <Link to="/client/login"
                    className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
                    <ArrowRight size={13} />
                    العودة لتسجيل الدخول
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          © 2025 أفق لحلول الأعمال — جميع الحقوق محفوظة
        </p>
      </motion.div>
    </div>
  );
}
