const express = require("express");
const router = express.Router();
const SavedBlog = require("../models/SavedBlog");
const authMiddleware = require("../utils/authMiddleware");

// ✅ Save a blog
router.post("/save", authMiddleware, async (req, res) => {
  const { title, content, image } = req.body;
  const userId = req.user.id;

  try {
    const blog = new SavedBlog({
      user: userId,
      title,
      content,
      image,
    });

    const saved = await blog.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ Save failed:", err.message);
    res.status(500).json({ message: "Save failed" });
  }
});

// ✅ Get all saved blogs for the user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const blogs = await SavedBlog.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved blogs" });
  }
});

// ✅ Delete a blog by ID
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const blog = await SavedBlog.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
