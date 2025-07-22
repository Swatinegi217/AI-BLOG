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

    // Allow unlimited generation for admin
    if (!user.isAdmin && !user.isSubscribed) {
      if (user.blogCount >= 2) {
        return res.status(403).json({ error: "Free blog limit reached" });
      }
      user.blogCount += 1;
      await user.save();
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert SEO blog writer and AI content strategist.
Write a **complete blog post** in **Markdown format** based on the topic: "${topic}".

Use these reference links as information sources if helpful:
${links.map(link => `- ${link}`).join('\n')}

### Requirements:
- Title (# H1)
- Meta Description (**bold**) - Max 160 characters
- Keywords (comma-separated list)
- Slug (URL-friendly string)
- Introduction
- At least 3 Subheadings (## H2)
- Conclusion with CTA
- Hashtags (e.g. #ai #seo #blog)
- No JSON, no HTML. Just pure Markdown only.
- Do not add duplicate titles or repeated sections.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    res.json({ content });
  } catch (error) {
    console.error("❌ Generation error:", error);
    res.status(500).json({ error: "Blog generation failed" });
  }
});

module.exports = router;
