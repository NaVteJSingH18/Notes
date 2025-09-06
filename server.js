const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // Added jsonwebtoken
const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const noteRoutes = require("./routes/noteRoutes");
const fileRoutes = require("./routes/fileRoutes");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/files', require('./routes/fileRoutes')); // <-- THIS IS THE CRITICAL LINE

// JWT Protection Middleware
function protect(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded payload to the request
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// Routes
// These routes connect your application to the different route handlers.
app.use("/api/auth", authRoutes); // Public route for login/register
app.use("/api/subjects", protect, subjectRoutes); // Protected
app.use("/api/notes", protect, noteRoutes); // Protected
app.use("/api/files", protect, fileRoutes); // Protected

// Test route
app.get("/", (req, res) => {
    res.send("Notes API is running...");
});

// DB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

