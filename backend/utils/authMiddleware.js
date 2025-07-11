const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("🔐 Incoming token:", token);

  if (!token) {
    console.log("❌ No token found in header");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded JWT payload:", decoded);

    // ✅ Fix: Use decoded.userId instead of decoded.id
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
