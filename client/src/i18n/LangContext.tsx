import { createContext, useContext, useEffect, useState } from "react";
import { translations, type Lang } from "./translations";

interface LangCtx {
  lang: Lang;
  toggleLang: () => void;
  t: typeof translations.ar;
  dir: "rtl" | "ltr";
}

const LangContext = createContext<LangCtx>({
  lang: "ar",
  toggleLang: () => {},
  t: translations.ar,
  dir: "rtl",
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("ofoq_lang") as Lang) || "ar";
  });

  useEffect(() => {
    document.documentElement.dir  = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("ofoq_lang", lang);
    // Cairo works well for both; keep the font stack consistent
    document.documentElement.style.fontFamily =
      lang === "ar"
        ? "'Cairo', 'Tajawal', sans-serif"
        : "'Cairo', 'Segoe UI', 'Helvetica Neue', sans-serif";
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  const t = translations[lang];
  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
