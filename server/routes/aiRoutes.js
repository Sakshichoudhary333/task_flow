const express = require("express");
const router = express.Router();

const requireDatabase = require("../middleware/databaseMiddleware");
const protect = require("../middleware/authMiddleware");

const { suggestTaskPlanning } = require("../controllers/aiController");

router.post("/suggest", requireDatabase, protect, suggestTaskPlanning);

module.exports = router;
