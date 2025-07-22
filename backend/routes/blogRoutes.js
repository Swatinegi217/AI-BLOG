const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const authMiddleware = require('../utils/authMiddleware');
const checkUsageLimit = require("../utils/checkLimit");



router.post("/generate", authMiddleware, checkUsageLimit, async (req, res) => {

  const user = await User.findById(req.user.id);

  // Generate AI blog content here...
  const blogContent = `# Blog on ${req.body.topic}\n\n...`;

  user.blogCount += 1;
  await user.save();

  res.json({ content: blogContent });
});

// Get all blogs for a user
router.get('/', authMiddleware, async (req, res) => {
  const blogs = await Blog.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(blogs);
});


module.exports = router;
