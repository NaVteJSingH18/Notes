const Note = require("../models/note");

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { subjectId, content } = req.body;
    const userId = req.user.id;

    if (!subjectId || !content) {
      return res.status(400).json({ message: "Subject ID and note content are required." });
    }

    const newNote = new Note({
      userId,
      subjectId,
      content,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all notes for a user (optionally by subject)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subjectId } = req.query; // Get subjectId from query params

    let filter = { userId };
    if (subjectId) {
      filter.subjectId = subjectId;
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { content },
      { new: true } // Return the updated document
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found or unauthorized." });
    }

    res.status(200).json({ message: "Note deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
};
