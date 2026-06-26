import { PRIORITY_META, STATUS_META } from "../lib/taskHelpers";

const statusOrder = ["todo", "in-progress", "done"];
const priorityOrder = ["high", "medium", "low"];

function StatCharts({ summary }) {
  const total = summary?.total || 0;
  const doneRate = summary?.completionRate || 0;
  const overdue = summary?.overdue || 0;
  const statuses = summary?.byStatus || {};
  const priorities = summary?.byPriority || {};

  return (
    <section className="grid gap-5 xl:grid-cols-[1.05fr_1fr_1fr]">
      <div className="panel-glow rounded-3xl border border-white/10 bg-slate-950/55 p-5 shadow-card backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80">
              Overview
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-50">
              Task momentum
            </h3>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              Completion
            </p>
            <p className="text-2xl font-semibold text-slate-50">{doneRate}%</p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-5">
          <div className="relative h-36 w-36 shrink-0">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#38bdf8 ${doneRate}%, rgba(148, 163, 184, 0.18) 0)`,
              }}
            />
            <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/90 text-center">
              <span className="text-3xl font-semibold text-slate-50">{total}</span>
              <span className="text-xs uppercase tracking-[0.28em] text-slate-400">
                Tasks
              </span>
            </div>
          </div>

          <div className="grid flex-1 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Overdue</p>
              <p className="mt-1 text-2xl font-semibold text-rose-200">{overdue}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-400">Done</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-200">
                {statuses.done || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChartPanel
        title="Status distribution"
        subtitle="Work in flight by column"
        data={statusOrder.map((status) => ({
          key: status,
          label: STATUS_META[status].label,
          value: statuses[status] || 0,
          color: STATUS_META[status].solidClass,
        }))}
      />

      <ChartPanel
        title="Priority mix"
        subtitle="Urgency across your queue"
        data={priorityOrder.map((priority) => ({
          key: priority,
          label: PRIORITY_META[priority].label,
          value: priorities[priority] || 0,
          color: PRIORITY_META[priority].solidClass,
        }))}
      />
    </section>
  );
}

function ChartPanel({ title, subtitle, data }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-5 shadow-card backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.3em] text-sky-200/80">{subtitle}</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-50">{title}</h3>

      <div className="mt-5 grid gap-4">
        {data.map((item) => (
          <div key={item.key} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{item.label}</span>
              <span className="text-slate-400">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-white/5">
              <div
                className={`h-3 rounded-full ${item.color}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatCharts;
