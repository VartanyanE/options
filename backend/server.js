// -----------------------------
// Cash Flow Strategist / Options Tracker Backend
// -----------------------------

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch"; // needed for global-news on Render
import OpenAI from "openai";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5050;

// -----------------------------
// CORS (Render-safe)
// -----------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://cash-flow-strategist.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

// JSON parser
app.use(express.json());

// Directory setup for production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// API ROUTES
// -----------------------------

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ============================================================
   AI Sentiment (Legacy — Safe to remove if unused)
============================================================ */
app.get("/api/analyze/:ticker", async (req, res) => {
  const { ticker } = req.params;
  try {
    const prompt = `Given the ticker ${ticker}, describe the short-term option sentiment.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
    });

    res.json({ insight: completion.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ insight: "Error fetching AI insight." });
  }
});

/* ============================================================
   STOCK PRICE (FINNHUB)
============================================================ */
app.get("/api/price/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const { data } = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    );

    const close = data.c ?? 0;
    const prev = data.pc ?? 0;
    const pct =
      close && prev
        ? (((close - prev) / prev) * 100).toFixed(2)
        : "0.00";

    res.json({
      ticker,
      close,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: prev,
      percentChange: pct,
    });
  } catch (err) {
    console.error("Finnhub price error:", err.message);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

/* ============================================================
   🔥 NEW: CRYPTO PRICE ROUTE (Yahoo Finance)
   Supports ANY symbol: BTC, ETH, SOL, etc.
============================================================ */
/* ============================================================
   🔥 NEW WORKING CRYPTO PRICE ROUTE (Yahoo Mobile API)
   Supports ANY symbol: BTC, ETH, SOL, etc.
============================================================ */
app.get("/api/crypto/:symbol", async (req, res) => {
  try {
    const raw = req.params.symbol.toUpperCase().trim();
    if (!raw) {
      return res.status(400).json({ error: "Symbol required" });
    }

    // Map BTC → BTC-USD, ETH → ETH-USD, etc.
    const yahooSymbol = `${raw}-USD`;

    // ⭐ Yahoo Finance mobile-friendly API (NO authentication required)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d`;

    const response = await axios.get(url);

    const result = response.data.chart.result?.[0];
    if (!result) {
      return res.status(500).json({ error: "Crypto data not available" });
    }

    const price = result.meta.regularMarketPrice;

    res.json({
      symbol: raw,
      yahooSymbol,
      price,
    });
  } catch (err) {
    console.error("Crypto fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch crypto price" });
  }
});

/* ============================================================
   SINGLE-TICKER NEWS (Polygon)
============================================================ */
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
    console.error("Ticker news error:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

/* ============================================================
   GLOBAL MARKET NEWS (Polygon Proxy)
============================================================ */
app.get("/api/global-news", async (req, res) => {
  try {
    const today = new Date();
    today.setDate(today.getDate() - 2);
    const from = today.toISOString();

    const url = `https://api.polygon.io/v2/reference/news?published_utc.gte=${from}&limit=15&sort=published_utc&order=desc&apiKey=${process.env.POLYGON_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) return res.json({ results: [] });

    const englishOnly = data.results.filter((a) => {
      const text = `${a.title} ${a.description || ""}`;
      const englishRatio =
        (text.match(/[a-zA-Z]/g)?.length || 0) / text.length;
      return englishRatio > 0.7;
    });

    const formatted = englishOnly.map((a) => ({
      title: a.title,
      url: a.article_url,
      source: a.publisher?.name || "Polygon",
      published: a.published_utc,
    }));

    res.json({ results: formatted });
  } catch (err) {
    console.error("Global news error:", err.message);
    res.status(500).json({ error: "Failed to fetch global market news" });
  }
});

/* ============================================================
   HEALTH CHECK
============================================================ */
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend OK" });
});

/* ============================================================
   SERVE REACT FRONTEND (PRODUCTION)
============================================================ */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

/* ============================================================
   START SERVER
============================================================ */
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);