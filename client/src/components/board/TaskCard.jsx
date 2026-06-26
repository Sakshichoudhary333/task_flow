import { useRef } from "react";
import {
  formatDueDate,
  getMemberAvatars,
  getTaskMeta,
  getTaskProgress,
  PRIORITY_META,
  STATUS_META,
  avatarFromName,
} from "../../lib/taskHelpers";
import { useAuth } from "../../context/AuthContext";

export default function TaskCard({ task, isDragging, onDragStart, onDragEnd, onEdit }) {
  const { user } = useAuth();
  const draggedRef = useRef(false);

  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const status = STATUS_META[task.status] || STATUS_META.todo;
  const progress = getTaskProgress(task);
  const meta = getTaskMeta(task);
  const members = getMemberAvatars(task, 3);
  const creatorName = user?.name || "User";

  const handleDragStart = e => {
    draggedRef.current = true;
    e.dataTransfer.effectAllowed = "move";
    onDragStart();
  };

  const handleDragEnd = () => {
    onDragEnd();
    setTimeout(() => { draggedRef.current = false; }, 0);
  };

  const handleClick = () => {
    if (!draggedRef.current) onEdit(task);
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`kanban-task-card ${isDragging ? "dragging" : ""}`}
    >
      <div className="kanban-task-top">
        <span className={`priority-pill ${priority.className}`}>{priority.label}</span>
        <div className="kanban-task-creator">
          <span className="kanban-task-creator-label">Created By</span>
          <img src={avatarFromName(creatorName)} alt={creatorName} className="kanban-task-creator-avatar" />
        </div>
      </div>

      <h4 className="kanban-task-title">{task.title}</h4>

      <div className="kanban-task-members">
        <div className="kanban-task-avatar-stack">
          {members.map((m, i) => (
            <img key={i} src={m.src} alt={m.name} title={m.name} className="kanban-task-member-avatar" />
          ))}
        </div>
        <div className="kanban-task-due">
          <span className="kanban-task-due-label">Due By</span>
          <span className="kanban-task-due-date">{formatDueDate(task.dueDate)}</span>
        </div>
      </div>

      <div className="kanban-task-progress-section">
        <div className="kanban-task-progress-header">
          <span className="kanban-task-progress-label">Task Status</span>
          <div className="kanban-task-progress-meta">
            <span className="kanban-task-progress-pct">{progress}%</span>
            <button
              type="button"
              className="kanban-task-overview"
              onClick={e => { e.stopPropagation(); onEdit(task); }}
            >
              Overview
            </button>
          </div>
        </div>
        <div className="kanban-task-progress-bar">
          <div className="kanban-task-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <span className={`status-pill ${status.className}`}>{status.columnLabel}</span>

      <div className="kanban-task-footer">
        <span className="kanban-task-footer-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {meta.timeSpent}
        </span>
        <span className="kanban-task-footer-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
          </svg>
          {meta.files} Files
        </span>
        <span className="kanban-task-footer-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {meta.comments} Comments
        </span>
      </div>
    </article>
  );
}
