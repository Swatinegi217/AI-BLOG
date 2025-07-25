const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const authMiddleware = require('../utils/authMiddleware');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", authMiddleware, async (req, res) => {
  const { topic, links = [] } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    // ✅ Allow unlimited blogs for admin
    if (!user.isAdmin && !user.isSubscribed) {
      if (user.blogCount >= 2) {
        return res.status(403).json({ error: "Free blog limit reached" });
      }
      user.blogCount += 1;
      await user.save();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      You are an expert SEO blog writer and AI content strategist.
      Write a complete blog post on the topic: ${topic}.
      Use these reference links (if helpful): ${links.join(', ')}.
      Return the blog in Markdown format...

      ✅ Title (h1)
      ✅ Meta Description (160 char)
      ✅ Keywords (comma-separated)
      ✅ Slug (URL-friendly)
      ✅ Introduction
      ✅ At least 3 Subheadings (##)
      ✅ Conclusion with CTA
      ✅ Hashtags (e.g., #ai #seo #blog)
      ✅ No JSON or HTML, only Markdown
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return res.json({ content });
  } catch (err) {
    console.error("Generation error:", err);
    return res.status(500).json({ error: "Blog generation failed" });
  }
});



module.exports = router;