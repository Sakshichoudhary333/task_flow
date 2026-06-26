import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS_COLORS  = { todo:"#6366F1", "in-progress":"#F59E0B", done:"#10B981" };
const PRIORITY_COLORS = { high:"#EF4444", medium:"#F59E0B", low:"#10B981" };

function SkeletonChart() {
  return (
    <div className="card p-5">
      <div className="skeleton w-36 h-4 rounded mb-6" />
      <div className="skeleton w-full h-44 rounded-xl" />
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-sm font-semibold shadow-xl"
      style={{ background:"var(--surface)", border:"1px solid var(--border)", color:"var(--text)" }}>
      {payload[0].name}: <strong>{payload[0].value}</strong>
    </div>
  );
}

export default function Charts({ summary, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <SkeletonChart /><SkeletonChart />
      </div>
    );
  }

  const byStatus   = summary?.byStatus   || {};
  const byPriority = summary?.byPriority || {};

  const statusData = [
    { name:"To Do",       value: byStatus.todo          || 0, color: STATUS_COLORS.todo },
    { name:"In Progress", value: byStatus["in-progress"] || 0, color: STATUS_COLORS["in-progress"] },
    { name:"Done",        value: byStatus.done           || 0, color: STATUS_COLORS.done },
  ];

  const priorityData = [
    { name:"High",   value: byPriority.high   || 0 },
    { name:"Medium", value: byPriority.medium || 0 },
    { name:"Low",    value: byPriority.low    || 0 },
  ];

  const hasStatus   = statusData.some(d => d.value > 0);
  const hasPriority = priorityData.some(d => d.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Donut */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color:"var(--text)" }}>Tasks by Status</h3>
        {!hasStatus ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                paddingAngle={3} dataKey="value" nameKey="name">
                {statusData.map(e => <Cell key={e.name} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ fontSize:12, color:"var(--muted)", fontWeight:500 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bar */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-4" style={{ color:"var(--text)" }}>Tasks by Priority</h3>
        {!hasPriority ? <EmptyChart /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData} barSize={32} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize:12, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize:12, fill:"var(--muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill:"var(--bg-alt)" }} />
              <Bar dataKey="value" name="Tasks" radius={[6,6,0,0]}>
                {priorityData.map(e => (
                  <Cell key={e.name} fill={PRIORITY_COLORS[e.name.toLowerCase()] || "#6366F1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-44 flex flex-col items-center justify-center gap-2">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:"var(--bg-alt)" }}>
        <svg className="w-5 h-5" style={{ color:"var(--muted-2)" }} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      </div>
      <p className="text-sm" style={{ color:"var(--muted)" }}>No data yet</p>
    </div>
  );
}
