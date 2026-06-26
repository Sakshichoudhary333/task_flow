import { motion } from "framer-motion";
import { formatCompactDate, isOverdue } from "../../lib/taskHelpers";

const priorityBadge = p => ({
  high: "badge badge-high", medium: "badge badge-medium", low: "badge badge-low"
}[p] || "badge badge-medium");

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <div className="skeleton w-2 h-2 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="skeleton w-2/5 h-3.5 rounded" />
        <div className="skeleton w-1/4 h-3 rounded" />
      </div>
      <div className="skeleton w-16 h-5 rounded-full" />
    </div>
  );
}

export default function RecentActivity({ tasks, loading }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:"var(--border)" }}>
        <div>
          <h2 className="font-bold text-sm" style={{ color:"var(--text)" }}>Recent Activity</h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--muted)" }}>Latest tasks across all boards</p>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background:"var(--bg-alt)", color:"var(--muted)" }}>
          {tasks.length} shown
        </span>
      </div>

      {loading ? (
        <div>{[1,2,3,4].map(i=><SkeletonRow key={i}/>)}</div>
      ) : tasks.length===0 ? (
        <div className="flex flex-col items-center justify-center p-10 gap-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background:"var(--bg-alt)" }}>
            <svg className="w-5 h-5" style={{ color:"var(--muted-2)" }} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color:"var(--text)" }}>No tasks yet</p>
          <p className="text-xs" style={{ color:"var(--muted)" }}>Open a board and add your first task.</p>
        </div>
      ) : (
        <div>
          {tasks.map((task, i) => {
            const overdue = isOverdue(task);
            const dot = task.status==="done"?"#10B981":task.status==="in-progress"?"#F59E0B":"#6366F1";
            return (
              <motion.div key={task._id}
                initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*.03 }}
                className="flex items-center gap-3 px-5 py-3 border-b last:border-0"
                style={{ borderColor:"var(--border)", background: overdue?"rgba(239,68,68,.03)":"transparent" }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:dot }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${overdue?"text-red-500":""}`}
                    style={overdue?{}:{ color:"var(--text)" }}>
                    {task.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color:"var(--muted)" }}>
                    {task.board?.title||"—"} · {overdue?"Overdue":formatCompactDate(task.dueDate)||"No due date"}
                  </p>
                </div>
                <span className={priorityBadge(task.priority)}>{task.priority}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
