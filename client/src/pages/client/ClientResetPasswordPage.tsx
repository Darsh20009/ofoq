import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "../../api/client";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";

export default function ClientResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { ui, dir } = useLang();

  useEffect(() => {
    if (!token) navigate("/client/login", { replace: true });
  }, [token, navigate]);

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const strengthLabel = ["", ui.auth.strengthVeryWeak, ui.auth.strengthWeak, ui.auth.strengthAcceptable, ui.auth.strengthStrong];
  const strengthColor  = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError(ui.auth.mismatch); return; }
    if (password.length < 8)  { setError(ui.auth.minPassword); return; }
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/client/login", { replace: true }), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || ui.auth.invalidReset);
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
            <h1 className="text-white text-xl font-bold">{ui.auth.resetTitle}</h1>
            <p className="text-white/50 text-sm mt-1">{ui.auth.resetSubtitle}</p>
          </div>

          <div className="p-8">
            {done ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-ofoq-navy font-bold text-lg mb-2">{ui.auth.passwordChanged}</h2>
                <p className="text-gray-500 text-sm mb-4">{ui.auth.redirecting}</p>
                <Link to="/client/login" className="text-ofoq-navy text-sm font-semibold hover:text-ofoq-red transition-colors">
                  {ui.auth.goLogin}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* كلمة المرور الجديدة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{ui.auth.newPassword}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400 hover:text-ofoq-navy transition-colors">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                         {ui.auth.passwordStrength}: <span className={`font-medium ${strength >= 3 ? "text-green-600" : strength === 2 ? "text-yellow-600" : "text-red-500"}`}>
                          {strengthLabel[strength]}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* تأكيد كلمة المرور */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{ui.auth.confirmPassword}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 pl-10 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 transition-all"
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
                  className="w-full bg-ofoq-navy hover:bg-ofoq-red disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {ui.auth.saving}</>
                  ) : ui.auth.savePassword}
                </button>

                <div className="text-center">
                  <Link to="/client/login" className="text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
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
