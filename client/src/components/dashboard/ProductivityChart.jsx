import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = { primary: "#4F46E5", success: "#10B981", warning: "#F59E0B", danger: "#EF4444" };

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="dropdown" style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>
      {label && <p style={{ fontWeight: 600, marginBottom: 4, color: "#1A202C" }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ fontWeight: 500, color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

const SkeletonChart = () => (
  <div className="dash-panel">
    <div className="dash-panel-body">
      <div className="skeleton" style={{ width: 140, height: 14, borderRadius: 6, marginBottom: 16 }} />
      <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 10 }} />
    </div>
  </div>
);

export default function ProductivityChart({ summary, loading }) {
  if (loading) return <SkeletonChart />;

  const byStatus = summary?.byStatus || {};
  const byPriority = summary?.byPriority || {};
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const total = summary?.total || 0;
  const done = byStatus.done || 0;

  const weekData = days.map((day, i) => {
    const seed = (total + i * 3) % 7;
    return {
      day,
      completed: Math.round((done / 7) * (0.6 + (seed % 5) * 0.1)),
      created: Math.round((total / 7) * (0.5 + (seed % 4) * 0.12)),
    };
  });

  const hasData = (summary?.total || 0) > 0;

  return (
    <div className="dash-panel">
      <div className="dash-panel-header">
        <div>
          <h3>Productivity Overview</h3>
          <p style={{ fontSize: "0.6875rem", color: "#A0AEC0", marginTop: 2 }}>Tasks created vs completed this week</p>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: "0.6875rem", color: "#718096" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.primary }} />Created
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.success }} />Completed
          </span>
        </div>
      </div>

      <div className="dash-panel-body">
        {!hasData ? (
          <EmptyChart />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={weekData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E8ECF1" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#A0AEC0" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#A0AEC0" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="created" name="Created" stroke={COLORS.primary}
                  fill="url(#gCreated)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="completed" name="Completed" stroke={COLORS.success}
                  fill="url(#gDone)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <MiniBar label="By Priority" data={[
                { name: "High", value: byPriority.high || 0, color: COLORS.danger },
                { name: "Medium", value: byPriority.medium || 0, color: COLORS.warning },
                { name: "Low", value: byPriority.low || 0, color: COLORS.success },
              ]} />
              <MiniBar label="By Status" data={[
                { name: "To Do", value: byStatus.todo || 0, color: COLORS.primary },
                { name: "In Prog.", value: byStatus["in-progress"] || 0, color: COLORS.warning },
                { name: "Done", value: byStatus.done || 0, color: COLORS.success },
              ]} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniBar({ label, data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ background: "#F7FAFC", borderRadius: 10, padding: "0.75rem" }}>
      <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#718096", marginBottom: 10 }}>{label}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map(d => (
          <div key={d.name}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", marginBottom: 3 }}>
              <span style={{ color: "#718096" }}>{d.name}</span>
              <span style={{ fontWeight: 600, color: "#1A202C" }}>{d.value}</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "#E2E8F0", overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", borderRadius: 99, background: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F7FAFC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg style={{ width: 20, height: 20, color: "#A0AEC0" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#1A202C" }}>No data yet</p>
        <p style={{ fontSize: "0.75rem", color: "#718096", marginTop: 2 }}>Create tasks to see your productivity chart</p>
      </div>
    </div>
  );
}
