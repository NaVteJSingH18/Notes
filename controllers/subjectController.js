const Subject = require("../models/subject");

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res) => {
  try {
    const { name, color } = req.body;
    const userId = req.user.id; // User ID is attached by auth middleware

    if (!name) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    const newSubject = new Subject({
      userId,
      name,
      color,
    });

    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjects = await Subject.find({ userId }).sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user.id;

    const subject = await Subject.findOne({ _id: id, userId });
    
    if (!subject) {
      return res.status(404).json({ message: "Subject not found or unauthorized" });
    }

    subject.name = name || subject.name;
    subject.color = color || subject.color;

    await subject.save();
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const subject = await Subject.findOneAndDelete({ _id: id, userId });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found or unauthorized" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
};
