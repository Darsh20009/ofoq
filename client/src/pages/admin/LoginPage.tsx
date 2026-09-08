import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Fingerprint, QrCode, X } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authApi, webauthnApi } from "../../api/client";
import { useAuthStore } from "../../store/authStore";
import OfoqLogo from "../../components/OfoqLogo";
import { useLang } from "../../i18n/LangContext";

function normalizeOtpInput(value: string): string {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/\D/g, "")
    .slice(0, 6);
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.5 34.7 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.9 39.6 16.4 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.5 5.5c-.5.4 7.4-5.4 7.4-16.6 0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.415 2.19-1.24 3.14-.995 1.14-2.196 1.8-3.5 1.7-.04-1.1.44-2.24 1.24-3.15.99-1.15 2.28-1.83 3.5-1.69zM20.6 17.3c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.93-1-4.02-.99-2.08.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.5 17.32-.35 13 1.09 9.99c.79-1.68 2.2-2.75 3.73-2.77 1.5-.02 2.92 1 3.83 1s2.62-1.23 4.42-1.05c.75.03 2.87.3 4.23 2.28-.11.07-2.53 1.48-2.5 4.4.03 3.5 3.07 4.66 3.1 4.68 0 0-.24 0 0 0" />
    </svg>
  );
}

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<{ tempToken: string; method: string } | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [oauthStatus, setOauthStatus] = useState<{ google: boolean; apple: boolean }>({ google: false, apple: false });
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState("");
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const { ui, dir } = useLang();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<LoginForm>();
  const emailValue = watch("email");

  useEffect(() => {
    authApi.oauthStatus()
      .then((res) => setOauthStatus(res.data))
      .catch(() => {});
  }, []);

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    try {
      const optRes = await webauthnApi.loginOptions(emailValue || undefined);
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const asseResp = await startAuthentication({ optionsJSON: optRes.data });
      const verifyRes = await webauthnApi.loginVerify(asseResp);
      const { user, token } = verifyRes.data;
      setAuth(user, token);
        toast.success(`${user.name || user.fullName}`);
      navigate("/admin");
    } catch {
      // silent
    }
    setPasskeyLoading(false);
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true); setError("");
    try {
      const res = await authApi.login(data.email, data.password);
      const { user, token, requires2FA, tempToken, method, methods } = res.data;
      if (requires2FA) {
        setTwoFAStep({ tempToken, method: method || methods?.[0] || "totp" });
        toast(ui.adminLogin.twoFactor, { icon: "🔐" });
      } else {
        setAuth(user, token);
        toast.success(user.name);
        navigate(user.role === "employee" ? "/admin/employee/dashboard" : "/admin");
      }
    } catch (e: any) {
      setError(e.response?.data?.error || ui.adminLogin.invalid);
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async () => {
    if (!twoFAStep || !otpCode.trim()) return;
    setLoading(true);
    try {
      const res = await authApi.verify2FA({ tempToken: twoFAStep.tempToken, method: twoFAStep.method, code: otpCode });
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(user.name);
      navigate(user.role === "employee" ? "/admin/employee/dashboard" : "/admin");
    } catch (e: any) {
      setError(e.response?.data?.error || ui.adminLogin.twoFactorInvalid);
    } finally {
      setLoading(false);
    }
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
      toast.success(user.name);
      navigate("/admin/employee/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.error || ui.adminLogin.invalid);
    } finally {
      setBarcodeLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      scanningRef.current = true;

      // The video is rendered only after cameraActive changes. Wait for the
      // ref to exist before attaching the stream, otherwise the scanner opens
      // with a black frame and the old code silently stopped.
      await new Promise<void>((resolve) => {
        const attach = () => {
          const v = videoRef.current;
          if (!v) {
            requestAnimationFrame(attach);
            return;
          }
          v.srcObject = stream;
          if (v.readyState >= 2) {
            resolve();
          } else {
            v.onloadeddata = () => resolve();
          }
        };
        requestAnimationFrame(attach);
      });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

      // محاولة BarcodeDetector أولاً (Chrome) ثم jsQR كـ fallback
      const nativeDetector =
        "BarcodeDetector" in window
          ? new (window as any).BarcodeDetector({ formats: ["qr_code"] })
          : null;

      const tick = async () => {
        if (!scanningRef.current || !streamRef.current) return;
        const v = videoRef.current;
        if (!v || v.readyState < 2 || v.videoWidth === 0) {
          requestAnimationFrame(tick);
          return;
        }

        canvas.width  = v.videoWidth;
        canvas.height = v.videoHeight;
        ctx.drawImage(v, 0, 0);

        let result: string | null = null;

        try {
          if (nativeDetector) {
            const codes = await nativeDetector.detect(v);
            if (codes.length) result = codes[0].rawValue;
          } else {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const { default: jsQR } = await import("jsqr");
            const qr = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: "dontInvert",
            });
            if (qr) result = qr.data;
          }
        } catch {}

        if (result) {
          stopCamera();
          await handleBarcodeLogin(result);
          return;
        }

        // مسح دائم كل 150 مللي ثانية
        setTimeout(() => requestAnimationFrame(tick), 150);
      };

      requestAnimationFrame(tick);
    } catch {
      // silent
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  return (
     <div className="min-h-screen bg-[#F7F3EE] flex items-stretch" dir={dir}>

      {/* ── الجانب الأيسر — صورة خلفية + بطاقات ── */}
      <div
        className="hidden lg:flex lg:w-[58%] relative bg-cover bg-center items-center justify-center p-16"
         style={{ backgroundImage: "linear-gradient(rgba(43,39,63,.48),rgba(43,39,63,.88)), url('/images/hero-aramco-hq.jpg')" }}
      >
        <div className="text-center text-white">
          <OfoqLogo className="w-40 h-28 mx-auto mb-8 text-white" />
          <h2 className="text-5xl font-black">{ui.adminLogin.title}</h2>
          <p className="text-white/65 text-lg mt-4">{ui.home.heroSub}</p>
          <div className="mt-14 flex gap-4 justify-center">
            <div className="glass rounded-2xl px-6 py-4">
              <b className="text-2xl block text-ofoq-yellow">200+</b>
              <span className="text-xs text-white/60">{ui.adminLogin.successfulProjects}</span>
            </div>
            <div className="glass rounded-2xl px-6 py-4">
               <b className="text-2xl block text-ofoq-green">98%</b>
              <span className="text-xs text-white/60">{ui.adminLogin.customerSatisfaction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── الجانب الأيمن — نموذج الدخول ── */}
       <div className="w-full lg:w-[42%] flex items-center justify-center p-5 sm:p-10 bg-[#F7F3EE] relative">
        {/* خلفية نقاط ديكورية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-ofoq-navy/10"
              style={{
                top: `${(i * 13 + 7) % 100}%`,
                left: `${(i * 17 + 11) % 100}%`,
                width: `${(i % 3) * 3 + 4}px`,
                height: `${(i % 3) * 3 + 4}px`,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* البطاقة الرئيسية */}
           <div className="w-full max-w-md rounded-3xl p-8 sm:p-10 border border-[#2B273F]/10 shadow-[0_25px_80px_rgba(43,39,63,.14)] bg-white">
            {/* اللوجو والعنوان */}
            <div className="text-center mb-8">
              <OfoqLogo className="w-24 h-16 mx-auto mb-4" dark />
              <h1 className="text-ofoq-navy text-2xl font-bold">{ui.adminLogin.login}</h1>
              <p className="text-gray-500 text-sm mt-1">{ui.adminLogin.subtitle}</p>
            </div>

            {!twoFAStep ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
                  >
                    {error}
                  </div>
                )}

                {/* البريد الإلكتروني */}
                <div>
                  <label className="label">{ui.adminLogin.email}</label>
                  <div className="relative">
                    <Mail size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      {...register("email", { required: ui.adminLogin.emailRequired })}
                      type="email"
                      autoComplete="email"
                      placeholder="admin@ofoqhc.com"
                      className="input-field pr-10"
                      dir="ltr"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* كلمة المرور */}
                <div>
                  <label className="label">{ui.adminLogin.password}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-400" />
                    <input
                      {...register("password", { required: ui.adminLogin.passwordRequired })}
                      type={showPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="input-field pr-10 pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                       className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-400 hover:text-ofoq-green transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                   <Link to="/admin/forgot-password" className="text-ofoq-green text-xs hover:underline">
                    {ui.adminLogin.forgot}
                  </Link>
                </div>

                {/* زر الدخول */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary justify-center py-3.5 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {ui.adminLogin.verifying}
                    </span>
                  ) : (
                    ui.adminLogin.login
                  )}
                </button>

                {/* Passkey */}
                <button
                  type="button"
                  onClick={handlePasskeyLogin}
                  disabled={passkeyLoading}
                  className="w-full flex items-center justify-center gap-2 bg-ofoq-navy/5 border border-gray-200 text-ofoq-navy rounded-xl py-3 text-sm hover:bg-ofoq-navy/10 transition-all"
                >
                  <Fingerprint size={17} className="text-ofoq-green" />
                  {passkeyLoading ? ui.adminLogin.verifying : ui.adminLogin.passkeyLogin}
                </button>

                {/* OAuth */}
                {(oauthStatus.google || oauthStatus.apple) && (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-gray-400 text-xs">{ui.adminLogin.or}</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {oauthStatus.google && (
                        <a
                          href="/api/auth/google"
                          className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <GoogleIcon /> Google
                        </a>
                      )}
                      {oauthStatus.apple && (
                        <a
                          href="/api/auth/apple"
                          className="flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <AppleIcon /> Apple
                        </a>
                      )}
                    </div>
                  </>
                )}
              </form>
            ) : (
              /* مرحلة التحقق الثنائي */
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">
                     {twoFAStep.method === "totp"
                       ? ui.adminLogin.twoFactor
                       : ui.adminLogin.code}
                  </p>
                </div>
                <input
                  value={otpCode}
                   onChange={(e) => setOtpCode(normalizeOtpInput(e.target.value))}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full border border-gray-200 bg-gray-50 text-ofoq-navy text-center text-2xl tracking-[0.5em] placeholder-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-ofoq-red focus:ring-2 focus:ring-ofoq-red/20"
                  dir="ltr"
                />
                <button
                  onClick={handle2FA}
                  disabled={loading || otpCode.length < 6}
                  className="w-full btn-primary justify-center py-3.5"
                >
                  {loading ? ui.adminLogin.verifying : ui.adminLogin.verify}
                </button>
                <button
                  onClick={() => setTwoFAStep(null)}
                  className="w-full text-gray-400 text-sm hover:text-ofoq-navy transition-colors"
                >
                  {ui.adminLogin.back}
                </button>
              </div>
            )}
          </div>

          {/* زر باركود الموظف */}
          {!twoFAStep && (
            <button
              onClick={() => { setBarcodeOpen(true); setBarcodeCode(""); }}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-ofoq-navy text-xs mt-4 py-2 transition-colors border border-transparent hover:border-gray-200 rounded-xl"
            >
              <QrCode size={14} />
              {ui.adminLogin.employeeBarcode}
            </button>
          )}

          <p className="text-center text-gray-400 text-xs mt-4">
            © {new Date().getFullYear()} {ui.adminLogin.title}
          </p>
        </motion.div>
      </div>

      {/* ── مودال الباركود / QR ── */}
      {barcodeOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); setBarcodeOpen(false); } }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-sm bg-[#1a1730] border border-white/10 rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-ofoq-green" />
                <h3 className="text-white font-bold">{ui.adminLogin.employeeLogin}</h3>
              </div>
              <button
                onClick={() => { stopCamera(); setBarcodeOpen(false); }}
                className="text-white/40 hover:text-white/70 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* كاميرا المسح */}
            {cameraActive ? (
              <div className="relative mb-4 rounded-2xl overflow-hidden bg-black aspect-square">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-ofoq-green rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-ofoq-green rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-ofoq-green rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-ofoq-green rounded-br-lg" />
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-ofoq-green/60 animate-pulse" />
                  </div>
                </div>
                <p className="absolute bottom-3 left-0 right-0 text-center text-white/60 text-xs">
                  {ui.adminLogin.employeeBarcode}
                </p>
              </div>
            ) : (
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-white/70 hover:bg-white/10 hover:text-white rounded-2xl py-4 mb-4 transition-all text-sm"
              >
                <QrCode size={18} className="text-ofoq-green" />
                {ui.adminLogin.employeeBarcode}
              </button>
            )}

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-white/15" />
              <span className="text-white/40 text-xs">or enter the code manually</span>
              <div className="flex-1 h-px bg-white/15" />
            </div>

            <input
              value={barcodeCode}
              onChange={(e) => setBarcodeCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleBarcodeLogin()}
              placeholder="OFOQ-XXXXXXXX"
              dir="ltr"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm text-center font-mono tracking-widest focus:outline-none focus:border-ofoq-green focus:ring-1 focus:ring-ofoq-green mb-3"
            />

            <button
              onClick={() => handleBarcodeLogin()}
              disabled={!barcodeCode.trim() || barcodeLoading}
              className="w-full btn-primary justify-center py-3"
            >
              {barcodeLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   {ui.adminLogin.verifying}
                </span>
              ) : ui.adminLogin.login}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
