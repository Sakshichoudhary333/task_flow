import { formatDate, isOverdue, PRIORITY_META, STATUS_META } from "../lib/taskHelpers";

function TaskCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  isDragging,
  compact = false,
  actions = true,
}) {
  const overdue = isOverdue(task);
  const priorityMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const statusMeta = STATUS_META[task.status] || STATUS_META.todo;

  return (
    <article
      draggable={Boolean(onDragStart)}
      onDragStart={() => onDragStart?.(task)}
      className={[
        "group rounded-3xl border bg-slate-950/70 p-4 shadow-card transition duration-200 backdrop-blur-xl",
        overdue ? "border-rose-400/40 ring-1 ring-rose-400/20" : "border-white/10",
        isDragging ? "scale-[0.98] opacity-60" : "hover:-translate-y-0.5 hover:border-sky-400/35",
        compact ? "p-3" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-slate-50">
            {task.title}
          </h4>
          {task.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
              {task.description}
            </p>
          ) : null}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ring-1 ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
        <span
          className={`rounded-full px-3 py-1 ring-1 ${priorityMeta.className}`}
        >
          {priorityMeta.label}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-slate-300 ring-1 ring-white/10">
          {task.estimatedEffort || "Effort n/a"}
        </span>
        <span
          className={`rounded-full px-3 py-1 ring-1 ${
            overdue
              ? "bg-rose-500/15 text-rose-200 ring-rose-500/30"
              : "bg-white/5 text-slate-300 ring-white/10"
          }`}
        >
          {overdue ? "Overdue" : formatDate(task.dueDate)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {task.board?.title ? `Board: ${task.board.title}` : " "}
        </p>

        {actions ? (
          <div className="flex items-center gap-2">
            {onEdit ? (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default TaskCard;
