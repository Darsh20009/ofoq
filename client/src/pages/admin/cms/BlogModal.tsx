import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { cmsApi } from "../../../api/client";
import type { BlogPost } from "../../../types";

export default function BlogModal({ open, onClose, post, onSaved }: {
  open: boolean; onClose: () => void; post: BlogPost | null; onSaved: () => void;
}) {
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (post) {
      reset({
        titleAr: post.title?.ar,
        titleEn: post.title?.en,
        excerptAr: post.excerpt?.ar,
        contentAr: post.content?.ar,
        coverImage: post.coverImage,
        category: post.category,
        isPublished: post.isPublished,
        tags: post.tags?.join(", "),
      });
    } else {
      reset({ isPublished: false });
    }
  }, [post, reset]);

  const mut = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const payload = {
        title: { ar: data.titleAr, en: data.titleEn },
        excerpt: { ar: data.excerptAr },
        content: { ar: data.contentAr },
        coverImage: data.coverImage,
        category: data.category,
        isPublished: data.isPublished,
        tags: typeof data.tags === "string" ? data.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
      };
      return post ? cmsApi.blog.update(post._id, payload) : cmsApi.blog.create(payload);
    },
    onSuccess: () => { toast.success(post ? "تم التحديث" : "تمت الإضافة"); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{post ? "تعديل مقالة" : "مقالة جديدة"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d as Record<string, unknown>))} className="p-6 space-y-4">
              <div>
                <label className="label">العنوان (عربي) *</label>
                <input {...register("titleAr", { required: true })} className="input-field" placeholder="عنوان المقالة بالعربية" />
              </div>
              <div>
                <label className="label">العنوان (إنجليزي)</label>
                <input {...register("titleEn")} className="input-field" placeholder="Article title in English" dir="ltr" />
              </div>
              <div>
                <label className="label">مقتطف</label>
                <textarea {...register("excerptAr")} rows={2} className="input-field resize-none" placeholder="ملخص قصير للمقالة..." />
              </div>
              <div>
                <label className="label">المحتوى</label>
                <textarea {...register("contentAr")} rows={8} className="input-field resize-none" placeholder="محتوى المقالة كاملاً..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">رابط الصورة الغلاف</label>
                  <input {...register("coverImage")} className="input-field" placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="label">التصنيف</label>
                  <input {...register("category")} className="input-field" placeholder="تسويق، تقنية..." />
                </div>
                <div>
                  <label className="label">الوسوم (مفصولة بفاصلة)</label>
                  <input {...register("tags")} className="input-field" placeholder="تقنية، ذكاء اصطناعي, أعمال" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input {...register("isPublished")} type="checkbox" id="published"
                    className="w-4 h-4 rounded text-ofoq-green" />
                  <label htmlFor="published" className="text-sm font-medium text-navy-700 cursor-pointer">نشر الآن</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "جاري الحفظ..." : post ? "تحديث" : "نشر المقالة"}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
