const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support both 'id' and 'userId' for backward compatibility
    if (decoded.id && !decoded.userId) {
      decoded.userId = decoded.id;
    }
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
