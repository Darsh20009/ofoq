import { useEffect, useRef, useState } from "react";
import imgAramco from './images/ofoq-aramco-hq.png';
import imgKafd from './images/ofoq-kafd-towers.png';
import imgBrand from './images/ofoq-brand.png';
import imgTower from './images/ofoq-tower-close.png';
import imgDusk from './images/ofoq-buildings-dusk.png';

/* ── Animated Counter ─────────────────────────── */
function Counter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start: number | null = null;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.floor(ease * to));
        if (p < 1) requestAnimationFrame(step);
        else setVal(to);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Fade-in on scroll ────────────────────────── */
function FadeIn({ children, delay = 0, dir = "up" }: { children: React.ReactNode; delay?: number; dir?: "up"|"left"|"right"|"none" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const tx = dir === "left" ? "-40px" : dir === "right" ? "40px" : "0px";
  const ty = dir === "up" ? "40px" : "0px";
  return (
    <div ref={ref} style={{
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      opacity: vis ? 1 : 0,
      transform: vis ? "translate(0,0)" : `translate(${tx},${ty})`,
    }}>
      {children}
    </div>
  );
}

/* ── Parallax Hero Image ──────────────────────── */
function ParallaxHero({ src }: { src: string }) {
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const scrolled = window.scrollY;
      ref.current.style.transform = `scale(1.12) translateY(${scrolled * 0.22}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <img ref={ref} src={src} alt="hero"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.12)", transformOrigin: "center top", willChange: "transform" }}
    />
  );
}

/* ── Floating particle ────────────────────────── */
function Particles() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 3 === 0 ? "3px" : "2px",
          height: i % 3 === 0 ? "3px" : "2px",
          borderRadius: "50%",
          background: i % 4 === 0 ? "#E63329" : "rgba(255,255,255,0.35)",
          left: `${(i * 23 + 7) % 100}%`,
          top: `${(i * 17 + 11) % 100}%`,
          animation: `float-${i % 3} ${4 + (i % 3) * 2}s ease-in-out infinite`,
          animationDelay: `${(i * 0.4) % 3}s`,
        }} />
      ))}
      <style>{`
        @keyframes float-0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes float-1 { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-12px) translateX(8px)} }
        @keyframes float-2 { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-22px) rotate(45deg)} }
      `}</style>
    </div>
  );
}

/* ── Glowing line animation ───────────────────── */
function GlowLine() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, transparent 0%, #E63329 30%, #ff9a94 50%, #E63329 70%, transparent 100%)",
        animation: "glow-slide 2.5s linear infinite",
      }} />
      <style>{`@keyframes glow-slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  );
}

export default function ClikClakDuskMix() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", background: "#0a0f1e", color: "#fff", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── NAV ─────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 40 ? "rgba(10,15,30,0.95)" : "rgba(10,15,30,0.55)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid rgba(255,255,255,${scrollY > 40 ? 0.1 : 0.04})`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 68,
        transition: "background 0.4s, border-color 0.4s",
        boxShadow: scrollY > 40 ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="42" height="42" viewBox="0 0 80 80" fill="none">
            <rect x="4" y="4" width="34" height="52" rx="7" stroke="#fff" strokeWidth="5" fill="none"/>
            <text x="43" y="32" fill="#e63329" fontSize="38" fontWeight="800" fontFamily="Arial">F</text>
            <rect x="4" y="62" width="16" height="16" rx="4" stroke="#fff" strokeWidth="4" fill="none"/>
            <rect x="26" y="62" width="16" height="16" rx="4" stroke="#fff" strokeWidth="4" fill="none"/>
          </svg>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: "#fff" }}>OFOQ</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", letterSpacing: 1.5 }}>FOR BUSINESS SOLUTIONS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 36, fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: 1.5 }}>
          {["من نحن", "خدماتنا", "مشاريعنا", "تواصل معنا"].map(l => (
            <span key={l} style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{l}</span>
          ))}
        </div>
        <button style={{
          background: "#e63329", color: "#fff", border: "none",
          padding: "10px 24px", borderRadius: 6, fontSize: 12, fontWeight: 600,
          letterSpacing: 1, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
          boxShadow: "0 0 0 rgba(230,51,41,0)",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(230,51,41,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
        >احصل على عرض</button>
      </nav>

      {/* ── HERO ────────────────────────────────── */}
      <section style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
        <ParallaxHero src={imgAramco} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.35) 60%, rgba(10,15,30,0.75) 100%)",
        }}/>
        <Particles />

        {/* content */}
        <div style={{ position: "absolute", bottom: "13%", left: "7%", maxWidth: 640 }}>
          <FadeIn delay={100}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(230,51,41,0.15)", border: "1px solid rgba(230,51,41,0.4)",
              borderRadius: 30, padding: "6px 18px", marginBottom: 24,
              fontSize: 11, letterSpacing: 2, color: "#ff7a74",
              animation: "pulse-badge 3s ease-in-out infinite",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E63329", display: "inline-block", animation: "blink 1.4s ease-in-out infinite" }} />
              شريكك في النجاح
            </div>
          </FadeIn>
          <FadeIn delay={220}>
            <h1 style={{
              fontSize: "clamp(40px,6vw,72px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
            }}>
              نبني مستقبل<br/>
              <span style={{
                color: "#e63329",
                backgroundImage: "linear-gradient(135deg, #e63329 30%, #ff8a80 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>الأعمال</span> معاً
            </h1>
          </FadeIn>
          <FadeIn delay={360}>
            <p style={{ fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.72)", marginBottom: 40, maxWidth: 480 }}>
              أفق لحلول الأعمال — شريكك الاستراتيجي في تحويل رؤيتك إلى واقع. نقدم حلولاً متكاملة تواكب أعلى معايير الجودة.
            </p>
          </FadeIn>
          <FadeIn delay={480}>
            <div style={{ display: "flex", gap: 14 }}>
              <button style={{
                background: "linear-gradient(135deg,#e63329,#c62020)", color: "#fff", border: "none",
                padding: "15px 34px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 32px rgba(230,51,41,0.4)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(230,51,41,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(230,51,41,0.4)"; }}
              >اكتشف خدماتنا ←</button>
              <button style={{
                background: "rgba(255,255,255,0.06)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                padding: "15px 34px", borderRadius: 8, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >تواصل معنا</button>
            </div>
          </FadeIn>
        </div>

        {/* stat strip */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "rgba(10,15,30,0.9)", backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex", justifyContent: "center", gap: 80, padding: "22px 48px",
        }}>
          {[
            { to: 500, suffix: "+", l: "عميل موثوق" },
            { to: 12,  suffix: "+", l: "سنة خبرة" },
            { to: 50,  suffix: "+", l: "شريك استراتيجي" },
            { to: 98,  suffix: "%", l: "رضا العملاء" },
          ].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#e63329" }}>
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <GlowLine />
        <style>{`
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
          @keyframes pulse-badge { 0%,100%{box-shadow:0 0 0 rgba(230,51,41,0)} 50%{box-shadow:0 0 16px rgba(230,51,41,0.3)} }
        `}</style>
      </section>

      {/* ── ABOUT / BRAND ───────────────────────── */}
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "70vh" }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={imgBrand} alt="OFOQ Brand" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", transition: "transform 0.6s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,15,30,0) 55%, #0a0f1e 100%)" }}/>
        </div>
        <div style={{ background: "#0d1326", display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 64px" }}>
          <FadeIn dir="right">
            <div style={{ width: 40, height: 3, background: "linear-gradient(90deg,#e63329,#ff8a80)", marginBottom: 28, borderRadius: 2 }}/>
            <h2 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px" }}>
              هوية راسخة<br/>
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, fontSize: 30 }}>في سوق الأعمال</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 15, lineHeight: 1.9, marginBottom: 36 }}>
              منذ أكثر من عقد، نقود أفق لحلول الأعمال مسيرة التميز في تقديم خدمات احترافية متكاملة تشمل الاستشارات الإدارية، التحول الرقمي، والحلول التقنية المبتكرة.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { t: "الاستشارات الإدارية", i: "◈" },
                { t: "التحول الرقمي",       i: "◉" },
                { t: "الحلول التقنية",      i: "◎" },
                { t: "تطوير الأعمال",       i: "◆" },
              ].map((f, idx) => (
                <div key={f.t} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "16px 18px", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.25s", cursor: "default",
                  animation: `slide-in-card 0.5s ease ${idx * 100}ms both`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,51,41,0.08)"; e.currentTarget.style.borderColor = "rgba(230,51,41,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "none"; }}
                >
                  <span style={{ color: "#e63329", fontSize: 20 }}>{f.i}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.80)" }}>{f.t}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PROJECTS MOSAIC ─────────────────────── */}
      <section style={{ background: "#060a16", padding: "100px 60px" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#e63329", marginBottom: 14 }}>مشاريعنا</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: 0 }}>بصمتنا في المملكة</h2>
            <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 15, marginTop: 12 }}>
              نفخر بشراكاتنا مع كبرى المؤسسات في المشهد الاقتصادي السعودي
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "340px 280px", gap: 14 }}>
          {/* large left */}
          <FadeIn dir="left" delay={100}>
            <div style={{ gridRow: "1 / 3", position: "relative", borderRadius: 20, overflow: "hidden", height: "100%", cursor: "pointer" }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1)"; }}
            >
              <img src={imgKafd} alt="KAFD" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,30,0.92) 0%, rgba(10,15,30,0.1) 55%)" }}/>
              <div style={{ position: "absolute", bottom: 28, left: 28 }}>
                <div style={{ background: "#e63329", borderRadius: 4, padding: "4px 12px", fontSize: 10, letterSpacing: 2, marginBottom: 10, display: "inline-block" }}>قطاع الأعمال</div>
                <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>مركز الملك عبدالله المالي</h3>
                <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 13 }}>الرياض، المملكة العربية السعودية</p>
              </div>
            </div>
          </FadeIn>

          {/* top right */}
          <FadeIn dir="right" delay={200}>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1)"; }}
            >
              <img src={imgTower} alt="Tower" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "transform 0.6s ease" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,30,0.88) 0%, transparent 55%)" }}/>
              <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>أبراج الرياض</h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>التطوير العمراني</p>
              </div>
            </div>
          </FadeIn>

          {/* bottom right */}
          <FadeIn dir="right" delay={320}>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1.06)"; }}
              onMouseLeave={e => { const img = e.currentTarget.querySelector("img") as HTMLImageElement; if (img) img.style.transform = "scale(1)"; }}
            >
              <img src={imgDusk} alt="Buildings dusk" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s ease" }}/>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,30,0.88) 0%, transparent 55%)" }}/>
              <div style={{ position: "absolute", bottom: 20, left: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>الحي الدبلوماسي</h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>الرياض الكبرى</p>
              </div>
            </div>
          </FadeIn>
        </div>
        <style>{`@keyframes slide-in-card { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }`}</style>
      </section>

      {/* ── SERVICES ────────────────────────────── */}
      <section style={{ background: "#0d1326", padding: "100px 60px" }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p style={{ fontSize: 11, letterSpacing: 3, color: "#e63329", marginBottom: 14 }}>ما نقدمه</p>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: 0 }}>خدماتنا المتكاملة</h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {[
            { icon: "⬡", title: "الاستشارات الاستراتيجية", desc: "نضع معك خارطة طريق واضحة لتحقيق أهدافك التجارية بكفاءة عالية وعائد استثمار مثالي.", featured: false },
            { icon: "◈", title: "التحول الرقمي",           desc: "نحول عملياتك التقليدية إلى منظومة رقمية ذكية تواكب متطلبات السوق وتتفوق على المنافسين.", featured: true },
            { icon: "◉", title: "إدارة المشاريع",          desc: "فريق متخصص يقود مشاريعك من الفكرة حتى التسليم بأعلى معايير الجودة وفي الوقت المحدد.", featured: false },
            { icon: "◆", title: "الحلول التقنية",          desc: "نطور حلولاً برمجية مخصصة تنسجم مع طبيعة أعمالك وتعزز إنتاجية فريقك.", featured: false },
            { icon: "◎", title: "تطوير الموارد البشرية",   desc: "برامج تدريبية احترافية لرفع كفاءة كادرك البشري وتأهيله لمتطلبات المستقبل.", featured: false },
            { icon: "▣", title: "التسويق الرقمي",          desc: "استراتيجيات تسويقية متكاملة تضع علامتك التجارية في مقدمة المشهد الرقمي.", featured: false },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 80} dir="up">
              <div style={{
                background: s.featured ? "linear-gradient(135deg,#e63329,#c01c14)" : "rgba(255,255,255,0.04)",
                border: s.featured ? "none" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "36px 30px", height: "100%",
                transition: "all 0.3s", cursor: "default",
                boxShadow: s.featured ? "0 16px 48px rgba(230,51,41,0.3)" : "none",
              }}
                onMouseEnter={e => {
                  if (!s.featured) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)"; }
                  else { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 24px 56px rgba(230,51,41,0.45)"; }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = s.featured ? "linear-gradient(135deg,#e63329,#c01c14)" : "rgba(255,255,255,0.04)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = s.featured ? "0 16px 48px rgba(230,51,41,0.3)" : "none";
                }}
              >
                <div style={{ fontSize: 30, marginBottom: 18 }}>{s.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.85, color: s.featured ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.50)", margin: 0 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FULL-BLEED CTA ──────────────────────── */}
      <section style={{ position: "relative", height: 440, overflow: "hidden" }}>
        <img src={imgAramco} alt="CTA bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%", filter: "brightness(0.30) saturate(1.3)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(10,15,30,0.85) 0%, rgba(230,51,41,0.22) 100%)" }}/>
        {/* animated rings */}
        {[1,2,3].map(i => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: `${i * 180}px`, height: `${i * 180}px`,
            border: `1px solid rgba(230,51,41,${0.15 / i})`,
            borderRadius: "50%", transform: "translate(-50%,-50%)",
            animation: `ring-pulse ${2 + i * 0.5}s ease-in-out infinite`,
          }}/>
        ))}
        <style>{`@keyframes ring-pulse { 0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)} }`}</style>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 40px" }}>
          <FadeIn>
            <h2 style={{ fontSize: 46, fontWeight: 800, margin: "0 0 16px", maxWidth: 700, textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
              جاهز للانطلاق نحو الأفق؟
            </h2>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 16, marginBottom: 36, maxWidth: 520 }}>
              تواصل مع فريقنا اليوم واحصل على استشارة مجانية تفتح لك آفاق جديدة
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
              <button style={{
                background: "linear-gradient(135deg,#e63329,#c01c14)", color: "#fff", border: "none",
                padding: "16px 40px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 32px rgba(230,51,41,0.5)", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(230,51,41,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(230,51,41,0.5)"; }}
              >احصل على استشارة مجانية</button>
              <button style={{
                background: "rgba(255,255,255,0.08)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)",
                padding: "16px 40px", borderRadius: 8, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              >اعرف المزيد</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer style={{ background: "#060a16", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "60px 60px 36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
                <rect x="4" y="4" width="34" height="52" rx="7" stroke="#fff" strokeWidth="5" fill="none"/>
                <text x="43" y="32" fill="#e63329" fontSize="38" fontWeight="800" fontFamily="Arial">F</text>
                <rect x="4" y="62" width="16" height="16" rx="4" stroke="#fff" strokeWidth="4" fill="none"/>
                <rect x="26" y="62" width="16" height="16" rx="4" stroke="#fff" strokeWidth="4" fill="none"/>
              </svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>OFOQ</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: 1.5 }}>FOR BUSINESS SOLUTIONS</div>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.42)", fontSize: 13, lineHeight: 1.8, maxWidth: 280 }}>
              شريكك الاستراتيجي في تحقيق النمو والتطور المستدام عبر حلول أعمال مبتكرة ومتكاملة.
            </p>
          </div>
          {[
            { title: "الشركة",  links: ["من نحن","رؤيتنا","فريقنا","المسيرة"] },
            { title: "الخدمات", links: ["الاستشارات","التحول الرقمي","إدارة المشاريع","التدريب"] },
            { title: "تواصل",   links: ["اتصل بنا","الشراكات","العمل معنا","الأخبار"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.85)", marginBottom: 18 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 11, cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
                >{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>© 2025 أفق لحلول الأعمال. جميع الحقوق محفوظة.</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>صُنع بواسطة Qirox Studio Group</span>
        </div>
      </footer>
    </div>
  );
}
