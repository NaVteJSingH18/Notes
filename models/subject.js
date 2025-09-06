const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: "#ffffff" // optional: UI color label
  }
}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);
