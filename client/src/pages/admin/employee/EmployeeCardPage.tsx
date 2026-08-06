import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Download, QrCode, AlertCircle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { employeeApi } from "../../../api/client";
import { useAuthStore } from "../../../store/authStore";
import OfoqLogo from "../../../components/OfoqLogo";
import { useLang } from "../../../i18n/LangContext";

// ── iOS / Android detection ───────────────────────────────────────────
const isIOS     = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

// ── Download card front as PNG ────────────────────────────────────────
async function downloadCardAsImage(el: HTMLDivElement | null, name: string) {
  if (!el) return;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null });
    const a = document.createElement("a");
    a.download = `${name}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  } catch { /* silent */ }
}

// ── Apple Wallet pass download ────────────────────────────────────────
async function downloadWalletPass(setLoading: (v: boolean) => void) {
  setLoading(true);
  try {
    const res = await employeeApi.walletPass() as any;

    // If the response is not a valid pkpass blob, it might be a JSON error
    const contentType: string = res.headers?.["content-type"] || "";
    if (!contentType.includes("pkpass") && !contentType.includes("octet-stream")) {
      // Try to read error from blob
      try {
        const text = await (res.data as Blob).text();
        const json = JSON.parse(text);
        toast.error(json.detail || json.error || "Unable to generate card");
      } catch {
        toast.error("Unable to generate Apple Wallet card");
      }
      return;
    }

    const blob: Blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: "application/vnd.apple.pkpass" });
    const url = URL.createObjectURL(blob);

    if (isIOS) {
      // iOS Safari: navigate directly so Wallet intercepts the .pkpass MIME type
      window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } else {
      const a = document.createElement("a");
      a.href = url;
      a.download = "ofoq-employee.pkpass";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Apple Wallet card downloaded");
    }
  } catch (err: any) {
    // Try reading blob error from axios response
    if (err?.response?.data instanceof Blob) {
      try {
        const text = await err.response.data.text();
        const json = JSON.parse(text);
        toast.error(json.detail || json.error || "Unable to generate card");
      } catch {
        toast.error("Unable to generate Apple Wallet card");
      }
    } else {
      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Unable to generate Apple Wallet card"
      );
    }
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────────────────────────────────
export default function EmployeeCardPage() {
  const { user } = useAuthStore();
  const { ui } = useLang();
  const copy = ui.adminPages.adminPortal;
  const [flipped, setFlipped]           = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const frontRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["employee-card"],
    queryFn:  () => employeeApi.card().then((r) => r.data.card),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const regenMut = useMutation({
    mutationFn: () => employeeApi.regenerateCode(),
    onSuccess:  () => { toast.success(copy.barcodeRegenerated); refetch(); },
  });

  const card        = data;
  const avatarUrl   = card?.avatar || user?.avatar;
  const displayName = card?.fullNameAr || card?.fullName || user?.name || "—";
  const position    = card?.position   || copy.roleEmployee;
  const department  = card?.department || "";
  const code        = card?.employeeCode || "—";
  const qrCode      = card?.qrCode;   // data URL from server

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="page-title">{copy.employeeCardTitle}</h1>
        <p className="page-subtitle">{copy.employeeCardSubtitle}</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-10 h-10 border-4 border-ofoq-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{copy.loadingCard}</p>
        </div>
      ) : !card ? (
        <div className="card text-center py-12 space-y-3">
          <AlertCircle size={36} className="mx-auto text-red-400" />
          <p className="text-navy-700 font-semibold">{copy.loadError}</p>
          <button onClick={() => refetch()} className="btn-primary text-sm">{copy.retry}</button>
        </div>
      ) : (
        <>
          {/* ── 3D Flip Card ───────────────────────────────── */}
          <div
            className="cursor-pointer select-none"
            style={{ perspective: 1400 }}
            onClick={() => setFlipped(!flipped)}
             title={flipped ? copy.clickToBack : copy.clickToBarcode}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.55, type: "spring", stiffness: 80, damping: 14 }}
              style={{ transformStyle: "preserve-3d", position: "relative", height: 230 }}
            >
              {/* ════════ FRONT ════════ */}
              <div
                ref={frontRef}
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", position: "absolute", inset: 0 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* BG */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1640] via-[#1C2B6E] to-[#0C1338]" />
                {/* Grid pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 230" aria-hidden>
                  <defs>
                    <pattern id="emp-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#33B27C" strokeWidth="0.6"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#emp-grid)"/>
                  <circle cx="380" cy="-30" r="160" fill="none" stroke="#33B27C" strokeWidth="32" opacity="0.1"/>
                  <circle cx="20" cy="260" r="110" fill="none" stroke="#E5FE04" strokeWidth="22" opacity="0.06"/>
                </svg>

                {/* Content */}
                <div className="relative flex h-full">
                  {/* Photo column */}
                  <div className="flex flex-col items-center justify-center px-5 w-40 flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl} alt={displayName} crossOrigin="anonymous"
                        className="w-24 h-24 rounded-2xl object-cover border-2 border-[#33B27C]/50 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#33B27C] to-[#1C2B6E] flex items-center justify-center text-white text-4xl font-bold shadow-lg select-none">
                        {displayName.charAt(0)}
                      </div>
                    )}
                    <div className="mt-3 px-2 py-1 bg-white/10 rounded-lg w-full max-w-[7rem]">
                      <p className="text-[8px] font-mono text-white/50 text-center tracking-widest truncate">{code}</p>
                    </div>
                  </div>

                  {/* Info column */}
                  <div className="flex flex-col justify-between flex-1 pr-5 py-5">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                      <OfoqLogo className="w-14 h-10" />
                      <p className="text-white/30 text-[9px] leading-tight">{copy.companyBrand}</p>
                    </div>

                    {/* Name */}
                    <div>
                      <h2 className="text-white text-[22px] font-extrabold leading-tight"
                        style={{ fontFamily: "Cairo, sans-serif" }}>{displayName}</h2>

                      {/* Position */}
                      <div className="mt-1.5 inline-flex items-center gap-1.5 bg-[#33B27C]/20 border border-[#33B27C]/30 rounded-lg px-2.5 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#33B27C] animate-pulse flex-shrink-0" />
                        <span className="text-[#33B27C] text-xs font-semibold">{position}</span>
                      </div>

                      {department && (
                        <p className="text-white/40 text-xs mt-1">{department}</p>
                      )}
                    </div>

                    {/* Hint */}
                    <p className="text-white/20 text-[9px]">{copy.clickToBarcode} ↩</p>
                  </div>
                </div>
              </div>

              {/* ════════ BACK ════════ */}
              <div
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", position: "absolute", inset: 0 }}
                className="rounded-3xl overflow-hidden shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1640] via-[#1C2B6E] to-[#0C1338]" />
                <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 400 230" aria-hidden>
                  <rect width="100%" height="100%" fill="url(#emp-grid)"/>
                </svg>

                <div className="relative flex flex-col items-center justify-center h-full gap-3 py-4">
                   <p className="text-white/40 text-xs tracking-widest uppercase">{copy.scanToVerify}</p>

                  {/* QR Code */}
                  {qrCode ? (
                    <div className="bg-white p-3 rounded-2xl shadow-2xl ring-2 ring-[#33B27C]/30">
                      <img src={qrCode} alt="QR Code" className="w-32 h-32 block" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/10">
                      <QrCode size={36} className="text-white/30" />
                       <p className="text-white/30 text-[9px]">{copy.generating}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-white font-mono text-sm font-bold tracking-[0.2em]">{code}</p>
                    <p className="text-white/25 text-[9px] mt-0.5">ofoqhc.com</p>
                  </div>

                  {/* Logo bottom */}
                  <div className="absolute bottom-3 flex items-center gap-2 opacity-40">
                    <OfoqLogo className="w-10 h-7" />
                    <p className="text-white text-[8px]">Business Solutions</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Flip hint */}
          <p className="text-center text-xs text-gray-400">
             {flipped ? `← ${copy.clickToBack}` : `${copy.clickToBarcode} →`}
          </p>

          {/* ── Action buttons ──────────────────────────────── */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFlipped(!flipped)}
              className="btn-secondary text-sm gap-2"
            >
              <QrCode size={16} />
               {flipped ? copy.frontSide : copy.showBarcode}
            </button>

            <button
              onClick={() => downloadCardAsImage(frontRef.current, `بطاقة-${displayName}`)}
              className="btn-secondary text-sm gap-2"
            >
              <Download size={16} />
               {copy.downloadCard}
            </button>

            <button
              onClick={() => {
                 if (window.confirm(copy.regenerateConfirm)) {
                  regenMut.mutate();
                }
              }}
              disabled={regenMut.isPending}
              className="btn-secondary text-sm gap-2"
            >
              <RefreshCw size={16} className={regenMut.isPending ? "animate-spin" : ""} />
               {copy.regenerateBarcode}
            </button>
          </div>

          {/* ── Apple Wallet section ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            {/* Pass preview */}
            <div
              className="rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{ background: "linear-gradient(135deg, #1c1c1e 0%, #2d2d2f 100%)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div>
                   <p className="text-white/40 text-[9px] uppercase tracking-[0.15em]">{copy.cardLabel}</p>
                   <p className="text-white font-bold text-sm">{copy.companyBrand}</p>
                </div>
                <OfoqLogo className="w-16 h-11" />
              </div>

              {/* Employee info */}
              <div className="px-4 pb-3 flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#33B27C]/40 flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#33B27C]/20 flex items-center justify-center text-2xl text-[#33B27C] font-bold flex-shrink-0">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white font-bold truncate">{displayName}</p>
                  <p className="text-[#33B27C] text-xs">{position}</p>
                  {department && <p className="text-white/40 text-xs">{department}</p>}
                </div>
              </div>

              {/* QR strip */}
              <div className="bg-black/30 mx-3 mb-3 rounded-xl p-3 flex items-center gap-3">
                {qrCode ? (
                  <img src={qrCode} alt="QR" className="w-12 h-12 rounded-lg bg-white p-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <QrCode size={22} className="text-white/30" />
                  </div>
                )}
                <div className="min-w-0">
                   <p className="text-white/40 text-[9px] uppercase tracking-wider">{copy.employeeCode}</p>
                  <p className="text-white font-mono text-sm font-bold tracking-widest truncate">{code}</p>
                </div>
              </div>
            </div>

            {/* Add to Wallet button */}
            <button
              onClick={() => downloadWalletPass(setWalletLoading)}
              disabled={walletLoading}
              className="w-full flex items-center justify-center gap-2.5 bg-black text-white rounded-2xl py-3.5 px-6 font-semibold text-sm hover:bg-gray-900 active:scale-[0.98] transition-all shadow-xl disabled:opacity-60"
            >
              {walletLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                /* Apple icon */
                <svg width="18" height="22" viewBox="0 0 814 1000" fill="white" aria-hidden>
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-109.1c-52-77.3-103.6-203.1-103.6-323.3c0-197 135.5-306.4 269-306.4 61.5 0 112.9 40.8 150.1 40.8 35.5 0 91.5-41.5 161.1-41.5 28.7 0 108.2 2.7 165.9 67.5zm-137.5-219.5c30.7-36.5 52.2-87.5 52.2-138.5 0-7.1-.6-14.3-1.9-20.1-49.9 1.9-109.5 33.3-145.8 75.8-28.1 32.4-55.1 83.4-55.1 135.1 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 44.5 0 102.5-29.9 135.1-71.7z"/>
                </svg>
              )}
              <span>
                {walletLoading
                   ? copy.generating
                  : isIOS
                   ? copy.addToWallet
                  : isAndroid
                   ? copy.walletDownload
                   : copy.walletDownload}
              </span>
            </button>

            {/* Platform note */}
            <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
              {isIOS ? (
                 <><CheckCircle size={12} className="text-emerald-500" /> {copy.platformNoteIos}</>
              ) : (
                 <><AlertCircle size={12} /> {copy.platformNoteOther}</>
              )}
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
