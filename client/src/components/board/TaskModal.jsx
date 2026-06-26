import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

const bkdrop = { hidden:{ opacity:0 }, show:{ opacity:1 }, exit:{ opacity:0 } };
const panel  = {
  hidden:{ opacity:0, scale:.93, y:24 },
  show:  { opacity:1, scale:1,   y:0, transition:{ duration:.22, ease:[.4,0,.2,1] } },
  exit:  { opacity:0, scale:.93, y:24, transition:{ duration:.16 } },
};

const emptyForm = { title:"", description:"", priority:"medium", dueDate:"", estimatedEffort:"", status:"todo" };

export default function TaskModal({ task, defaultStatus, onClose, onSave, onDelete, saving, deleting }) {
  const [form,   setForm]    = useState(emptyForm);
  const [ai,     setAi]      = useState(null);

  useEffect(() => {
    if (task) {
      setForm({
        title:           task.title           || "",
        description:     task.description     || "",
        priority:        task.priority        || "medium",
        dueDate:         task.dueDate ? String(task.dueDate).slice(0, 10) : "",
        estimatedEffort: task.estimatedEffort || "",
        status:          task.status          || "todo",
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus });
    }
    setAi(null);
  }, [task, defaultStatus]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const aiMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/ai/suggest", { title: form.title.trim(), description: form.description.trim() })).data,
    onSuccess: data => {
      setAi(data);
      setForm(f => ({
        ...f,
        estimatedEffort: data.estimatedEffort || f.estimatedEffort,
        dueDate:         data.suggestedDueDate || f.dueDate,
      }));
      toast.success("AI suggestion applied!");
    },
    onError: () => toast.error("AI suggestion failed."),
  });

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      title:           form.title.trim(),
      description:     form.description.trim(),
      priority:        form.priority,
      dueDate:         form.dueDate || null,
      estimatedEffort: form.estimatedEffort.trim(),
      status:          form.status,
    });
  };

  const fl = "field-label";
  const fi = "field-input text-sm";

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" variants={bkdrop} initial="hidden" animate="show" exit="exit"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div className="modal-box" variants={panel} initial="hidden" animate="show" exit="exit">

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid #E8ECF1" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A202C" }}>
                {task ? "Edit Task" : "New Task"}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#718096", marginTop: 2 }}>
                {task ? "Update task details." : "Fill in the details below."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-ghost"
              style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}>
              <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ padding: "1rem 1.5rem 1.25rem", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Title */}
            <div className="field-group">
              <label className={fl}>Title *</label>
              <input className={fi} type="text" placeholder="e.g. Design onboarding flow"
                value={form.title} onChange={set("title")} required autoFocus />
            </div>

            {/* Description */}
            <div className="field-group">
              <label className={fl}>Description</label>
              <textarea className={`${fi} resize-none`} rows={3}
                placeholder="Add notes, acceptance criteria, or context…"
                value={form.description} onChange={set("description")} />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className={fl}>Priority</label>
                <select className={fi} value={form.priority} onChange={set("priority")}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field-group">
                <label className={fl}>Status</label>
                <select className={fi} value={form.status} onChange={set("status")}>
                  <option value="todo">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>

            {/* Due date + Effort */}
            <div className="grid grid-cols-2 gap-3">
              <div className="field-group">
                <label className={fl}>Due Date</label>
                <input className={fi} type="date" value={form.dueDate} onChange={set("dueDate")} />
              </div>
              <div className="field-group">
                <label className={fl}>Effort Estimate</label>
                <input className={fi} type="text" placeholder="e.g. 3-5 hours"
                  value={form.estimatedEffort} onChange={set("estimatedEffort")} />
              </div>
            </div>

            {/* AI suggest */}
            <button type="button"
              onClick={() => {
                if (!form.title.trim()) { toast.error("Enter a title first."); return; }
                aiMutation.mutate();
              }}
              disabled={aiMutation.isPending}
              className="btn w-full text-sm"
              style={{ background:"rgba(79,70,229,.1)", color:"#A5B4FC", border:"1px solid rgba(79,70,229,.25)" }}>
              {aiMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full spin" />
                  Generating AI estimate…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="m12 3-1.912 5.813a2 2 0 01-1.275 1.275L3 12l5.813 1.912a2 2 0 011.275 1.275L12 21l1.912-5.813a2 2 0 011.275-1.275L21 12l-5.813-1.912a2 2 0 01-1.275-1.275L12 3z"/>
                    <path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>
                  </svg>
                  AI Suggest Estimate
                </>
              )}
            </button>

            {/* AI result */}
            <AnimatePresence>
              {ai && (
                <motion.div
                  initial={{ opacity:0, height:0 }}
                  animate={{ opacity:1, height:"auto" }}
                  exit={{ opacity:0, height:0 }}
                  className="rounded-xl p-4 overflow-hidden"
                  style={{ background:"rgba(79,70,229,.08)", border:"1px solid rgba(79,70,229,.2)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"#A5B4FC" }}>
                      ✨ AI Planning
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background:"rgba(79,70,229,.2)", color:"#818CF8" }}>
                      {ai.source}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <p className="text-[11px]" style={{ color:"var(--muted)" }}>Suggested Effort</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color:"var(--text)" }}>{ai.estimatedEffort}</p>
                    </div>
                    <div>
                      <p className="text-[11px]" style={{ color:"var(--muted)" }}>Suggested Due Date</p>
                      <p className="text-sm font-bold mt-0.5" style={{ color:"var(--text)" }}>{ai.suggestedDueDate}</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color:"var(--muted)" }}>{ai.reasoning}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4, flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, minWidth: 120 }} disabled={saving || deleting}>
                {saving ? "Saving…" : task ? "Update Task" : "Create Task"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving || deleting}>
                Cancel
              </button>
              {task && onDelete && (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: "100%" }}
                  disabled={saving || deleting}
                  onClick={() => {
                    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) onDelete();
                  }}
                >
                  {deleting ? "Deleting…" : "Delete Task"}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
