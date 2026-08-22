/**
 * CandidateDocumentChecklist
 *
 * Shown only for client-owned (named_candidates) candidates.
 * Fetches /requests/:rid/candidates/:cid/documents/requirements on mount,
 * then presents each required category with an upload control.
 *
 * Rules mirroring server computeRequiredCategories:
 *   passport                    — always
 *   education_certificate       — always
 *   residence_permit            — isGulfResident === true
 *   resignation_acknowledgement — workStatus === "employed"
 *   experience_certificate      — workStatus !== "employed"
 *
 * Client-side validation: PDF/JPEG/PNG, max 5 MB.
 * No document download links (storedName is never returned).
 */

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { clientApi, type DocumentCategory, type DocumentRequirementsResult } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"];
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
  requestId: string;
  candidateId: string;
  /** Called whenever the completeness state changes. */
  onComplete?: (complete: boolean, missingLabels: string[]) => void;
}

export default function CandidateDocumentChecklist({ requestId, candidateId, onComplete }: Props) {
  const { ui } = useLang();
  const t = ui.request;
  const qc = useQueryClient();
  const [uploading, setUploading] = useState<DocumentCategory | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocumentCategory, string>>>({});
  const fileInputs = useRef<Partial<Record<DocumentCategory, HTMLInputElement | null>>>({});

  const queryKey = ["doc-requirements", requestId, candidateId];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      clientApi
        .getCandidateDocumentRequirements(requestId, candidateId)
        .then((r) => r.data.requirements),
    staleTime: 10_000,
  });

  const req: DocumentRequirementsResult | undefined = data;

  const categoryLabel: Record<DocumentCategory, string> = {
    passport:                    t.docPassport,
    education_certificate:       t.docEducation,
    residence_permit:            t.docResidence,
    resignation_acknowledgement: t.docResignation,
    experience_certificate:      t.docExperience,
  };

  // Notify parent when completeness or missing list changes
  useEffect(() => {
    if (!onComplete || !req) return;
    const missingLabels = req.details
      .filter((d) => !d.uploaded)
      .map((d) => categoryLabel[d.category]);
    onComplete(req.complete, missingLabels);
  // categoryLabel entries are derived from stable i18n strings; safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req, onComplete]);


  function validate(file: File): string | null {
    if (!ACCEPTED.includes(file.type)) return t.docTypeError;
    if (file.size > MAX_BYTES) return t.docSizeError;
    return null;
  }

  async function handleFile(category: DocumentCategory, file: File) {
    const err = validate(file);
    if (err) {
      setErrors((prev) => ({ ...prev, [category]: err }));
      return;
    }
    setErrors((prev) => ({ ...prev, [category]: undefined }));
    setUploading(category);
    try {
      await clientApi.uploadCandidateDocument(requestId, candidateId, file, category);
      qc.invalidateQueries({ queryKey });
    } catch {
      setErrors((prev) => ({ ...prev, [category]: t.docUploadError }));
    } finally {
      setUploading(null);
      // reset the file input so re-upload of same file triggers change
      const el = fileInputs.current[category];
      if (el) el.value = "";
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-3">
        <Loader2 size={14} className="animate-spin" />
        <span>{t.savingCandidate}</span>
      </div>
    );
  }

  if (isError || !req) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">{t.docsSection}</p>
        {req.complete ? (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={12} />
            {t.docsComplete}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertCircle size={12} />
            {req.missing.length} {t.docsMissing}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        {req.details.map((detail) => {
          const isUploading = uploading === detail.category;
          const fieldError = errors[detail.category];

          return (
            <div
              key={detail.category}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm ${
                detail.uploaded
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {detail.uploaded ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={`text-xs font-medium truncate ${detail.uploaded ? "text-emerald-700" : "text-gray-600"}`}>
                  {categoryLabel[detail.category]}
                </span>
                <span className="text-xs text-gray-400 shrink-0">{t.docRequired}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {fieldError && (
                  <span className="text-xs text-red-500 max-w-[120px] truncate">{fieldError}</span>
                )}
                {/* Hidden file input */}
                <input
                  ref={(el) => { fileInputs.current[detail.category] = el; }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  id={`doc-${candidateId}-${detail.category}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(detail.category, file);
                  }}
                />
                <label
                  htmlFor={`doc-${candidateId}-${detail.category}`}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors select-none ${
                    isUploading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none"
                      : detail.uploaded
                      ? "bg-white border border-gray-200 text-gray-500 hover:border-ofoq-navy/30 hover:text-ofoq-navy"
                      : "bg-ofoq-navy text-white hover:bg-ofoq-red"
                  }`}
                >
                  {isUploading ? (
                    <><Loader2 size={11} className="animate-spin" /> {t.docUploading}</>
                  ) : detail.uploaded ? (
                    <><Upload size={11} /> {t.docUpload}</>
                  ) : (
                    <><Upload size={11} /> {t.docUpload}</>
                  )}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
