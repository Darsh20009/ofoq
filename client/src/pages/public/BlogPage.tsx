import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { cmsApi } from "../../api/client";
import type { BlogPost } from "../../types";
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
    <div dir={dir} className="min-h-screen bg-[#F7F3EE] text-[#2B273F]">
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
            "linear-gradient(to top, rgba(43,39,63,0.94) 0%, rgba(43,39,63,0.50) 58%, rgba(43,39,63,.18) 100%), url('/images/riyadh-towers-palms.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
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
       <section className="py-16 sm:py-20 border-t border-[#2B273F]/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#33B27C] mb-4">{ui.blog.sectionEyebrow}</p>
            <h2 className="text-4xl font-black text-[#2B273F]">
              {ui.blog.sectionTitle} <span className="text-[#33B27C]">{ui.blog.sectionHighlight}</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-[#2B273F]/10 bg-white">
                  <div className="h-44 bg-[#2B273F]/5 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#2B273F]/5 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-[#2B273F]/5 rounded animate-pulse" />
                    <div className="h-3 bg-[#2B273F]/5 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-2xl border border-[#2B273F]/10 bg-white flex items-center justify-center mx-auto mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-[#2B273F]/30">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v10a2 2 0 0 1-2 2z" /><polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#2B273F] mb-2">{ui.blog.empty}</h3>
              <p className="text-[#2B273F]/50 text-sm">{ui.blog.emptySub}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post, i) => (
                <motion.article
                  key={post._id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group overflow-hidden rounded-2xl border border-[#2B273F]/10 bg-white shadow-[0_8px_30px_rgba(43,39,63,.06)] transition-all hover:-translate-y-1 hover:border-[#33B27C]/50 hover:shadow-[0_16px_40px_rgba(43,39,63,.10)]"
                >
                  <div className="relative h-48 bg-[#2B273F] overflow-hidden">
                    {post.coverImage ? (
                      <img
                        src={`/uploads/${post.coverImage}`}
                        alt={post.title}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 text-white/10">
                          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v10a2 2 0 0 1-2 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B273F]/70 to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="text-[#33B27C] text-xs font-bold mb-3">
                      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : lang, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <h3 className="font-black text-[#2B273F] text-base leading-tight mb-3 line-clamp-2 group-hover:text-[#33B27C] transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-[#2B273F]/55 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <Link to="/blog" className="flex items-center gap-2 text-xs font-bold text-[#2B273F]/50 hover:text-[#33B27C] transition-colors">
                      {ui.blog.read}
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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
