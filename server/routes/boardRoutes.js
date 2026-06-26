const express = require("express");
const router = express.Router();

const requireDatabase = require("../middleware/databaseMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");

router.route("/")
  .post(requireDatabase, protect, createBoard)
  .get(requireDatabase, protect, getBoards);

router.route("/:id")
  .get(requireDatabase, protect, getBoardById)
  .put(requireDatabase, protect, updateBoard)
  .delete(requireDatabase, protect, deleteBoard);

module.exports = router;
