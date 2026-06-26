import { useRef, useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  avatarFromName,
  DATE_RANGE_OPTIONS,
  PRIORITY_OPTIONS,
  TEAM_MEMBERS,
  STATUS_META,
} from "../../lib/taskHelpers";

const drop = {
  hidden: { opacity: 0, y: 6, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, y: 6, scale: 0.97, transition: { duration: 0.1 } },
};

function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

function Dropdown({ open, onClose, children, align = "left", width = 260 }) {
  const ref = useRef(null);
  useOutsideClick(ref, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          variants={drop}
          initial="hidden"
          animate="show"
          exit="exit"
          className="board-dropdown"
          style={{ [align === "right" ? "right" : "left"]: 0, width }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterDropdown({ id, openId, setOpenId, icon, label, activeLabel, children }) {
  const open = openId === id;
  return (
    <div className="board-filter-wrap">
      <button
        type="button"
        className={`board-filter ${open || activeLabel !== label ? "board-filter--active" : ""}`}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
      >
        <span className="board-filter-icon">{icon}</span>
        <span>{activeLabel}</span>
        <svg className={`board-filter-chevron ${open ? "open" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
      <Dropdown open={open} onClose={() => setOpenId(null)} width={240}>
        {children}
      </Dropdown>
    </div>
  );
}

function DropdownItem({ children, onClick, active, danger }) {
  return (
    <button type="button" className={`board-dropdown-item ${active ? "active" : ""} ${danger ? "danger" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function CheckboxItem({ checked, onChange, children }) {
  return (
    <label className="board-dropdown-check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{children}</span>
    </label>
  );
}

export default function BoardHeader({
  boardTitle,
  onAddTask,
  tasks = [],
  filters,
  onFiltersChange,
  onResetFilters,
  onDeleteBoard,
}) {
  const { user } = useAuth();
  const { onMenuClick } = useOutletContext() || {};
  const [openId, setOpenId] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);

  useOutsideClick(notifRef, () => setNotifOpen(false));
  useOutsideClick(settingsRef, () => setSettingsOpen(false));

  const dateLabel = DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)?.label || "Date Range";
  const memberLabel = filters.members.length === 0
    ? "Members"
    : filters.members.length === 1
      ? filters.members[0]
      : `${filters.members.length} members`;
  const priorityLabel = filters.priorities.length === 0
    ? "Priority"
    : filters.priorities.length === 1
      ? PRIORITY_OPTIONS.find(p => p.value === filters.priorities[0])?.label
      : `${filters.priorities.length} selected`;

  const hasActiveFilters =
    filters.dateRange !== "all" || filters.priorities.length > 0 || filters.members.length > 0;

  const recentNotifs = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 6);

  const togglePriority = value => {
    const next = filters.priorities.includes(value)
      ? filters.priorities.filter(p => p !== value)
      : [...filters.priorities, value];
    onFiltersChange({ ...filters, priorities: next });
  };

  const toggleMember = name => {
    const next = filters.members.includes(name)
      ? filters.members.filter(m => m !== name)
      : [...filters.members, name];
    onFiltersChange({ ...filters, members: next });
  };

  const closeAll = () => { setOpenId(null); setNotifOpen(false); setSettingsOpen(false); };

  return (
    <div className="board-header">
      <div className="board-header-top">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {onMenuClick && (
            <button type="button" className="board-icon-btn board-icon-btn--mobile" onClick={onMenuClick} aria-label="Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <nav className="board-breadcrumb">
            <Link to="/dashboard">Projects</Link>
            <span className="board-breadcrumb-sep">&gt;</span>
            <span className="board-breadcrumb-current">{boardTitle || "Board"}</span>
          </nav>
        </div>

        <div className="board-header-actions">
          {onAddTask && (
            <button type="button" className="btn-teal" onClick={onAddTask}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Task
            </button>
          )}

          <div className="board-icon-wrap" ref={notifRef}>
            <button
              type="button"
              className={`board-icon-btn ${notifOpen ? "active" : ""}`}
              aria-label="Notifications"
              onClick={() => { setNotifOpen(v => !v); setSettingsOpen(false); setOpenId(null); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {recentNotifs.length > 0 && <span className="board-icon-badge" />}
            </button>
            <Dropdown open={notifOpen} onClose={() => setNotifOpen(false)} align="right" width={300}>
              <div className="board-dropdown-head">Notifications</div>
              {recentNotifs.length === 0 ? (
                <div className="board-dropdown-empty">No recent activity</div>
              ) : (
                <div className="board-dropdown-list">
                  {recentNotifs.map(task => (
                    <div key={task._id} className="board-dropdown-notif">
                      <span className="board-dropdown-notif-dot" style={{
                        background: task.status === "done" ? "#10B981"
                          : task.status === "in-progress" ? "#F59E0B"
                          : task.status === "resolved" ? "#38B2AC" : "#4F46E5"
                      }} />
                      <div>
                        <p className="board-dropdown-notif-title">{task.title}</p>
                        <p className="board-dropdown-notif-meta">
                          {STATUS_META[task.status]?.label || task.status} · {task.priority} priority
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Dropdown>
          </div>

          <div className="board-icon-wrap" ref={settingsRef}>
            <button
              type="button"
              className={`board-icon-btn ${settingsOpen ? "active" : ""}`}
              aria-label="Settings"
              onClick={() => { setSettingsOpen(v => !v); setNotifOpen(false); setOpenId(null); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </button>
            <Dropdown open={settingsOpen} onClose={() => setSettingsOpen(false)} align="right" width={220}>
              <div className="board-dropdown-head">Board Settings</div>
              <DropdownItem onClick={() => { onResetFilters(); closeAll(); toast.success("Filters cleared."); }}>
                Clear all filters
              </DropdownItem>
              <DropdownItem onClick={() => { onFiltersChange({ ...filters, dateRange: "overdue" }); closeAll(); toast.success("Showing overdue tasks."); }}>
                Show overdue only
              </DropdownItem>
              <DropdownItem onClick={() => { onFiltersChange({ ...filters, priorities: ["high"] }); closeAll(); toast.success("Showing high priority tasks."); }}>
                Show high priority only
              </DropdownItem>
              <DropdownItem onClick={() => { closeAll(); toast.success("Board view refreshed."); }}>
                Refresh board
              </DropdownItem>
              {onDeleteBoard && (
                <>
                  <div className="board-dropdown-divider" />
                  <DropdownItem danger onClick={() => { closeAll(); onDeleteBoard(); }}>
                    Delete project
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          </div>

          <img
            src={avatarFromName(user?.name || "User")}
            alt={user?.name || "User"}
            className="board-avatar"
            title={user?.name}
          />
        </div>
      </div>

      <div className="board-filters">
        <FilterDropdown
          id="date"
          openId={openId}
          setOpenId={setOpenId}
          label="Date Range"
          activeLabel={filters.dateRange === "all" ? "Date Range" : dateLabel}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          }
        >
          {DATE_RANGE_OPTIONS.map(opt => (
            <DropdownItem
              key={opt.value}
              active={filters.dateRange === opt.value}
              onClick={() => { onFiltersChange({ ...filters, dateRange: opt.value }); setOpenId(null); }}
            >
              {opt.label}
            </DropdownItem>
          ))}
        </FilterDropdown>

        <FilterDropdown
          id="members"
          openId={openId}
          setOpenId={setOpenId}
          label="Members"
          activeLabel={memberLabel}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
        >
          <div className="board-dropdown-head" style={{ borderBottom: "none", paddingBottom: 4 }}>Filter by member</div>
          <CheckboxItem
            checked={filters.members.length === 0}
            onChange={() => onFiltersChange({ ...filters, members: [] })}
          >
            All members
          </CheckboxItem>
          {user?.name && (
            <CheckboxItem
              checked={filters.members.includes(user.name)}
              onChange={() => toggleMember(user.name)}
            >
              {user.name} (you)
            </CheckboxItem>
          )}
          {TEAM_MEMBERS.map(name => (
            <CheckboxItem
              key={name}
              checked={filters.members.includes(name)}
              onChange={() => toggleMember(name)}
            >
              {name}
            </CheckboxItem>
          ))}
          <button type="button" className="board-dropdown-apply" onClick={() => setOpenId(null)}>
            Apply
          </button>
        </FilterDropdown>

        <FilterDropdown
          id="priority"
          openId={openId}
          setOpenId={setOpenId}
          label="Priority"
          activeLabel={priorityLabel}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
          }
        >
          <CheckboxItem
            checked={filters.priorities.length === 0}
            onChange={() => onFiltersChange({ ...filters, priorities: [] })}
          >
            All priorities
          </CheckboxItem>
          {PRIORITY_OPTIONS.map(opt => (
            <CheckboxItem
              key={opt.value}
              checked={filters.priorities.includes(opt.value)}
              onChange={() => togglePriority(opt.value)}
            >
              <span className="board-priority-dot" style={{ background: opt.color }} />
              {opt.label}
            </CheckboxItem>
          ))}
          <button type="button" className="board-dropdown-apply" onClick={() => setOpenId(null)}>
            Apply
          </button>
        </FilterDropdown>

        {hasActiveFilters && (
          <button type="button" className="board-filter-clear" onClick={onResetFilters}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
