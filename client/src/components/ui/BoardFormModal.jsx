import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BoardFormModal({ board, onClose, onSave, saving }) {
  const [form, setForm] = useState({ title:"", description:"" });

  useEffect(() => {
    setForm({ title: board?.title || "", description: board?.description || "" });
  }, [board]);

  const onSubmit = (e) => {
    e.preventDefault();
    const payload = { title: form.title.trim(), description: form.description.trim() };
    if (board?._id) payload._id = board._id;
    onSave(payload);
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={e => { if (e.target===e.currentTarget) onClose(); }}>
        <motion.div className="modal-box"
          initial={{ opacity:0, scale:.93, y:16 }}
          animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:.93, y:16 }}
          transition={{ duration:.2, ease:[.4,0,.2,1] }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b"
            style={{ borderColor:"var(--border)" }}>
            <div>
              <h2 className="text-base font-bold" style={{ color:"var(--text)" }}>
                {board?"Edit Board":"New Board"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color:"var(--muted)" }}>
                {board?"Update your board details.":"Set up a new project board."}
              </p>
            </div>
            <button onClick={onClose} className="btn btn-ghost w-8 h-8 p-0 rounded-lg">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="field-group">
              <label className="field-label">Board Title *</label>
              <input className="field-input" type="text" placeholder="e.g. Product Launch Q3"
                value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                required autoFocus />
            </div>
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea className="field-input resize-none" rows={3}
                placeholder="Briefly describe this board…"
                value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                {saving?"Saving…":board?"Update Board":"Create Board"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
