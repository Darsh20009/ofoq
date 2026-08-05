interface Props {
  className?: string;
  /** true = render marks in navy (for light backgrounds) */
  dark?: boolean;
}

/**
 * Accurate OFOQ brand logo SVG:
 * - Big tall "O" (portrait rectangle, white outline) on the left
 * - Big "F" in brand red to the right of O
 * - Small "OQ" below right (same portrait-rect style)
 * - Small diagonal cursor element on the Q
 */
export default function OfoqLogo({ className = "w-28 h-20", dark = false }: Props) {
  const mark = dark ? "#2B273F" : "#FFFFFF";
  const red = "#C13229";

  return (
    <svg
      className={className}
      viewBox="0 0 210 148"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OFOQ لحلول الأعمال"
      focusable="false"
    >
      {/* ── Big O: tall portrait rounded rectangle ─────── */}
      <rect x="6" y="5" width="58" height="90" rx="11" stroke={mark} strokeWidth="9" fill="none" />

      {/* ── Big F: bold red, right of O ─────────────────── */}
      {/* vertical stroke */}
      <line x1="73" y1="10" x2="73" y2="90" stroke={red} strokeWidth="11" strokeLinecap="square" />
      {/* top horizontal bar */}
      <line x1="73" y1="10" x2="125" y2="10" stroke={red} strokeWidth="11" strokeLinecap="square" />
      {/* middle horizontal bar (shorter) */}
      <line x1="73" y1="47" x2="112" y2="47" stroke={red} strokeWidth="11" strokeLinecap="square" />

      {/* ── Small "o" — portrait rect below F ───────────── */}
      <rect x="72" y="103" width="26" height="38" rx="6" stroke={mark} strokeWidth="5.5" fill="none" />

      {/* ── Small "Q" — portrait rect with cursor ────────── */}
      <rect x="102" y="103" width="26" height="38" rx="6" stroke={mark} strokeWidth="5.5" fill="none" />

      {/* Q cursor: diagonal filled bar at bottom-right, red */}
      <rect
        x="116"
        y="130"
        width="6.5"
        height="20"
        rx="2.5"
        fill={red}
        transform="rotate(-45 119.25 140)"
      />
    </svg>
  );
}
