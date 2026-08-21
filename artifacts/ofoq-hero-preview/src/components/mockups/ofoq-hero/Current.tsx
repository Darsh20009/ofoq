import "./_group.css";

const gridStyle = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "80px 80px",
};

export function Current() {
  return (
    <div className="ofoq-hero-preview min-h-screen bg-[#2B273F] text-white" dir="rtl">
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={gridStyle} />
        <img
          src="/__ofoq-hero/images/riyadh-business-district.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B273F]/40 via-[#2B273F]/60 to-[#2B273F]" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <svg viewBox="0 0 600 600" className="absolute -right-20 -top-20 h-[600px] w-[600px]">
            <rect x="60" y="60" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
            <rect x="120" y="120" width="220" height="220" stroke="#E5FE04" strokeWidth="1.5" fill="none" />
            <rect x="180" y="180" width="220" height="220" stroke="#33B27C" strokeWidth="1.5" fill="none" />
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-end px-6 pb-20 pt-36 sm:px-10 sm:pb-28">
          <div className="max-w-5xl">
            <h1 className="text-[clamp(2.8rem,8vw,7.5rem)] font-black leading-[1.0] tracking-tight">
              <span className="block font-light text-white/50">نرتّب التفاصيل،</span>
              <span className="block text-white">لتتفرغ للنمو.</span>
              <span className="block text-[#33B27C]">لتتفرغ للنمو.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg leading-8 text-white/50">
              شريكك الموثوق في الموارد البشرية، الخدمات الحكومية، التأشيرات وتأسيس الشركات في المملكة.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button className="inline-flex items-center gap-3 rounded-full bg-[#33B27C] px-8 py-4 text-sm font-bold text-white">
                اطلب خدمة <span aria-hidden="true">←</span>
              </button>
              <button className="inline-flex items-center gap-3 rounded-full border border-white/25 px-8 py-4 text-sm font-bold text-white">
                استكشف الخدمات
              </button>
            </div>
          </div>
          <p className="absolute bottom-8 left-8 text-[10px] uppercase tracking-[.35em] text-white/25 sm:left-12">
            Riyadh · Jeddah · KSA
          </p>
        </div>
      </section>
    </div>
  );
}