const express = require("express");
const router = express.Router();

const requireDatabase = require("../middleware/databaseMiddleware");
const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  getTaskSummary,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.get("/summary", requireDatabase, protect, getTaskSummary);
router.post("/", requireDatabase, protect, createTask);

router.get("/", requireDatabase, protect, getTasks);

router
.route("/:id")
.put(requireDatabase, protect, updateTask)
.delete(requireDatabase, protect, deleteTask);

module.exports = router;
