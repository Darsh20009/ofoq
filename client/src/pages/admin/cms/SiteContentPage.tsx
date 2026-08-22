import { useState, useEffect, useCallback } from "react";
import { useLang } from "../../../i18n/LangContext";
import { LANGS } from "../../../i18n/extraLangs";

type LangCode = typeof LANGS[number]["code"];

interface ContentField {
  key: string;         // dot-notation path, e.g. "home.hero1"
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

// Fields the admin can edit per language
const SECTIONS: { id: string; label: string; labelAr: string; fields: ContentField[] }[] = [
  {
    id: "home",
    label: "Homepage",
    labelAr: "الصفحة الرئيسية",
    fields: [
      { key: "home.badge",       label: "Header Badge",           placeholder: "OFOQ / SAUDI BUSINESS CONCIERGE" },
      { key: "home.hero1",       label: "Hero Line 1 (light)",    placeholder: "We handle" },
      { key: "home.hero2",       label: "Hero Line 2 (bold)",     placeholder: "the details." },
      { key: "home.heroSub",     label: "Hero Subtitle",          multiline: true },
      { key: "home.request",     label: "CTA Button: Request",    placeholder: "Request service" },
      { key: "home.explore",     label: "CTA Button: Explore",    placeholder: "Explore services" },
      { key: "home.aboutBadge",  label: "About Section Badge" },
      { key: "home.aboutTitle1", label: "About Title Line 1" },
      { key: "home.aboutTitle2", label: "About Title Line 2" },
      { key: "home.aboutDesc",   label: "About Description",      multiline: true },
      { key: "home.aboutCta",    label: "About Link Text" },
      { key: "home.splash.0",    label: "Splash Word 1" },
      { key: "home.splash.1",    label: "Splash Word 2" },
      { key: "home.splash.2",    label: "Splash Word 3" },
      { key: "home.splash.3",    label: "Splash Word 4" },
      { key: "home.whyBadge",    label: "Why Section Badge" },
      { key: "home.whyTitle",    label: "Why Section Title" },
      { key: "home.ctaTitle1",   label: "CTA Section Eyebrow" },
      { key: "home.ctaTitle2",   label: "CTA Section Main Title" },
      { key: "home.ctaDesc",     label: "CTA Section Description", multiline: true },
      { key: "home.contact",     label: "CTA Button: Contact" },
      { key: "home.stats.0",     label: "Stat Label 1 (200+ Clients)" },
      { key: "home.stats.1",     label: "Stat Label 2 (98% Satisfaction)" },
      { key: "home.stats.2",     label: "Stat Label 3 (50+ Specialists)" },
      { key: "home.stats.3",     label: "Stat Label 4 (7 Countries)" },
    ],
  },
  {
    id: "about",
    label: "About Page",
    labelAr: "صفحة من نحن",
    fields: [
      { key: "about.badge",        label: "Page Badge" },
      { key: "about.heroTitle1",   label: "Hero Title Line 1" },
      { key: "about.heroTitle2",   label: "Hero Title Line 2 (green)" },
      { key: "about.heroSub",      label: "Hero Subtitle",       multiline: true },
      { key: "about.storyGrowth",  label: "Story Growth Quote" },
      { key: "about.visionText",   label: "Vision Text",         multiline: true },
      { key: "about.missionTitle", label: "Mission Section Title" },
      { key: "about.missionText",  label: "Mission Text",        multiline: true },
      { key: "about.ctaBadge",     label: "CTA Badge" },
      { key: "about.requestService", label: "Request Button Text" },
    ],
  },
  {
    id: "services",
    label: "Services Page",
    labelAr: "صفحة الخدمات",
    fields: [
      { key: "services.badge",      label: "Page Badge" },
      { key: "services.hero1",      label: "Hero Line 1" },
      { key: "services.hero2",      label: "Hero Line 2 (green)" },
      { key: "services.heroSub",    label: "Hero Subtitle",   multiline: true },
      { key: "services.areaBadge",  label: "Area Badge (Homepage)" },
      { key: "services.choose",     label: "Choose (heading part 1)" },
      { key: "services.yourService",label: "Your Service (heading part 2)" },
      { key: "services.learnMore",  label: "Learn More Button" },
    ],
  },
  {
    id: "contact",
    label: "Contact Page",
    labelAr: "صفحة التواصل",
    fields: [
      { key: "contact.badge",     label: "Page Badge" },
      { key: "contact.heroTitle", label: "Hero Title" },
      { key: "contact.heroSub",   label: "Hero Subtitle", multiline: true },
    ],
  },
  {
    id: "header",
    label: "Header & Nav",
    labelAr: "القائمة والترويسة",
    fields: [
      { key: "header.clientLogin", label: "Client Login Button" },
      { key: "header.menu",        label: "Menu Button" },
      { key: "header.nav.0",       label: "Nav Link 1 (Home)" },
      { key: "header.nav.1",       label: "Nav Link 2 (About)" },
      { key: "header.nav.2",       label: "Nav Link 3 (Services)" },
      { key: "header.nav.3",       label: "Nav Link 4 (Packages)" },
      { key: "header.nav.4",       label: "Nav Link 5 (Countries)" },
      { key: "header.nav.5",       label: "Nav Link 6 (Blog)" },
      { key: "header.nav.6",       label: "Nav Link 7 (Contact)" },
    ],
  },
];

// Utility: get nested value from object by dot-path
function getPath(obj: any, path: string): string {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return "";
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : "";
}

// Utility: set nested value in object by dot-path (immutable)
function setPath(obj: any, path: string, value: string): any {
  const parts = path.split(".");
  const copy = { ...obj };
  let cur: any = copy;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    cur[p] = Array.isArray(cur[p]) ? [...cur[p]] : { ...(cur[p] || {}) };
    cur = cur[p];
  }
  const last = parts[parts.length - 1];
  if (Array.isArray(cur)) {
    cur[parseInt(last)] = value;
  } else {
    cur[last] = value;
  }
  return copy;
}

export default function SiteContentPage() {
  const { ui, lang: adminLang } = useLang();
  const isRtl = adminLang === "ar" || adminLang === "ur";

  const [activeLang, setActiveLang] = useState<LangCode>("ar");
  const [activeSection, setActiveSection] = useState("home");
  const [content, setContent] = useState<Record<string, any>>({});
  const [defaults, setDefaults] = useState<Record<LangCode, any>>({} as any);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved content from DB + default ui.ts values
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/cms/site-content", { credentials: "include" });
        const json = await res.json();
        setContent(json?.data?.content || {});
      } catch {
        // ignore
      }

      // Compute defaults for all languages by calling getUiCopy equivalent
      // We load via the API which now serves the full merged content
      try {
        const res = await fetch("/api/cms/site-content?defaults=1", { credentials: "include" });
        const json = await res.json();
        if (json?.data?.defaults) setDefaults(json.data.defaults);
      } catch {
        // ignore
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleChange = useCallback((path: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [activeLang]: setPath(prev[activeLang] || {}, path, value),
    }));
    setSaved(false);
  }, [activeLang]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cms/site-content", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: activeLang, data: content[activeLang] || {} }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert(adminLang === "ar" ? "خطأ في الحفظ" : "Save failed");
    }
    setSaving(false);
  };

  const currentSection = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0];
  const langContent = content[activeLang] || {};
  const langDefaults = defaults[activeLang] || {};

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {adminLang === "ar" ? "محرر محتوى الموقع" : "Site Content Editor"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isRtl
              ? "عدّل كل نصوص الموقع بكل اللغات وسيتطبق التغيير فوراً للزوار"
              : "Edit all website texts in every language — changes apply immediately to visitors"}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-[#33B27C] text-white hover:bg-[#2a9a6a]"
          } disabled:opacity-60`}
        >
          {saving ? (adminLang === "ar" ? "جاري الحفظ..." : "Saving...") : saved ? (adminLang === "ar" ? "✓ تم الحفظ" : "✓ Saved") : (adminLang === "ar" ? "حفظ التغييرات" : "Save changes")}
        </button>
      </div>

      {/* Language tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-4 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            {adminLang === "ar" ? "اختر اللغة" : "Select language"}
          </p>
          <div className="flex flex-wrap gap-2 pb-0">
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => setActiveLang(l.code)}
                className={`px-4 py-2 rounded-t-lg text-sm font-bold border-b-2 transition-all ${
                  activeLang === l.code
                    ? "border-[#33B27C] text-[#33B27C] bg-[#33B27C]/5"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Section sidebar */}
          <aside className="w-48 border-r border-gray-200 py-4 flex-shrink-0">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-start px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? "bg-[#2B273F]/5 text-[#2B273F] font-bold border-r-2 border-[#2B273F]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {adminLang === "ar" ? s.labelAr : s.label}
              </button>
            ))}
          </aside>

          {/* Fields */}
          <main className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                {adminLang === "ar" ? "جاري التحميل..." : "Loading..."}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gray-400 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {isRtl
                    ? "💡 الحقول الفارغة تستخدم القيمة الافتراضية من الكود. اكتب قيمة لتتجاوزها."
                    : "💡 Empty fields use the built-in default value. Type to override it."}
                </p>
                {currentSection.fields.map(field => {
                  const currentVal = getPath(langContent, field.key);
                  const defaultVal = getPath(langDefaults, field.key);
                  return (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-gray-600 mb-1">
                        {field.label}
                        {defaultVal && (
                          <span className="ms-2 font-normal text-gray-400 truncate max-w-[200px] inline-block align-bottom">
                            ({adminLang === "ar" ? "افتراضي" : "default"}: {defaultVal.slice(0, 40)}{defaultVal.length > 40 ? "…" : ""})
                          </span>
                        )}
                      </label>
                      {field.multiline ? (
                        <textarea
                          rows={3}
                          value={currentVal}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={defaultVal || field.placeholder || ""}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#33B27C]/30 focus:border-[#33B27C] resize-none"
                          dir={activeLang === "ar" || activeLang === "ur" ? "rtl" : "ltr"}
                        />
                      ) : (
                        <input
                          type="text"
                          value={currentVal}
                          onChange={e => handleChange(field.key, e.target.value)}
                          placeholder={defaultVal || field.placeholder || ""}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#33B27C]/30 focus:border-[#33B27C]"
                          dir={activeLang === "ar" || activeLang === "ur" ? "rtl" : "ltr"}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-bold mb-1">{adminLang === "ar" ? "كيف يعمل؟" : "How it works"}</p>
        <p className="text-blue-600">
          {isRtl
            ? "كل تغيير تحفظه يتطبق على الموقع فوراً لجميع زوار هذه اللغة. لا حاجة لإعادة نشر أو بناء الكود."
            : "Every saved change applies immediately to your website for all visitors of that language. No rebuild or deploy required."}
        </p>
      </div>
    </div>
  );
}
