const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  markdown: { type: String, required: true },
  tags: [String],
  image: String,

  scheduledAt: Date,
  published: { type: Boolean, default: false },
  publishedUrl: String,       // Used by cron job
  devtoUrl: String,           // Used by /publish route

  status: {
    type: String,
    enum: ["generated", "regenerated", "scheduled", "published"],
    default: "generated"
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Blog", blogSchema);
