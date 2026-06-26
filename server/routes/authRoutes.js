const express = require("express");
const requireDatabase = require("../middleware/databaseMiddleware");
const { registerUser, loginUser, getMe } = require("../controllers/authControllers");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", requireDatabase, registerUser);
router.post("/login", requireDatabase, loginUser);
router.get("/me", requireDatabase, protect, getMe);

module.exports = router;
