export const STATUS_META = {
  todo: {
    label: "Open",
    columnLabel: "OPEN",
    className: "status-open",
    progress: 15,
  },
  "in-progress": {
    label: "In Progress",
    columnLabel: "IN PROGRESS",
    className: "status-in-progress",
    progress: 55,
  },
  resolved: {
    label: "Resolved",
    columnLabel: "RESOLVED",
    className: "status-resolved",
    progress: 85,
  },
  done: {
    label: "Done",
    columnLabel: "DONE",
    className: "status-done",
    progress: 100,
  },
};

export const KANBAN_COLUMNS = ["todo", "in-progress", "resolved", "done"];

export const PRIORITY_META = {
  high: {
    label: "HIGH",
    className: "priority-high",
    color: "#E53E3E",
  },
  medium: {
    label: "MEDIUM",
    className: "priority-medium",
    color: "#DD6B20",
  },
  low: {
    label: "LOW",
    className: "priority-low",
    color: "#D69E2E",
  },
};

export const formatDate = (value) => {
  if (!value) return "No due date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatDueDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";

  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

export const formatCompactDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

export const isOverdue = (task) => {
  if (!task?.dueDate || task.status === "done" || task.status === "resolved") return false;
  const due = new Date(task.dueDate);
  return !Number.isNaN(due.getTime()) && due.getTime() < Date.now();
};

export const groupTasksByStatus = (tasks = []) =>
  KANBAN_COLUMNS.reduce((acc, status) => {
    acc[status] = tasks.filter((t) => (t.status || "todo") === status);
    return acc;
  }, {});

export const getTaskProgress = (task) => {
  if (task?.progress != null) return Math.min(100, Math.max(0, task.progress));
  return STATUS_META[task?.status || "todo"]?.progress ?? 0;
};

const hashCode = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
};

export const getTaskMeta = (task) => {
  const h = hashCode(task?._id || task?.title || "");
  const hours = (h % 20) + 2;
  const mins = h % 60;
  const secs = (h * 7) % 60;
  return {
    timeSpent: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
    files: (h % 5) + 1,
    comments: h % 4,
  };
};

export const getMemberAvatars = (task, count = 3) => {
  const names = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"];
  const h = hashCode(task?._id || task?.title || "");
  const result = [];
  for (let i = 0; i < count; i++) {
    const name = names[(h + i) % names.length];
    result.push({
      name,
      src: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`,
    });
  }
  return result;
};

export const avatarFromName = (name = "User") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4FD1C5&color=fff&size=64`;

export const TEAM_MEMBERS = ["Alex", "Sam", "Jordan", "Taylor", "Morgan", "Casey"];

export const getTaskPrimaryMember = (task) =>
  getMemberAvatars(task, 1)[0]?.name || TEAM_MEMBERS[0];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const filterTasks = (tasks = [], { dateRange = "all", priorities = [], members = [] } = {}) => {
  const now = new Date();
  const today = startOfDay(now);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const monthEnd = new Date(today);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  return tasks.filter(task => {
    if (priorities.length > 0 && !priorities.includes(task.priority)) return false;

    if (members.length > 0) {
      const primary = getTaskPrimaryMember(task);
      const taskMembers = getMemberAvatars(task, 3).map(m => m.name);
      const matches = members.some(m => taskMembers.includes(m) || primary === m);
      if (!matches) return false;
    }

    if (dateRange === "all") return true;

    const due = task.dueDate ? new Date(task.dueDate) : null;
    const dueValid = due && !Number.isNaN(due.getTime());

    if (dateRange === "no_date") return !dueValid;
    if (!dueValid) return false;

    const dueDay = startOfDay(due);
    if (dateRange === "today") return dueDay.getTime() === today.getTime();
    if (dateRange === "week") return dueDay >= today && dueDay < weekEnd;
    if (dateRange === "month") return dueDay >= today && dueDay < monthEnd;
    if (dateRange === "overdue") return isOverdue(task);

    return true;
  });
};

export const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All dates" },
  { value: "today", label: "Due today" },
  { value: "week", label: "Due this week" },
  { value: "month", label: "Due this month" },
  { value: "overdue", label: "Overdue" },
  { value: "no_date", label: "No due date" },
];

export const PRIORITY_OPTIONS = [
  { value: "high", label: "High", color: "#E53E3E" },
  { value: "medium", label: "Medium", color: "#DD6B20" },
  { value: "low", label: "Low", color: "#D69E2E" },
];
