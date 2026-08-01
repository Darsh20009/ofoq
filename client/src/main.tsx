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

/* ─────────────────────────────────────────────────────────
   OFOQ Cinematic Splash Screen
   Timeline:
     0ms        Navy BG appears
     50ms       Logo fades in
     600ms      White line begins sweeping left → right
     600→1500ms Line sweeps (eased), logo hides, name reveals
     1500ms     Hold name
     1900ms     Fade out
     2400ms     Remove from DOM
───────────────────────────────────────────────────────── */

const LOGO_SVG = `<svg width="180" height="124" viewBox="0 0 210 148" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="5" width="58" height="90" rx="11" stroke="white" stroke-width="9" fill="none"/>
  <line x1="73" y1="10" x2="73" y2="90" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <line x1="73" y1="10" x2="125" y2="10" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <line x1="73" y1="47" x2="112" y2="47" stroke="#C13229" stroke-width="11" stroke-linecap="square"/>
  <rect x="72" y="103" width="26" height="38" rx="6" stroke="white" stroke-width="5.5" fill="none"/>
  <rect x="102" y="103" width="26" height="38" rx="6" stroke="white" stroke-width="5.5" fill="none"/>
  <rect x="116" y="130" width="6.5" height="20" rx="2.5" fill="#C13229" transform="rotate(-45 119.25 140)"/>
</svg>`;

const NAME_HTML = `
  <div style="margin-top:22px;text-align:center;font-family:'Cairo',Tajawal,sans-serif;">
    <p style="color:white;font-size:clamp(18px,3vw,26px);font-weight:700;letter-spacing:0.01em;margin:0;line-height:1.2;">أفق لحلول الأعمال</p>
    <p style="color:rgba(255,255,255,0.45);font-size:clamp(9px,1.2vw,11px);letter-spacing:0.22em;margin:8px 0 0;text-transform:uppercase;">OFOQ FOR BUSINESS SOLUTIONS</p>
  </div>`;

// Build splash DOM
const splash = document.createElement("div");
splash.id = "splash-screen";
Object.assign(splash.style, {
  position: "fixed", inset: "0", zIndex: "9999",
  background: "#1C2B6E", overflow: "hidden",
  transition: "opacity 0.5s ease",
});

// logoLayer: shows on RIGHT side of the sweeping line
const logoLayer = document.createElement("div");
Object.assign(logoLayer.style, {
  position: "absolute", inset: "0",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  opacity: "0", transition: "opacity 0.4s ease",
});
logoLayer.innerHTML = LOGO_SVG;

// nameLayer: shows on LEFT side of the sweeping line (logo + Arabic name)
const nameLayer = document.createElement("div");
Object.assign(nameLayer.style, {
  position: "absolute", inset: "0",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  clipPath: "inset(0 100% 0 0)",      // fully hidden initially
});
nameLayer.innerHTML = LOGO_SVG + NAME_HTML;

// Sweep line (glowing white vertical bar)
const sweepLine = document.createElement("div");
Object.assign(sweepLine.style, {
  position: "absolute", top: "0", bottom: "0",
  width: "3px", left: "-3px",
  background: "white",
  boxShadow: "0 0 24px rgba(255,255,255,0.9), 0 0 64px rgba(255,255,255,0.35)",
  zIndex: "1",
});

// Thin accent line behind the sweep (stays as decoration)
const accentLine = document.createElement("div");
Object.assign(accentLine.style, {
  position: "absolute", top: "50%", left: "0", right: "0",
  height: "1px", background: "rgba(255,255,255,0.06)", zIndex: "0",
});

splash.appendChild(accentLine);
splash.appendChild(logoLayer);
splash.appendChild(nameLayer);
splash.appendChild(sweepLine);
document.body.prepend(splash);

// Phase 1 – fade in logo
setTimeout(() => { logoLayer.style.opacity = "1"; }, 50);

// Phase 2 – sweep line
const SWEEP_DELAY = 600;
const SWEEP_DURATION = 900;   // ms for full sweep
const HOLD_MS = 350;          // hold before fade
const FADE_MS = 500;          // fade out duration

setTimeout(() => {
  const start = Date.now();

  function easeInOut(t: number) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function sweep() {
    const raw = Math.min((Date.now() - start) / SWEEP_DURATION, 1);
    const p = easeInOut(raw);
    const x = p * 100;

    sweepLine.style.left = `calc(${x}% - 1.5px)`;
    // Logo stays visible only to the RIGHT of line
    logoLayer.style.clipPath = `inset(0 0 0 ${x}%)`;
    // Name reveals to the LEFT of line
    nameLayer.style.clipPath = `inset(0 ${100 - x}% 0 0)`;

    if (raw < 1) {
      requestAnimationFrame(sweep);
    } else {
      sweepLine.style.display = "none";
      // Phase 3 – hold, then fade out
      setTimeout(() => {
        splash.style.opacity = "0";
        setTimeout(() => splash.remove(), FADE_MS);
      }, HOLD_MS);
    }
  }

  requestAnimationFrame(sweep);
}, SWEEP_DELAY);

/* ── React Mount ────────────────────────────────────── */
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
