const express = require("express");
const router = express.Router();
const axios = require("axios");
const Blog = require("../models/Blog");
const authMiddleware = require("../utils/authMiddleware");
require("dotenv").config();

// ✅ Publish instantly to WordPress
router.post("/publish", async (req, res) => {
  try {
    console.log("📥 Incoming publish body:", req.body);

    const { title, markdown, image } = req.body;

    if (!title || !markdown) {
      return res.status(400).json({ message: "Missing title or content" });
    }

    const content = image
      ? `<img src="${image}" /><br/>${markdown}`
      : markdown;

    const response = await axios.post(
      `${process.env.WP_SITE}/wp-json/wp/v2/posts`,
      {
        title,
        content,
        status: "publish",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${process.env.WP_USER}:${process.env.WP_APP_PASS.replace(/\s+/g, "")}`
            ).toString("base64"),
        },
      }
    );

    console.log("✅ WordPress post created:", response.data.link);
    res.status(200).json({ success: true, link: response.data.link });
  } catch (error) {
    console.error("❌ WordPress publish error:");
    console.error("Message:", error.message);
    console.error("Response:", error.response?.data);
    res.status(500).json({
      message: "Failed to publish blog",
      error: error.response?.data || error.message,
    });
  }
});



// ✅ Schedule blog for future publishing

router.post("/schedule", authMiddleware, async (req, res) => {
  const { title, markdown, tags, scheduledAt, image } = req.body;

  console.log("📥 Schedule request body:", req.body);

  try {
    const blog = await Blog.create({
      userId: req.user.id,
      title,
      markdown,
      tags,
      scheduledAt,
      image,
      published: false,
      status: "scheduled",
    });

    res.status(201).json({ message: "Blog scheduled", blog });
  } catch (err) {
  console.error("❌ Error scheduling blog:", err);
  res.status(500).json({ error: "Failed to schedule blog" });
}
});


module.exports = router;
