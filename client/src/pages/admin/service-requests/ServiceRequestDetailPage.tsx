import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, Loader2, AlertCircle, Send, ChevronDown,
  Clock, MessageSquare, UserPlus, Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi, type CandidateInput, type AdminCandidatePatch, type CandidatePublicStatus } from "../../../api/clientApi";
import { useLang } from "../../../i18n/LangContext";

const STATUS_OPTIONS = [
  { value: "new",         color: "bg-blue-100 text-blue-700" },
  { value: "reviewing",   color: "bg-yellow-100 text-yellow-700" },
  { value: "approved",    color: "bg-green-100 text-green-700" },
  { value: "in_progress", color: "bg-purple-100 text-purple-700" },
  { value: "completed",   color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected",    color: "bg-red-100 text-red-700" },
];

/** Matches CANDIDATE_PUBLIC_STATUS_AR keys in server model */
const CANDIDATE_PUBLIC_STATUSES: { value: CandidatePublicStatus; color: string }[] = [
  { value: "submitted",           color: "bg-gray-100 text-gray-600" },
  { value: "under_review",        color: "bg-blue-100 text-blue-700" },
  { value: "shortlisted",         color: "bg-indigo-100 text-indigo-700" },
  { value: "interview_scheduled", color: "bg-purple-100 text-purple-700" },
  { value: "offer_extended",      color: "bg-amber-100 text-amber-700" },
  { value: "hired",               color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected",            color: "bg-red-100 text-red-700" },
  { value: "withdrawn",           color: "bg-gray-100 text-gray-500" },
];

interface NewCandidateForm {
  fullName: string;
  contactPhone: string;
  contactEmail: string;
  nationality: string;
  currentProfession: string;
  desiredProfession: string;
  workStatus: string;
  country: string;
  candidateNotes: string;
  internalNotes: string;
  publicStatus: string;
  clientVisible: boolean;
}

export default function ServiceRequestDetailPage() {
  const { ui, lang, dir } = useLang();
  const t = ui.request;
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const [statusDropdown, setStatusDropdown] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCand, setNewCand] = useState<NewCandidateForm>({
    fullName: "", contactPhone: "", contactEmail: "",
    nationality: "", currentProfession: "", desiredProfession: "",
    workStatus: "", country: "", candidateNotes: "",
    internalNotes: "", publicStatus: "submitted", clientVisible: false,
  });
  const [savingCandidate, setSavingCandidate] = useState(false);

  // Per-candidate inline edit state
  const [editingCid, setEditingCid] = useState<string | null>(null);
  const [editPatch, setEditPatch] = useState<{ publicStatus: string; internalNotes: string; clientVisible: boolean }>({
    publicStatus: "", internalNotes: "", clientVisible: false,
  });
  const [savingCid, setSavingCid] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-sr-detail", id],
    queryFn:  () => clientApi.adminGetRequest(id!).then((r) => r.data.request),
    enabled:  !!id,
  });

  const req = data;
  const hasRecruitment = req?.requestKind === "named_candidates" || req?.requestKind === "recruitment";

  const { data: candidatesData, refetch: refetchCandidates } = useQuery({
    queryKey: ["admin-candidates", id],
    queryFn:  () => clientApi.adminGetCandidates(id!).then((r) => r.data.candidates).catch(() => []),
    enabled:  !!id && !!hasRecruitment,
  });

  const candidates: any[] = candidatesData || [];

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

  async function changeStatus(newStatus: string) {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await clientApi.adminUpdateStatus(id, newStatus, statusNote || undefined);
      qc.invalidateQueries({ queryKey: ["admin-sr-detail", id] });
      qc.invalidateQueries({ queryKey: ["admin-service-requests"] });
      setStatusDropdown(false);
      setStatusNote("");
      toast.success(ui.client.statusUpdated);
    } catch (e: any) {
      // Surface the backend completeness error text directly so the admin
      // can see exactly which candidates have missing documents.
      const serverMsg: string | undefined = e?.response?.data?.error;
      toast.error(serverMsg || ui.client.statusUpdateError, { duration: 8000 });
    } finally { setUpdatingStatus(false); }
  }

  async function addNote() {
    if (!id || !noteText.trim()) return;
    setAddingNote(true);
    try {
      await clientApi.adminAddNote(id, noteText, isInternal);
      qc.invalidateQueries({ queryKey: ["admin-sr-detail", id] });
      setNoteText(""); setIsInternal(false);
      toast.success(ui.client.noteAdded);
    } catch {
      toast.error(ui.client.noteError);
    } finally { setAddingNote(false); }
  }

  async function addCandidate() {
    if (!id || !newCand.fullName.trim()) return;
    setSavingCandidate(true);
    try {
      const input: CandidateInput & { internalNotes?: string; publicStatus?: string; clientVisible?: boolean } = {
        fullName:          newCand.fullName,
        contactPhone:      newCand.contactPhone || undefined,
        contactEmail:      newCand.contactEmail || undefined,
        nationality:       newCand.nationality || undefined,
        currentProfession: newCand.currentProfession || undefined,
        desiredProfession: newCand.desiredProfession || undefined,
        workStatus:        (newCand.workStatus as CandidateInput["workStatus"]) || undefined,
        country:           newCand.country || undefined,
        candidateNotes:    newCand.candidateNotes || undefined,
        internalNotes:     newCand.internalNotes || undefined,
        publicStatus:      newCand.publicStatus || "submitted",
        clientVisible:     newCand.clientVisible,
      };
      await clientApi.adminAddCandidate(id, input);
      refetchCandidates();
      setNewCand({ fullName: "", contactPhone: "", contactEmail: "", nationality: "",
        currentProfession: "", desiredProfession: "", workStatus: "", country: "",
        candidateNotes: "", internalNotes: "", publicStatus: "submitted", clientVisible: false });
      setShowAddCandidate(false);
      toast.success(t.candidateAdded);
    } catch {
      toast.error(t.candidateAddError);
    } finally { setSavingCandidate(false); }
  }

  async function saveCandidatePatch(cid: string) {
    if (!id) return;
    setSavingCid(cid);
    try {
      const patch: AdminCandidatePatch = {};
      if (editPatch.publicStatus) patch.publicStatus = editPatch.publicStatus as CandidatePublicStatus;
      if (editPatch.internalNotes !== "") patch.internalNotes = editPatch.internalNotes;
      patch.clientVisible = editPatch.clientVisible;
      await clientApi.adminUpdateCandidate(id, cid, patch);
      refetchCandidates();
      setEditingCid(null);
      setEditPatch({ publicStatus: "", internalNotes: "", clientVisible: false });
      toast.success(t.candidateUpdated);
    } catch {
      toast.error(t.candidateUpdateError);
    } finally { setSavingCid(null); }
  }

  if (isLoading) return (
    <div className="flex justify-center py-20" dir={dir}>
      <Loader2 size={32} className="animate-spin text-gray-300" />
    </div>
  );

  if (isError || !req) return (
    <div className="text-center py-16" dir={dir}>
      <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">{ui.client.requestNotFound}</p>
      <Link to="/admin/service-requests" className="mt-4 inline-flex items-center gap-2 text-ofoq-navy text-sm">
        <ArrowRight size={15} /> {ui.client.requests}
      </Link>
    </div>
  );

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === req.status);
  const statusLabels = ui.client.status;
  const packageLabels: Record<string, string> = {
    silver: ui.packages.silver,
    gold: ui.packages.gold,
    platinum: ui.packages.platinum,
  };
  const locale = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang;

  return (
    <div className="space-y-6 max-w-3xl" dir={dir}>
      {/* Back */}
      <Link to="/admin/service-requests"
        className="inline-flex items-center gap-2 text-gray-400 text-sm hover:text-ofoq-navy transition-colors">
        <ArrowRight size={15} /> {ui.client.requests}
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-ofoq-navy">{req.companyName}</h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {ui.client.services[req.serviceType] || req.serviceType}
              {req.countryOfRecruitment && ` · ${req.countryOfRecruitment}`}
            </p>
            <p className="text-gray-300 text-xs mt-1">#{String(req._id).slice(-8)}</p>
          </div>

          {/* Status changer */}
          <div className="relative">
            <button onClick={() => setStatusDropdown(!statusDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${currentStatus?.color || "bg-gray-100 text-gray-600"}`}>
              {currentStatus ? statusLabels[currentStatus.value] || currentStatus.value : req.status}
              <ChevronDown size={14} className={`transition-transform ${statusDropdown ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {statusDropdown && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-4">
                  <p className="text-xs font-semibold text-gray-400 mb-3">{ui.client.changeStatus}</p>
                  <div className="space-y-1 mb-3">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s.value}
                        disabled={s.value === req.status || updatingStatus}
                        onClick={() => changeStatus(s.value)}
                        className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                          s.value === req.status ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50"
                        }`}>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${s.color}`}>{statusLabels[s.value] || s.value}</span>
                      </button>
                    ))}
                  </div>
                  <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                    rows={2} placeholder={ui.client.statusNotePlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-ofoq-navy/30 resize-none" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
          {[
            [ui.client.client, req.clientId?.fullName || req.clientEmail],
            [t.contactEmail,   req.contactEmail],
            [t.contactPhone,   req.contactPhone],
            [t.commercialReg,  req.commercialReg || "—"],
            [t.activity,       req.businessActivity],
            [t.package,        req.packageType ? packageLabels[req.packageType] || "—" : "—"],
            [t.submitted,      new Date(req.createdAt).toLocaleDateString(locale)],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <p className="text-xs text-gray-400 mb-0.5">{k}</p>
              <p className="text-sm font-medium text-ofoq-navy">{String(v)}</p>
            </div>
          ))}
        </div>
        {req.additionalNotes && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 text-sm text-gray-600">
            <p className="text-xs text-gray-400 mb-1">{ui.client.customerNotes}</p>
            {req.additionalNotes}
          </div>
        )}
      </div>

      {/* Recruitment meta */}
      {hasRecruitment && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-ofoq-navy mb-4">{t.recruitmentInfo}</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t.recruitmentType}</p>
              <p className="text-sm font-medium text-ofoq-navy">
                {req.requestKind === "named_candidates" ? t.namedCandidates
                  : req.requestKind === "recruitment"    ? t.recruitmentKind
                  : t.generalKind}
              </p>
            </div>
            {req.recruitment?.vacancyTitle && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t.vacancyTitle}</p>
                <p className="text-sm font-medium text-ofoq-navy">{req.recruitment.vacancyTitle}</p>
              </div>
            )}
            {req.recruitment?.vacancyCount && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t.vacancyCount}</p>
                <p className="text-sm font-medium text-ofoq-navy">{req.recruitment.vacancyCount}</p>
              </div>
            )}
            {req.recruitment?.targetCountry && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t.targetCountry}</p>
                <p className="text-sm font-medium text-ofoq-navy">{req.recruitment.targetCountry}</p>
              </div>
            )}
            {req.recruitment?.requiredNationality && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t.requiredNationality}</p>
                <p className="text-sm font-medium text-ofoq-navy">{req.recruitment.requiredNationality}</p>
              </div>
            )}
            {req.recruitment?.requiredProfession && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">{t.requiredProfession}</p>
                <p className="text-sm font-medium text-ofoq-navy">{req.recruitment.requiredProfession}</p>
              </div>
            )}
          </div>
          {req.recruitment?.additionalRequirements && (
            <div className="mt-3 p-3 rounded-xl bg-gray-50 text-sm text-gray-600">
              <p className="text-xs text-gray-400 mb-1">{t.additionalRequirements}</p>
              {req.recruitment.additionalRequirements}
            </div>
          )}
        </div>
      )}

      {/* Candidates panel */}
      {hasRecruitment && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ofoq-navy flex items-center gap-2">
              <Users size={16} /> {t.candidatesSection}
            </h2>
            <span className="text-xs text-gray-400">{candidates.length} {t.candidateCount}</span>
          </div>

          {candidates.length > 0 && (
            <div className="space-y-3 mb-4">
              {candidates.map((c: any) => {
                const cid = String(c._id || c.id);
                const isEditing = editingCid === cid;
                const currentPublicStatus = CANDIDATE_PUBLIC_STATUSES.find((s) => s.value === c.publicStatus);
                return (
                  <div key={cid} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ofoq-navy text-sm">{c.fullName}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                          {c.nationality && <span className="text-xs text-gray-500">{c.nationality}</span>}
                          {c.desiredProfession && <span className="text-xs text-gray-500">{c.desiredProfession}</span>}
                          {c.country && <span className="text-xs text-gray-400">{c.country}</span>}
                          {c.contactPhone && <span className="text-xs text-gray-400" dir="ltr">{c.contactPhone}</span>}
                        </div>
                        {/* candidateNotes — visible to client */}
                        {c.candidateNotes && (
                          <p className="text-xs text-gray-500 mt-1.5 bg-gray-50 rounded-lg px-2 py-1">{c.candidateNotes}</p>
                        )}
                        {/* internalNotes — admin-only */}
                        {c.internalNotes && (
                          <p className="text-xs text-amber-700 mt-1 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                            {c.internalNotes}
                          </p>
                        )}
                      </div>
                      {!isEditing && (
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {c.publicStatus && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${currentPublicStatus?.color || "bg-gray-100 text-gray-500"}`}>
                              {candidateStatusLabel[c.publicStatus] || c.publicStatus}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.clientVisible ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
                            {t.candidateClientVisible}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Inline edit */}
                    {isEditing ? (
                      <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                        <div className="flex gap-2">
                          <select
                            value={editPatch.publicStatus || c.publicStatus || ""}
                            onChange={(e) => setEditPatch((p) => ({ ...p, publicStatus: e.target.value }))}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20">
                            {CANDIDATE_PUBLIC_STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>{candidateStatusLabel[s.value]}</option>
                            ))}
                          </select>
                        </div>
                        <input
                          value={editPatch.internalNotes}
                          onChange={(e) => setEditPatch((p) => ({ ...p, internalNotes: e.target.value }))}
                          placeholder={t.adminCandidateInternalNotes}
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-100 bg-amber-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-200" />
                        {/* Visibility toggle */}
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={editPatch.clientVisible}
                            onChange={(e) => setEditPatch((p) => ({ ...p, clientVisible: e.target.checked }))}
                            className="mt-0.5 rounded accent-ofoq-navy"
                          />
                          <span className="flex flex-col">
                            <span className="text-xs font-medium text-ofoq-navy">{t.candidateClientVisible}</span>
                            <span className="text-xs text-gray-400 leading-tight">{t.candidateClientVisibleHint}</span>
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <button disabled={savingCid === cid} onClick={() => saveCandidatePatch(cid)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-ofoq-navy text-white text-xs font-medium hover:bg-ofoq-red disabled:opacity-50 transition-colors">
                            {savingCid === cid ? <Loader2 size={12} className="animate-spin" /> : null}
                            {t.updateCandidate}
                          </button>
                          <button onClick={() => { setEditingCid(null); setEditPatch({ publicStatus: "", internalNotes: "" }); }}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCid(cid);
                          setEditPatch({
                            publicStatus: c.publicStatus || "submitted",
                            internalNotes: c.internalNotes || "",
                            clientVisible: !!c.clientVisible,
                          });
                        }}
                        className="mt-2 text-xs text-gray-400 hover:text-ofoq-navy transition-colors">
                        {t.updateCandidate}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add candidate form */}
          {showAddCandidate ? (
            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-ofoq-navy">{t.adminAddCandidateTitle}</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["fullName",          t.candidateName,            false],
                  ["contactPhone",      t.candidatePhone,           true],
                  ["nationality",       t.candidateNationality,     false],
                  ["country",           t.candidateCountry,         false],
                  ["currentProfession", t.candidateCurrentProfession, false],
                  ["desiredProfession", t.candidateDesiredProfession, false],
                ] as [keyof NewCandidateForm, string, boolean][]).map(([field, label, ltr]) => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label}{field === "fullName" && <span className="text-red-500"> *</span>}
                    </label>
                    <input value={newCand[field]} dir={ltr ? "ltr" : undefined}
                      onChange={(e) => setNewCand({ ...newCand, [field]: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t.candidateWorkStatus}</label>
                  <select value={newCand.workStatus}
                    onChange={(e) => setNewCand({ ...newCand, workStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20">
                    <option value="">—</option>
                    <option value="employed">{t.workStatusEmployed}</option>
                    <option value="unemployed">{t.workStatusUnemployed}</option>
                    <option value="freelance">{t.workStatusFreelance}</option>
                    <option value="student">{t.workStatusStudent}</option>
                    <option value="other">{t.workStatusOther}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t.adminCandidatePublicStatus}</label>
                  <select value={newCand.publicStatus}
                    onChange={(e) => setNewCand({ ...newCand, publicStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20">
                    {CANDIDATE_PUBLIC_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{candidateStatusLabel[s.value]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.candidateNotes}</label>
                <textarea value={newCand.candidateNotes} rows={2}
                  onChange={(e) => setNewCand({ ...newCand, candidateNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t.adminCandidateInternalNotes}</label>
                <textarea value={newCand.internalNotes} rows={2}
                  onChange={(e) => setNewCand({ ...newCand, internalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-amber-100 bg-amber-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-200 resize-none" />
              </div>
              {/* Client visibility toggle for new candidate */}
              <label className="flex items-start gap-2 cursor-pointer select-none p-3 rounded-xl border border-gray-100 bg-gray-50">
                <input
                  type="checkbox"
                  checked={newCand.clientVisible}
                  onChange={(e) => setNewCand({ ...newCand, clientVisible: e.target.checked })}
                  className="mt-0.5 rounded accent-ofoq-navy"
                />
                <span className="flex flex-col">
                  <span className="text-xs font-medium text-ofoq-navy">{t.candidateClientVisible}</span>
                  <span className="text-xs text-gray-400 leading-tight">{t.candidateClientVisibleHint}</span>
                </span>
              </label>
              <div className="flex gap-2">
                <button onClick={addCandidate} disabled={savingCandidate}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-ofoq-navy text-white text-sm font-medium hover:bg-ofoq-red disabled:opacity-60 transition-colors">
                  {savingCandidate ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  {t.addCandidate}
                </button>
                <button onClick={() => setShowAddCandidate(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddCandidate(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:border-ofoq-navy/30 hover:text-ofoq-navy transition-colors">
              <UserPlus size={15} /> {t.adminAddCandidateTitle}
            </button>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-ofoq-navy mb-4 flex items-center gap-2">
          <MessageSquare size={16} /> {ui.client.notesTitle}
        </h2>

        <div className="space-y-3 mb-5">
          {(!req.notes || req.notes.length === 0) && (
            <p className="text-gray-300 text-sm text-center py-4">{ui.client.noNotes}</p>
          )}
          {(req.notes || []).map((n: any, i: number) => (
            <div key={i} className={`p-4 rounded-xl border text-sm ${
              n.isInternal ? "bg-amber-50 border-amber-200"
              : n.from === "admin" ? "bg-ofoq-navy/5 border-ofoq-navy/10"
              : "bg-gray-50 border-gray-100"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${n.from === "admin" ? "text-ofoq-navy" : "text-gray-500"}`}>
                  {n.authorName}{n.isInternal && ` · ${ui.client.internalNote}`}
                </span>
                <span className="text-xs text-gray-300">{new Date(n.createdAt).toLocaleDateString(locale)}</span>
              </div>
              <p className="text-gray-700">{n.text}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
            rows={2} placeholder={ui.client.notePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} className="rounded" />
              {ui.client.internalNote}
            </label>
            <button onClick={addNote} disabled={!noteText.trim() || addingNote}
              className="flex items-center gap-2 px-4 py-2 bg-ofoq-navy text-white rounded-xl text-sm font-medium hover:bg-ofoq-red disabled:opacity-50 transition-colors">
              {addingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {ui.client.add}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {req.statusHistory?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-ofoq-navy mb-4 flex items-center gap-2">
            <Clock size={16} /> {ui.client.history}
          </h2>
          <div className="relative space-y-3 pr-6">
            <div className="absolute top-0 bottom-0 right-2 w-px bg-gray-100" />
            {[...req.statusHistory].reverse().map((h: any, i: number) => {
              const sOpt = STATUS_OPTIONS.find((s) => s.value === h.status);
              return (
                <div key={i} className="relative">
                  <div className="absolute -right-6 w-4 h-4 rounded-full border-2 border-ofoq-navy bg-white top-0.5" />
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sOpt?.color || "bg-gray-100 text-gray-600"}`}>
                      {sOpt ? statusLabels[sOpt.value] || sOpt.value : h.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(h.changedAt).toLocaleString(locale)}
                      {h.changedBy && ` · ${h.changedBy}`}
                    </p>
                    {h.note && <p className="text-xs text-gray-500 mt-1 bg-gray-50 rounded-lg p-2">{h.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
