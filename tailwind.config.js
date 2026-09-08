/** @type {import('tailwindcss').Config} */
export default {
  content: ["./client/index.html", "./client/src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── OFOQ deep violet ────────────────────────────── */
        navy: {
          DEFAULT: "#2B273F",
          50:  "#F6F4F8",
          100: "#ECE8F1",
          200: "#D8D0E3",
          300: "#BAAEC9",
          400: "#9383A8",
          500: "#716284",
          600: "#554863",
          700: "#2B273F",
          800: "#231F35",
          900: "#1A1728",
          950: "#0E0C16",
        },
        /* ── Brand tokens ─────────────────────────────────── */
        ofoq: {
          navy:        "#2B273F",   /* primary brand deep navy-purple */
          "navy-alt":  "#3B3555",
          red:         "#C13229",   /* brand red from "F" in logo */
          "red-dark":  "#9B2820",
          "red-light": "#FDECEA",
          yellow:      "#E5FE04",   /* accent neon yellow */
          green:       "#33B27C",   /* brand green */
          "green-dark":"#267A57",
          "green-light":"#E6F7F1",
          "navy-light":"#3A3558",
          "navy-dark": "#1A1730",
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
        "navy-gradient": "linear-gradient(135deg, #2B273F 0%, #1A1728 100%)",
        "red-gradient":  "linear-gradient(135deg, #C13229 0%, #9B2820 100%)",
        "hero-gradient": "linear-gradient(135deg, #2B273F 0%, #3A3558 45%, #1A1728 100%)",
      },
      boxShadow: {
        "ofoq":        "0 12px 36px rgba(43,39,63,0.14)",
        "ofoq-red":    "0 4px 24px rgba(193,50,41,0.30)",
        "ofoq-yellow": "0 4px 24px rgba(229,254,4,0.35)",
        "card":        "0 1px 2px rgba(43,39,63,0.04), 0 12px 30px rgba(43,39,63,0.07)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
