const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  markdown: String,
  tags: [String],
  devtoUrl: String,
  status: { type: String, enum: ["generated", "regenerated", "published"], default: "generated" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Blog", blogSchema);
