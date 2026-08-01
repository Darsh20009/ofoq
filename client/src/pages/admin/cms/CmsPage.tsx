import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Globe, FileText, Star, Image, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { cmsApi } from "../../../api/client";
import type { BlogPost } from "../../../types";
import BlogModal from "./BlogModal";

const tabs = [
  { id: "blog", label: "المدونة", icon: FileText },
  { id: "testimonials", label: "الشهادات", icon: Star },
  { id: "pages", label: "الصفحات", icon: Globe },
];

export default function CmsPage() {
  const [tab, setTab] = useState("blog");
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);

  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => cmsApi.blog.list({ limit: 50 }).then((r) => r.data),
    enabled: tab === "blog",
  });

  const { data: testimonials, isLoading: testimonialsLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => cmsApi.testimonials.list().then((r) => r.data),
    enabled: tab === "testimonials",
  });

  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => cmsApi.pages.list().then((r) => r.data),
    enabled: tab === "pages",
  });

  const deletePostMut = useMutation({
    mutationFn: (id: string) => cmsApi.blog.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog-posts"] }); toast.success("تم الحذف"); },
  });

  const deleteTestimonialMut = useMutation({
    mutationFn: (id: string) => cmsApi.testimonials.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("تم الحذف"); },
  });

  const posts: BlogPost[] = blogData?.data?.posts || [];
  const testimonialList = testimonials?.data?.testimonials || [];
  const pageList = pages?.data?.pages || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة المحتوى</h1>
          <p className="page-subtitle">تحكم كامل في محتوى الموقع</p>
        </div>
        {tab === "blog" && (
          <button onClick={() => { setEditPost(null); setModalOpen(true); }} className="btn-primary">
            <Plus size={16} /> مقالة جديدة
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
              tab === t.id
                ? "border-ofoq-green text-ofoq-green bg-emerald-50"
                : "border-transparent text-gray-500 hover:text-navy-700"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Blog Posts */}
      {tab === "blog" && (
        <div className="space-y-4">
          {blogLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="card py-16 text-center">
              <FileText size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">لا توجد مقالات بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="card p-4 flex items-center gap-4 group hover:shadow-ofoq transition-shadow">
                  {p.coverImage && (
                    <img src={p.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  {!p.coverImage && (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Image size={20} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-700 truncate">{p.title.ar}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={p.isPublished ? "badge-green" : "badge-gray"}>
                        {p.isPublished ? "منشور" : "مسودة"}
                      </span>
                      {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                      {p.publishedAt && (
                        <span className="text-xs text-gray-400">
                          {format(new Date(p.publishedAt), "d MMM yyyy", { locale: arSA })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditPost(p); setModalOpen(true); }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => { if (confirm("حذف المقالة؟")) deletePostMut.mutate(p._id); }}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Testimonials */}
      {tab === "testimonials" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonialsLoading ? (
            [...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)
          ) : testimonialList.length === 0 ? (
            <div className="col-span-3 card py-16 text-center">
              <Star size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">لا توجد شهادات</p>
            </div>
          ) : (
            testimonialList.map((t: { _id: string; author: { name: string; company: string }; content: { ar: string }; rating: number }) => (
              <motion.div key={t._id} className="card group">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.content?.ar}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-navy-700">{t.author?.name}</p>
                    <p className="text-xs text-gray-400">{t.author?.company}</p>
                  </div>
                  <button onClick={() => { if (confirm("حذف الشهادة؟")) deleteTestimonialMut.mutate(t._id); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Pages */}
      {tab === "pages" && (
        <div className="space-y-3">
          {pagesLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
          ) : (
            pageList.map((p: { _id: string; key: string; title: { ar: string }; isPublished: boolean; slug: string }) => (
              <div key={p._id} className="card p-4 flex items-center gap-4 group">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Globe size={16} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-navy-700">{p.title?.ar || p.key}</p>
                  <p className="text-xs text-gray-400">/{p.slug || p.key}</p>
                </div>
                <span className={p.isPublished ? "badge-green" : "badge-gray"}>
                  {p.isPublished ? "منشور" : "مخفي"}
                </span>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <BlogModal open={modalOpen} onClose={() => setModalOpen(false)} post={editPost}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["blog-posts"] }); setModalOpen(false); }} />
    </div>
  );
}
