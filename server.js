const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const path = require('path');

// Import routes ONCE at the top
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");
const fileRoutes = require("./routes/fileRoutes");

dotenv.config();
const app = express();

// --- 1. CORE MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- 2. STATIC FILE SERVING (CRITICAL: MUST BE HERE) ---
// This tells the server to look in the 'frontend' folder for files like index.html
app.use(express.static(path.join(__dirname, 'frontend')));

// --- 3. API ROUTES ---
// Now, define your API routes after the static middleware
app.use("/api/auth", authRoutes);
app.use("/api/subjects", protect, subjectRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/files", protect, fileRoutes);

// JWT Protection Middleware (Definition can be here)
function protect(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

// Test route
app.get("/api", (req, res) => { // Changed path to /api to avoid conflicts
    res.send("Notes API is running...");
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));