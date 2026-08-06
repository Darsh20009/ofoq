import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { cmsApi } from "../../../api/client";
import type { BlogPost } from "../../../types";
import { useLang } from "../../../i18n/LangContext";

export default function BlogModal({ open, onClose, post, onSaved }: {
  open: boolean; onClose: () => void; post: BlogPost | null; onSaved: () => void;
}) {
  const { ui, dir } = useLang();
  const copy = ui.adminPages.cms;
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
    onSuccess: () => { toast.success(post ? copy.updated : copy.created); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{post ? copy.formEdit : copy.formNew}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d as Record<string, unknown>))} className="p-6 space-y-4">
              <div>
                <label className="label">{copy.titleAr}</label>
                <input {...register("titleAr", { required: true })} className="input-field" placeholder={copy.titleArPlaceholder} />
              </div>
              <div>
                <label className="label">{copy.titleEn}</label>
                <input {...register("titleEn")} className="input-field" placeholder={copy.titleEnPlaceholder} dir="ltr" />
              </div>
              <div>
                <label className="label">{copy.excerpt}</label>
                <textarea {...register("excerptAr")} rows={2} className="input-field resize-none" placeholder={copy.excerptPlaceholder} />
              </div>
              <div>
                <label className="label">{copy.content}</label>
                <textarea {...register("contentAr")} rows={8} className="input-field resize-none" placeholder={copy.contentPlaceholder} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{copy.coverImage}</label>
                  <input {...register("coverImage")} className="input-field" placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="label">{copy.category}</label>
                  <input {...register("category")} className="input-field" placeholder={copy.categoryPlaceholder} />
                </div>
                <div>
                  <label className="label">{copy.tags}</label>
                  <input {...register("tags")} className="input-field" placeholder={copy.tagsPlaceholder} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input {...register("isPublished")} type="checkbox" id="published"
                    className="w-4 h-4 rounded text-ofoq-green" />
                  <label htmlFor="published" className="text-sm font-medium text-navy-700 cursor-pointer">{copy.publishNow}</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? copy.saving : post ? copy.update : copy.publish}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">{copy.cancel}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
