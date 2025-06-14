const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const axios = require("axios");

// POST /api/devto/publish
router.post("/publish", async (req, res) => {
  const { title, markdown, tags } = req.body;

  try {
    const response = await axios.post("https://dev.to/api/articles", {
      article: {
        title,
        published: true,
        body_markdown: markdown,
        tags
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
      status: "published"
    });

    await blog.save();

    res.status(200).json({ url: devtoUrl });
  } catch (error) {
    console.error("❌ Error publishing to dev.to:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to publish" });
  }
});

module.exports = router;
