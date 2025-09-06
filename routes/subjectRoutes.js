const express = require("express");
const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} = require("../controllers/subjectController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Define routes for subjects
router.route("/")
  .post(protect, createSubject)
  .get(protect, getSubjects);

router.route("/:id")
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;