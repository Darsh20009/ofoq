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
 * A single phone field that accepts local or international numbers.
 * Existing saved values are kept intact instead of being split into a country selector.
 */
export default function PhoneInput({
  value = "",
  onChange,
  onBlur,
  required,
  disabled,
  placeholder = "5X XXX XXXX",
  className = "input-field",
}: PhoneInputProps) {
  return (
    <input
      type="tel"
      dir="ltr"
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d\s()+-]/g, ""))}
      onBlur={onBlur}
      required={required}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      inputMode="tel"
    />
  );
}