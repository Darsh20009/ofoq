import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCheck, Clock3, FolderKanban, Loader2, MessageCircle, Send } from "lucide-react";
import toast from "react-hot-toast";
import { projectsApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";

const STAGES = ["request", "review", "quotation", "contract", "payment", "execution", "closed"];
const LABELS_AR: Record<string, string> = {
  request: "طلب المشروع", review: "مراجعة المتطلبات", quotation: "عرض السعر",
  contract: "العقد", payment: "الدفع", execution: "التنفيذ", closed: "إغلاق المشروع",
};
const LABELS_EN: Record<string, string> = {
  request: "Project request", review: "Requirements review", quotation: "Quotation",
  contract: "Contract", payment: "Payment", execution: "In progress", closed: "Project closed",
};

type Feedback = {
  _id?: string;
  decision: "comment" | "approved";
  message?: string;
  createdBy?: { fullName?: string } | string;
  createdAt: string;
};
type HistoryEntry = {
  _id: string;
  stage: string;
  changedAt: string;
  note?: string;
  changedBy?: { fullName?: string } | string;
  customerFeedback?: Feedback[];
};
type ProjectRecord = {
  _id: string;
  name: string;
  projectNumber: string;
  stage: string;
  status: string;
  progress: number;
  dueDate?: string;
  stageHistory?: HistoryEntry[];
  manager?: { fullName?: string };
};

function actorName(actor: Feedback["createdBy"]): string {
  if (actor && typeof actor === "object") return actor.fullName || "—";
  return "—";
}

export default function ClientProjectsPage() {
  const { dir, lang } = useLang();
  const isArabic = lang === "ar";
  const qc = useQueryClient();
  const [openStageId, setOpenStageId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["client-projects"],
    queryFn: () => projectsApi.list({ limit: 100 }).then((response) => response.data.projects as ProjectRecord[]),
  });
  const feedbackMutation = useMutation({
    mutationFn: ({ projectId, stageHistoryId, decision, message: text }: {
      projectId: string; stageHistoryId: string; decision: "comment" | "approved"; message?: string;
    }) => projectsApi.stageFeedback(projectId, { stageHistoryId, decision, message: text }),
    onSuccess: (_response, variables) => {
      setMessage("");
      setOpenStageId(null);
      qc.invalidateQueries({ queryKey: ["client-projects"] });
      toast.success(variables.decision === "approved"
        ? (isArabic ? "تم اعتماد المرحلة وإبلاغ فريق المشروع" : "Stage approved; the project team was notified")
        : (isArabic ? "تم إرسال تعليقك لفريق المشروع" : "Your comment was sent to the project team"));
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر إرسال التفاعل" : "Couldn't send your update")),
  });

  const projects = data || [];
  const dateLabel = (value: string) => new Date(value).toLocaleDateString(isArabic ? "ar-SA" : lang, {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <main className="mx-auto max-w-[1480px] space-y-6" dir={dir}>
      <header className="rounded-2xl bg-[#071a32] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#e0b875]"><FolderKanban size={23} /></span>
          <div>
            <p className="text-xs font-bold text-[#e0b875]">{isArabic ? "بوابة العميل" : "CLIENT PORTAL"}</p>
            <h1 className="mt-1 text-2xl font-black">{isArabic ? "مشاريعي" : "My projects"}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
          {isArabic
            ? "تابع مراحل تنفيذ مشاريعك، واطّلع على تحديثات فريق أفق، وشاركنا تعليقك أو اعتمادك لكل مرحلة."
            : "Follow each project stage, read team updates, and comment on or approve the current stage."}
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20 text-[#8b806f]"><Loader2 className="animate-spin" /></div>
      ) : projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#ded7ce] bg-[#fffdfa] px-6 py-16 text-center">
          <FolderKanban className="mx-auto mb-3 text-[#c7c0b6]" size={38} />
          <h2 className="font-bold text-[#071a32]">{isArabic ? "لا توجد مشاريع مرتبطة بحسابك" : "No projects are linked to your account"}</h2>
          <p className="mt-2 text-sm text-[#8b806f]">{isArabic ? "ستظهر المشاريع هنا بعد ربطها بحساب العميل." : "Projects will appear here when they are linked to your account."}</p>
        </section>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => {
            const currentIndex = Math.max(0, STAGES.indexOf(project.stage));
            const historyByStage = new Map<string, HistoryEntry>();
            for (const entry of project.stageHistory || []) historyByStage.set(entry.stage, entry);
            return (
              <article key={project._id} className="overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffdfa] shadow-[0_5px_18px_rgba(7,26,50,.04)]">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee7de] p-5 sm:p-6">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#9a9288]">{project.projectNumber}</p>
                    <h2 className="mt-1 text-lg font-black text-[#071a32]">{project.name}</h2>
                    {project.manager?.fullName && (
                      <p className="mt-1 text-xs text-[#8b806f]">{isArabic ? "مدير المشروع" : "Project manager"}: {project.manager.fullName}</p>
                    )}
                  </div>
                  <div className="min-w-36 text-end">
                    <span className="rounded-full bg-[#f4efe8] px-3 py-1.5 text-xs font-bold text-[#071a32]">
                      {isArabic ? LABELS_AR[project.stage] : LABELS_EN[project.stage]}
                    </span>
                    <p className="mt-2 text-xs text-[#8b806f]">
                      {isArabic ? `نسبة الإنجاز ${project.progress || 0}%` : `${project.progress || 0}% complete`}
                      {project.dueDate ? ` · ${isArabic ? "التسليم" : "Due"} ${dateLabel(project.dueDate)}` : ""}
                    </p>
                  </div>
                </header>

                <div className="p-5 sm:p-6">
                  <ol className="relative space-y-0">
                    {STAGES.map((stage, index) => {
                      const entry = historyByStage.get(stage);
                      const isDone = index < currentIndex || project.status === "completed";
                      const isCurrent = index === currentIndex && project.status !== "completed";
                      const feedback = entry?.customerFeedback || [];
                      const approved = feedback.some((item) => item.decision === "approved");
                      const canRespond = Boolean(entry?._id);
                      return (
                        <li key={stage} className="relative flex gap-3 pb-5 last:pb-0">
                          {index < STAGES.length - 1 && (
                            <span className={`absolute bottom-0 top-7 w-px ${dir === "rtl" ? "right-[13px]" : "left-[13px]"} ${isDone ? "bg-[#33a878]" : "bg-[#e8e0d6]"}`} />
                          )}
                          <span className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            isDone ? "border-[#33a878] bg-[#33a878] text-white"
                              : isCurrent ? "border-[#c59650] bg-[#c59650] text-[#071a32]"
                                : "border-[#ded7ce] bg-[#fffdfa] text-[#9a9288]"
                          }`}>
                            {isDone ? <Check size={14} /> : index + 1}
                          </span>
                          <div className="min-w-0 flex-1 rounded-xl border border-[#eee7de] px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-[#071a32]">{isArabic ? LABELS_AR[stage] : LABELS_EN[stage]}</h3>
                                {isCurrent && <span className="rounded-full bg-[#fff3d8] px-2 py-0.5 text-[10px] font-bold text-[#835b1c]">{isArabic ? "المرحلة الحالية" : "Current stage"}</span>}
                                {approved && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"><CheckCheck size={12} />{isArabic ? "معتمدة" : "Approved"}</span>}
                              </div>
                              {entry?.changedAt && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#9a9288]"><Clock3 size={12} />{dateLabel(entry.changedAt)}</span>
                              )}
                            </div>
                            {entry?.note && <p className="mt-2 text-xs leading-6 text-[#556070]">{entry.note}</p>}
                            {feedback.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {feedback.map((item, index) => (
                                  <div key={item._id || `${item.createdAt}-${index}`} className="rounded-lg bg-[#f8f5f0] px-3 py-2 text-xs">
                                    <p className="font-bold text-[#071a32]">
                                      {item.decision === "approved" ? (isArabic ? "اعتماد من العميل" : "Client approval") : (isArabic ? "تعليق العميل" : "Client comment")}
                                      {actorName(item.createdBy) !== "—" ? ` · ${actorName(item.createdBy)}` : ""}
                                    </p>
                                    {item.message && <p className="mt-1 whitespace-pre-wrap leading-5 text-[#556070]">{item.message}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                            {canRespond && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {!approved && (
                                  <button disabled={feedbackMutation.isPending} onClick={() => feedbackMutation.mutate({
                                    projectId: project._id, stageHistoryId: entry!._id, decision: "approved",
                                  })} className="inline-flex items-center gap-1.5 rounded-lg bg-[#071a32] px-3 py-2 text-xs font-bold text-white hover:bg-[#1c2b6e] disabled:opacity-60">
                                    <CheckCheck size={14} />{isArabic ? "اعتماد المرحلة" : "Approve stage"}
                                  </button>
                                )}
                                <button onClick={() => { setOpenStageId(openStageId === entry!._id ? null : entry!._id); setMessage(""); }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#ded7ce] px-3 py-2 text-xs font-bold text-[#071a32] hover:bg-[#f8f5f0]">
                                  <MessageCircle size={14} />{isArabic ? "إضافة تعليق" : "Add comment"}
                                </button>
                              </div>
                            )}
                            {canRespond && openStageId === entry!._id && (
                              <form onSubmit={(event) => {
                                event.preventDefault();
                                if (!message.trim()) return;
                                feedbackMutation.mutate({ projectId: project._id, stageHistoryId: entry!._id, decision: "comment", message: message.trim() });
                              }} className="mt-3 flex flex-col gap-2 sm:flex-row">
                                <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1500} rows={2} required
                                  placeholder={isArabic ? "اكتب تعليقك لفريق المشروع..." : "Write a note for the project team..."}
                                  className="min-h-12 flex-1 resize-y rounded-lg border border-[#ded7ce] bg-white px-3 py-2 text-sm text-[#071a32] outline-none focus:border-[#c59650]" />
                                <button type="submit" disabled={feedbackMutation.isPending || !message.trim()}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#c59650] px-4 py-2 text-xs font-bold text-[#071a32] disabled:opacity-60">
                                  {feedbackMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                  {isArabic ? "إرسال" : "Send"}
                                </button>
                              </form>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}