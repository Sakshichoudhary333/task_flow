import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCompactDate } from "../../lib/taskHelpers";

const PALETTE = [
  ["#6366F1","#8B5CF6"],["#3B82F6","#6366F1"],["#10B981","#059669"],
  ["#F59E0B","#EF4444"],["#EC4899","#8B5CF6"],["#14B8A6","#3B82F6"],
];
function color(title) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = title.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export default function BoardCard({ board, onEdit, onDelete }) {
  const [c1, c2] = color(board.title);

  return (
    <motion.article whileHover={{ y:-4 }} transition={{ duration:.18 }}
      className="card flex flex-col overflow-hidden cursor-default">
      <div className="h-1.5 w-full" style={{ background:`linear-gradient(90deg,${c1},${c2})` }} />
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background:`linear-gradient(135deg,${c1},${c2})` }}>
            {board.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm leading-snug truncate" style={{ color:"var(--text)" }}>
              {board.title}
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color:"var(--muted)" }}>
              Updated {formatCompactDate(board.updatedAt)}
            </p>
          </div>
        </div>

        {board.description && (
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color:"var(--muted)" }}>
            {board.description}
          </p>
        )}

        {/* footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor:"var(--border)" }}>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background:"var(--bg-alt)", color:"var(--muted)" }}>
            {board.taskCount||0} task{board.taskCount!==1?"s":""}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={onEdit} title="Edit"
              className="btn btn-ghost w-7 h-7 p-0 rounded-lg"
              style={{ fontSize:11 }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button onClick={onDelete} title="Delete"
              className="btn btn-ghost w-7 h-7 p-0 rounded-lg"
              style={{ color:"#EF4444" }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </button>
            <Link to={`/boards/${board._id}`}
              className="btn btn-primary text-xs py-1 px-3 rounded-lg" style={{ fontSize:12 }}>
              Open
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
