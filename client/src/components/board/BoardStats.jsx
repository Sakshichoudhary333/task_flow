import { motion } from "framer-motion";

const ITEMS = [
  { key:"total",      label:"Total",       color:"#4F46E5" },
  { key:"inProgress", label:"In Progress", color:"#F59E0B" },
  { key:"done",       label:"Completed",   color:"#10B981" },
  { key:"overdue",    label:"Overdue",     color:"#EF4444" },
];

export default function BoardStats({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="card p-4">
            <div className="skeleton w-8 h-6 rounded mb-2" />
            <div className="skeleton w-20 h-3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const vals = {
    total:      summary?.total ?? 0,
    inProgress: summary?.byStatus?.["in-progress"] ?? 0,
    done:       summary?.byStatus?.done ?? 0,
    overdue:    summary?.overdue ?? 0,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ITEMS.map((item, i) => (
        <motion.div key={item.key} className="card p-4 flex items-center gap-3"
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * .06 }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:`${item.color}18`, color: item.color }}>
            <span className="text-sm font-bold">{vals[item.key]}</span>
          </div>
          <p className="text-xs font-medium" style={{ color:"var(--muted)" }}>{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
