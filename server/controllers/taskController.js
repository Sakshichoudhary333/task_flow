const mongoose = require("mongoose");
const Task = require("../models/Task");
const Board = require("../models/Board");
const asyncHandler = require("../utils/asyncHandler");

const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2,
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildSortComparator = (sortBy = "createdAt", order = "desc") => {
  return (a, b) => {
    if (sortBy === "priority") {
      const aValue = PRIORITY_ORDER[a.priority] ?? 99;
      const bValue = PRIORITY_ORDER[b.priority] ?? 99;

      return order === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (sortBy === "dueDate") {
      const aDate = a.dueDate
        ? new Date(a.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bDate = b.dueDate
        ? new Date(b.dueDate).getTime()
        : Number.MAX_SAFE_INTEGER;

      return order === "asc" ? aDate - bDate : bDate - aDate;
    }

    if (sortBy === "title") {
      return order === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }

    const aValue = new Date(a[sortBy] || a.createdAt).getTime();
    const bValue = new Date(b[sortBy] || b.createdAt).getTime();
    return order === "asc" ? aValue - bValue : bValue - aValue;
  };
};

const ensureBoardAccess = async (boardId, userId) => {
  if (!boardId) {
    return null;
  }

  if (!isValidObjectId(boardId)) {
    const error = new Error("Invalid board id");
    error.statusCode = 400;
    throw error;
  }

  const board = await Board.findOne({ _id: boardId, owner: userId });

  if (!board) {
    const error = new Error("Board not found");
    error.statusCode = 404;
    throw error;
  }

  return board;
};

const createTask = asyncHandler(async (req, res) => {
  const {
    boardId,
    board,
    title,
    description = "",
    status = "todo",
    priority = "medium",
    dueDate,
    estimatedEffort = "",
  } = req.body;

  const resolvedBoardId = boardId || board;

  if (!resolvedBoardId) {
    return res.status(400).json({
      message: "Board id is required",
    });
  }

  await ensureBoardAccess(resolvedBoardId, req.user._id);

  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";
  const trimmedEffort =
    typeof estimatedEffort === "string" ? estimatedEffort.trim() : "";
  const parsedDate = normalizeDate(dueDate);

  if (!trimmedTitle) {
    return res.status(400).json({
      message: "Task title is required",
    });
  }

  const task = await Task.create({
    board: resolvedBoardId,
    owner: req.user._id,
    title: trimmedTitle,
    description: trimmedDescription,
    status,
    priority,
    dueDate: parsedDate,
    estimatedEffort: trimmedEffort,
  });

  res.status(201).json(task);
});

const getTasks = asyncHandler(async (req, res) => {
  const {
    boardId,
    status,
    priority,
    search,
    sortBy = "createdAt",
    order = "desc",
    overdueOnly,
  } = req.query;

  const query = {
    owner: req.user._id,
  };

  if (boardId) {
    await ensureBoardAccess(boardId, req.user._id);
    query.board = boardId;
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }

  const tasks = await Task.find(query)
    .populate("board", "title description")
    .lean();

  const now = Date.now();
  const filteredTasks =
    overdueOnly === "true"
      ? tasks.filter(
          (task) =>
            task.dueDate &&
            new Date(task.dueDate).getTime() < now &&
            task.status !== "done"
        )
      : tasks;

  res.json(filteredTasks.sort(buildSortComparator(sortBy, order)));
});

const getTaskSummary = asyncHandler(async (req, res) => {
  const { boardId } = req.query;
  const query = {
    owner: req.user._id,
  };

  if (boardId) {
    await ensureBoardAccess(boardId, req.user._id);
    query.board = boardId;
  }

  const tasks = await Task.find(query).select(
    "status priority dueDate estimatedEffort"
  );
  const total = tasks.length;
  const todo = tasks.filter((task) => task.status === "todo").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const resolved = tasks.filter((task) => task.status === "resolved").length;
  const done = tasks.filter((task) => task.status === "done").length;
  const overdue = tasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate).getTime() < Date.now() &&
      task.status !== "done"
  ).length;
  const highPriority = tasks.filter((task) => task.priority === "high").length;
  const mediumPriority = tasks.filter((task) => task.priority === "medium").length;
  const lowPriority = tasks.filter((task) => task.priority === "low").length;

  res.json({
    total,
    byStatus: {
      todo,
      "in-progress": inProgress,
      resolved,
      done,
    },
    byPriority: {
      high: highPriority,
      medium: mediumPriority,
      low: lowPriority,
    },
    overdue,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  const { title, description, priority, status, dueDate, estimatedEffort } =
    req.body;

  if (typeof title === "string" && title.trim()) {
    task.title = title.trim();
  }

  if (typeof description === "string") {
    task.description = description.trim();
  }

  if (priority && ["low", "medium", "high"].includes(priority)) {
    task.priority = priority;
  }

  if (status && ["todo", "in-progress", "resolved", "done"].includes(status)) {
    task.status = status;
  }

  if (typeof estimatedEffort === "string") {
    task.estimatedEffort = estimatedEffort.trim();
  }

  if (dueDate !== undefined) {
    task.dueDate = normalizeDate(dueDate);
  }

  const updatedTask = await task.save();
  res.json(updatedTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!task) {
    return res.status(404).json({
      message: "Task not found",
    });
  }

  res.json({
    message: "Task deleted",
  });
});

module.exports = {
  createTask,
  getTasks,
  getTaskSummary,
  updateTask,
  deleteTask,
};
