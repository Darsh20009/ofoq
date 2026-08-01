/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── OFOQ Royal Navy Blue (corrected from purple) ── */
        navy: {
          DEFAULT: "#1C2B6E",
          50:  "#F0F2FA",
          100: "#D5DCF4",
          200: "#ABBAE9",
          300: "#8197DE",
          400: "#5774C8",
          500: "#3A57B4",
          600: "#2D4499",
          700: "#1C2B6E",
          800: "#141F52",
          900: "#0C1338",
          950: "#060919",
        },
        /* ── Brand tokens ─────────────────────────────────── */
        ofoq: {
          navy:        "#1C2B6E",   /* primary brand navy — royal blue */
          red:         "#C13229",   /* brand red from "F" in logo */
          "red-dark":  "#9B2820",
          "red-light": "#FDECEA",
          yellow:      "#E5FE04",   /* accent yellow */
          "navy-light":"#2A3F8A",
          "navy-dark": "#0C1338",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "Tajawal", "sans-serif"],
        sans:   ["Cairo", "Inter",   "sans-serif"],
      },
      animation: {
        "fade-in":       "fadeIn 0.5s ease-in-out",
        "slide-up":      "slideUp 0.4s ease-out",
        "slide-in-right":"slideInRight 0.3s ease-out",
        "pulse-slow":    "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:       { "0%": { opacity:"0" }, "100%": { opacity:"1" } },
        slideUp:      { "0%": { transform:"translateY(20px)", opacity:"0" }, "100%": { transform:"translateY(0)", opacity:"1" } },
        slideInRight: { "0%": { transform:"translateX(100%)", opacity:"0" }, "100%": { transform:"translateX(0)", opacity:"1" } },
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(135deg, #1C2B6E 0%, #0C1338 100%)",
        "red-gradient":  "linear-gradient(135deg, #C13229 0%, #9B2820 100%)",
        "hero-gradient": "linear-gradient(135deg, #1C2B6E 0%, #2A3F8A 45%, #1C2B6E 100%)",
      },
      boxShadow: {
        "ofoq":        "0 4px 24px rgba(28,43,110,0.18)",
        "ofoq-red":    "0 4px 24px rgba(193,50,41,0.30)",
        "ofoq-yellow": "0 4px 24px rgba(229,254,4,0.35)",
        "card":        "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
