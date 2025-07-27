const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require("../models/User");
const authMiddleware = require("../utils/authMiddleware");

require("dotenv").config();

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
Use these reference links (if helpful): ${links.join(", ")}.

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

You are a professional blog writer and content strategist.

Write a detailed, well-formatted blog post on the topic: **${topic}**.
Use a clean, informative tone. The blog should follow a modern layout that's easy to read and visually structured.

### 🧱 Format Requirements:
- Use **Markdown format only**
- Use clear **section headings** (##)
- Use **tables** when comparing multiple items (use | and --- syntax)
- Use **bullet points** where necessary
- Use **emojis** to make it engaging and skimmable
- Keep tone: **professional, confident, modern**

### 🛠️ Output Should Include:
- ✅ A clear and bold **Title**
- ✅ Strong, engaging **Introduction**
- ✅ At least **3–5 main sections** with proper headings
- ✅ Use tables where useful (e.g., comparisons, specs)
- ✅ End with a **TL;DR** summary or Final Thoughts
- ✅ Output must be in **Markdown only** (no HTML, no JSON)

### 💡 Notes:
- If the topic includes comparisons, use **Markdown tables**
- If not, just break down the topic into clear, logical sections
- Use these links as supporting sources if relevant: ${links.join(", ")}



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
