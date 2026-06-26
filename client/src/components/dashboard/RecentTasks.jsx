import { motion } from "framer-motion";
import { isOverdue, formatCompactDate } from "../../lib/taskHelpers";

const dot = { todo: "#4F46E5", "in-progress": "#F59E0B", done: "#10B981", resolved: "#38B2AC" };
const priorityColor = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };

export default function RecentTasks({ tasks, loading }) {
  return (
    <div className="dash-panel" style={{ display: "flex", flexDirection: "column" }}>
      <div className="dash-panel-header">
        <h3>Recent Activity</h3>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.15rem 0.5rem", borderRadius: 99, background: "#F7FAFC", color: "#718096" }}>
          {tasks.length} tasks
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", maxHeight: 320 }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.625rem 1.125rem", borderBottom: "1px solid #F0F4F8" }}>
              <div className="skeleton" style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: "75%", height: 12, borderRadius: 4, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: "50%", height: 10, borderRadius: 4 }} />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.25rem", textAlign: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F7FAFC", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <svg style={{ width: 18, height: 18, color: "#A0AEC0" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#1A202C" }}>No tasks yet</p>
            <p style={{ fontSize: "0.75rem", color: "#718096", marginTop: 2 }}>Open a board to add tasks</p>
          </div>
        ) : (
          tasks.map((task, i) => {
            const overdue = isOverdue(task);
            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "0.625rem 1.125rem",
                  borderBottom: "1px solid #F0F4F8",
                  background: overdue ? "rgba(239,68,68,.03)" : "transparent",
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: dot[task.status] || dot.todo }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 600, color: overdue ? "#E53E3E" : "#1A202C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.title}
                  </p>
                  <p style={{ fontSize: "0.6875rem", color: "#A0AEC0", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.board?.title || "—"} · {overdue ? "Overdue" : formatCompactDate(task.dueDate) || "No due date"}
                  </p>
                </div>
                <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: priorityColor[task.priority] || priorityColor.medium }} />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
