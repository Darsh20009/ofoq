import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Globe, FileText, Star, Image, Eye, EyeOff, Handshake } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { cmsApi } from "../../../api/client";
import type { BlogPost, Partner } from "../../../types";
import BlogModal from "./BlogModal";
import PartnerModal from "./PartnerModal";
import { useLang } from "../../../i18n/LangContext";
import { useAuthStore } from "../../../store/authStore";

export default function CmsPage() {
  const { ui, lang, dir } = useLang();
  const copy = ui.adminPages.cms;
  const isArabic = lang === "ar" || lang === "ur";
  const tabs = [
    { id: "blog", label: copy.blog, icon: FileText },
    { id: "testimonials", label: copy.testimonials, icon: Star },
    { id: "partners", label: isArabic ? "الشركاء" : "Partners", icon: Handshake },
    { id: "pages", label: copy.pages, icon: Globe },
  ];
  const locale = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang;
  const [tab, setTab] = useState("blog");
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const { user } = useAuthStore();
  const canDeletePartner = ["super_admin", "admin"].includes(user?.role || "");

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

  const { data: partnerData, isLoading: partnersLoading, isError: partnersError } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: () => cmsApi.partners.adminList().then((r) => r.data),
    enabled: tab === "partners",
    retry: 1,
  });

  const deletePostMut = useMutation({
    mutationFn: (id: string) => cmsApi.blog.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["blog-posts"] }); toast.success(copy.deleted); },
  });

  const deleteTestimonialMut = useMutation({
    mutationFn: (id: string) => cmsApi.testimonials.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success(copy.deleted); },
  });

  const deletePartnerMut = useMutation({
    mutationFn: (id: string) => cmsApi.partners.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-partners"] });
      qc.invalidateQueries({ queryKey: ["public-partners"] });
      toast.success(isArabic ? "تم حذف الشريك." : "Partner deleted.");
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر حذف الشريك." : "Could not delete partner.")),
  });

  const posts: BlogPost[] = blogData?.data?.posts || [];
  const testimonialList = testimonials?.data?.testimonials || [];
  const pageList = pages?.data?.pages || [];
  const partnerList: Partner[] = partnerData?.partners || [];

  return (
    <div className="space-y-6" dir={dir}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-subtitle">{copy.subtitle}</p>
        </div>
        {tab === "blog" && (
          <button onClick={() => { setEditPost(null); setModalOpen(true); }} className="btn-primary">
            <Plus size={16} /> {copy.newArticle}
          </button>
        )}
        {tab === "partners" && (
          <button onClick={() => { setEditPartner(null); setPartnerModalOpen(true); }} className="btn-primary">
            <Plus size={16} /> {isArabic ? "إضافة شريك" : "Add partner"}
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
              <p className="text-gray-400">{copy.emptyPosts}</p>
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
                     <p className="font-semibold text-navy-700 truncate">{lang === "en" ? p.title.en || p.title.ar : p.title.ar}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={p.isPublished ? "badge-green" : "badge-gray"}>
                         {p.isPublished ? copy.published : copy.draft}
                      </span>
                      {p.category && <span className="text-xs text-gray-400">{p.category}</span>}
                      {p.publishedAt && (
                        <span className="text-xs text-gray-400">
                           {new Date(p.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditPost(p); setModalOpen(true); }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700">
                      <Edit2 size={14} />
                    </button>
                     <button onClick={() => { if (confirm(copy.deletePostConfirm)) deletePostMut.mutate(p._id); }}
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
               <p className="text-gray-400">{copy.emptyTestimonials}</p>
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
                   <button onClick={() => { if (confirm(copy.deleteTestimonialConfirm)) deleteTestimonialMut.mutate(t._id); }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Partners */}
      {tab === "partners" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-navy-700">{isArabic ? "إدارة شركاء أفق" : "Manage OFOQ partners"}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isArabic ? "أضف الشعارات والمحتوى الثنائي اللغة وتحكم في ترتيب الظهور على الصفحة الرئيسية." : "Manage bilingual content, logos, visibility, and display order on the home page."}
            </p>
          </div>
          {partnersError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {isArabic ? "تعذر تحديث قائمة الشركاء. ستظل آخر بيانات محملة ظاهرة إن كانت متاحة." : "Could not refresh partners. Previously loaded data remains visible when available."}
            </p>
          )}
          {partnersLoading && partnerList.length === 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
            </div>
          ) : partnerList.length === 0 ? (
            <div className="card py-16 text-center">
              <Handshake size={42} className="mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400">{isArabic ? "لا يوجد شركاء مضافون بعد." : "No partners have been added yet."}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {partnerList.map((partner, index) => (
                <motion.article
                  key={partner._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.035 }}
                  className="card group flex min-h-52 flex-col"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-2">
                      <img src={partner.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-navy-700">{(isArabic ? partner.nameAr : partner.nameEn) || partner.nameAr || partner.nameEn || (isArabic ? "شريك غير مكتمل" : "Incomplete partner")}</h3>
                      <p className="mt-1 truncate text-xs text-gray-400">{(isArabic ? partner.nameEn : partner.nameAr) || (isArabic ? "بيانات غير مكتملة" : "Incomplete data")}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={partner.isPublished ? "badge-green" : "badge-gray"}>
                          {partner.isPublished ? (isArabic ? "ظاهر" : "Visible") : (isArabic ? "مخفي" : "Hidden")}
                        </span>
                        <span className="badge-navy">{isArabic ? `الترتيب ${partner.order}` : `Order ${partner.order}`}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500">
                    {(isArabic ? partner.descriptionAr : partner.descriptionEn) || (isArabic ? "هذا السجل قديم ويحتاج إلى استكمال بياناته قبل نشره." : "This legacy record needs to be completed before publishing.")}
                  </p>
                  <div className="mt-auto flex justify-end gap-1 pt-4">
                    <button
                      onClick={() => { setEditPartner(partner); setPartnerModalOpen(true); }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-navy-700"
                      aria-label={isArabic ? "تعديل الشريك" : "Edit partner"}
                    >
                      <Edit2 size={15} />
                    </button>
                    {canDeletePartner && (
                      <button
                        onClick={() => {
                          if (confirm(isArabic ? `هل تريد حذف ${partner.nameAr || "هذا الشريك"}؟` : `Delete ${partner.nameEn || partner.nameAr || "this partner"}?`)) deletePartnerMut.mutate(partner._id);
                        }}
                        disabled={deletePartnerMut.isPending}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={isArabic ? "حذف الشريك" : "Delete partner"}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pages */}
      {tab === "pages" && (
        <div className="space-y-3">
          {pagesLoading ? (
            [...Array(4)].map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)
           ) : pageList.length === 0 ? (
             <div className="card py-16 text-center">
               <Globe size={40} className="mx-auto text-gray-200 mb-3" />
               <p className="text-gray-400">{copy.noPages}</p>
             </div>
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
                   {p.isPublished ? copy.published : copy.hidden}
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
      <PartnerModal
        open={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        partner={editPartner}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["admin-partners"] });
          qc.invalidateQueries({ queryKey: ["public-partners"] });
          setPartnerModalOpen(false);
        }}
      />
    </div>
  );
}
