import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight, Loader2, AlertCircle, Send, ChevronDown,
  Clock, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi } from "../../../api/clientApi";
import { useLang } from "../../../i18n/LangContext";

const STATUS_OPTIONS = [
  { value: "new", color: "bg-blue-100 text-blue-700" },
  { value: "reviewing", color: "bg-yellow-100 text-yellow-700" },
  { value: "approved", color: "bg-green-100 text-green-700" },
  { value: "in_progress", color: "bg-purple-100 text-purple-700" },
  { value: "completed", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", color: "bg-red-100 text-red-700" },
];

export default function ServiceRequestDetailPage() {
  const { ui, lang, dir } = useLang();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-sr-detail", id],
    queryFn:  () => clientApi.adminGetRequest(id!).then((r) => r.data.request),
    enabled:  !!id,
  });

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
    } catch {
      toast.error(ui.client.statusUpdateError);
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

  if (isLoading) return (
    <div className="flex justify-center py-20" dir={dir}>
      <Loader2 size={32} className="animate-spin text-gray-300" />
    </div>
  );

  if (isError || !data) return (
    <div className="text-center py-16" dir={dir}>
      <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">{ui.client.requestNotFound}</p>
      <Link to="/admin/service-requests" className="mt-4 inline-flex items-center gap-2 text-ofoq-navy text-sm">
        <ArrowRight size={15} /> {ui.client.backRequests}
      </Link>
    </div>
  );

  const req = data;
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

      {/* Header card */}
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
              {currentStatus?.value ? statusLabels[currentStatus.value] || currentStatus.value : req.status}
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
                        className={`w-full text-right px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                          s.value === req.status
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-gray-50"
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

        {/* Details */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3">
          {[
            [ui.client.client, req.clientId?.fullName || req.clientEmail],
            [ui.request.contactEmail, req.contactEmail],
            [ui.request.contactPhone, req.contactPhone],
            [ui.request.commercialReg, req.commercialReg || "—"],
            [ui.request.activity, req.businessActivity],
            [ui.request.package, req.packageType ? packageLabels[req.packageType as string] || "—" : "—"],
            [ui.request.submitted, new Date(req.createdAt).toLocaleDateString(locale)],
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
              n.isInternal
                ? "bg-amber-50 border-amber-200"
                : n.from === "admin"
                ? "bg-ofoq-navy/5 border-ofoq-navy/10"
                : "bg-gray-50 border-gray-100"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${n.from === "admin" ? "text-ofoq-navy" : "text-gray-500"}`}>
                  {n.from === "admin" ? "👤 " : "🏢 "}{n.authorName}
                  {n.isInternal && ` (${ui.client.internalNote})`}
                </span>
                <span className="text-xs text-gray-300">{new Date(n.createdAt).toLocaleDateString(locale)}</span>
              </div>
              <p className="text-gray-700">{n.text}</p>
            </div>
          ))}
        </div>

        {/* Add note */}
        <div className="space-y-2">
          <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
            rows={2} placeholder={ui.client.notePlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded" />
              {ui.client.internalNote}
            </label>
            <button onClick={addNote} disabled={!noteText.trim() || addingNote}
              className="flex items-center gap-2 px-4 py-2 bg-ofoq-navy text-white rounded-xl text-sm font-medium hover:bg-ofoq-red disabled:opacity-50 transition-all">
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
                      {sOpt?.value ? statusLabels[sOpt.value] || sOpt.value : h.status}
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
