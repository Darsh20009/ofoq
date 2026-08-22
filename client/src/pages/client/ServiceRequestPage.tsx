import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CheckCircle2,
  Building2, Briefcase, FileText, Loader2, UserPlus, Trash2, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { clientApi, type RequestKind, type CandidateInput, type EducationLevel } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";
import PhoneInput from "../../components/forms/PhoneInput";
import CandidateFormFields, { emptyCandidateForm, type CandidateFormState } from "../../components/candidates/CandidateFormFields";
import CandidateDocumentChecklist from "../../components/candidates/CandidateDocumentChecklist";

const SERVICES = [
  { value: "company_formation" },
  { value: "legal_services" },
  { value: "trademark" },
  { value: "government_services" },
  { value: "hr_management" },
  { value: "gov_platforms" },
  { value: "investor_services" },
  { value: "ipo_preparation" },
  { value: "recruitment" },
];

const PACKAGES = [
  { value: "silver",   label: "فضية" },
  { value: "gold",     label: "ذهبية" },
  { value: "platinum", label: "بلاتينية" },
];

const COUNTRIES = [
  "المملكة العربية السعودية","الإمارات","قطر","الكويت","البحرين","عُمان",
  "اليمن","مصر","الأردن","العراق","تركيا","أثيوبيا","أوغندا","الفلبين","الهند","الباكستان","أخرى",
];

const STEPS = [Building2, Briefcase, FileText, CheckCircle2];

const HR_SERVICES = ["hr_management", "recruitment"];

/** A buffered candidate: form fields + the candidateId returned after creation */
interface BufferedCandidate {
  form: CandidateFormState;
  /** Set after the candidate is POSTed to the server */
  candidateId: string | null;
}

/**
 * Per-candidate document completeness tracked in parent state so the finish
 * button can be blocked and a clear explanation shown.
 */
interface CandidateDocState {
  complete: boolean;
  missingLabels: string[];
}

interface Form {
  companyName: string; commercialReg: string; businessActivity: string;
  contactEmail: string; contactPhone: string;
  serviceType: string; countryOfRecruitment: string; packageType: string; additionalNotes: string;
  requestKind: RequestKind | "";
  vacancyTitle: string; vacancyCount: string;
  targetCountry: string; additionalRequirements: string;
  requiredNationality: string; requiredProfession: string;
}

export default function ServiceRequestPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // After the SR is created (named_candidates flow)
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);
  // Buffered list of candidates (saved to server one-by-one as they are confirmed)
  const [buffered, setBuffered] = useState<BufferedCandidate[]>([]);
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [newCandidate, setNewCandidate] = useState<CandidateFormState>(emptyCandidateForm());
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [finishingUp, setFinishingUp] = useState(false);
  // Per-candidate doc completeness: key = candidateId
  const [docState, setDocState] = useState<Record<string, CandidateDocState>>({});
  const [deletingCid, setDeletingCid] = useState<string | null>(null);

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const requestedService = params.get("service") || "";
  const initialService = SERVICES.some((s) => s.value === requestedService) ? requestedService : "";
  const { ui, dir } = useLang();
  const t = ui.request;

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<Form>({
    defaultValues: { serviceType: initialService, requestKind: "" },
  });
  const all = watch();

  const isHrService = HR_SERVICES.includes(all.serviceType);
  const isNamedCandidates = all.requestKind === "named_candidates";
  const isRecruitment = all.requestKind === "recruitment";

  // ── Submit main request form ─────────────────────────────────────
  async function onSubmit(data: Form) {
    setSubmitting(true);
    try {
      const kind: RequestKind = isHrService && data.requestKind
        ? (data.requestKind as RequestKind)
        : "general";

      const payload: Parameters<typeof clientApi.createRequest>[0] = {
        companyName:      data.companyName,
        commercialReg:    data.commercialReg || undefined,
        businessActivity: data.businessActivity,
        contactEmail:     data.contactEmail,
        contactPhone:     data.contactPhone,
        serviceType:      data.serviceType,
        countryOfRecruitment: data.countryOfRecruitment || undefined,
        packageType:      data.packageType || undefined,
        additionalNotes:  data.additionalNotes || undefined,
        requestKind:      kind,
      };

      if (kind === "named_candidates" || kind === "recruitment") {
        payload.recruitment = {
          vacancyTitle:           data.vacancyTitle || undefined,
          vacancyCount:           data.vacancyCount ? Number(data.vacancyCount) : undefined,
          targetCountry:          data.targetCountry || undefined,
          additionalRequirements: data.additionalRequirements || undefined,
          requiredNationality:    data.requiredNationality || undefined,
          requiredProfession:     data.requiredProfession || undefined,
        };
      }

      const res = await clientApi.createRequest(payload);
      const id: string = res.data.request._id;

      if (kind === "named_candidates") {
        setCreatedRequestId(id);
        toast.success(t.success);
        return;
      }

      toast.success(t.success);
      navigate(`/client/requests/${id}`);
    } catch (e: any) {
      toast.error(e.response?.data?.error || t.error);
    } finally { setSubmitting(false); }
  }

  // ── Add a candidate: POST to server immediately so docs can be uploaded ──
  async function confirmAddCandidate() {
    if (!newCandidate.fullName.trim() || !createdRequestId) {
      toast.error(t.required);
      return;
    }
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
      const res = await clientApi.addCandidate(createdRequestId, input);
      const candidateId: string = res.data.candidate._id;
      setBuffered((prev) => [...prev, { form: { ...newCandidate }, candidateId }]);
      setNewCandidate(emptyCandidateForm());
      setAddingCandidate(false);
      toast.success(t.candidateAdded);
    } catch (e: any) {
      toast.error(e.response?.data?.error || t.candidateAddError);
    } finally { setSavingCandidate(false); }
  }

  async function removeBuffered(idx: number) {
    const b = buffered[idx];
    if (!b) return;
    if (b.candidateId && createdRequestId) {
      // Delete from server so no ghost record remains
      setDeletingCid(b.candidateId);
      try {
        await clientApi.deleteCandidate(createdRequestId, b.candidateId);
        // Remove completeness entry
        setDocState((prev) => {
          const next = { ...prev };
          delete next[b.candidateId!];
          return next;
        });
      } catch (e: any) {
        toast.error(e.response?.data?.error || t.candidateDeleteError);
        setDeletingCid(null);
        return;
      }
      setDeletingCid(null);
    }
    setBuffered((prev) => prev.filter((_, i) => i !== idx));
  }

  function finish() {
    if (!createdRequestId) return;
    navigate(`/client/requests/${createdRequestId}`);
  }

  // Compute blocking reason for the finish button
  function finishBlockReason(): string | null {
    if (buffered.length === 0) return t.finishNoCandidates;
    const incomplete = buffered.filter((b) => {
      if (!b.candidateId) return true; // still saving
      const ds = docState[b.candidateId];
      return !ds || !ds.complete;
    });
    if (incomplete.length === 0) return null;
    // Collect all missing labels across incomplete candidates
    const allMissing: string[] = [];
    for (const b of incomplete) {
      if (!b.candidateId) continue;
      const ds = docState[b.candidateId];
      if (ds && ds.missingLabels.length > 0) {
        allMissing.push(...ds.missingLabels.filter((l) => !allMissing.includes(l)));
      }
    }
    const suffix = allMissing.length > 0 ? ` ${allMissing.join("، ")}` : "";
    return `${t.finishDocsIncomplete}${suffix}`;
  }

  function next() { setStep((s) => Math.min(s + 1, 3)); }
  function prev() { setStep((s) => Math.max(s - 1, 0)); }

  // ── Named-candidates post-creation screen ────────────────────────
  if (createdRequestId) {
    const blockReason = finishBlockReason();

    return (
      <div className="max-w-2xl mx-auto space-y-5" dir={dir}>
        <div>
          <h1 className="text-xl font-bold text-ofoq-navy">{t.candidatesSection}</h1>
          <p className="text-gray-400 text-sm mt-1">{t.namedCandidatesDesc}</p>
        </div>

        {/* Buffered candidates with inline document checklists */}
        {buffered.length > 0 && (
          <div className="space-y-3">
            {buffered.map((b, i) => {
              const isDeleting = deletingCid !== null && deletingCid === b.candidateId;
              return (
                <div key={b.candidateId ?? i} className="bg-white rounded-xl border border-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ofoq-navy text-sm truncate">{b.form.fullName}</p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {b.form.nationality && `${b.form.nationality} · `}
                        {b.form.desiredProfession || b.form.currentProfession}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => removeBuffered(i)}
                      className="text-gray-300 hover:text-red-400 disabled:opacity-40 transition-colors shrink-0"
                      aria-label="Remove candidate"
                    >
                      {isDeleting
                        ? <Loader2 size={14} className="animate-spin text-gray-400" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                  {/* Document checklist — only when we have a real server candidateId */}
                  {b.candidateId && (
                    <CandidateDocumentChecklist
                      requestId={createdRequestId}
                      candidateId={b.candidateId}
                      onComplete={(complete, missingLabels) =>
                        setDocState((prev) => ({
                          ...prev,
                          [b.candidateId!]: { complete, missingLabels },
                        }))
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add candidate form or button */}
        {addingCandidate ? (
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
            <p className="text-sm font-semibold text-ofoq-navy">{t.addCandidate}</p>
            <CandidateFormFields value={newCandidate} onChange={setNewCandidate} />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmAddCandidate}
                disabled={savingCandidate}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-ofoq-navy text-white text-sm font-medium hover:bg-ofoq-red disabled:opacity-60 transition-colors"
              >
                {savingCandidate
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle2 size={14} />}
                {t.addCandidate}
              </button>
              <button
                type="button"
                onClick={() => { setAddingCandidate(false); setNewCandidate(emptyCandidateForm()); }}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {t.previous}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCandidate(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-500 hover:border-ofoq-navy/40 hover:text-ofoq-navy transition-colors"
          >
            <UserPlus size={15} /> {t.addCandidate}
          </button>
        )}

        {/* Blocking message — shown above the finish button when submission is incomplete */}
        {blockReason && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <span>{blockReason}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">{buffered.length} {t.candidateCount}</p>
          <button
            onClick={finish}
            disabled={!!blockReason || finishingUp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {finishingUp
              ? <Loader2 size={15} className="animate-spin" />
              : <CheckCircle2 size={15} />}
            {t.submit}
          </button>
        </div>
      </div>
    );
  }

  // ── Multi-step request form ───────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto" dir={dir}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ofoq-navy">{t.title}</h1>
        <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((_, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? "text-ofoq-navy" : "text-gray-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                i < step     ? "bg-emerald-500 border-emerald-500 text-white"
                : i === step ? "bg-ofoq-navy border-ofoq-navy text-white"
                : "border-gray-200 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{t.steps[i]}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px flex-1 ${i < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* ── Step 0: Company ─────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">{t.steps[0]}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.company} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("companyName", { required: t.required })}
                  placeholder={t.company}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.companyName ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                />
                {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.commercialReg}</label>
                <input {...register("commercialReg")} dir="ltr" placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.activity} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("businessActivity", { required: t.required })}
                  placeholder={t.activity}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.businessActivity ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                />
                {errors.businessActivity && <p className="mt-1 text-xs text-red-500">{errors.businessActivity.message}</p>}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Contact ─────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">{t.steps[1]}</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.contactEmail} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" dir="ltr"
                  {...register("contactEmail", { required: t.required })}
                  placeholder="contact@company.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.contactEmail ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                />
                {errors.contactEmail && <p className="mt-1 text-xs text-red-500">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t.contactPhone} <span className="text-red-500">*</span>
                </label>
                <Controller name="contactPhone" control={control} rules={{ required: t.required }}
                  render={({ field }) => (
                    <PhoneInput
                      value={field.value || ""} onChange={field.onChange} onBlur={field.onBlur} required
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 ${errors.contactPhone ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
                    />
                  )}
                />
                {errors.contactPhone && <p className="mt-1 text-xs text-red-500">{errors.contactPhone.message}</p>}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Service details ──────────────────────────── */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-bold text-ofoq-navy text-lg">{t.steps[2]}</h2>

              {/* Service picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.service} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICES.map((s) => (
                    <button key={s.value} type="button"
                      onClick={() => { setValue("serviceType", s.value); setValue("requestKind", ""); }}
                      className={`p-3 rounded-xl border text-sm font-medium text-right transition-colors ${
                        all.serviceType === s.value
                          ? "border-ofoq-navy bg-ofoq-navy text-white"
                          : "border-gray-200 bg-gray-50 text-gray-700 hover:border-ofoq-navy/40"
                      }`}>
                      {ui.client.services[s.value] || s.value}
                    </button>
                  ))}
                </div>
                {!all.serviceType && <p className="mt-1.5 text-xs text-red-500">{t.required}</p>}
              </div>

              {/* HR kind picker */}
              {isHrService && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.recruitmentTypeLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {([
                      ["general",          t.generalKind,      t.generalKindDesc],
                      ["named_candidates", t.namedCandidates,  t.namedCandidatesDesc],
                      ["recruitment",      t.recruitmentKind,  t.recruitmentKindDesc],
                    ] as [RequestKind, string, string][]).map(([val, label, desc]) => (
                      <button key={val} type="button"
                        onClick={() => setValue("requestKind", val)}
                        className={`p-3 rounded-xl border text-right transition-colors ${
                          all.requestKind === val
                            ? "border-ofoq-navy bg-ofoq-navy/5 text-ofoq-navy"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:border-ofoq-navy/30"
                        }`}>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                  {isHrService && !all.requestKind && (
                    <p className="mt-1.5 text-xs text-red-500">{t.required}</p>
                  )}
                </div>
              )}

              {/* Recruitment meta */}
              {isHrService && (isNamedCandidates || isRecruitment) && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.vacancyTitle}</label>
                      <input {...register("vacancyTitle")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.vacancyCount}</label>
                      <input type="number" min={1} {...register("vacancyCount")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.requiredNationality}</label>
                      <input {...register("requiredNationality")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.requiredProfession}</label>
                      <input {...register("requiredProfession")}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.targetCountry}</label>
                    <select {...register("targetCountry")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30">
                      <option value="">{t.chooseCountry}</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.additionalRequirements}</label>
                    <textarea {...register("additionalRequirements")} rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
                  </div>
                </div>
              )}

              {/* Package + country for non-recruitment kinds */}
              {(!isHrService || all.requestKind === "general") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.package}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PACKAGES.map((pk) => (
                        <button key={pk.value} type="button"
                          onClick={() => setValue("packageType", all.packageType === pk.value ? "" : pk.value)}
                          className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                            all.packageType === pk.value
                              ? "border-ofoq-navy bg-ofoq-navy text-white"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-ofoq-navy/40"
                          }`}>
                          {pk.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.country}</label>
                    <select {...register("countryOfRecruitment")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30">
                      <option value="">{t.chooseCountry}</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.notes}</label>
                <textarea {...register("additionalNotes")} rows={3} placeholder={t.notes}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Review ──────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-ofoq-navy text-lg mb-4">{t.review}</h2>
              <div className="space-y-3">
                {[
                  [t.company,       all.companyName],
                  [t.commercialReg, all.commercialReg || "—"],
                  [t.activity,      all.businessActivity],
                  [t.contactEmail,  all.contactEmail],
                  [t.contactPhone,  all.contactPhone],
                  [t.service,       ui.client.services[all.serviceType] || all.serviceType],
                  ...(isHrService && all.requestKind ? [[t.recruitmentTypeLabel,
                    all.requestKind === "named_candidates" ? t.namedCandidates
                    : all.requestKind === "recruitment"    ? t.recruitmentKind
                    : t.generalKind]] : []),
                  ...(isHrService && (isNamedCandidates || isRecruitment) ? [
                    ...(all.vacancyTitle       ? [[t.vacancyTitle,        all.vacancyTitle]]       : []),
                    ...(all.vacancyCount       ? [[t.vacancyCount,        all.vacancyCount]]       : []),
                    ...(all.targetCountry      ? [[t.targetCountry,       all.targetCountry]]      : []),
                    ...(all.requiredNationality ? [[t.requiredNationality, all.requiredNationality]] : []),
                    ...(all.requiredProfession  ? [[t.requiredProfession,  all.requiredProfession]]  : []),
                  ] : []),
                  ...(!isHrService || all.requestKind === "general" ? [
                    [t.package,  PACKAGES.find((p) => p.value === all.packageType)?.label || "—"],
                    [t.country,  all.countryOfRecruitment || "—"],
                  ] : []),
                  [t.notes, all.additionalNotes || "—"],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-400 text-sm w-36 shrink-0">{k}</span>
                    <span className="text-ofoq-navy text-sm font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
              {isNamedCandidates && (
                <p className="mt-4 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">{t.namedCandidatesDesc}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={prev} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={16} /> {t.previous}
          </button>
          {step < 3 ? (
            <button type="button" onClick={() => {
              if (step === 2 && !all.serviceType) return;
              if (step === 2 && isHrService && !all.requestKind) return;
              next();
            }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-ofoq-navy text-white text-sm font-semibold hover:bg-ofoq-red transition-colors">
              {t.next} <ChevronLeft size={16} />
            </button>
          ) : (
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {t.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
