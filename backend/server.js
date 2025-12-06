// ------------------------------------
// Cash Flow Strategist Backend
// ------------------------------------

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import fetch from "node-fetch";
import OpenAI from "openai";
import YahooFinance from "yahoo-finance2";

// Load env vars
dotenv.config();

// Setup Express
const app = express();
const PORT = process.env.PORT || 5050;

// Allow frontend access during development
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
app.use(express.json());

// Directory utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Yahoo Finance (FIXED)
const yahoo = new YahooFinance({
  enableDebug: false,
});

// --------------------------------------------------
// PRICE ROUTE
// --------------------------------------------------
app.get("/api/price/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const { data } = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    );

    const close = data.c ?? 0;
    const prev = data.pc ?? 0;

    let percentChange = null;
    if (close && prev && prev !== 0) {
      percentChange = ((close - prev) / prev) * 100;
    }

    res.json({
      ticker,
      close,
      open: data.o,
      high: data.h,
      low: data.l,
      previousClose: prev,
      percentChange:
        percentChange !== null ? percentChange.toFixed(2) : "0.00",
    });
  } catch (err) {
    console.error("Finnhub price error:", err.message);
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

// --------------------------------------------------
// INVESTMENT ANALYSIS ROUTE (NEW + FIXED)
// --------------------------------------------------
app.get("/api/invest/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    // 1) FINNHUB QUOTE
    const qResp = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
    );
    const q = qResp.data || {};

    const close = q.c ?? null;
    const open = q.o ?? null;
    const high = q.h ?? null;
    const low = q.l ?? null;
    const prevClose = q.pc ?? null;

    let percentChange = null;
    if (close && prevClose && prevClose !== 0) {
      percentChange = ((close - prevClose) / prevClose) * 100;
    }

    const quote = {
      ticker,
      close,
      open,
      high,
      low,
      previousClose: prevClose,
      percentChange,
    };

    // 2) FUNDAMENTALS (Yahoo Finance FIXED)
    let yfQuote = {};
    try {
      yfQuote = await yahoo.quote(ticker);
    } catch (err) {
      console.error("Yahoo Finance quote error:", err.message);
    }

    const fundamentals = {
      longName: yfQuote.longName || yfQuote.shortName || ticker,
      sector: yfQuote.sector || null,
      industry: yfQuote.industry || null,
      marketCap: yfQuote.marketCap || null,
      trailingPE: yfQuote.trailingPE || null,
      forwardPE: yfQuote.forwardPE || null,
      dividendYield: yfQuote.trailingAnnualDividendYield || null,
      beta: yfQuote.beta || null,
      fiftyTwoWeekHigh: yfQuote.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: yfQuote.fiftyTwoWeekLow || null,
      fiftyDayAverage: yfQuote.fiftyDayAverage || null,
      twoHundredDayAverage: yfQuote.twoHundredDayAverage || null,
    };

    // 3) OPENAI ANALYSIS
    const prompt = `
    You are an investment research assistant. This is NOT financial advice.
    Summarize trends, fundamentals, sector standing, and risks for stock ${ticker}.

    QUOTE:
    ${JSON.stringify(quote, null, 2)}

    FUNDAMENTALS:
    ${JSON.stringify(fundamentals, null, 2)}

    Return ONLY JSON like:
    {
      "trend": "string",
      "sectorStanding": "string",
      "fundamentalsView": "string",
      "risks": "string",
      "score": 1-10
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = completion.choices[0].message.content.trim();
    let analysis = {};

    try {
      analysis = JSON.parse(raw);
    } catch {
      analysis = {
        fundamentalsView: raw,
        trend: "",
        sectorStanding: "",
        risks: "",
        score: null,
      };
    }

    res.json({ ticker, quote, fundamentals, analysis });
  } catch (err) {
    console.error("Error in /api/invest route:", err.message);
    res.status(500).json({ error: "Failed to analyze ticker" });
  }
});

// --------------------------------------------------
// NEWS ROUTE - POLYGON
// --------------------------------------------------
app.get("/api/news/:ticker", async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();

  try {
    const response = await axios.get(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=1&apiKey=${process.env.POLYGON_API_KEY}`
    );

    const article = response.data.results?.[0] ?? null;

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
    console.error("Polygon news error:", err.message);
    res.status(500).json({ error: "Failed to fetch ticker news" });
  }
});

// --------------------------------------------------
// GLOBAL MARKET NEWS
// --------------------------------------------------
app.get("/api/global-news", async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 2);

    const url = `https://api.polygon.io/v2/reference/news?published_utc.gte=${since.toISOString()}&limit=15&sort=published_utc&order=desc&apiKey=${process.env.POLYGON_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) return res.json({ results: [] });

    const englishOnly = data.results.filter((a) => {
      const t = `${a.title} ${a.description ?? ""}`;
      const englishRatio =
        (t.match(/[a-zA-Z]/g)?.length || 0) / t.length;
      return englishRatio > 0.7;
    });

    const cleaned = englishOnly.map((a) => ({
      title: a.title,
      url: a.article_url,
      source: a.publisher?.name || "Polygon",
      published: a.published_utc,
    }));

    res.json({ results: cleaned });
  } catch (err) {
    console.error("Global news error:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend running" });
});

// --------------------------------------------------
// STATIC FRONTEND (disabled during development)
// --------------------------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
  });
}

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});