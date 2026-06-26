const mongoose = require("mongoose");

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message:
        "Database unavailable. Please check the MongoDB connection and try again.",
    });
  }

  return next();
};

module.exports = requireDatabase;
