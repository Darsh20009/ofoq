import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { cmsApi } from "../../api/client";
import type { BlogPost } from "../../types";
import WireframeCube from "../../components/WireframeCube";
import { useLang } from "../../i18n/LangContext";

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.5 } }),
};

export default function BlogPage() {
  const { ui, lang, dir } = useLang();
  const { data, isLoading } = useQuery({
    queryKey: ["public-blog"],
    queryFn: () => cmsApi.blog.list({ isPublished: true, limit: 20 }).then((r) => r.data),
  });

  const posts: BlogPost[] = data?.data?.posts ?? [];

  return (
    <div dir={dir}>
      <Helmet>
        <title>{ui.blog.metaTitle}</title>
        <meta name="description" content={ui.blog.metaDescription} />
        <link rel="canonical" href="https://ofoqhc.com/blog" />
      </Helmet>

      {/* ══ هيرو ══════════════════════════════════════════════ */}
      <section
        className="relative min-h-[55vh] flex items-end overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(43,39,63,0.90) 0%, rgba(43,39,63,0.45) 55%, transparent 100%), url('/images/riyadh-towers-palms.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute left-4 bottom-4 opacity-18 pointer-events-none">
          <WireframeCube className="w-56 h-40 text-ofoq-green" color="#33B27C" />
        </div>
        <div className="absolute right-8 top-12 opacity-12 pointer-events-none">
          <WireframeCube className="w-36 h-26 text-ofoq-yellow" color="#E5FE04" />
        </div>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pb-14 relative z-10 w-full">
          <div className="flex items-center gap-2 text-white/45 text-xs mb-4">
            <Link to="/" className="hover:text-white transition-colors">{ui.category.home}</Link>
            <span>/</span>
            <span className="text-white/70">{ui.blog.badge}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl font-black text-white"
            >
            {ui.blog.heroTitle}{" "}
            <span className="text-ofoq-yellow">{ui.blog.heroHighlight}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/50 text-sm mt-2"
          >
            {ui.blog.heroSub}
          </motion.p>
        </div>
      </section>

      {/* ══ آخر الأخبار ═══════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="mb-10">
            <p className="text-ofoq-green text-sm font-bold mb-1">{ui.blog.sectionEyebrow}</p>
            <h2 className="text-3xl font-black text-ofoq-navy">
              {ui.blog.sectionTitle} <span className="text-ofoq-green">{ui.blog.sectionHighlight}</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden">
                  <div className="h-44 bg-ofoq-navy/5 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-block mb-6 opacity-20">
                <WireframeCube className="w-32 h-24 text-ofoq-navy" color="#2B273F" />
              </div>
              <h3 className="text-xl font-bold text-ofoq-navy mb-2">{ui.blog.empty}</h3>
              <p className="text-gray-400 text-sm">{ui.blog.emptySub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post, i) => (
                <motion.article
                  key={post._id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all group"
                >
                  {/* صورة الغلاف */}
                  <div className="relative h-52 bg-gradient-to-br from-ofoq-navy to-ofoq-navy-light overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={`/uploads/${post.coverImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <WireframeCube className="w-32 h-24 text-ofoq-green" color="#33B27C" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ofoq-navy/60 to-transparent" />
                  </div>

                  {/* المحتوى */}
                  <div className="p-6">
                    <p className="text-ofoq-green text-xs font-bold mb-2">
                      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <h3 className="font-black text-ofoq-navy text-base leading-tight mb-3 line-clamp-2 group-hover:text-ofoq-green transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <Link
                      to="/blog"
                      className="flex items-center gap-1.5 text-sm font-bold text-ofoq-green hover:gap-3 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                       {ui.blog.read}
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
