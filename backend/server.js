import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch"; // ✅ Added for global-news route

// ✅ Load environment variables first
dotenv.config();

// ✅ Setup express app
const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://cash-flow-strategist.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("CORS blocked"), false);
      }
      return callback(null, true);
    },
  })
);

// ✅ Handle preflight requests explicitly
app.options("*", cors());

// ✅ Middleware for parsing JSON
app.use(express.json());

// ✅ Directory setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Port setup
const PORT = process.env.PORT || 5050;

// === STOCK PRICE (FINNHUB) === //
app.get("/api/price/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    );
    const data = response.data;
    if (!data || !data.c)
      return res.status(404).json({ error: "Ticker not found" });

    res.json({
      ticker,
      close: data.c,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: data.pc,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Error fetching price (Finnhub):", err.message);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// === SINGLE-TICKER NEWS (Polygon) === //
app.get("/api/news/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  try {
    const response = await axios.get(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=1&apiKey=${process.env.POLYGON_API_KEY}`
    );
    const article = response.data.results?.[0];
    if (!article) return res.json({ article: null });
    res.json({
      article: {
        title: article.title,
        url: article.article_url,
        source: article.publisher?.name || "Polygon",
        published: article.published_utc,
      },
    });
  } catch (err) {
    console.error("Error fetching ticker news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// === 🌍 GLOBAL MARKET NEWS ENDPOINT (for NewsTicker.js) === //
app.get("/api/global-news", async (req, res) => {
  try {
    const url = `https://api.polygon.io/v2/reference/news?limit=10&sort=published_utc&apiKey=${process.env.POLYGON_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Global news fetch error:", error);
    res.status(500).json({ error: "Failed to fetch global market news" });
  }
});

// === FRONTEND SERVE (PROD) === //
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`✅ Server live on port ${PORT}`));