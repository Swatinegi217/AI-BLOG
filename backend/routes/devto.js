const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const axios = require("axios");

// POST /api/devto/publish
router.post("/publish", async (req, res) => {
  const { title, markdown, tags, image } = req.body; // ✅ include image

  try {
    const response = await axios.post("https://dev.to/api/articles", {
      article: {
        title,
        published: true,
        body_markdown: markdown,
        tags,
        main_image: image // ✅ Dev.to uses `main_image` key
      }
    }, {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.DEVTO_API_KEY
      }
    });

    const devtoUrl = response.data.url;

    const blog = new Blog({
      title,
      markdown,
      tags,
      devtoUrl,
      image,
      status: "published",
      published: true
    });

    await blog.save();

    res.status(200).json({ url: devtoUrl });
  } catch (error) {
    console.error("❌ Error publishing to dev.to:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to publish" });
  }
});

// POST /api/devto/schedule
router.post("/schedule", async (req, res) => {
  const { title, markdown, tags, scheduledAt, image } = req.body; // ✅ include image

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
