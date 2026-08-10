import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";
import { LANGS, extraLangs, deepMerge, type LangCode } from "./extraLangs";
import { getUiCopy, type UiCopy } from "./ui";

export type Lang = LangCode;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: typeof translations.ar;
  dir: "rtl" | "ltr";
  langs: typeof LANGS;
  ui: UiCopy;
}

const LangContext = createContext<LangCtx>({
  lang: "ar",
  setLang: () => {},
  toggleLang: () => {},
  t: translations.ar,
  dir: "rtl",
  langs: LANGS,
  ui: getUiCopy("ar"),
});

const RTL: Lang[] = ["ar", "ur"];
const VALID = LANGS.map((l) => l.code) as readonly string[];

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("ofoq_lang");
    return (saved && VALID.includes(saved) ? saved : "ar") as Lang;
  });

  // DB-stored content overrides (loaded once, shared across all languages)
  const [siteContent, setSiteContent] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/cms/site-content")
      .then((r) => r.json())
      .then((d) => { if (d?.data?.content) setSiteContent(d.data.content); })
      .catch(() => {});
  }, []);

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
    return deepMerge(translations.en as typeof translations.ar, extraLangs[lang]);
  }, [lang]);

  const ui = useMemo(() => {
    const base = getUiCopy(lang);
    const patch = siteContent[lang];
    if (!patch || typeof patch !== "object") return base;
    // Deep-merge DB content over the static default
    return deepMerge(base as any, patch) as UiCopy;
  }, [lang, siteContent]);

  const toggleLang = () => setLang((current) => {
    const index = LANGS.findIndex((item) => item.code === current);
    return LANGS[(index + 1) % LANGS.length].code;
  });

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, dir, langs: LANGS, ui }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
