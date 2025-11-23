const mongoose = require("mongoose");

const shortUrlSchema = mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    url: { type: String, unique: true, required: true },
    clicks: { type: Number, default: 0 },
    lastClickedAt: Date,
  },
  { timestamps: true }
);

const shortUrl = mongoose.model("ShortUrl", shortUrlSchema);

module.exports = shortUrl;
