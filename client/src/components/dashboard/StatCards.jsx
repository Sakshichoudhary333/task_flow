import { motion } from "framer-motion";

const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    color: "#4F46E5",
    shadow: "rgba(79,70,229,.2)",
    bg: "rgba(79,70,229,.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    key: "done",
    label: "Completed",
    color: "#10B981",
    shadow: "rgba(16,185,129,.2)",
    bg: "rgba(16,185,129,.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    key: "inProgress",
    label: "In Progress",
    color: "#F59E0B",
    shadow: "rgba(245,158,11,.2)",
    bg: "rgba(245,158,11,.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    key: "overdue",
    label: "Overdue",
    color: "#EF4444",
    shadow: "rgba(239,68,68,.2)",
    bg: "rgba(239,68,68,.1)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

function SkeletonStat() {
  return (
    <div className="dash-stat-card">
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
      <div className="skeleton" style={{ width: 48, height: 24, borderRadius: 6, marginTop: 12 }} />
      <div className="skeleton" style={{ width: 72, height: 12, borderRadius: 4, marginTop: 8 }} />
    </div>
  );
}

export default function StatCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="dashboard-stats">
        {[1, 2, 3, 4].map(i => <SkeletonStat key={i} />)}
      </div>
    );
  }

  const total = summary?.total ?? 0;
  const done = summary?.byStatus?.done ?? 0;
  const inProgress = summary?.byStatus?.["in-progress"] ?? 0;
  const overdue = summary?.overdue ?? 0;
  const rate = summary?.completionRate ?? 0;
  const vals = { total, done, inProgress, overdue };

  return (
    <div className="dashboard-stats">
      {STATS.map((s, i) => (
        <motion.div
          key={s.key}
          className="dash-stat-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.28 }}
        >
          <div className="dash-stat-top">
            <div className="dash-stat-icon" style={{ background: s.bg, color: s.color, boxShadow: `0 2px 8px ${s.shadow}` }}>
              {s.icon}
            </div>
            {s.key === "done" && total > 0 && (
              <span className="dash-stat-badge">{rate}%</span>
            )}
          </div>
          <p className="dash-stat-value">{vals[s.key]}</p>
          <p className="dash-stat-label">{s.label}</p>
          {s.key === "done" && (
            <div className="progress-bar" style={{ marginTop: 10 }}>
              <motion.div
                className="progress-fill"
                style={{ background: "linear-gradient(90deg, #38B2AC, #4FD1C5)" }}
                initial={{ width: 0 }}
                animate={{ width: `${rate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
