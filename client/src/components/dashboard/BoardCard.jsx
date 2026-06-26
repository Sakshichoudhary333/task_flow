import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCompactDate } from "../../lib/taskHelpers";

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue},65%,58%)`;
}

export default function BoardCard({ board, onEdit, onDelete }) {
  const color = hashColor(board.title);
  const init = board.title.charAt(0).toUpperCase();

  return (
    <motion.article
      className="dash-board-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <div className="dash-board-accent" style={{ background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />

      <div className="dash-board-body">
        <div className="dash-board-top">
          <div className="dash-board-avatar" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
            {init}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 className="dash-board-title">{board.title}</h3>
            <p className="dash-board-meta">Updated {formatCompactDate(board.updatedAt)}</p>
          </div>
        </div>

        {board.description && (
          <p className="dash-board-desc">{board.description}</p>
        )}
      </div>

      <div className="dash-board-footer">
        <span className="dash-board-count">
          {board.taskCount || 0} task{board.taskCount !== 1 ? "s" : ""}
        </span>
        <div className="dash-board-actions">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onEdit(); }}
            className="dash-board-action-btn"
            title="Edit board"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(); }}
            className="dash-board-action-btn dash-board-action-btn--danger"
            title="Delete board"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            </svg>
          </button>
          <Link to={`/boards/${board._id}`} className="dash-board-open">Open →</Link>
        </div>
      </div>
    </motion.article>
  );
}
