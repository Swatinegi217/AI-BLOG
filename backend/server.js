const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

const Blog = require("./models/Blog");
const { publishToDevto } = require("./utils/devtoApi");

dotenv.config();




const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/devto", require("./routes/devto"));


// Routes
const devtoRoutes = require("./routes/devto");
app.use("/api/devto", devtoRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ CRON JOB to auto-publish
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const blogs = await Blog.find({ scheduledAt: { $lte: now }, published: false });

  for (const blog of blogs) {
    try {
      const url = await publishToDevto({
        title: blog.title,
        markdown: blog.markdown,
        tags: blog.tags
      });

      blog.published = true;
      blog.publishedUrl = url;
      await blog.save();

      console.log(`✅ Blog published: ${blog.title}`);
    } catch (err) {
      console.error(`❌ Failed to publish ${blog.title}:`, err.message);
    }
  }
});


// ✅ NEW: Route for WPGetAPI to access published blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("❌ Failed to fetch blogs:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});


app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});

