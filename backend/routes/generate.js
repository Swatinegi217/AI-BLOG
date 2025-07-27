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
You are a professional blog writer and expert product reviewer.

Write a detailed, structured comparison blog on the topic: ${topic}. Compare the two products (or vehicles) in-depth across categories. Use a clear, easy-to-read format that is informative and engaging.

Use the following structure and formatting:

1. 🚗 **Pricing & Variants** – Compare base and top model pricing. Mention variant options.
2. ⚡ **Performance & Range** – Compare power output, battery capacity, torque, certified and real-world range, and charging times.
3. 🛠️ **Features & Build Quality** – Compare design, suspension, build materials, display, comfort, and standout features.
4. 🏙️ **Use Cases & Audience Fit** – Who is each product best for? Rural, urban, fleet, logistics, personal use, etc.
5. 🥇 **Which One Should You Choose?** – Present a clear table or list summarizing what type of buyer should choose which one.
6. 🧭 **Final Verdict** – Summarize in a few lines which product wins in which category and why.
7. 🌟 **TL;DR** – A short bullet summary with emojis, price, power, range, and recommendation.

Guidelines:
- Use clear headings and bullet points
- Use emojis to make sections more visually engaging
- Write in **Markdown format only**
- Tone: Informative, professional, confident — not casual or humorous
- Do NOT return HTML or JSON

You may use these links if helpful: ${links.join(", ")}

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
