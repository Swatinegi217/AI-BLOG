const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  markdown: String,
  tags: [String],
  scheduledAt: Date,
  published: { type: Boolean, default: false },
  publishedUrl: String,
});

module.exports = mongoose.model("Blog", blogSchema);
