import "./_group.css";

function OfoqMark() {
  return (
    <svg viewBox="0 0 68 50" className="h-9 w-12" fill="none" aria-label="OFOQ">
      <rect x="4" y="4" width="22" height="34" rx="5" stroke="#0F1268" strokeWidth="4" />
      <path d="M34 5V37M34 5H57M34 20H51" stroke="#C13229" strokeWidth="4.5" strokeLinecap="square" />
      <rect x="35" y="42" width="10" height="5" rx="2.5" fill="#0F1268" />
      <path d="M53 42l8 5" stroke="#C13229" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function WireframeOfoq() {
  return (
    <svg viewBox="0 0 760 570" className="h-full w-full" fill="none" aria-hidden="true">
      <path d="M-74 223C69 111 201 93 391 108L504 177V394L285 443L-74 357V223Z" stroke="#D7C86C" strokeWidth="1.4" />
      <path d="M-74 223L285 299L504 177M285 299V443M-74 357L285 299" stroke="#D7C86C" strokeWidth="1.4" />
      <path d="M-28 202C124 135 247 121 414 134M-28 253C127 194 261 185 468 204" stroke="#D7C86C" strokeWidth="1.1" opacity=".9" />
      <path d="M-18 367C147 383 282 409 503 394" stroke="#D7C86C" strokeWidth="1.1" opacity=".7" />
    </svg>
  );
}

export function ReferenceRedesign() {
  return (
    <div className="ofoq-hero-preview min-h-screen bg-[#08065F] text-white" dir="rtl">
      <header className="relative z-20 flex h-20 items-center justify-between bg-white px-5 text-[#0D0C3F] shadow-sm sm:h-24 sm:px-10">
        <div className="flex items-center gap-2.5">
          <OfoqMark />
          <div className="leading-tight">
            <p className="text-lg font-black tracking-tight sm:text-xl">أفق</p>
            <p className="text-[9px] font-semibold tracking-[.12em] text-[#8B825B] sm:text-[10px]">OFOQ BUSINESS SERVICES</p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-sm font-semibold sm:gap-8">
          <button className="transition-colors hover:text-[#C13229]">English</button>
          <button className="flex h-10 w-10 flex-col items-center justify-center gap-1.5" aria-label="القائمة">
            <span className="h-0.5 w-6 bg-current" />
            <span className="h-0.5 w-6 bg-current" />
            <span className="h-0.5 w-6 bg-current" />
          </button>
        </div>
      </header>

      <section className="relative isolate min-h-[calc(100vh-5rem)] overflow-hidden bg-[#08065F] sm:min-h-[calc(100vh-6rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_40%,rgba(34,45,181,.5),transparent_33%),linear-gradient(110deg,#07055D_0%,#090661_52%,#050443_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:74px_74px]" />

        <div className="ofoq-hero-glow absolute -bottom-36 right-[4%] h-[105%] w-[36%] rotate-[-18deg] bg-[radial-gradient(ellipse_at_center,rgba(182,192,255,.72),rgba(90,98,255,.22)_29%,transparent_67%)] blur-2xl" />
        <div className="absolute bottom-0 left-0 h-[55%] w-[57%] opacity-80">
          <WireframeOfoq />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center px-6 py-20 sm:min-h-[calc(100vh-6rem)] sm:px-10">
          <div className="mr-auto w-full max-w-2xl pt-6 text-right sm:mr-0 sm:pr-[8%]">
            <p className="mb-6 text-xs font-semibold tracking-[.18em] text-[#D7C86C]">أفق لحلول الأعمال</p>
            <h1 className="text-[clamp(3.2rem,7.2vw,6.9rem)] font-medium leading-[1.16] tracking-[-.045em]">
              <span className="block text-white">خدمات ترتقي</span>
              <span className="block font-black text-[#D7B34B]">بالشركات</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-9 text-white/78 sm:text-lg">
              تسعى أفق لتكون الشريك الأمثل لتمكين الجهات من تحقيق مساهمتها الفعّالة في رؤية السعودية.
            </p>
            <button className="mt-9 inline-flex items-center gap-3 rounded-full bg-white py-2.5 pr-3 pl-6 text-sm font-extrabold text-[#11102F] shadow-[0_12px_30px_rgba(0,0,0,.2)] transition-transform hover:-translate-y-0.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B6E186] text-xl font-normal text-white">←</span>
              تعرّفوا على خدماتنا
            </button>
          </div>
        </div>

        <p className="absolute bottom-8 right-6 text-[9px] tracking-[.38em] text-white/28 sm:right-10">
          OFOQHC.COM
        </p>
      </section>
    </div>
  );
}