import { useMemo } from "react";

export const PHONE_COUNTRY_CODES = [
  { code: "+966", label: "السعودية +966" },
  { code: "+971", label: "الإمارات +971" },
  { code: "+965", label: "الكويت +965" },
  { code: "+974", label: "قطر +974" },
  { code: "+973", label: "البحرين +973" },
  { code: "+968", label: "عُمان +968" },
  { code: "+20", label: "مصر +20" },
  { code: "+962", label: "الأردن +962" },
  { code: "+92", label: "باكستان +92" },
  { code: "+91", label: "الهند +91" },
  { code: "+880", label: "بنغلاديش +880" },
  { code: "+44", label: "المملكة المتحدة +44" },
  { code: "+1", label: "الولايات المتحدة +1" },
];

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  selectClassName?: string;
}

/**
 * Keeps phone numbers in one predictable international format.
 * The country code is always present; Saudi Arabia is the default.
 */
export default function PhoneInput({
  value = "",
  onChange,
  onBlur,
  required,
  disabled,
  placeholder = "5X XXX XXXX",
  className = "input-field",
  selectClassName = "input-field",
}: PhoneInputProps) {
  const { countryCode, localNumber } = useMemo(() => {
    const match = PHONE_COUNTRY_CODES
      .slice()
      .sort((a, b) => b.code.length - a.code.length)
      .find(({ code }) => value.trim().startsWith(code));

    if (!match) return { countryCode: "+966", localNumber: value.replace(/^\+/, "") };
    return {
      countryCode: match.code,
      localNumber: value.trim().slice(match.code.length).trim(),
    };
  }, [value]);

  const update = (nextCode: string, nextLocal: string) => {
    onChange(nextLocal.trim() ? `${nextCode} ${nextLocal.trim()}` : nextCode);
  };

  return (
    <div className="flex gap-2" dir="ltr">
      <select
        value={countryCode}
        onChange={(event) => update(event.target.value, localNumber)}
        disabled={disabled}
        aria-label="Country code"
        className={`${selectClassName} w-[8.5rem] shrink-0`}
      >
        {PHONE_COUNTRY_CODES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
      <input
        type="tel"
        value={localNumber}
        onChange={(event) => update(countryCode, event.target.value.replace(/[^\d\s()-]/g, ""))}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`${className} min-w-0 flex-1`}
        inputMode="tel"
      />
    </div>
  );
}