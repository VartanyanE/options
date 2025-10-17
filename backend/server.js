import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
const allowedOrigins = [
  "http://localhost:3000", // local dev
  "https://cash-flow-strategist.onrender.com" // your live frontend
];

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.options("*", cors());

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// === CRYPTO MARKET BAR (BTC, ETH, XRP via FreeCryptoAPI) === //
app.get("/api/crypto/marketbar", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.freecryptoapi.com/v1/cryptos/prices?ids=bitcoin,ethereum,ripple&vs_currencies=usd",
      {
        headers: { "X-API-KEY": process.env.FREE_CRYPTO_API_KEY },
      }
    );

    const results = response.data || {};

    const data = [
      {
        name: "BTC",
        price: results.bitcoin?.usd || 0,
        change: results.bitcoin?.usd_24h_change?.toFixed(2) || 0,
      },
      {
        name: "ETH",
        price: results.ethereum?.usd || 0,
        change: results.ethereum?.usd_24h_change?.toFixed(2) || 0,
      },
      {
        name: "XRP",
        price: results.ripple?.usd || 0,
        change: results.ripple?.usd_24h_change?.toFixed(2) || 0,
      },
    ];

    res.json(data);
  } catch (err) {
    console.error("Error fetching crypto data (FreeCryptoAPI):", err.message);
    res.status(500).json({ error: "Failed to fetch crypto data" });
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
app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.polygon.io/v2/reference/news?limit=10&apiKey=${process.env.POLYGON_API_KEY}`
    );
    const articles = response.data.results || [];
    const headlines = articles.map((a) => ({
      title: a.title,
      url: a.article_url,
    }));
    res.json(headlines);
  } catch (err) {
    console.error("Error fetching Polygon news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
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