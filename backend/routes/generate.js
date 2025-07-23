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
Return the blog in Markdown format, using clear sections and headings.
Follow this structure exactly, using proper heading levels like #, ##, and ### for compatibility with Markdown-to-HTML converters.
Do not add extra markdown formatting (like italics/bold) unless necessary for clarity. Do not return JSON or HTML — only markdown.

⚙️ Requirements:
✅ Start with a catchy blog title.
✅ Include a meta description (max 160 characters).
✅ Provide 5 SEO-friendly tags/keywords.
✅ Generate a URL-friendly slug (lowercase, hyphens only).
✅ The blog post should include:
✅ A strong introduction (hook the reader)
✅ At least 3 subheadings (with relevant H2 tags)
✅ A conclusion with a CTA
✅ Use bullet points or numbered lists if needed
✅ Highlight code blocks (if topic is technical)

Output:

Title:
[Catchy, SEO-optimized blog title]

Slug:
[URL-friendly version of title (lowercase, hyphenated)]

Meta Description:
[Short and SEO-friendly (under 160 characters)]

Keywords:
[Comma-separated list of 5 to 7 SEO keywords relevant to the blog]

Author:
[Author name or leave as "AI Assistant"]

Estimated Reading Time:
[X minutes]

Date:
[YYYY-MM-DD]

Introduction:
[A hook that introduces the topic and gives context]

Subheading 1:
[Explanation, examples, or list under this sub-topic]

Subheading 2:
[Another focused sub-topic, well explained]

Subheading 3:
[Optional — can include code blocks, steps, or comparisons]

Conclusion:
[Summarize the key points, add final thoughts or a call-to-action]

Hashtags:
[#tag1 #tag2 #tag3 #tag4 #tag5]

Tags:
[tag1, tag2, tag3, tag4, tag5]

Note: give title in h1 tag
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