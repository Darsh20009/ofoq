import PhoneInputLibrary from "react-phone-number-input";
import type { Country, Labels } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import enLabels from "react-phone-number-input/locale/en.json";
import { useLang } from "../../i18n/LangContext";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * International phone field used across public forms and the portals.
 * The library provides the complete ISO country list and E.164 formatting.
 * `value` is therefore stored as a normalized international number.
 */
export default function PhoneInput({
  value = "",
  onChange,
  onBlur,
  required,
  disabled,
  placeholder,
  className = "input-field",
}: PhoneInputProps) {
  const { lang } = useLang();
  const locale = lang === "ar" ? "ar" : lang === "de" ? "de" : lang === "es" ? "es" : "en";
  const regionNames = typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames([locale], { type: "region" })
    : null;

  const labels: Labels = {
    ...(enLabels as Labels),
    country: locale === "ar" ? "الدولة" : locale === "de" ? "Land" : locale === "es" ? "País" : "Country",
    phone: locale === "ar" ? "رقم الهاتف" : locale === "de" ? "Telefonnummer" : locale === "es" ? "Número de teléfono" : "Phone number",
  };
  const isDark = className.includes("bg-white/[0.04]") || className.includes("text-white");
  const hasError = className.includes("border-red");

  // The package renders every country automatically. Replace its English
  // country labels with the active language where the browser supports it.
  for (const country of Object.keys(labels)) {
    if (country.length === 2 && regionNames) {
      try {
        labels[country as Country] = regionNames.of(country) || labels[country as Country];
      } catch {
        // Keep the package's English label for an uncommon/unsupported region.
      }
    }
  }

  return (
    <PhoneInputLibrary
      international
      defaultCountry="SA"
      countryCallingCodeEditable={false}
      flags={flags}
      value={value || undefined}
      onChange={(next) => onChange(next || "")}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      placeholder={placeholder || undefined}
      className={`ofoq-phone-input ${isDark ? "ofoq-phone-input-dark" : ""} ${hasError ? "ofoq-phone-input-error" : ""}`}
      labels={labels}
    />
  );
}