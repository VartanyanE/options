// -----------------------------
// Cash Flow Strategist / Options Tracker Backend
// -----------------------------

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch"; // ✅ Needed for global-news route on Render

// -----------------------------
// Load environment variables
// -----------------------------
dotenv.config();

// -----------------------------
// Initialize Express
// -----------------------------
const app = express();
const PORT = process.env.PORT || 5050;

// -----------------------------
// ✅ CORS configuration (Render-safe)
// -----------------------------
const allowedOrigins = [
  "http://localhost:3000", // local development
  "https://cash-flow-strategist.onrender.com", // your deployed frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Explicitly handle preflight
app.options("*", cors());

// Parse JSON
app.use(express.json());

// -----------------------------
// Directory setup for production
// -----------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// ✅ API ROUTES
// -----------------------------

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

// === 🌍 GLOBAL MARKET NEWS (Polygon Proxy) === //
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

// === Health Check === //
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Backend is live and CORS headers are active." });
});

// -----------------------------
// ✅ Serve React Frontend in Production
// -----------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

// -----------------------------
// ✅ Start Server
// -----------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
n;
