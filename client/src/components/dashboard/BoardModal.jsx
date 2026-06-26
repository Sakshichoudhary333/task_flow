import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const backdrop = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const panel = {
  hidden: { opacity: 0, scale: 0.93, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.93, y: 20, transition: { duration: 0.16 } },
};

export default function BoardModal({ board, onClose, onSave, onDelete, saving, deleting }) {
  const [form, setForm] = useState({ title: "", description: "" });

  useEffect(() => {
    setForm({ title: board?.title || "", description: board?.description || "" });
  }, [board]);

  const submit = e => {
    e.preventDefault();
    const payload = { title: form.title.trim(), description: form.description.trim() };
    if (board?._id) payload._id = board._id;
    onSave(payload);
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" variants={backdrop} initial="hidden" animate="show" exit="exit"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div className="modal-box" variants={panel} initial="hidden" animate="show" exit="exit">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid #E8ECF1" }}>
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1A202C" }}>
                {board ? "Edit Project" : "Create Project"}
              </h2>
              <p style={{ fontSize: "0.75rem", color: "#718096", marginTop: 2 }}>
                {board ? "Update project details." : "Set up a new project board."}
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn btn-ghost"
              style={{ width: 32, height: 32, padding: 0, borderRadius: 10 }}>
              <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <form onSubmit={submit} style={{ padding: "1rem 1.5rem 1.25rem", display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field-group">
              <label className="field-label">Project Title *</label>
              <input className="field-input" type="text" placeholder="e.g. Product Launch Q4"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required autoFocus />
            </div>

            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea className="field-input" rows={3} style={{ resize: "none" }}
                placeholder="What does this project track?"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, minWidth: 120 }} disabled={saving || deleting}>
                {saving ? "Saving…" : board ? "Update Project" : "Create Project"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving || deleting}>
                Cancel
              </button>
              {board && onDelete && (
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ width: "100%" }}
                  disabled={saving || deleting}
                  onClick={() => {
                    if (window.confirm(`Delete "${board.title}" and all its tasks? This cannot be undone.`)) onDelete();
                  }}
                >
                  {deleting ? "Deleting…" : "Delete Project"}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
