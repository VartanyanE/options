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

// === FETCH LIVE PRICE (FINNHUB) === //
app.get("/api/price/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    );

    const data = response.data;
    if (!data || data.c === 0) {
      return res.status(404).json({ error: "Ticker not found or invalid." });
    }

    res.json({
      ticker,
      close: data.c, // current price
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: data.pc,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Error fetching price (Finnhub):", err.message);
    res.status(500).json({ error: "Failed to fetch price data" });
  }
});

// === FETCH ONE LATEST NEWS ARTICLE (POLYGON) === //
app.get("/api/news/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const response = await axios.get(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=1&apiKey=${process.env.POLYGON_API_KEY}`
    );

    const article = response.data.results?.[0];

    if (!article) {
      return res.json({ article: null });
    }

    res.json({
      article: {
        title: article.title,
        url: article.article_url,
        source: article.publisher?.name || "Polygon",
        published: article.published_utc,
      },
    });
  } catch (err) {
    console.error("Error fetching news (Polygon):", err.message);
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

// === START SERVER === //
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT} using Finnhub (price) + Polygon (news)`)
);