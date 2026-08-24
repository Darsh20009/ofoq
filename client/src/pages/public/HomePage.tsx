import { Helmet } from "react-helmet-async";
import { useLang } from "../../i18n/LangContext";

/**
 * الصفحة الرئيسية النظيفة
 *
 * تم إبقاء الصفحة فارغة عمدًا حتى يبدأ تصميم الصفحة الرئيسية من الصفر.
 * الهيدر والفوتر موجودان في PublicLayout، وباقي صفحات الموقع لا تتأثر.
 */
export default function HomePage() {
  const { ui, dir } = useLang();

  return (
    <>
      <Helmet>
        <title>{ui.home.metaTitle}</title>
        <meta name="description" content={ui.home.heroSub} />
      </Helmet>
      <main
        dir={dir}
        aria-label={dir === "rtl" ? "الصفحة الرئيسية" : "Homepage"}
        className="min-h-[calc(100vh-5rem)] bg-white"
      />
    </>
  );
}