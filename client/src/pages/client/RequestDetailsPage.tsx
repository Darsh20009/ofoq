import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Send, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";

const STATUS_COLOR: Record<string, string> = {
  new:         "bg-blue-100 text-blue-700 border-blue-200",
  reviewing:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  approved:    "bg-green-100 text-green-700 border-green-200",
  in_progress: "bg-purple-100 text-purple-700 border-purple-200",
  completed:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected:    "bg-red-100 text-red-700 border-red-200",
};
const STEPS = ["new", "reviewing", "approved", "in_progress", "completed"];

export default function RequestDetailsPage() {
  const { dir, ui, lang } = useLang();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["client-request", id],
    queryFn:  () => clientApi.getRequest(id!).then((r) => r.data.request),
    enabled:  !!id,
  });

  async function sendNote() {
    if (!note.trim() || !id) return;
    setSending(true);
    try {
      await clientApi.addNote(id, note);
      setNote("");
      qc.invalidateQueries({ queryKey: ["client-request", id] });
      toast.success(ui.client.noteAdded);
    } catch {
      toast.error(ui.client.noteError);
    } finally { setSending(false); }
  }

  if (isLoading) return (
    <div className="flex justify-center py-20" dir={dir}>
      <Loader2 size={32} className="animate-spin text-gray-400" />
    </div>
  );

  if (isError || !data) return (
    <div className="text-center py-16" dir={dir}>
      <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">{ui.client.invalidRequest}</p>
      <Link to="/client/requests" className="mt-4 inline-flex items-center gap-2 text-ofoq-navy text-sm hover:text-ofoq-red">
        <ArrowRight size={15} /> {ui.client.backRequests}
      </Link>
    </div>
  );

  const req = data;
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

        {/* Progress bar */}
        {req.status !== "rejected" && (
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`h-2 rounded-full flex-1 transition-all ${
                  i <= stepIdx ? "bg-ofoq-navy" : "bg-gray-100"
                }`} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-ofoq-navy mb-4">{ui.client.requestDetails}</h2>
        <div className="space-y-2.5">
          {[
            [ui.request.company,       req.companyName],
            [ui.request.commercialReg, req.commercialReg || "—"],
            [ui.request.activity,      req.businessActivity],
            [ui.request.contactEmail,  req.contactEmail],
            [ui.request.contactPhone,  req.contactPhone],
            [ui.request.package,       req.packageType || "—"],
            ["Submitted",              new Date(req.createdAt).toLocaleDateString(lang)],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex gap-3">
              <span className="text-gray-400 text-sm w-32 shrink-0">{k}</span>
              <span className="text-ofoq-navy text-sm font-medium">{String(v)}</span>
            </div>
          ))}
          {req.additionalNotes && (
            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
              <span className="text-gray-400 text-sm w-32 shrink-0">{ui.request.notes}</span>
              <span className="text-ofoq-navy text-sm">{req.additionalNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
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

      {/* Notes from admin */}
      {req.notes?.filter((n: any) => n.from === "admin").length > 0 && (
        <div className="bg-ofoq-navy/5 rounded-2xl border border-ofoq-navy/10 p-6">
          <h2 className="font-bold text-ofoq-navy mb-3">{ui.client.messages}</h2>
          <div className="space-y-3">
            {req.notes.filter((n: any) => n.from === "admin").map((n: any, i: number) => (
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
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={ui.client.notePlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none"
            />
            <button onClick={sendNote} disabled={!note.trim() || sending}
              className="px-4 py-3 bg-ofoq-navy text-white rounded-xl hover:bg-ofoq-red disabled:opacity-50 transition-all self-start">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
