import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";
import SkeletonTask from "./SkeletonTask";
import { STATUS_META } from "../../lib/taskHelpers";

export default function KanbanColumn({ status, tasks, loading, draggingId,
  onDragStart, onDragEnd, onDrop, onAdd, onEdit }) {
  const [dragOver, setDragOver] = useState(false);
  const meta = STATUS_META[status];

  return (
    <div
      className={`kanban-column ${dragOver ? "drag-over" : ""}`}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(status); }}
    >
      <div className="kanban-column-header">
        <h3>{meta?.columnLabel || status}</h3>
        <button type="button" className="kanban-column-add" onClick={onAdd} aria-label="Add task" title="Add task">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <div className="kanban-column-body">
        {loading ? (
          [1, 2].map(i => <SkeletonTask key={i} />)
        ) : tasks.length === 0 ? (
          <button type="button" className="kanban-column-empty" onClick={onAdd}>
            <span>+ Add task</span>
          </button>
        ) : (
          <AnimatePresence>
            {tasks.map((task, i) => (
              <motion.div key={task._id} layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}>
                <TaskCard
                  task={task}
                  isDragging={draggingId === task._id}
                  onDragStart={() => onDragStart(task._id)}
                  onDragEnd={onDragEnd}
                  onEdit={onEdit}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {tasks.length > 0 && !loading && (
        <button type="button" className="kanban-column-add-footer" onClick={onAdd}>
          + Add task
        </button>
      )}
    </div>
  );
}
