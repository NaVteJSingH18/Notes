const express = require("express");
const {
  uploadFile,
  getFiles,
  deleteFile,
} = require("../controllers/fileController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Define routes for files
router.route("/")
  .post(protect, uploadFile)
  .get(protect, getFiles);

router.route("/:id")
  .delete(protect, deleteFile);

module.exports = router;
