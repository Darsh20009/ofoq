import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Send, Loader2, CheckCircle2, AlertCircle, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi, type CandidateInput, type EducationLevel } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";
import CandidateFormFields, { emptyCandidateForm, type CandidateFormState } from "../../components/candidates/CandidateFormFields";
import CandidateDocumentChecklist from "../../components/candidates/CandidateDocumentChecklist";

const STATUS_COLOR: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700 border-blue-200",
  reviewing:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved:    "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-purple-100 text-purple-700 border-purple-200",
  completed:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:    "bg-red-100 text-red-700 border-red-200",
};

const CANDIDATE_STATUS_COLOR: Record<string, string> = {
  submitted:           "bg-gray-100 text-gray-600",
  under_review:        "bg-blue-100 text-blue-700",
  shortlisted:         "bg-indigo-100 text-indigo-700",
  interview_scheduled: "bg-purple-100 text-purple-700",
  offer_extended:      "bg-amber-100 text-amber-700",
  hired:               "bg-emerald-100 text-emerald-700",
  rejected:            "bg-red-100 text-red-700",
  withdrawn:           "bg-gray-100 text-gray-500",
};

const STEPS = ["new", "reviewing", "approved", "in_progress", "completed"];

export default function RequestDetailsPage() {
  const { dir, ui, lang } = useLang();
  const t = ui.request;
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState<CandidateFormState>(emptyCandidateForm());
  const [savingCandidate, setSavingCandidate] = useState(false);
  // Track the most-recently-created candidateId to show its checklist immediately
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-request", id],
    queryFn:  () => clientApi.getRequest(id!).then((r) => r.data.request),
    enabled:  !!id,
  });

  const req = data;
  const isNamedCandidates = req?.requestKind === "named_candidates";
  const isRecruitment     = req?.requestKind === "recruitment";
  const hasCandidates     = isNamedCandidates || isRecruitment;

  const { data: candidatesData, refetch: refetchCandidates } = useQuery({
    queryKey: ["client-candidates", id],
    queryFn:  () => clientApi.getCandidates(id!).then((r) => r.data.candidates).catch(() => []),
    enabled:  !!id && hasCandidates,
  });

  // For recruitment (admin-sourced), show only clientVisible=true rows.
  // For named_candidates (client-submitted), show all — server already filters by submittedBy.
  const allCandidates: any[] = candidatesData || [];
  const candidates: any[] = isRecruitment
    ? allCandidates.filter((c: any) => !!c.isAdminSourced !== false || !!c.clientVisible)
    : allCandidates;

  const candidateStatusLabel: Record<string, string> = {
    submitted:           t.candidateStatusSubmitted,
    under_review:        t.candidateStatusUnderReview,
    shortlisted:         t.candidateStatusShortlisted,
    interview_scheduled: t.candidateStatusInterviewScheduled,
    offer_extended:      t.candidateStatusOfferExtended,
    hired:               t.candidateStatusHired,
    rejected:            t.candidateStatusRejected,
    withdrawn:           t.candidateStatusWithdrawn,
  };

  async function sendNote() {
    if (!note.trim() || !id) return;
    setSending(true);
    try {
      await clientApi.addNote(id, note);
      setNote("");
      qc.invalidateQueries({ queryKey: ["client-request", id] });
      toast.success(ui.client.noteAdded);
    } catch { toast.error(ui.client.noteError); }
    finally { setSending(false); }
  }

  async function saveCandidate() {
    if (!newCandidate.fullName.trim() || !id) return;
    setSavingCandidate(true);
    try {
      const input: CandidateInput = {
        fullName:          newCandidate.fullName,
        contactPhone:      newCandidate.contactPhone || undefined,
        contactEmail:      newCandidate.contactEmail || undefined,
        nationality:       newCandidate.nationality || undefined,
        currentProfession: newCandidate.currentProfession || undefined,
        desiredProfession: newCandidate.desiredProfession || undefined,
        workStatus:        (newCandidate.workStatus as CandidateInput["workStatus"]) || undefined,
        country:           newCandidate.country || undefined,
        candidateNotes:    newCandidate.candidateNotes || undefined,
        isGulfResident:    newCandidate.isGulfResident,
        educationLevel:    (newCandidate.educationLevel as EducationLevel) || undefined,
      };
      const res = await clientApi.addCandidate(id, input);
      const cid: string = res.data.candidate._id;
      await refetchCandidates();
      setJustAddedId(cid);
      setNewCandidate(emptyCandidateForm());
      setAddingCandidate(false);
      toast.success(t.candidateAdded);
    } catch (e: any) {
      toast.error(e.response?.data?.error || t.candidateAddError);
    } finally { setSavingCandidate(false); }
  }

  if (isLoading) return (
    <div className="flex justify-center py-20" dir={dir}>
      <Loader2 size={32} className="animate-spin text-gray-400" />
    </div>
  );

  if (isError || !req) return (
    <div className="text-center py-16" dir={dir}>
      <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">{ui.client.invalidRequest}</p>
      <Link to="/client/requests" className="mt-4 inline-flex items-center gap-2 text-ofoq-navy text-sm hover:text-ofoq-red">
        <ArrowRight size={15} /> {ui.client.backRequests}
      </Link>
    </div>
  );

  const stepIdx = STEPS.indexOf(req.status);

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir={dir}>
      {/* Back */}
      <Link to="/client/requests" className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
        <ArrowRight size={15} /> {ui.client.backRequests}
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-ofoq-navy">{req.companyName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {ui.client.services[req.serviceType] || req.serviceType}
              {req.countryOfRecruitment && ` · ${req.countryOfRecruitment}`}
            </p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_COLOR[req.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {ui.client.status[req.status] || req.status}
          </span>
        </div>
        {req.status !== "rejected" && (
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`h-2 rounded-full flex-1 transition-all ${i <= stepIdx ? "bg-ofoq-navy" : "bg-gray-100"}`} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Request details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-ofoq-navy mb-4">{ui.client.requestDetails}</h2>
        <div className="space-y-2.5">
          {[
            [t.company,       req.companyName],
            [t.commercialReg, req.commercialReg || "—"],
            [t.activity,      req.businessActivity],
            [t.contactEmail,  req.contactEmail],
            [t.contactPhone,  req.contactPhone],
            [t.package,       req.packageType || "—"],
            [t.submitted,     new Date(req.createdAt).toLocaleDateString(lang)],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex gap-3">
              <span className="text-gray-400 text-sm w-32 shrink-0">{k}</span>
              <span className="text-ofoq-navy text-sm font-medium">{String(v)}</span>
            </div>
          ))}
          {req.additionalNotes && (
            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
              <span className="text-gray-400 text-sm w-32 shrink-0">{t.notes}</span>
              <span className="text-ofoq-navy text-sm">{req.additionalNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recruitment meta */}
      {hasCandidates && req.recruitment && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-ofoq-navy mb-4">{t.recruitmentInfo}</h2>
          <div className="space-y-2.5">
            <div className="flex gap-3">
              <span className="text-gray-400 text-sm w-32 shrink-0">{t.recruitmentType}</span>
              <span className="text-ofoq-navy text-sm font-medium">
                {req.requestKind === "named_candidates" ? t.namedCandidates
                  : req.requestKind === "recruitment"    ? t.recruitmentKind
                  : t.generalKind}
              </span>
            </div>
            {req.recruitment.vacancyTitle && (
              <div className="flex gap-3">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.vacancyTitle}</span>
                <span className="text-ofoq-navy text-sm font-medium">{req.recruitment.vacancyTitle}</span>
              </div>
            )}
            {req.recruitment.vacancyCount && (
              <div className="flex gap-3">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.vacancyCount}</span>
                <span className="text-ofoq-navy text-sm font-medium">{req.recruitment.vacancyCount}</span>
              </div>
            )}
            {req.recruitment.targetCountry && (
              <div className="flex gap-3">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.targetCountry}</span>
                <span className="text-ofoq-navy text-sm font-medium">{req.recruitment.targetCountry}</span>
              </div>
            )}
            {req.recruitment.requiredNationality && (
              <div className="flex gap-3">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.requiredNationality}</span>
                <span className="text-ofoq-navy text-sm font-medium">{req.recruitment.requiredNationality}</span>
              </div>
            )}
            {req.recruitment.requiredProfession && (
              <div className="flex gap-3">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.requiredProfession}</span>
                <span className="text-ofoq-navy text-sm font-medium">{req.recruitment.requiredProfession}</span>
              </div>
            )}
            {req.recruitment.additionalRequirements && (
              <div className="flex gap-3 pt-1 border-t border-gray-100 mt-1">
                <span className="text-gray-400 text-sm w-32 shrink-0">{t.additionalRequirements}</span>
                <span className="text-ofoq-navy text-sm">{req.recruitment.additionalRequirements}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidates section */}
      {hasCandidates && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ofoq-navy">{t.candidatesSection}</h2>
            <span className="text-xs text-gray-400">{candidates.length} {t.candidateCount}</span>
          </div>

          {candidates.length > 0 && (
            <div className="space-y-3 mb-4">
              {candidates.map((c: any) => {
                const cid: string = String(c._id);
                // isAdminSourced is present on admin-sourced rows (toClientVisibleAdminView sets it)
                const isAdminSourced: boolean = !!c.isAdminSourced;
                return (
                  <div key={cid} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ofoq-navy text-sm">{c.fullName}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {c.nationality && <span className="text-xs text-gray-500">{c.nationality}</span>}
                          {c.desiredProfession && <span className="text-xs text-gray-500">· {c.desiredProfession}</span>}
                          {c.country && <span className="text-xs text-gray-400">{c.country}</span>}
                          {/* Phone only for client-submitted candidates */}
                          {!isAdminSourced && c.contactPhone && (
                            <span className="text-xs text-gray-400" dir="ltr">{c.contactPhone}</span>
                          )}
                        </div>
                        {c.candidateNotes && (
                          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2 py-1">{c.candidateNotes}</p>
                        )}
                      </div>
                      {c.publicStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${CANDIDATE_STATUS_COLOR[c.publicStatus] || "bg-gray-100 text-gray-500"}`}>
                          {candidateStatusLabel[c.publicStatus] || c.publicStatus}
                        </span>
                      )}
                    </div>

                    {/*
                      Document checklist — only for client-owned candidates (not admin-sourced).
                      The server's toClientOwnedView returns documentRequirements inline,
                      but we fetch fresh from the requirements endpoint so uploads reflect immediately.
                      Never show documents for admin-sourced candidates.
                    */}
                    {!isAdminSourced && id && (
                      <CandidateDocumentChecklist requestId={id} candidateId={cid} />
                    )}

                    {/* Highlight freshly-added candidate */}
                    {justAddedId === cid && (
                      <p className="text-xs text-emerald-600 mt-2">{t.candidateAdded}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add candidate — named_candidates only; not for admin-sourced recruitment */}
          {isNamedCandidates && !["completed", "rejected"].includes(req.status) && (
            addingCandidate ? (
              <div className="border border-gray-100 rounded-xl p-4 space-y-4 mt-2">
                <p className="text-sm font-semibold text-ofoq-navy">{t.addCandidate}</p>
                <CandidateFormFields value={newCandidate} onChange={setNewCandidate} />
                <div className="flex gap-2">
                  <button type="button" onClick={saveCandidate} disabled={savingCandidate}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-ofoq-navy text-white text-sm font-medium hover:bg-ofoq-red disabled:opacity-60 transition-colors">
                    {savingCandidate ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                    {t.addCandidate}
                  </button>
                  <button type="button" onClick={() => { setAddingCandidate(false); setNewCandidate(emptyCandidateForm()); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    {t.previous}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => { setAddingCandidate(true); setJustAddedId(null); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 hover:border-ofoq-navy/40 hover:text-ofoq-navy transition-colors">
                <UserPlus size={15} /> {t.addCandidate}
              </button>
            )
          )}

          {/* No-candidates placeholder for recruitment */}
          {isRecruitment && candidates.length === 0 && (
            <p className="text-center text-xs text-gray-400 py-4">{t.candidateStatusSubmitted} · {t.candidateCount}: 0</p>
          )}
        </div>
      )}

      {/* Status timeline */}
      {req.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-ofoq-navy mb-4">{ui.client.statusHistory}</h2>
          <div className="relative space-y-3 pr-6">
            <div className="absolute top-0 bottom-0 right-2 w-px bg-gray-100" />
            {[...req.statusHistory].reverse().map((h: any, i: number) => (
              <div key={i} className="relative">
                <div className="absolute -right-6 w-4 h-4 rounded-full border-2 border-ofoq-navy bg-white top-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ofoq-navy">{ui.client.status[h.status] || h.status}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(h.changedAt).toLocaleString(lang)}
                    {h.changedBy && ` · ${h.changedBy}`}
                  </p>
                  {h.note && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg p-2">{h.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin messages */}
      {req.notes?.filter((n: any) => n.from === "admin" && !n.isInternal).length > 0 && (
        <div className="bg-ofoq-navy/5 rounded-2xl border border-ofoq-navy/10 p-6">
          <h2 className="font-bold text-ofoq-navy mb-3">{ui.client.messages}</h2>
          <div className="space-y-3">
            {req.notes.filter((n: any) => n.from === "admin" && !n.isInternal).map((n: any, i: number) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-ofoq-navy/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-ofoq-navy">{n.authorName}</span>
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString(lang)}</span>
                </div>
                <p className="text-sm text-gray-700">{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add note */}
      {!["completed", "rejected"].includes(req.status) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-ofoq-navy mb-3">{ui.client.addNote}</h2>
          <div className="flex gap-3">
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder={ui.client.notePlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
            <button onClick={sendNote} disabled={!note.trim() || sending}
              className="px-4 py-3 bg-ofoq-navy text-white rounded-xl hover:bg-ofoq-red disabled:opacity-50 transition-colors self-start">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
