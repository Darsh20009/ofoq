/**
 * Reusable candidate form field grid (named_candidates only).
 * Includes isGulfResident checkbox and educationLevel select.
 * No document controls — those come after save via CandidateDocumentChecklist.
 */

import { useLang } from "../../i18n/LangContext";

export interface CandidateFormState {
  fullName: string;
  contactPhone: string;
  contactEmail: string;
  nationality: string;
  currentProfession: string;
  desiredProfession: string;
  workStatus: string;
  country: string;
  candidateNotes: string;
  isGulfResident: boolean;
  educationLevel: string;
}

export const emptyCandidateForm = (): CandidateFormState => ({
  fullName: "", contactPhone: "", contactEmail: "",
  nationality: "", currentProfession: "", desiredProfession: "",
  workStatus: "", country: "", candidateNotes: "",
  isGulfResident: false, educationLevel: "",
});

interface Props {
  value: CandidateFormState;
  onChange: (v: CandidateFormState) => void;
}

export default function CandidateFormFields({ value, onChange }: Props) {
  const { ui } = useLang();
  const t = ui.request;

  const set =
    (f: keyof CandidateFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [f]: e.target.value });

  const cls = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20 focus:bg-white";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {t.candidateName} <span className="text-red-500">*</span>
          </label>
          <input value={value.fullName} onChange={set("fullName")} className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidatePhone}</label>
          <input value={value.contactPhone} onChange={set("contactPhone")} dir="ltr" className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateNationality}</label>
          <input value={value.nationality} onChange={set("nationality")} className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateCountry}</label>
          <input value={value.country} onChange={set("country")} className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateCurrentProfession}</label>
          <input value={value.currentProfession} onChange={set("currentProfession")} className={cls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateDesiredProfession}</label>
          <input value={value.desiredProfession} onChange={set("desiredProfession")} className={cls} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateWorkStatus}</label>
          <select value={value.workStatus} onChange={set("workStatus")} className={cls}>
            <option value="">—</option>
            <option value="employed">{t.workStatusEmployed}</option>
            <option value="unemployed">{t.workStatusUnemployed}</option>
            <option value="freelance">{t.workStatusFreelance}</option>
            <option value="student">{t.workStatusStudent}</option>
            <option value="other">{t.workStatusOther}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateEducationLevel}</label>
          <select value={value.educationLevel} onChange={set("educationLevel")} className={cls}>
            <option value="">—</option>
            <option value="below_secondary">{t.eduBelow}</option>
            <option value="secondary">{t.eduSecondary}</option>
            <option value="diploma">{t.eduDiploma}</option>
            <option value="bachelor">{t.eduBachelor}</option>
            <option value="master">{t.eduMaster}</option>
            <option value="doctorate">{t.eduDoctorate}</option>
            <option value="other">{t.eduOther}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateEmail}</label>
          <input value={value.contactEmail} onChange={set("contactEmail")} dir="ltr" className={cls} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={value.isGulfResident}
              onChange={(e) => onChange({ ...value, isGulfResident: e.target.checked })}
              className="w-4 h-4 rounded accent-ofoq-navy"
            />
            <span className="text-xs font-medium text-gray-600">{t.candidateIsGulfResident}</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">{t.candidateNotes}</label>
        <textarea
          value={value.candidateNotes}
          onChange={set("candidateNotes")}
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-ofoq-navy/20 focus:bg-white resize-none"
        />
      </div>
    </div>
  );
}
