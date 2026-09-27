import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, Clock3, FolderKanban, Loader2, MessageCircle, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import { projectsApi } from "../../api/client";
import { useLang } from "../../i18n/LangContext";

const STAGES = ["request", "review", "quotation", "contract", "payment", "execution", "closed"];

type Feedback = {
  _id?: string;
  decision: "comment" | "approved";
  message?: string;
  createdBy?: { fullName?: string; name?: string } | string;
  createdAt: string;
};
type HistoryEntry = {
  _id: string;
  stage: string;
  changedAt: string;
  changedBy?: { fullName?: string; name?: string } | string;
  note?: string;
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
  customerId?: { name?: string; companyName?: string };
  stageHistory?: HistoryEntry[];
};

function nameOf(actor: Feedback["createdBy"]): string {
  if (actor && typeof actor === "object") return actor.fullName || actor.name || "";
  return "";
}

export default function EmployeeProjectsPage() {
  const { dir, lang, ui } = useLang();
  const isArabic = lang === "ar";
  const copy = ui.adminPages.projects;
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nextStage, setNextStage] = useState("");
  const [stageNote, setStageNote] = useState("");
  const stageLabels = copy.stages as Record<string, string>;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["employee-projects"],
    queryFn: () => projectsApi.list({ limit: 100 }).then((response) => response.data.projects as ProjectRecord[]),
    refetchInterval: 30_000,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, stage, note }: { id: string; stage: string; note: string }) =>
      projectsApi.update(id, { stage, stageNote: note }),
    onSuccess: () => {
      setEditingId(null);
      setStageNote("");
      queryClient.invalidateQueries({ queryKey: ["employee-projects"] });
      toast.success(isArabic ? "تم تحديث مرحلة المشروع وإبلاغ العميل" : "Project stage updated and client notified");
    },
    onError: (error: any) => toast.error(error?.response?.data?.error || (isArabic ? "تعذر تحديث المرحلة" : "Couldn't update the project stage")),
  });

  const projects = data || [];
  const labelForStage = (stage: string) => stageLabels[stage] || stage;
  const formatDate = (value: string) => new Date(value).toLocaleDateString(isArabic ? "ar-SA" : lang, {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6" dir={dir}>
      <header className="rounded-2xl bg-[#071a30] px-6 py-7 text-white shadow-lg sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#dfb978]"><FolderKanban size={23} /></span>
          <div>
            <p className="text-xs font-bold text-[#dfb978]">{ui.employee.portal}</p>
            <h1 className="mt-1 text-2xl font-black">{copy.title || (isArabic ? "مشاريعي" : "My projects")}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
          {isArabic
            ? "حدّث مراحل المشاريع المسندة إليك، وأضف ملاحظة تظهر للعميل. تظهر هنا أيضًا تعليقات العميل واعتماداته."
            : "Update stages for your assigned projects and add a note visible to the client. Client comments and approvals appear here too."}
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20 text-[#8b806f]"><Loader2 className="animate-spin" /></div>
      ) : isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {isArabic ? "تعذر تحميل المشاريع. حاول تحديث الصفحة." : "Couldn't load projects. Refresh and try again."}
        </div>
      ) : projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#ded7ce] bg-[#fffdfa] px-6 py-16 text-center">
          <FolderKanban className="mx-auto mb-3 text-[#c7c0b6]" size={38} />
          <h2 className="font-bold text-[#071a30]">{isArabic ? "لا توجد مشاريع مسندة إليك" : "No projects are assigned to you"}</h2>
          <p className="mt-2 text-sm text-[#8b806f]">{isArabic ? "ستظهر المشاريع هنا بعد تعيينك مديرًا أو عضوًا في الفريق." : "Projects will appear here when you are assigned as manager or team member."}</p>
        </section>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => {
            const history = [...(project.stageHistory || [])].reverse();
            const customer = project.customerId?.companyName || project.customerId?.name;
            return (
              <article key={project._id} className="overflow-hidden rounded-2xl border border-[#e8e0d6] bg-[#fffdfa] shadow-[0_5px_18px_rgba(7,26,48,.04)]">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#eee7de] p-5 sm:p-6">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#9a9288]">{project.projectNumber}</p>
                    <h2 className="mt-1 text-lg font-black text-[#071a30]">{project.name}</h2>
                    {customer && <p className="mt-1 text-xs text-[#8b806f]">{isArabic ? "العميل" : "Client"}: {customer}</p>}
                  </div>
                  <div className="text-end">
                    <span className="rounded-full bg-[#fff3d8] px-3 py-1.5 text-xs font-bold text-[#835b1c]">{labelForStage(project.stage)}</span>
                    <p className="mt-2 text-xs text-[#8b806f]">
                      {isArabic ? `الإنجاز ${project.progress || 0}%` : `${project.progress || 0}% complete`}
                      {project.dueDate ? ` · ${isArabic ? "التسليم" : "Due"} ${formatDate(project.dueDate)}` : ""}
                    </p>
                  </div>
                </header>

                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,.9fr)]">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#071a30]">{isArabic ? "تسلسل المراحل" : "Project stages"}</h3>
                      <button onClick={() => {
                        setEditingId(editingId === project._id ? null : project._id);
                        setNextStage(project.stage);
                        setStageNote("");
                      }} className="rounded-lg bg-[#071a30] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1c2b6e]">
                        {editingId === project._id ? (isArabic ? "إغلاق" : "Close") : (isArabic ? "تحديث المرحلة" : "Update stage")}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {STAGES.map((stage, index) => {
                        const currentIndex = STAGES.indexOf(project.stage);
                        const done = stage === "closed" && project.status === "completed" || index < currentIndex;
                        const current = stage === project.stage;
                        return <span key={stage} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                          current ? "border-[#c59650] bg-[#fff3d8] text-[#715018]"
                            : done ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[#e8e0d6] bg-white text-[#9a9288]"
                        }`}>{labelForStage(stage)}</span>;
                      })}
                    </div>

                    {editingId === project._id && (
                      <form onSubmit={(event) => {
                        event.preventDefault();
                        if (nextStage === project.stage) {
                          toast.error(isArabic ? "اختر مرحلة مختلفة لحفظ التحديث" : "Choose a different stage to save an update");
                          return;
                        }
                        updateMutation.mutate({ id: project._id, stage: nextStage, note: stageNote.trim() });
                      }} className="mt-4 space-y-3 rounded-xl border border-[#e8e0d6] bg-[#f8f5f0] p-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-[#071a30]">{isArabic ? "المرحلة الجديدة" : "New stage"}</label>
                          <select value={nextStage} onChange={(event) => setNextStage(event.target.value)} className="w-full rounded-lg border border-[#d9d0c4] bg-white px-3 py-2 text-sm outline-none focus:border-[#c59650]">
                            {STAGES.map((stage) => <option key={stage} value={stage}>{labelForStage(stage)}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-[#071a30]">{isArabic ? "ملاحظة للعميل" : "Note for the client"}</label>
                          <textarea value={stageNote} onChange={(event) => setStageNote(event.target.value)} rows={3} maxLength={1000}
                            placeholder={isArabic ? "اكتب ملخص التقدم أو المطلوب من العميل..." : "Summarize progress or anything needed from the client..."}
                            className="w-full resize-y rounded-lg border border-[#d9d0c4] bg-white px-3 py-2 text-sm outline-none focus:border-[#c59650]" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded-lg border border-[#d9d0c4] px-3 py-2 text-xs font-bold text-[#556070]"><X size={14} />{isArabic ? "إلغاء" : "Cancel"}</button>
                          <button type="submit" disabled={updateMutation.isPending || nextStage === project.stage}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#c59650] px-3 py-2 text-xs font-bold text-[#071a30] disabled:opacity-50">
                            {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isArabic ? "حفظ وإبلاغ العميل" : "Save & notify client"}
                          </button>
                        </div>
                      </form>
                    )}
                  </section>

                  <section className="min-w-0">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#071a30]">
                      <MessageCircle size={16} className="text-[#b88a4a]" />
                      {isArabic ? "سجل التحديثات وتفاعل العميل" : "Updates & client feedback"}
                    </h3>
                    {history.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#ded7ce] p-4 text-xs text-[#8b806f]">{isArabic ? "لا توجد تحديثات مسجلة بعد." : "No updates have been recorded yet."}</p>
                    ) : (
                      <div className="max-h-[440px] space-y-3 overflow-y-auto pe-1">
                        {history.map((entry) => {
                          const employeeName = nameOf(entry.changedBy);
                          return (
                            <div key={entry._id} className="rounded-xl border border-[#eee7de] bg-white p-3.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <strong className="text-xs text-[#071a30]">{labelForStage(entry.stage)}</strong>
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#9a9288]">
                                  <Clock3 size={11} />{formatDate(entry.changedAt)}{employeeName ? ` · ${employeeName}` : ""}
                                </span>
                              </div>
                              {entry.note && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#556070]">{entry.note}</p>}
                              {entry.customerFeedback?.map((feedback, index) => {
                                const clientName = nameOf(feedback.createdBy);
                                return (
                                  <div key={feedback._id || `${feedback.createdAt}-${index}`} className="mt-2 rounded-lg bg-[#f8f5f0] px-3 py-2">
                                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#1c2b6e]">
                                      {feedback.decision === "approved" ? <CheckCheck size={13} /> : <MessageCircle size={13} />}
                                      {feedback.decision === "approved" ? (isArabic ? "اعتماد العميل" : "Client approval") : (isArabic ? "تعليق العميل" : "Client comment")}
                                      {clientName ? ` · ${clientName}` : ""}
                                    </p>
                                    {feedback.message && <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#556070]">{feedback.message}</p>}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}