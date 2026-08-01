/**
 * صفحة دخول بوابة الموظفين — employee.ofoqhc.com/login
 * مبسّطة: بريد + كلمة مرور فقط، بدون OAuth / Google / Apple
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, QrCode, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";

interface LoginForm { email: string; password: string; }

export default function EmployeePortalLoginPage() {
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [twoFA, setTwoFA]             = useState<{ tempToken: string; method: string } | null>(null);
  const [otp, setOtp]                 = useState("");
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectRef = useRef<any>(null);

  const { setAuth } = useAuthStore();
  const navigate    = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const goHome = () => navigate("/", { replace: true });

  /* ── Login ─────────────────────── */
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      const { user, token, requires2FA, tempToken, method } = res.data.data;
      if (requires2FA) {
        setTwoFA({ tempToken, method });
        toast("أدخل رمز التحقق الثنائي", { icon: "🔐" });
      } else {
        setAuth(user, token);
        toast.success(`مرحباً، ${user.name}!`);
        goHome();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "بيانات الدخول غير صحيحة");
    }
    setLoading(false);
  };

  /* ── 2FA ───────────────────────── */
  const handle2FA = async () => {
    if (!twoFA || !otp.trim()) return;
    setLoading(true);
    try {
      const res = await authApi.verify2FA({ tempToken: twoFA.tempToken, code: otp });
      const { user, token } = res.data.data;
      setAuth(user, token);
      toast.success(`مرحباً، ${user.name}!`);
      goHome();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "رمز التحقق غير صحيح");
    }
    setLoading(false);
  };

  /* ── Barcode Login ─────────────── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      if ("BarcodeDetector" in window) {
        const det = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        detectRef.current = det;
        const scan = async () => {
          if (!videoRef.current || !detectRef.current) return;
          try {
            const codes = await detectRef.current.detect(videoRef.current);
            if (codes.length) { handleBarcodeLogin(codes[0].rawValue); return; }
          } catch {}
          requestAnimationFrame(scan);
        };
        scan();
      }
    } catch { toast.error("تعذّر الوصول إلى الكاميرا"); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    detectRef.current = null;
    setCameraActive(false);
  };

  const handleBarcodeLogin = async (code?: string) => {
    const finalCode = (code || barcodeCode).trim().toUpperCase();
    if (!finalCode) return;
    setBarcodeLoading(true);
    try {
      const res = await authApi.barcodeLogin(finalCode);
      const { user, token } = res.data;
      setAuth(user, token);
      stopCamera();
      setBarcodeOpen(false);
      toast.success(`مرحباً، ${user.name}!`);
      goHome();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "كود الموظف غير صحيح");
    }
    setBarcodeLoading(false);
  };

  useEffect(() => () => stopCamera(), []);

  /* ── UI ────────────────────────── */
  return (
    <div
      className="min-h-screen bg-[#0C1338] flex flex-col items-center justify-center px-4"
      dir="rtl"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <OfoqLogo size={60} />
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">بوابة الموظفين</h1>
          <p className="text-white/50 text-sm mt-1">OFOQ Employee Portal</p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
      >
        {twoFA ? (
          /* 2FA step */
          <div className="space-y-5">
            <h2 className="text-center font-bold text-navy-700 text-lg">
              التحقق الثنائي
            </h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="رمز التحقق"
              maxLength={6}
              className="w-full input text-center text-2xl tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handle2FA()}
            />
            <button
              onClick={handle2FA}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "جارٍ التحقق..." : "تأكيد"}
            </button>
            <button
              onClick={() => { setTwoFA(null); setOtp(""); }}
              className="text-xs text-gray-400 w-full text-center hover:underline"
            >
              رجوع
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <h2 className="text-center font-bold text-navy-700 text-xl mb-2">
              تسجيل الدخول
            </h2>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  {...register("email", { required: "البريد مطلوب" })}
                  placeholder="name@ofoqhc.com"
                  className="input pr-9 w-full"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password", { required: "كلمة المرور مطلوبة" })}
                  placeholder="••••••••"
                  className="input pr-9 pl-9 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "جارٍ الدخول..." : "دخول"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs">أو</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Barcode login */}
            <button
              type="button"
              onClick={() => setBarcodeOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-navy-700 hover:bg-gray-50 transition-colors"
            >
              <QrCode size={16} />
              دخول بباركود البطاقة
            </button>
          </form>
        )}
      </motion.div>

      {/* Barcode Modal */}
      {barcodeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-navy-700">دخول بالباركود</h3>
              <button onClick={() => { stopCamera(); setBarcodeOpen(false); }}>
                <X size={18} className="text-gray-400 hover:text-gray-700" />
              </button>
            </div>

            {cameraActive ? (
              <div className="relative rounded-xl overflow-hidden aspect-square bg-black mb-4">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-[#33B27C] rounded-xl" />
                </div>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="w-full aspect-square rounded-xl bg-gray-100 flex flex-col items-center justify-center gap-3 mb-4 hover:bg-gray-200 transition-colors"
              >
                <QrCode size={48} className="text-gray-400" />
                <span className="text-sm text-gray-500">اضغط لتفعيل الكاميرا</span>
              </button>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeCode}
                onChange={(e) => setBarcodeCode(e.target.value.toUpperCase())}
                placeholder="OFOQ-XXXXXXXX"
                className="input flex-1 text-center tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && handleBarcodeLogin()}
              />
              <button
                onClick={() => handleBarcodeLogin()}
                disabled={barcodeLoading || !barcodeCode}
                className="btn-primary px-4"
              >
                {barcodeLoading ? "..." : "دخول"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <p className="text-white/30 text-xs mt-8">
        © {new Date().getFullYear()} OFOQ Business Solutions
      </p>
    </div>
  );
}
