/* ── WireframeCube — ديكور مكعب ثلاثي الأبعاد مستوحى من تصميم تسامي ─── */
export default function WireframeCube({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* الوجه الأمامي */}
      <rect x="0" y="52" width="128" height="90" stroke={color} strokeWidth="1.4" />
      {/* الوجه العلوي */}
      <path d="M0 52 L64 8 L192 8 L128 52 Z" stroke={color} strokeWidth="1.4" fill="none" />
      {/* الوجه الجانبي */}
      <path d="M128 52 L192 8 L192 98 L128 142 Z" stroke={color} strokeWidth="1.4" fill="none" />
      {/* خطوط داخلية أمامية */}
      <line x1="64" y1="8" x2="64" y2="98" stroke={color} strokeWidth="0.7" opacity="0.45" />
      <line x1="0" y1="97" x2="128" y2="97" stroke={color} strokeWidth="0.7" opacity="0.45" />
      {/* خط عمودي جانبي */}
      <line x1="192" y1="52" x2="192" y2="98" stroke={color} strokeWidth="0.7" opacity="0.45" />
    </svg>
  );
}
