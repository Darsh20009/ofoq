import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/* ─────────────────────────────────────────────────────────────────────────
   OFOQ SPLASH SCREEN — يظهر مرة واحدة عند فتح التطبيق
   الأنيميشن:
     0–50ms    الخلفية تظهر
     50ms      اللوجو المفرّغ يبدأ الانزلاق من اليمين
     50–650ms  اللوجو ينزلق إلى المركز (easeOut)
     500ms     اسم "أفق" يبدأ بالظهور تدريجياً
     500–850ms الاسم يظهر كاملاً
     900ms     يبدأ التلاشي
     1400ms    يُزال من DOM
───────────────────────────────────────────────────────────────────────── */

const LOGO_SVG = `<svg width="120" height="84" viewBox="0 0 210 148" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="5" width="58" height="90" rx="11" stroke="white" stroke-width="9" fill="none"/>
  <line x1="73" y1="10" x2="73" y2="90" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <line x1="73" y1="10" x2="125" y2="10" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <line x1="73" y1="47" x2="112" y2="47" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <rect x="72" y="103" width="26" height="38" rx="6" stroke="white" stroke-width="5.5" fill="none"/>
  <rect x="102" y="103" width="26" height="38" rx="6" stroke="white" stroke-width="5.5" fill="none"/>
  <rect x="116" y="130" width="6.5" height="20" rx="2.5" fill="#C13229" transform="rotate(-45 119.25 140)"/>
</svg>`;

// بناء عنصر السبلاش
const splash = document.createElement("div");
splash.id = "splash-screen";
Object.assign(splash.style, {
  position: "fixed",
  inset: "0",
  zIndex: "9999",
  background: "#1C2B6E",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  transition: "opacity 0.5s ease",
});

// الحاوية الداخلية (لوجو + اسم جنباً لجنب)
const inner = document.createElement("div");
Object.assign(inner.style, {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  transform: "translateX(140px)",
  opacity: "0",
  transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease",
});

// اللوجو
const logoEl = document.createElement("div");
logoEl.innerHTML = LOGO_SVG;

// النص
const nameEl = document.createElement("div");
nameEl.style.cssText = `font-family: Cairo, Tajawal, sans-serif; opacity: 0; transition: opacity 0.45s ease; transform: translateX(18px);`;
nameEl.innerHTML = `
  <p style="color:white;font-size:clamp(18px,2.8vw,24px);font-weight:700;margin:0;line-height:1.2;">أفق لحلول الأعمال</p>
  <p style="color:rgba(255,255,255,0.38);font-size:clamp(9px,1.1vw,11px);letter-spacing:0.22em;margin:6px 0 0;text-transform:uppercase;">OFOQ FOR BUSINESS SOLUTIONS</p>
`;

// خط ديكوري سفلي
const bar = document.createElement("div");
Object.assign(bar.style, {
  position: "absolute",
  bottom: "0",
  left: "0",
  height: "2px",
  width: "0%",
  background: "linear-gradient(to right, transparent, #C13229, rgba(229,254,4,0.6), transparent)",
  transition: "width 1.1s ease-in-out",
});

inner.appendChild(logoEl);
inner.appendChild(nameEl);
splash.appendChild(inner);
splash.appendChild(bar);
document.body.prepend(splash);

// Phase 1: اللوجو ينزلق للمركز
setTimeout(() => {
  inner.style.transform = "translateX(0)";
  inner.style.opacity = "1";
  bar.style.width = "100%";
}, 50);

// Phase 2: الاسم يظهر
setTimeout(() => {
  nameEl.style.opacity = "1";
  nameEl.style.transform = "translateX(0)";
}, 460);

// Phase 3: التلاشي والإزالة
setTimeout(() => {
  splash.style.opacity = "0";
  setTimeout(() => splash.remove(), 500);
}, 950);

/* ── React Mount ─────────────────────────────── */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: "Cairo, Tajawal, sans-serif",
                fontSize: "14px",
                direction: "rtl",
              },
              success: { style: { background: "#33B27C", color: "#fff" } },
              error:   { style: { background: "#EF4444", color: "#fff" } },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Register service worker (production only)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register("/sw.js").catch(console.error);
}
