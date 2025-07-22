const User = require('../models/User');

const checkUsageLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isAdmin || user.isSubscribed) return next();

    if (user.blogCount >= 2) {
      return res.status(403).json({ message: "Free blog limit reached. Please subscribe." });
    }

    next();
  } catch (error) {
    console.error("Check limit error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkUsageLimit;