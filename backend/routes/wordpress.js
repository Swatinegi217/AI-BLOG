const express = require("express");
const router = express.Router();
const { publishToWordPress } = require("../utils/wordpressApi");
const Blog = require("../models/Blog");
require("dotenv").config();

// ✅ Publish instantly to WordPress
router.post("/publish", async (req, res) => {
  const { title, markdown, tags, image } = req.body;

  try {
    // 🧠 Use utility function
    const wordpressUrl = await publishToWordPress({ title, markdown });

    // 📦 Save to MongoDB
    await Blog.create({
      title,
      markdown,
      tags,
      image,
      published: true,
      publishedUrl: wordpressUrl,
      status: "published",
    });

    res.status(200).json({ url: wordpressUrl });
  }catch (error) {
  console.error("❌ Error publishing to WordPress:", error.response?.data || error.message);
  res.status(500).json({ error: "Failed to publish", details: error.response?.data || error.message });
}


});

// ✅ Schedule blog for future publishing
router.post("/schedule", async (req, res) => {
  const { title, markdown, tags, scheduledAt, image } = req.body;

  try {
    const blog = await Blog.create({
      title,
      markdown,
      tags,
      scheduledAt,
      image,
      published: false,
      status: "scheduled"
    });

    res.status(201).json({ message: "Blog scheduled", blog });
  } catch (err) {
    console.error("❌ Error scheduling blog:", err.message);
    res.status(500).json({ error: "Failed to schedule blog" });
  }
});

module.exports = router;
