import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";

export default function ForgotPasswordPage() {
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
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1a2a45] to-[#0d1b2e] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <OfoqLogo className="w-24 h-16 mx-auto mb-4" dark />
            <h1 className="text-ofoq-navy text-2xl font-bold">نسيت كلمة المرور؟</h1>
            <p className="text-gray-500 text-sm mt-1">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين</p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
              <h2 className="text-ofoq-navy font-bold text-lg mb-2">تحقق من بريدك الإلكتروني</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                إذا كان البريد <span className="font-medium text-ofoq-navy" dir="ltr">{email}</span> مسجّلاً لدينا،
                ستصلك رسالة بها رابط إعادة تعيين كلمة المرور خلال دقائق.
              </p>
              <p className="text-gray-400 text-xs mb-6">تحقق من مجلد Spam إذا لم تجد الرسالة</p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-ofoq-red text-sm font-medium hover:underline"
              >
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
                    placeholder="admin@ofoq.sa"
                    required
                    dir="ltr"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-red/30 focus:border-ofoq-red transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-ofoq-red hover:bg-ofoq-red/90 disabled:opacity-50 text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري الإرسال...
                  </>
                ) : "إرسال رابط الاسترداد"}
              </button>

              <div className="text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-ofoq-navy transition-colors"
                >
                  <ArrowRight size={13} />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
