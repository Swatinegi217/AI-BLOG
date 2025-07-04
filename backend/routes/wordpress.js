const express = require("express");
const router = express.Router();
const { publishToWordPress } = require("../utils/wordpressApi");
const Blog = require("../models/Blog");
require("dotenv").config();

// ✅ Publish instantly to WordPress
router.post("/publish", async (req, res) => {
  try {
    const { title, content, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Missing title or content" });
    }

    // Your WordPress publishing logic
    const response = await axios.post(
      "https://your-wordpress-site.com/wp-json/wp/v2/posts",
      {
        title,
        content: `<img src="${image}" /><br/>${content}`,
        status: "publish",
      },
      {
        auth: {
          username: process.env.WP_USER,
          password: process.env.WP_APP_PASSWORD,
        },
      }
    );

    res.status(200).json({ success: true, link: response.data.link });
  } catch (error) {
    console.error("❌ WordPress publish error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to publish blog" });
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
