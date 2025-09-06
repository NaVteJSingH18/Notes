const File = require("../models/file");
const Note = require("../models/note"); // <-- This line was missing

// @desc    Upload a new file
// @route   POST /api/files
// @access  Private
const uploadFile = async (req, res) => {
  try {
    const { noteId, name, type, fileContent } = req.body;
    const userId = req.user.id; 

    if (!noteId || !name || !type || !fileContent) {
      return res.status(400).json({ message: "Note ID, file name, type, and content are required." });
    }

    const newFile = new File({
      userId,
      noteId,
      name,
      type,
      url: fileContent, 
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error("!!! SERVER ERROR while uploading file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all files for a user (optionally by note)
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId, subjectId } = req.query;

    console.log("--- Fetching files for subject:", subjectId, "---"); // Log 1

    let filter = { userId };

    if (subjectId) {
      const notes = await Note.find({ userId, subjectId }).select("_id");
      console.log("Found matching notes:", notes); // Log 2

      const noteIds = notes.map(note => note._id);
      console.log("Extracted Note IDs:", noteIds); // Log 3
      
      filter.noteId = { $in: noteIds };

    } else if (noteId) {
      filter.noteId = noteId;
    }

    console.log("Final file filter being used:", filter); // Log 4

    const files = await File.find(filter).sort({ createdAt: -1 });
    console.log("Found files in database:", files); // Log 5

    res.status(200).json(files);
  } catch (error) {
    console.error("!!! SERVER ERROR while getting files:", error); // Log 6
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const file = await File.findOneAndDelete({ _id: id, userId });

    if (!file) {
      return res.status(404).json({ message: "File not found or unauthorized." });
    }

    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    console.error("!!! SERVER ERROR while deleting file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
};