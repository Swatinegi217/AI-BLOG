const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  markdown: { type: String, required: true }, // ✅ renamed from "content"
  image: { type: String, default: "" },

  // ✅ Scheduling-related fields
  scheduledAt: { type: Date },
  published: { type: Boolean, default: false },
  publishedUrl: { type: String },
  status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },

  tags: [String], // optional
}, { timestamps: true }); // ✅ adds createdAt + updatedAt

module.exports = mongoose.model('Blog', blogSchema);
