const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

const Blog = require("./models/Blog");
const { publishToWordPress } = require("./utils/wordpressApi");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/wordpress", require("./routes/wordpress"));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
};
connectDB();

app.get("/", (req, res) => res.send("API is running..."));


const axios = require("axios");

app.get("/api/test-wp", async (req, res) => {
  const auth = `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASS}`).toString("base64")}`;
  try {
    const response = await axios.get(`${process.env.WP_SITE}/wp-json/wp/v2/users/me`, {
      headers: { Authorization: auth }
    });
    res.json(response.data);
  } catch (err) {
    console.error("🔐 WordPress Test Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});


// 🔁 CRON Job for scheduled blog publishing
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log("🕐 Running CRON at", now.toISOString());

  try {
    const blogs = await Blog.find({ scheduledAt: { $lte: now }, published: false });

    console.log(`🧠 Found ${blogs.length} blogs to publish...`);

    for (const blog of blogs) {
      try {
        console.log(`📤 Publishing: ${blog.title}`);

        const wordpressUrl = await publishToWordPress({
          title: blog.title,
          markdown: blog.markdown,
        });

        if (!wordpressUrl) {
          console.error("❌ No URL returned from WordPress");
          continue;
        }

        blog.published = true;
        blog.publishedUrl = wordpressUrl;
        blog.status = "published";
        await blog.save();

        console.log(`✅ Successfully published: ${blog.title} → ${wordpressUrl}`);
      } catch (err) {
        console.error(`❌ Failed to publish ${blog.title}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Cron failed:", err.message);
  }
});


// Get all published blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

app.listen(5000, () => console.log("🚀 Server on http://localhost:5000"));
