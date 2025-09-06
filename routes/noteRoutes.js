const express = require("express");
const {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Define routes for notes
router.route("/")
  .post(protect, createNote)
  .get(protect, getNotes);

router.route("/:id")
  .put(protect, updateNote)
  .delete(protect, deleteNote);

module.exports = router;