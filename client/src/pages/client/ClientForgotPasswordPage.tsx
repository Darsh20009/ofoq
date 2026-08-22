import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";

export default function ClientForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { ui, dir, lang } = useLang();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (requestError: any) {
      setError(
        requestError.response?.data?.error ||
        (lang === "ar"
          ? "تعذر إرسال رسالة إعادة التعيين حاليًا. يرجى المحاولة لاحقًا."
          : "We could not send the reset email right now. Please try again later.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ofoq-navy via-[#1C1930] to-[#0f0d1f] flex items-center justify-center p-4" dir={dir}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-ofoq-navy p-8 text-center">
            <div className="flex justify-center mb-4">
              <OfoqLogo className="w-20 h-14" />
            </div>
            <h1 className="text-white text-xl font-bold">{ui.auth.forgotTitle}</h1>
            <p className="text-white/50 text-sm mt-1">{ui.auth.forgotSubtitle}</p>
          </div>

          <div className="p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={28} className="text-green-600" />
                </div>
                <h2 className="text-ofoq-navy font-bold text-lg mb-2">{ui.auth.checkEmail}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                   {ui.auth.checkEmailDesc} <span className="font-medium text-ofoq-navy" dir="ltr">{email}</span>
                </p>
                <p className="text-gray-400 text-xs mb-6">{ui.auth.spam}</p>
                <Link to="/client/login"
                  className="inline-flex items-center gap-2 text-ofoq-navy text-sm font-semibold hover:text-ofoq-red transition-colors">
                  <ArrowRight size={14} />
                  {ui.auth.backLogin}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                    {error}
                  </p>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{ui.auth.email}</label>
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
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {ui.auth.sending}</>
                  ) : ui.auth.sendReset}
                </button>

                <div className="text-center">
                  <Link to="/client/login"
                    className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
                    <ArrowRight size={13} />
                    {ui.auth.backLogin}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs">
          © {new Date().getFullYear()} OFOQ Business Solutions
        </p>
      </motion.div>
    </div>
  );
}
