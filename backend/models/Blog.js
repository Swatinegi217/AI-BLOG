const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: String,
  markdown: String,
  tags: [String],
<<<<<<< HEAD
  scheduledAt: Date,
  published: { type: Boolean, default: false },
  publishedUrl: String,
=======
  devtoUrl: String,
  status: { type: String, enum: ["generated", "regenerated", "published"], default: "generated" },
  createdAt: { type: Date, default: Date.now }
>>>>>>> 8697d41b686a449a538caa8e1b8a2c5147ff83f1
});

module.exports = mongoose.model("Blog", blogSchema);
