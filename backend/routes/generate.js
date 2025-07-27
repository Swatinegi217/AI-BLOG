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
You're a professional blog writer and expert product reviewer.

Write a detailed and well-structured comparison blog on the topic: ${topic}.
Use the following format:

1. 🚗 **Pricing & Variants**  
Compare base and top variant prices for both products. Include notable variant names.

2. ⚡ **Powertrain & Range**  
Compare motor power, torque, battery size, certified vs real-world range, and charging speed.

3. 🛠️ **Features & Build Quality**  
Cover safety features, digital cluster, suspension, frame design, seating, and highlights.

4. 🏙️ **Use Cases & Market Fit**  
Who should use each product? Compare suitability for urban vs rural, fleets vs logistics.

5. 🥇 **Which One Should You Choose?**  
Create a side-by-side table comparing use-case-based needs (torque, price, ride quality, etc.).

6. 🧭 **Final Verdict**  
Summarize clearly who should choose what — with reasons and confidence.

7. 🌟 **TL;DR**  
Bullet summary with emojis + key specs (₹price, power, range, key feature). Keep it short and useful.

Guidelines:
- Write in **Markdown only**
- No HTML or JSON
- Tone: informative, confident, clear
- Use emojis and formatting like headings (##), bold text, and tables
- Keep it engaging, but not casual or humorous
- Use data from these links if helpful: ${links.join(', ')}


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
