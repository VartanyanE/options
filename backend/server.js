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

// === ROUTES === //
app.get("/api/price/:ticker", async (req, res) => {
  try {
    const ticker = req.params.ticker.toUpperCase();
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${API_KEY}`
    );
    const close = response.data.results?.[0]?.c || null;
    res.json({ ticker, close });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price data" });
  }
});

// === SERVE FRONTEND IN PRODUCTION === //
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  // ✅ Express 5 fix — use "/*" instead of "*"
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));