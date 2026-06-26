const mongoose = require("mongoose");
const Board = require("../models/Board");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureBoardOwnership = async (boardId, userId) => {
  if (!isObjectId(boardId)) {
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

const createBoard = asyncHandler(async (req, res) => {
  const { title, description = "" } = req.body;
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedDescription =
    typeof description === "string" ? description.trim() : "";

  if (!trimmedTitle) {
    return res.status(400).json({
      message: "Board title is required",
    });
  }

  const board = await Board.create({
    title: trimmedTitle,
    description: trimmedDescription,
    owner: req.user._id,
  });

  res.status(201).json(board);
});

const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id }).sort({
    updatedAt: -1,
  });

  const boardIds = boards.map((board) => board._id);
  const taskCounts = boardIds.length
    ? await Task.aggregate([
        {
          $match: {
            owner: req.user._id,
            board: { $in: boardIds },
          },
        },
        {
          $group: {
            _id: "$board",
            count: { $sum: 1 },
          },
        },
      ])
    : [];

  const countsByBoard = taskCounts.reduce((acc, entry) => {
    acc[entry._id.toString()] = entry.count;
    return acc;
  }, {});

  res.json(
    boards.map((board) => ({
      ...board.toObject(),
      taskCount: countsByBoard[board._id.toString()] || 0,
    }))
  );
});

const getBoardById = asyncHandler(async (req, res) => {
  const board = await ensureBoardOwnership(req.params.id, req.user._id);

  res.json(board);
});

const updateBoard = asyncHandler(async (req, res) => {
  const board = await ensureBoardOwnership(req.params.id, req.user._id);
  const { title, description } = req.body;

  if (typeof title === "string" && title.trim()) {
    board.title = title.trim();
  }

  if (typeof description === "string") {
    board.description = description.trim();
  }

  const updatedBoard = await board.save();
  res.json(updatedBoard);
});

const deleteBoard = asyncHandler(async (req, res) => {
  const board = await ensureBoardOwnership(req.params.id, req.user._id);

  await Task.deleteMany({
    board: board._id,
    owner: req.user._id,
  });
  await board.deleteOne();

  res.json({
    message: "Board deleted",
  });
});

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
};
