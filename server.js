const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

// Only load variables from the .env file if the app is NOT in a production environment.
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Import middleware
const { protect } = require("./middlewares/authMiddleware");
const { errorHandler } = require("./middlewares/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/subjects", protect, subjectRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/files", protect, fileRoutes);

// --- Static File Serving ---
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// The "catch-all" handler: for any request that doesn't match one above,
// send back the main index.html file.
// --- THE FIX IS HERE ---
// Using a Regular Expression to match all paths to avoid parsing errors.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});

// --- Global Error Handling ---
app.use(errorHandler);

// --- Server & DB Connection ---
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        console.log("MongoDB connected");
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

