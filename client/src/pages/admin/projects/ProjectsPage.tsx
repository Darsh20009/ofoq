import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { projectsApi } from "../../../api/client";
import type { Project } from "../../../types";
import ProjectModal from "./ProjectModal";
import { useLang } from "../../../i18n/LangContext";

const STAGE_CONFIG: Record<string, { color: string; bg: string }> = {
  request:   { color: "#6366f1", bg: "#EEF2FF" },
  review:    { color: "#f59e0b", bg: "#FFFBEB" },
  quotation: { color: "#3b82f6", bg: "#EFF6FF" },
  contract:  { color: "#8b5cf6", bg: "#F5F3FF" },
  payment:   { color: "#10b981", bg: "#ECFDF5" },
  execution: { color: "#33B27C", bg: "#F0FDF4" },
  closed:    { color: "#6b7280", bg: "#F9FAFB" },
};

function StageTag({ stage, labels }: { stage: string; labels: Record<string, string> }) {
  const c = STAGE_CONFIG[stage] || { color: "#6b7280", bg: "#F9FAFB" };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: c.color, background: c.bg }}>
      {labels[stage] || stage}
    </span>
  );
}

export default function ProjectsPage() {
  const { ui, lang, dir } = useLang();
  const copy = ui.adminPages.projects;
  const locale = lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang;
  const formatDate = (value: string, withYear = false) =>
    new Date(value).toLocaleDateString(locale, { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [view, setView] = useState<"table" | "kanban">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["projects", search, stage],
    queryFn: () => projectsApi.list({ search, stage: stage || undefined, limit: 50 }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["projects"] }); toast.success(copy.deleted); },
  });

  const projects: Project[] = data?.data?.projects || [];
  const now = new Date();

  if (view === "kanban") {
    const stages = Object.keys(STAGE_CONFIG);
    return (
      <div className="space-y-6" dir={dir}>
        <div className="page-header">
          <div>
            <h1 className="page-title">{copy.title}</h1>
            <p className="page-subtitle">{projects.length} {copy.count}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setView("table")} className={`px-4 py-2 text-sm font-medium ${view === "table" ? "bg-ofoq-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>{copy.table}</button>
              <button onClick={() => setView("kanban")} className={`px-4 py-2 text-sm font-medium ${view === "kanban" ? "bg-ofoq-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>{copy.kanban}</button>
            </div>
            <button onClick={() => { setEditProject(null); setModalOpen(true); }} className="btn-primary">
              <Plus size={16} /> {copy.newProject}
            </button>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((s) => {
            const conf = STAGE_CONFIG[s];
            const stageProjects = projects.filter((p) => p.stage === s);
            return (
              <div key={s} className="flex-shrink-0 w-64">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: conf.color }} />
                  <span className="text-sm font-semibold text-navy-700">{copy.stages[s] || s}</span>
                  <span className="ms-auto badge-navy text-xs">{stageProjects.length}</span>
                </div>
                <div className="space-y-3">
                  {stageProjects.map((p) => (
                    <div key={p._id} className="card p-4 cursor-pointer hover:shadow-ofoq transition-shadow"
                      onClick={() => { setEditProject(p); setModalOpen(true); }}>
                      <p className="font-semibold text-sm text-navy-700 mb-1">{p.title.ar}</p>
                      <p className="text-xs text-gray-400 mb-2">#{p.projectNumber}</p>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div className="h-1.5 rounded-full" style={{ width: `${p.progress}%`, background: conf.color }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{p.progress}%</span>
                        {p.dueDate && (
                          <span className={new Date(p.dueDate) < now ? "text-red-500 font-semibold" : ""}>
                            {formatDate(p.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} project={editProject}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["projects"] }); setModalOpen(false); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div className="page-header">
        <div>
            <h1 className="page-title">{copy.title}</h1>
            <p className="page-subtitle">{projects.length} {copy.count}</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setView("table")} className={`px-4 py-2 text-sm font-medium ${view === "table" ? "bg-ofoq-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>{copy.table}</button>
            <button onClick={() => setView("kanban")} className={`px-4 py-2 text-sm font-medium ${view === "kanban" ? "bg-ofoq-navy text-white" : "text-gray-500 hover:bg-gray-50"}`}>{copy.kanban}</button>
          </div>
          <button onClick={() => { setEditProject(null); setModalOpen(true); }} className="btn-primary">
            <Plus size={16} /> {copy.newProject}
          </button>
        </div>
      </div>

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.search} className="input-field pe-10" />
        </div>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="input-field min-w-40">
          <option value="">{copy.allStages}</option>
          {Object.keys(STAGE_CONFIG).map((v) => (
            <option key={v} value={v}>{copy.stages[v] || v}</option>
          ))}
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>{copy.project}</th>
                  <th>{copy.stage}</th>
                  <th>{copy.progress}</th>
                  <th>{copy.dueDate}</th>
                  <th>{copy.priority}</th>
                  <th>{copy.actions}</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const isOverdue = p.dueDate && new Date(p.dueDate) < now && p.stage !== "closed";
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="group">
                      <td>
                        <p className="font-semibold text-navy-700">{p.title.ar}</p>
                        <p className="text-xs text-gray-400">#{p.projectNumber}</p>
                      </td>
                       <td><StageTag stage={p.stage} labels={copy.stages} /></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-ofoq-green" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{p.progress}%</span>
                        </div>
                      </td>
                      <td>
                        {p.dueDate ? (
                          <div className={`flex items-center gap-1 text-sm ${isOverdue ? "text-red-500 font-semibold" : "text-gray-600"}`}>
                            {isOverdue && <AlertCircle size={13} />}
                            {formatDate(p.dueDate, true)}
                          </div>
                        ) : "—"}
                      </td>
                      <td>
                        <span className={`badge ${
                          p.priority === "urgent" ? "badge-red" :
                          p.priority === "high" ? "badge-yellow" :
                          p.priority === "medium" ? "badge-navy" : "badge-gray"
                        }`}>
                           {copy.priorities[p.priority] || p.priority}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditProject(p); setModalOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700">
                            <Edit2 size={14} />
                          </button>
                           <button onClick={() => { if (confirm(copy.deleteConfirm)) deleteMut.mutate(p._id); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} project={editProject}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["projects"] }); setModalOpen(false); }} />
    </div>
  );
}
