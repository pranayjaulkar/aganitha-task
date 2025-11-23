const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ShortUrl = require("./model/ShortUrl");
const crypto = require("crypto");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.configDotenv();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "../client/dist/")));
} else {
  app.use(cors({ origin: ["http://localhost:5173"] }));
}

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  .then(() => console.log("Database Connected"))
  .catch((error) => {
    console.log("MongoDB Connection Error\n", error);
  });

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = crypto.randomInt(6, 9);
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars[crypto.randomInt(chars.length)];
  }

  return code;
}

app.get("/api/shorturls", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const q = req.query.q;
    if (q) {
      const searchQuery = {
        $or: [{ url: { $regex: q, $options: "i" } }, { code: { $regex: q, $options: "i" } }],
      };

      const shortUrls = await ShortUrl.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      return res.json(shortUrls);
    }

    const shortUrls = await ShortUrl.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(shortUrls);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch short URLs" });
  }
});

app.get("/api/shorturls/:code", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ code: req.params.code });
    if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });
    res.json(shortUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch short URL" });
  }
});

app.post("/api/shorturls", async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const code = generateCode();

    const codeExists = await ShortUrl.findOne({ code });
    const urlExists = await ShortUrl.findOne({ url });

    if (codeExists) return res.status(409).json({ error: "Code already exists" });
    if (urlExists) return res.status(409).json({ error: "URL already exists" });

    const shortUrl = await ShortUrl.create({ url, code });
    res.status(201).json(shortUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create short URL" });
  }
});

app.put("/api/shorturls/:code", async (req, res) => {
  try {
    const { url } = req.body;
    const { code } = req.params;

    const shortUrl = await ShortUrl.findOne({ code });
    if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });

    let newCodeAlreadyExists = true;
    let maxTries = 0;
    let newCode;
    while (newCodeAlreadyExists) {
      newCode = generateCode();
      newCodeAlreadyExists = (await ShortUrl.findOne({ code: newCode })) || newCode === code;

      if (maxTries >= 5) {
        break;
      }

      maxTries += 1;
    }

    if (maxTries >= 5) return res.json({ error: "Max tries reached for unique code generation" });

    shortUrl.code = newCode;

    if (url && url !== shortUrl.url) {
      if (await ShortUrl.findOne({ url })) return res.status(409).json({ error: "URL already exists" });
      shortUrl.url = url;
      shortUrl.lastClickedAt = null;
      shortUrl.clicks = 0;
    }

    await shortUrl.save();
    res.json(shortUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update short URL" });
  }
});

app.delete("/api/shorturls/:code", async (req, res) => {
  try {
    const result = await ShortUrl.deleteOne({ code: req.params.code });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Short URL not found" });
    res.json({ message: "Short URL deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete short URL" });
  }
});

app.get("/healthz", async (req, res) => {
  res.json({ ok: true });
});

app.get("/:code", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { clicks: 1 }, lastClickedAt: new Date() },
      { new: true }
    );
    if (!shortUrl) return res.status(404).json({ error: "Short URL not found" });
    res.redirect(shortUrl.url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to redirect" });
  }
});

if (process.env.NODE_ENV === "production") {
  app.get(/.*/, (req, res) => {
    console.log("returning html");
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(process.env.PORT, () => {
  console.log(`Server listening on PORT ${process.env.PORT}`);
});
