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

// Save a blog
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!req.user) {
      console.error("❌ req.user is undefined");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const blog = new Blog({
      userId: req.user._id,
      title,
      content,
      image,
    });

    const savedBlog = await blog.save();
    res.json(savedBlog);
  } catch (err) {
    console.error("❌ Error saving blog:", err);
    res.status(500).json({ message: "Failed to save blog" });
  }
});


// Delete a blog
router.delete('/:id', authMiddleware, async (req, res) => {
  await Blog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.status(204).send();
});

module.exports = router;
