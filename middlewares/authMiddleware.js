const jwt = require("jsonwebtoken");

// The function is now named 'protect' to match its intended use
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

// And we export it with the same name
module.exports = { protect };
