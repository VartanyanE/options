import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const API_KEY = process.env.POLYGON_API_KEY;

app.use(cors());
app.use(express.json());

// ✅ Route to fetch latest stock price (works even when market closed)
app.get("/api/price/:ticker", async (req, res) => {
  const { ticker } = req.params;
  try {
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker.toUpperCase()}/prev?adjusted=true&apiKey=${API_KEY}`;
    const response = await axios.get(url);

    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const data = response.data.results[0];
      return res.json({
        ticker: ticker.toUpperCase(),
        close: data.c,
        high: data.h,
        low: data.l,
        volume: data.v,
        timestamp: data.t,
      });
    } else {
      return res.status(404).json({ error: "No price data found" });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: "Failed to fetch price" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
