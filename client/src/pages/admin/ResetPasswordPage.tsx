import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";

export default function ResetPasswordPage() {
  const { ui, lang } = useLang();
  const copy = ui.auth;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login", { replace: true });
    }
  }, [token, navigate]);

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const strengthLabel = ["", copy.strengthVeryWeak, copy.strengthWeak, copy.strengthAcceptable, copy.strengthStrong];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(copy.mismatch); return; }
    if (password.length < 8)  { setError(copy.minPassword); return; }

    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/admin/login", { replace: true }), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.error || copy.invalidReset;
      toast.error(msg);
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
          <div className="text-center mb-8">
            <OfoqLogo className="w-24 h-16 mx-auto mb-4" dark />
            <h1 className="text-ofoq-navy text-2xl font-bold">{copy.resetTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">{copy.resetSubtitle}</p>
          </div>

          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
               <h2 className="text-ofoq-navy font-bold text-lg mb-2">{copy.passwordChanged}</h2>
               <p className="text-gray-500 text-sm mb-4">{copy.redirecting}</p>
              <Link to="/admin/login" className="text-ofoq-red text-sm font-medium hover:underline">
                 {copy.goLogin}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              {/* كلمة المرور الجديدة */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.newPassword}</label>
                <div className="relative">
                  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-red/30 focus:border-ofoq-red transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400 hover:text-ofoq-red transition-colors">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* مؤشر القوة */}
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                      ))}
                    </div>
                     <p className="text-xs text-gray-400">{copy.passwordStrength}: <span className={`font-medium ${strength >= 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-500"}`}>{strengthLabel[strength]}</span></p>
                  </div>
                )}
              </div>

              {/* تأكيد كلمة المرور */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1.5">{copy.confirmPassword}</label>
                <div className="relative">
                  <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-red/30 focus:border-ofoq-red transition-all"
                  />
                  {confirm && (
                    <span className="absolute top-1/2 -translate-y-1/2 left-3.5">
                      {password === confirm
                        ? <CheckCircle size={15} className="text-green-500" />
                        : <XCircle size={15} className="text-red-400" />}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full bg-ofoq-red hover:bg-ofoq-red/90 disabled:opacity-50 text-white font-semibold rounded-xl py-3.5 text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     {copy.saving}
                  </>
                 ) : copy.savePassword}
              </button>

              <div className="text-center">
                <Link to="/admin/login" className="text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
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
