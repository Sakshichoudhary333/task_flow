import { motion } from "framer-motion";

const STATS = [
  { key:"total",      label:"Total Tasks",   accent:"#6366F1", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { key:"done",       label:"Completed",     accent:"#10B981", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> },
  { key:"inProgress", label:"In Progress",  accent:"#F59E0B", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { key:"overdue",    label:"Overdue",       accent:"#EF4444", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
];

function Skeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton w-10 h-10 rounded-xl mb-3" />
      <div className="skeleton w-14 h-7 rounded-lg mb-2" />
      <div className="skeleton w-20 h-3.5 rounded" />
    </div>
  );
}

export default function StatCards({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} />)}
      </div>
    );
  }

  const values = {
    total:      summary?.total ?? 0,
    done:       summary?.byStatus?.done ?? 0,
    inProgress: summary?.byStatus?.["in-progress"] ?? 0,
    overdue:    summary?.overdue ?? 0,
  };
  const rate = summary?.completionRate ?? 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {STATS.map((s, i) => (
        <motion.div key={s.key} className="stat-card"
          initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
          transition={{ delay: i*.06, duration:.3 }}>
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background:`${s.accent}18`, color:s.accent }}>
              {s.icon}
            </div>
            {s.key === "done" && values.total > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background:`${s.accent}18`, color:s.accent }}>
                {rate}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color:"var(--text)" }}>{values[s.key]}</p>
          <p className="text-sm mt-0.5" style={{ color:"var(--muted)" }}>{s.label}</p>
          {s.key === "done" && (
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background:"var(--border)" }}>
              <motion.div className="h-full rounded-full" style={{ background:s.accent }}
                initial={{ width:0 }} animate={{ width:`${rate}%` }}
                transition={{ duration:.8, ease:"easeOut" }}
              />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
