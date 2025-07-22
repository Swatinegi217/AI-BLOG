const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const unfluff = require('unfluff');
const User = require('../models/User');
const authMiddleware = require('../utils/authMiddleware');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", authMiddleware, async (req, res) => {
  const { topic, links = [] } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    // Free usage limit check (unless admin)
    if (!user.isAdmin && !user.isSubscribed) {
      if (user.blogCount >= 2) {
        return res.status(403).json({ error: "Free blog limit reached" });
      }
      user.blogCount += 1;
      await user.save();
    }

    // Extract content from all links
    const linkSummaries = [];

    for (const url of links) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const data = unfluff(html);
        linkSummaries.push(`Title: ${data.title}\nSummary: ${data.text.slice(0, 300)}...`);
      } catch (error) {
        console.warn(`❌ Failed to process link: ${url}`, error.message);
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an expert SEO blog writer and AI content strategist.

Write a detailed blog post on: **${topic}**

Use the following summaries extracted from reference links as research:
${linkSummaries.join("\n\n")}

✅ Return the blog in Markdown format
✅ Include:
- Title (h1)
- Meta Description (160 char)
- Keywords (comma-separated)
- Slug (URL-friendly)
- Introduction
- At least 3 Subheadings (##)
- Conclusion with CTA
- Hashtags (e.g., #ai #seo #blog)

Do **not** include HTML or JSON. Only Markdown format.
    `;

    const result = await model.generateContent(prompt);
    const content = await result.response.text();

    return res.json({ content });
  } catch (err) {
    console.error("🚨 Blog generation failed:", err);
    return res.status(500).json({ error: "Blog generation failed" });
  }
});

module.exports = router;
