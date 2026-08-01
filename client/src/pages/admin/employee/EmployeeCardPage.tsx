import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Download, CreditCard, QrCode, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { employeeApi } from "../../../api/client";
import { useAuthStore } from "../../../store/authStore";

// ── iOS detection ──────────────────────────────────────────────────
const isIOS = typeof navigator !== "undefined"
  ? /iPhone|iPad|iPod/.test(navigator.userAgent)
  : false;

// ── Download card as PNG via canvas ────────────────────────────────
function downloadCardAsImage(cardRef: HTMLDivElement | null, filename: string) {
  if (!cardRef) return;
  import("html2canvas").then(({ default: html2canvas }) => {
    html2canvas(cardRef, { scale: 2, useCORS: true, backgroundColor: null })
      .then((canvas) => {
        const a = document.createElement("a");
        a.download = `${filename}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
      });
  }).catch(() => toast.error("تعذّر تحميل البطاقة"));
}

// ── Apple Wallet Pass download ──────────────────────────────────────
async function downloadWalletPass() {
  try {
    const res = await employeeApi.walletPass() as any;
    if (res.data instanceof Blob) {
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ofoq-employee.pkpass";
      a.click();
      URL.revokeObjectURL(url);
    }
  } catch (err: any) {
    const msg = err?.response?.data?.setup || "Apple Wallet سيكون متاحاً عند تفعيل شهادة المطوّر";
    toast.error(msg, { duration: 4000 });
  }
}

// ── OFOQ Logo SVG ───────────────────────────────────────────────────
function OfoqLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className={className}>
      <circle cx="30" cy="30" r="29" fill="#33B27C" fillOpacity="0.15" stroke="#33B27C" strokeWidth="1.5"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle"
        fill="#33B27C" fontSize="22" fontWeight="800" fontFamily="Cairo, sans-serif">أ</text>
    </svg>
  );
}

export default function EmployeeCardPage() {
  const { user } = useAuthStore();
  const [flipped, setFlipped] = useState(false);
  const [cardRef, setCardRef] = useState<HTMLDivElement | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employee-card"],
    queryFn: () => employeeApi.card().then((r) => r.data.card),
  });

  const regenMut = useMutation({
    mutationFn: () => employeeApi.regenerateCode(),
    onSuccess: () => { toast.success("تم تجديد الباركود — القديم لم يعد صالحاً"); refetch(); },
    onError: () => toast.error("خطأ في تجديد الباركود"),
  });

  const card = data;

  const avatarUrl = card?.avatar || user?.avatar;
  const displayName = card?.fullNameAr || card?.fullName || user?.name || "—";
  const position = card?.position || "موظف";
  const department = card?.department || "";
  const code = card?.employeeCode || "—";
  const qrCode = card?.qrCode;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="page-title">بطاقة الموظف</h1>
        <p className="page-subtitle">بطاقتك الرسمية لـ OFOQ • امسح الباركود لتسجيل الدخول</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-ofoq-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── 3D Flip Card ─────────────────────────────── */}
          <div
            className="cursor-pointer select-none"
            style={{ perspective: 1200 }}
            onClick={() => setFlipped(!flipped)}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 70 }}
              style={{ transformStyle: "preserve-3d", position: "relative", height: 220 }}
            >
              {/* ── FRONT ──────────────────────────────────── */}
              <div
                ref={(el) => setCardRef(el)}
                style={{ backfaceVisibility: "hidden", position: "absolute", inset: 0 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Background gradient + pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1640] via-[#1C2B6E] to-[#0C1338]" />
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 220">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#33B27C" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <circle cx="370" cy="-20" r="140" fill="none" stroke="#33B27C" strokeWidth="30" opacity="0.12"/>
                  <circle cx="30" cy="240" r="100" fill="none" stroke="#E5FE04" strokeWidth="20" opacity="0.06"/>
                </svg>

                {/* Content */}
                <div className="relative flex h-full">
                  {/* Left: Photo */}
                  <div className="flex flex-col items-center justify-center px-6 w-40">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName}
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-[#33B27C]/50 shadow-lg" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#33B27C] to-[#1C2B6E] flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {displayName.charAt(0)}
                      </div>
                    )}
                    {/* Code chip */}
                    <div className="mt-3 px-2 py-1 bg-white/10 rounded-lg">
                      <p className="text-[9px] font-mono text-white/60 text-center tracking-widest">{code}</p>
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="flex flex-col justify-center flex-1 pr-4 py-4">
                    {/* OFOQ branding */}
                    <div className="flex items-center gap-2 mb-4">
                      <OfoqLogo size={24} />
                      <div>
                        <p className="text-[#33B27C] text-xs font-bold tracking-widest leading-none">OFOQ</p>
                        <p className="text-white/40 text-[8px]">أفق لحلول الأعمال</p>
                      </div>
                    </div>

                    {/* Name */}
                    <h2 className="text-white text-xl font-bold leading-tight mb-1"
                      style={{ fontFamily: "Cairo, sans-serif" }}>{displayName}</h2>

                    {/* Position badge */}
                    <div className="inline-flex items-center gap-1 bg-[#33B27C]/20 border border-[#33B27C]/30 rounded-lg px-2 py-0.5 w-fit mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#33B27C] animate-pulse" />
                      <p className="text-[#33B27C] text-xs font-semibold">{position}</p>
                    </div>

                    {/* Department */}
                    {department && (
                      <p className="text-white/50 text-xs">{department}</p>
                    )}

                    {/* Divider */}
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <p className="text-white/30 text-[8px]">اضغط لعرض باركود الدخول</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BACK ───────────────────────────────────── */}
              <div
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1640] via-[#1C2B6E] to-[#0C1338]" />
                <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 220">
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>

                <div className="relative flex flex-col items-center justify-center h-full gap-3 py-4">
                  <p className="text-white/50 text-xs">امسح للدخول إلى النظام</p>

                  {qrCode ? (
                    <div className="bg-white p-2 rounded-xl shadow-xl">
                      <img src={qrCode} alt="QR Code" className="w-28 h-28" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 bg-white/10 rounded-xl flex items-center justify-center">
                      <QrCode size={40} className="text-white/30" />
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-white font-mono text-sm font-bold tracking-widest">{code}</p>
                    <p className="text-white/30 text-[9px] mt-0.5">ofoqhc.com</p>
                  </div>

                  {/* OFOQ bottom logo */}
                  <div className="absolute bottom-3 flex items-center gap-1.5">
                    <OfoqLogo size={16} />
                    <p className="text-white/30 text-[8px]">OFOQ Business Solutions</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Flip hint ────────────────────────────── */}
          <p className="text-center text-xs text-gray-400">
            {flipped ? "اضغط للعودة للواجهة الأمامية" : "اضغط على البطاقة لعرض باركود الدخول"}
          </p>

          {/* ── Actions ──────────────────────────────── */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFlipped(!flipped)}
              className="btn-secondary text-sm gap-2"
            >
              <QrCode size={16} />
              {flipped ? "الواجهة الأمامية" : "عرض الباركود"}
            </button>

            <button
              onClick={() => downloadCardAsImage(cardRef, `بطاقة-${displayName}`)}
              className="btn-secondary text-sm gap-2"
            >
              <Download size={16} />
              تحميل البطاقة
            </button>

            <button
              onClick={() => { if (confirm("هل تريد تجديد الباركود؟ الكود القديم لن يعمل بعد ذلك.")) regenMut.mutate(); }}
              disabled={regenMut.isPending}
              className="btn-secondary text-sm gap-2"
            >
              <RefreshCw size={16} className={regenMut.isPending ? "animate-spin" : ""} />
              تجديد الباركود
            </button>
          </div>

          {/* ── Apple Wallet (iOS only) ───────────────── */}
          <AnimatePresence>
            {isIOS && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Wallet Preview Card */}
                <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10"
                  style={{ background: "linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)" }}>
                  {/* Pass header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div>
                      <p className="text-white/50 text-[9px] uppercase tracking-widest">Employee Card</p>
                      <p className="text-white font-bold text-sm">أفق لحلول الأعمال</p>
                    </div>
                    <OfoqLogo size={36} />
                  </div>
                  <div className="px-4 pb-3 flex items-end gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#33B27C]/40" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#33B27C]/20 flex items-center justify-center text-2xl text-[#33B27C] font-bold">
                        {displayName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-bold">{displayName}</p>
                      <p className="text-[#33B27C] text-xs">{position}</p>
                    </div>
                  </div>
                  <div className="bg-black/30 mx-3 mb-3 rounded-xl p-2 flex items-center justify-center gap-2">
                    {qrCode && <img src={qrCode} alt="QR" className="w-10 h-10 rounded" />}
                    <p className="text-white/60 text-[10px] font-mono">{code}</p>
                  </div>
                </div>

                {/* Official "Add to Apple Wallet" button */}
                <button
                  onClick={downloadWalletPass}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-2xl py-3.5 px-6 font-semibold text-sm hover:bg-gray-900 active:scale-95 transition-transform shadow-xl"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M16.365 1.43c0 1.14-.415 2.19-1.24 3.14-.995 1.14-2.196 1.8-3.5 1.7-.04-1.1.44-2.24 1.24-3.15.99-1.15 2.28-1.83 3.5-1.69zm4.235 15.87c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.93-1-4.02-.99-2.08.01-2.52 1.01-4.06.99-1.73-.02-3.06-1.77-4.05-3.33C.5 17.32-.35 13 1.09 9.99c.79-1.68 2.2-2.75 3.73-2.77 1.5-.02 2.92 1 3.83 1s2.62-1.23 4.42-1.05c.75.03 2.87.3 4.23 2.28-.11.07-2.53 1.48-2.5 4.4.03 3.5 3.07 4.66 3.1 4.68" />
                  </svg>
                  <span>إضافة إلى Apple Wallet</span>
                </button>

                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <AlertCircle size={12} />
                  يتطلب تفعيل شهادة Apple Wallet من لوحة الإعدادات
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show Wallet card preview on non-iOS too, but without the download button */}
          {!isIOS && (
            <div className="card bg-gray-50 text-center py-4">
              <CreditCard size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                زر <strong>إضافة إلى Apple Wallet</strong> يظهر على أجهزة iPhone فقط
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
