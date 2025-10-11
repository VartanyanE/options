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

// === FETCH PRICE === //
app.get("/api/price/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev`,
      { params: { adjusted: true, apiKey: API_KEY } }
    );
    const close = response.data.results?.[0]?.c || null;
    res.json({ ticker, close });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price data" });
  }
});

// === FETCH LATEST NEWS (1 STORY) === //
app.get("/api/news/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const response = await axios.get("https://api.polygon.io/v2/reference/news", {
      params: { ticker, limit: 1, apiKey: API_KEY },
    });

    const article = response.data.results?.[0];
    if (!article) return res.status(404).json({ error: "No news found" });

    res.json({
      title: article.title,
      publisher: article.publisher?.name || "Unknown",
      url: article.article_url,
      image: article.image_url,
      published: article.published_utc,
    });
  } catch (err) {
    console.error("News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch news data" });
  }
});

// === GLOBAL MARKET TRACKER (Polygon + CoinGecko Hybrid, Stable) === //
app.get("/api/markets", async (req, res) => {
  try {
    const results = {};

    // ---- STOCK ETFs (Polygon) ----
    const stockTickers = ["SPY", "QQQ", "DIA"];
    for (const t of stockTickers) {
      const resp = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${t}/prev`,
        { params: { adjusted: true, apiKey: API_KEY } }
      );
      const data = resp.data.results?.[0];
      results[t] = data ? data.c : null;
    }

    // ---- CRYPTO (CoinGecko) ----
    const cryptoResp = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,ripple",
          vs_currencies: "usd",
        },
      }
    );
    results["BTC"] = cryptoResp.data.bitcoin.usd;
    results["ETH"] = cryptoResp.data.ethereum.usd;
    results["XRP"] = cryptoResp.data.ripple.usd;

    res.json(results);
  } catch (err) {
    console.error("Market tracker error:", err.message);
    res.status(500).json({ error: "Failed to fetch market data" });
  }
});

// === SERVE FRONTEND === //
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));