import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * PageLoader — انيميشن التنقل بين الصفحات (1 ثانية)
 * اللوجو المفرّغ يظهر من اليمين → يتحرك للمركز-اليسار
 * اسم "أفق" يظهر تدريجياً بجانب اللوجو
 */
export default function PageLoader({ onDone }: { onDone: () => void }) {
  // Keep the timer independent from parent re-renders. App creates a new
  // callback on each render, and restarting this effect can leave the loader
  // covering the page indefinitely during authentication/data updates.
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{ background: "#2B273F" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {/* الحاوية الرئيسية — تتحرك من اليمين لليسار */}
      <motion.div
        className="flex items-center gap-5"
        initial={{ x: 120, opacity: 0 }}
        animate={{ x: -20, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* اللوجو المفرّغ (outline فقط) */}
        <svg
          width="72"
          height="50"
          viewBox="0 0 210 148"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Big O */}
          <rect x="6" y="5" width="58" height="90" rx="11" stroke="rgba(255,255,255,0.9)" strokeWidth="9" fill="none" />
          {/* Big F */}
          <line x1="73" y1="10" x2="73" y2="90" stroke="#C13229" strokeWidth="11" strokeLinecap="square" />
          <line x1="73" y1="10" x2="125" y2="10" stroke="#C13229" strokeWidth="11" strokeLinecap="square" />
          <line x1="73" y1="47" x2="112" y2="47" stroke="#C13229" strokeWidth="11" strokeLinecap="square" />
          {/* Small o */}
          <rect x="72" y="103" width="26" height="38" rx="6" stroke="rgba(255,255,255,0.9)" strokeWidth="5.5" fill="none" />
          {/* Small Q with cursor */}
          <rect x="102" y="103" width="26" height="38" rx="6" stroke="rgba(255,255,255,0.9)" strokeWidth="5.5" fill="none" />
          <rect x="116" y="130" width="6.5" height="20" rx="2.5" fill="#C13229" transform="rotate(-45 119.25 140)" />
        </svg>

        {/* النص — يظهر بتأخير بعد اللوجو */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.38, duration: 0.45, ease: "easeOut" }}
          style={{ fontFamily: "Cairo, Tajawal, sans-serif" }}
        >
          <p style={{ color: "#fff", fontSize: "clamp(16px,2.5vw,22px)", fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            أفق لحلول الأعمال
          </p>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "clamp(8px,1vw,10px)", letterSpacing: "0.22em", margin: "5px 0 0", textTransform: "uppercase" }}>
            OFOQ FOR BUSINESS SOLUTIONS
          </p>
        </motion.div>
      </motion.div>

      {/* خط أفقي ديكوري */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5"
        style={{ background: "linear-gradient(to right, transparent, #C13229, rgba(229,254,4,0.6), transparent)" }}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
