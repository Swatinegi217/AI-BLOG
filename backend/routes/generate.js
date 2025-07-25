const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/User');
const authMiddleware = require('../utils/authMiddleware');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate", authMiddleware, async (req, res) => {
  const { topic, links = [], promptType = "A" } = req.body;
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

    let prompt = "";

    if (promptType === "A") {
      prompt = `
You are an expert SEO blog writer and AI content strategist.
Write a complete blog post on the topic: ${topic}.
Use these reference links (if helpful): ${links.join(', ')}.

Return the blog in **Markdown** format with:

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
    } else if (promptType === "B") {
      prompt = `
You're a witty, insightful tech blogger who loves breaking things down for everyday readers.

Write a fun and highly engaging **comparison blog** on the topic: ${topic}.
You may use these links if helpful: ${links.join(', ')}

Keep the tone relaxed, human, and humorous—but loaded with clear, structured, informative comparisons.

Structure the blog like this:

1. 🚗 Pricing & Variants
2. ⚡ Power & Range
3. 🛠️ Features & Build
4. 🏙️ Use Cases & Audience Fit
5. 🥇 Which One's Right for You?
6. 🧭 Final Verdict with emoji-based summary
7. 🌟 TL;DR — bullet summary with emojis and pricing/specs

Write in **Markdown format** only. Use creative section headings (##), bullets, and emojis. Avoid HTML or JSON.

✅ Make it fun  
✅ Add personality  
✅ Still informative  
✅ Only Markdown output
`;
    }

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
