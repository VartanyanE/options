import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5050;
const API_KEY = process.env.POLYGON_API_KEY;

// === FETCH LIVE PRICE === //
app.get("/api/price/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${API_KEY}`
    );
    const close = response.data.results?.[0]?.c || null;
    res.json({ ticker, close });
  } catch (err) {
    console.error("Error fetching price:", err.message);
    res.status(500).json({ error: "Failed to fetch price data" });
  }
});

// === FETCH ONE LATEST NEWS ARTICLE === //
app.get("/api/news/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const response = await axios.get(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=1&apiKey=${API_KEY}`
    );

    const article = response.data.results?.[0];
    if (!article) return res.json({ article: null });

    res.json({
      article: {
        title: article.title,
        url: article.article_url,
        source: article.publisher?.name || "Unknown",
        published: article.published_utc,
      },
    });
  } catch (err) {
    console.error("Error fetching news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// === SERVE FRONTEND IN PRODUCTION === //
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));