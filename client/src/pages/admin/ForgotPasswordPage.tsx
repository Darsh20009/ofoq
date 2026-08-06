import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";

export default function ForgotPasswordPage() {
  const { ui } = useLang();
  const copy = ui.auth;
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
            <h1 className="text-ofoq-navy text-2xl font-bold">{copy.forgotTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">{copy.forgotSubtitle}</p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-green-600" />
              </div>
               <h2 className="text-ofoq-navy font-bold text-lg mb-2">{copy.checkEmail}</h2>
               <p className="text-gray-500 text-sm leading-relaxed mb-3">{copy.checkEmailDesc}</p>
               <p className="font-medium text-ofoq-navy text-sm mb-6" dir="ltr">{email}</p>
               <p className="text-gray-400 text-xs mb-6">{copy.spam}</p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-ofoq-red text-sm font-medium hover:underline"
              >
                <ArrowRight size={14} />
                 {copy.backLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.email}</label>
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
                     {copy.sending}
                  </>
                 ) : copy.sendReset}
              </button>

              <div className="text-center">
                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 text-gray-400 text-sm hover:text-ofoq-navy transition-colors"
                >
                  <ArrowRight size={13} />
                   {copy.backLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
