import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Helmet } from "react-helmet-async";
import { cmsApi } from "../../api/client";
import type { BlogPost } from "../../types";

export default function BlogPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-blog"],
    queryFn: () => cmsApi.blog.list({ isPublished: true, limit: 20 }).then((r) => r.data),
  });

  const posts: BlogPost[] = data?.data?.posts || [];

  return (
    <>
      <Helmet>
        <title>المدونة | أفق لحلول الأعمال — مقالات التحول الرقمي والأعمال</title>
        <meta name="description" content="مدونة أفق لحلول الأعمال — مقالات وأدلة متخصصة في التحول الرقمي، إدارة المشاريع، CRM، الفواتير الإلكترونية، وحلول الأعمال للشركات السعودية والخليجية." />
        <meta name="keywords" content="مدونة أفق, مقالات التحول الرقمي, مقالات إدارة الأعمال, ofoq blog, مقالات CRM, إدارة المشاريع, حلول الأعمال السعودية, التحول الرقمي, رؤية 2030" />
        <link rel="canonical" href="https://ofoqhc.com/blog" />
        <meta property="og:title" content="المدونة | أفق لحلول الأعمال" />
        <meta property="og:description" content="مقالات وأدلة متخصصة في التحول الرقمي وحلول الأعمال للشركات السعودية والخليجية." />
        <meta property="og:url" content="https://ofoqhc.com/blog" />
        <meta property="og:type" content="blog" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "مدونة أفق لحلول الأعمال",
          "url": "https://ofoqhc.com/blog",
          "description": "مقالات وأدلة متخصصة في التحول الرقمي وإدارة الأعمال للشركات السعودية والخليجية.",
          "publisher": { "@type": "Organization", "name": "أفق لحلول الأعمال", "url": "https://ofoqhc.com" },
          "inLanguage": "ar"
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-hero pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="badge bg-ofoq-green/20 text-ofoq-green mb-4">المدونة</span>
            <h1 className="text-5xl font-black text-white mt-3 mb-4">مركز المعرفة</h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              رؤى واستراتيجيات من خبرائنا لمساعدتك في مواكبة التحولات الرقمية
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton h-48 w-full rounded-xl mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-3" />
                  <div className="skeleton h-3 w-full mb-2" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-card">
                <Tag size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-navy-700 mb-2">لا توجد مقالات بعد</h3>
              <p className="text-gray-500">سيتم نشر المقالات قريباً. تابعنا!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }} viewport={{ once: true }}
                  className="card-hover group overflow-hidden p-0"
                >
                  {/* Cover */}
                  <div className="relative h-52 bg-gradient-to-br from-ofoq-navy to-navy-600 overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title.ar}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-ofoq-yellow text-6xl font-black opacity-10">أ</span>
                      </div>
                    )}
                    {post.category && (
                      <span className="absolute top-4 right-4 badge-navy text-xs">{post.category}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="font-bold text-navy-700 text-lg mb-2 line-clamp-2 group-hover:text-ofoq-green transition-colors">
                      {post.title.ar}
                    </h2>
                    {post.excerpt?.ar && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt.ar}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {post.author && (
                          <span className="flex items-center gap-1">
                            <User size={11} /> {post.author.name}
                          </span>
                        )}
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {format(new Date(post.publishedAt), "d MMM yyyy", { locale: arSA })}
                          </span>
                        )}
                      </div>
                      <span className="text-ofoq-green font-medium flex items-center gap-1 hover:gap-2 transition-all cursor-pointer">
                        قراءة <ChevronLeft size={12} />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
