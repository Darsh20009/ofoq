/**
 * صفحة دخول بوابة الموظفين — employee.ofoqhc.com/login
 * مبسّطة: بريد + كلمة مرور فقط، بدون OAuth / Google / Apple
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, QrCode, X, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi, webauthnApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";
import LanguageSwitcher from "../../components/LanguageSwitcher";

interface LoginForm { email: string; password: string; }

function normalizeOtpInput(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 6);
}

export default function EmployeePortalLoginPage() {
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [error, setError]             = useState("");
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
  const { ui, dir } = useLang();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const goHome = () => navigate("/", { replace: true });

  /* ── Passkey login ───────────────── */
  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setError("");
    try {
      const email = (document.querySelector<HTMLInputElement>('input[name="email"]')?.value || "").trim();
      const optRes = await webauthnApi.loginOptions(email || undefined);
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const assertion = await startAuthentication({ optionsJSON: optRes.data });
      const verifyRes = await webauthnApi.loginVerify(assertion);
      const { user, token } = verifyRes.data;
      setAuth(user, token);
      toast.success(`مرحباً، ${user.name || user.fullName}!`);
      goHome();
    } catch (e: any) {
      setError(e.response?.data?.error || "تعذر الدخول بمفتاح المرور. سجّل مفتاحاً أولاً من صفحة ملفي.");
    } finally {
      setPasskeyLoading(false);
    }
  };

  /* ── Login ─────────────────────── */
  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(data.email, data.password);
      const { user, token, requires2FA, tempToken, method, methods } = res.data;
      if (requires2FA) {
        setTwoFA({ tempToken, method: method || methods?.[0] || "totp" });
        toast(ui.employee.twoFactor, { icon: "🔐" });
      } else {
        setAuth(user, token);
        toast.success(`مرحباً، ${user.name}!`);
        goHome();
      }
    } catch (e: any) {
      setError(e.response?.data?.error || ui.employee.invalid);
    } finally {
      setLoading(false);
    }
  };

  /* ── 2FA ───────────────────────── */
  const handle2FA = async () => {
    if (!twoFA || !otp.trim()) return;
    setLoading(true);
    try {
      const res = await authApi.verify2FA({
        tempToken: twoFA.tempToken,
        method: twoFA.method,
        code: normalizeOtpInput(otp),
      });
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`مرحباً، ${user.name}!`);
      goHome();
    } catch (e: any) {
      setError(e.response?.data?.error || ui.employee.invalid);
    } finally {
      setLoading(false);
    }
  };

  /* ── Barcode Login ─────────────── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setCameraActive(true);

      // cameraActive renders the video element. Attach the stream after the
      // ref is available; attaching it before this point leaves a black view.
      await new Promise<void>((resolve) => {
        const attach = () => {
          const video = videoRef.current;
          if (!video) {
            requestAnimationFrame(attach);
            return;
          }
          video.srcObject = stream;
          if (video.readyState >= 2) resolve();
          else video.onloadeddata = () => resolve();
        };
        requestAnimationFrame(attach);
      });

      const nativeDetector =
        "BarcodeDetector" in window
          ? new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          : null;
      detectRef.current = nativeDetector;
      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;
        const video = videoRef.current;
        if (video.readyState < 2 || video.videoWidth === 0) {
          requestAnimationFrame(scan);
          return;
        }

        try {
          let value: string | null = null;
          if (nativeDetector) {
            const codes = await nativeDetector.detect(video);
            value = codes[0]?.rawValue || null;
          } else {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (context) {
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const image = context.getImageData(0, 0, canvas.width, canvas.height);
              const { default: jsQR } = await import("jsqr");
              value = jsQR(image.data, image.width, image.height, {
                inversionAttempts: "attemptBoth",
              })?.data || null;
            }
          }
          if (value) {
            await handleBarcodeLogin(value);
            return;
          }
        } catch {}
        requestAnimationFrame(scan);
      };
      requestAnimationFrame(scan);
    } catch { /* silent */ }
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
    } catch {
      // silent
    }
    setBarcodeLoading(false);
  };

  useEffect(() => () => stopCamera(), []);

  /* ── UI ────────────────────────── */
  return (
    <div
      className="min-h-screen bg-[#0C1338] flex flex-col items-center justify-center px-4 relative"
      dir={dir}
    >
      <div className="absolute top-4 end-4">
        <LanguageSwitcher dark />
      </div>
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <OfoqLogo className="w-20 h-14" />
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold">{ui.employee.portal}</h1>
          <p className="text-white/50 text-sm mt-1">{ui.employee.portal}</p>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
      >
        {error && (
          <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {twoFA ? (
          /* 2FA step */
          <div className="space-y-5">
            <h2 className="text-center font-bold text-navy-700 text-lg">
              {ui.employee.twoFactor}
            </h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(normalizeOtpInput(e.target.value))}
              placeholder={ui.employee.code}
              maxLength={6}
              className="w-full input text-center text-2xl tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && handle2FA()}
            />
            <button
              onClick={handle2FA}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? ui.employee.verifying : ui.employee.verify}
            </button>
            <button
              onClick={() => { setTwoFA(null); setOtp(""); }}
              className="text-xs text-gray-400 w-full text-center hover:underline"
            >
              {ui.employee.back}
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <h2 className="text-center font-bold text-navy-700 text-xl mb-2">
              {ui.employee.login}
            </h2>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {ui.employee.email}
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  {...register("email", { required: ui.employee.emailRequired })}
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
                {ui.employee.password}
              </label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password", { required: ui.employee.passwordRequired })}
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
              {loading ? ui.employee.verifying : ui.employee.login}
            </button>

            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
              className="w-full flex items-center justify-center gap-2 border border-[#1C2B6E]/15 bg-[#1C2B6E]/5 text-[#1C2B6E] rounded-xl py-3 text-sm hover:bg-[#1C2B6E]/10 transition-colors"
            >
              <Fingerprint size={17} className="text-[#33B27C]" />
              {passkeyLoading ? ui.employee.verifying : ui.employee.passkey}
            </button>

            <p className="text-center text-[11px] text-gray-400 -mt-2">
              {ui.employee.passkeyHint}
            </p>

            <a
              href="https://www.ofoqhc.com/admin/login"
              className="block text-center text-xs text-gray-400 hover:text-navy-700 hover:underline transition-colors"
            >
              {ui.employee.adminLogin}
            </a>

            {/* Divider */}
            <div className="flex items-center gap-3 text-gray-300">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs">{ui.employee.or}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Barcode login */}
            <button
              type="button"
              onClick={() => setBarcodeOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 text-sm text-navy-700 hover:bg-gray-50 transition-colors"
            >
              <QrCode size={16} />
              {ui.employee.barcode}
            </button>
          </form>
        )}
      </motion.div>

      {/* Barcode Modal */}
      {barcodeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" dir={dir}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-navy-700">{ui.employee.barcodeTitle}</h3>
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
                 <span className="text-sm text-gray-500">{ui.employee.cameraHint}</span>
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
                 {barcodeLoading ? "..." : ui.employee.barcodeSubmit}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <p className="text-white/30 text-xs mt-8">
        © {new Date().getFullYear()} {ui.adminLogin.title}
      </p>
    </div>
  );
}
