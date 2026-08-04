import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";
import { LANGS, extraLangs, deepMerge, type LangCode } from "./extraLangs";

export type Lang = LangCode;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void; // legacy: cycles ar <-> en
  t: typeof translations.ar;
  dir: "rtl" | "ltr";
  langs: typeof LANGS;
}

const LangContext = createContext<LangCtx>({
  lang: "ar",
  setLang: () => {},
  toggleLang: () => {},
  t: translations.ar,
  dir: "rtl",
  langs: LANGS,
});

const RTL: Lang[] = ["ar", "ur"];
const VALID = LANGS.map((l) => l.code) as readonly string[];

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("ofoq_lang");
    return (saved && VALID.includes(saved) ? saved : "ar") as Lang;
  });

  const dir: "rtl" | "ltr" = RTL.includes(lang) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    localStorage.setItem("ofoq_lang", lang);
    document.documentElement.style.fontFamily =
      dir === "rtl"
        ? "'Cairo', 'Tajawal', sans-serif"
        : "'Cairo', 'Segoe UI', 'Helvetica Neue', sans-serif";
  }, [lang, dir]);

  const t = useMemo(() => {
    if (lang === "ar") return translations.ar;
    if (lang === "en") return translations.en as typeof translations.ar;
    // Other languages: English pack + partial overrides
    return deepMerge(translations.en as typeof translations.ar, extraLangs[lang]);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, dir, langs: LANGS }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
