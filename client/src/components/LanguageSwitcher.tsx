import { Languages } from "lucide-react";
import { useLang } from "../i18n/LangContext";

interface Props {
  dark?: boolean;
  compact?: boolean;
}

export default function LanguageSwitcher({ dark = false, compact = false }: Props) {
  const { lang, setLang, langs } = useLang();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
        dark
          ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
      }`}
      title={lang === "ar" ? "اختيار اللغة" : "Choose language"}
    >
      <Languages size={16} className={dark ? "text-white/75" : "text-gray-400"} />
      {!compact && (
        <span className="hidden sm:inline text-xs font-semibold">
          {lang === "ar" ? "اللغة" : "Language"}
        </span>
      )}
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value as typeof lang)}
        aria-label={lang === "ar" ? "اختيار اللغة" : "Choose language"}
        className={`cursor-pointer border-0 bg-transparent text-xs font-bold outline-none ${
          dark ? "text-white [&>option]:text-gray-900" : "text-gray-700"
        }`}
      >
        {langs.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}