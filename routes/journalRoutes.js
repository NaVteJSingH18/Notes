const express = require("express");
const Subject = require("../models/subject");
const Note = require("../models/note");

const router = express.Router();

// Get all subjects
router.get("/subjects", async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

// Create a new subject
router.post("/subjects", async (req, res) => {
    try {
        const newSubject = new Subject(req.body);
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (error) {
        res.status(500).json({ error: "Failed to create subject" });
    }
});

// Get notes for a specific subject
router.get("/notes/:subjectId", async (req, res) => {
    try {
        const notes = await Note.find({ subjectId: req.params.subjectId });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

// Create a new note or file entry
router.post("/notes", async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ error: "Failed to create note" });
    }
});

module.exports = router;
