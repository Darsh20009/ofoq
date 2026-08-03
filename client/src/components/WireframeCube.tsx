/* ── WireframeLogo — شكل هندسي wireframe مبني من أيقونة لوجو أفق ────────
   نفس هندسة الأيقونة: المستطيل الدائري "O"، ذراعا الـ"F"، والحرفان "q q"
   مرسومة كإطار سلكي (wireframe) بعمق ثلاثي الأبعاد بسيط — للديكور فقط. */
export default function WireframeCube({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  // إزاحة العمق للإسقاط الهندسي (isometric-style extrusion)
  const dx = 26;
  const dy = -18;
  return (
    <svg
      viewBox="-6 -26 260 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ═ O — المستطيل الدائري الكبير ═ */}
      {/* الوجه الخلفي (العمق) */}
      <rect x={6 + dx} y={5 + dy} width="58" height="90" rx="11" stroke={color} strokeWidth="0.8" opacity="0.4" />
      {/* خطوط الربط بين الوجهين */}
      <line x1="6" y1="16" x2={6 + dx} y2={16 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      <line x1="64" y1="5" x2={64 + dx} y2={5 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      <line x1="64" y1="95" x2={64 + dx} y2={95 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      <line x1="6" y1="84" x2={6 + dx} y2={84 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      {/* الوجه الأمامي */}
      <rect x="6" y="5" width="58" height="90" rx="11" stroke={color} strokeWidth="1.6" />

      {/* ═ F — الذراعان ═ */}
      {/* عمق الذراع العمودية */}
      <line x1={73 + dx} y1={10 + dy} x2={73 + dx} y2={90 + dy} stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="73" y1="10" x2={73 + dx} y2={10 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      <line x1="73" y1="90" x2={73 + dx} y2={90 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      {/* الذراع العمودية */}
      <line x1="73" y1="10" x2="73" y2="90" stroke={color} strokeWidth="1.6" />
      {/* الذراع العلوية + عمقها */}
      <line x1={125 + dx} y1={10 + dy} x2={73 + dx} y2={10 + dy} stroke={color} strokeWidth="0.8" opacity="0.4" />
      <line x1="125" y1="10" x2={125 + dx} y2={10 + dy} stroke={color} strokeWidth="0.7" opacity="0.4" />
      <line x1="73" y1="10" x2="125" y2="10" stroke={color} strokeWidth="1.6" />
      {/* الذراع الوسطى */}
      <line x1="73" y1="47" x2="112" y2="47" stroke={color} strokeWidth="1.6" />
      <line x1="112" y1="47" x2={112 + dx * 0.6} y2={47 + dy * 0.6} stroke={color} strokeWidth="0.7" opacity="0.4" />

      {/* ═ q q — المستطيلان الصغيران ═ */}
      <rect x={72 + dx * 0.5} y={103 + dy * 0.5} width="26" height="38" rx="6" stroke={color} strokeWidth="0.7" opacity="0.4" />
      <rect x="72" y="103" width="26" height="38" rx="6" stroke={color} strokeWidth="1.2" />
      <rect x={102 + dx * 0.5} y={103 + dy * 0.5} width="26" height="38" rx="6" stroke={color} strokeWidth="0.7" opacity="0.4" />
      <rect x="102" y="103" width="26" height="38" rx="6" stroke={color} strokeWidth="1.2" />
      {/* ذيل الـ q */}
      <line x1="122" y1="135" x2="134" y2="147" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
