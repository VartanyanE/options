import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const StockAnalyzer = () => {
  const [ticker, setTicker] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const analyze = async () => {
    if (!ticker) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/invest/${ticker}`);
      if (!res.ok) throw new Error("Bad response");

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError("Unable to analyze this ticker.");
    }

    setLoading(false);
  };

  const quote = result?.quote;
  const fundamentals = result?.fundamentals;
  const analysis = result?.analysis;

  return (
    <div style={{ maxWidth: "480px", margin: "auto", padding: "20px" }}>
      <motion.button
        onClick={() => navigate("/")}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          background: "transparent",
          border: "1px solid #2e2e2e",
          color: "#EAEAEA",
          padding: "6px 10px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "14px",
        }}
      >
        ← Back to Options
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(145deg, #111111, #1b1b1b)",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #1f1f1f",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: "#EAEAEA" }}>📊 Stock Analyzer</h2>
        <p style={{ marginTop: "6px", color: "#999", fontSize: "0.85rem" }}>
          Enter a stock ticker to get a data-driven AI summary.
        </p>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "#1a1a1a",
              border: "1px solid #333",
              color: "white",
              outline: "none",
            }}
          />
          <button
            onClick={analyze}
            style={{
              padding: "10px 14px",
              background: "linear-gradient(90deg, #00D27A, #00A85F)",
              fontWeight: "600",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
            }}
          >
            {loading ? "Loading…" : "Analyze"}
          </button>
        </div>

        {error && <p style={{ color: "#ff4d4d" }}>{error}</p>}
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "linear-gradient(145deg, #141414, #1c1c1c)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #1f1f1f",
          }}
        >
          <h2 style={{ color: "#00FF88" }}>
            {quote.ticker} • {fundamentals.longName}
          </h2>

          {/* Quote */}
          <div style={{ marginTop: "10px" }}>
            <p>Price: ${quote.close}</p>
            <p>Change: {quote.percentChange?.toFixed(2)}%</p>
          </div>

          {/* Fundamentals */}
          <h3 style={{ color: "#ccc", marginTop: "20px" }}>Fundamentals</h3>
          <p>Sector: {fundamentals.sector}</p>
          <p>Industry: {fundamentals.industry}</p>
          <p>Market Cap: {formatNumber(fundamentals.marketCap)}</p>

          {/* Analysis */}
          <h3 style={{ color: "#ccc", marginTop: "20px" }}>AI Analysis</h3>
          <p><strong>Trend:</strong> {analysis.trend}</p>
          <p><strong>Sector Standing:</strong> {analysis.sectorStanding}</p>
          <p><strong>Fundamentals:</strong> {analysis.fundamentalsView}</p>
          <p><strong>Risks:</strong> {analysis.risks}</p>
          <p>
            <strong>Score:</strong>{" "}
            <span style={{ color: analysis.score >= 7 ? "#00FF88" : "#FF4D4D" }}>
              {analysis.score}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

function formatNumber(n) {
  if (!n) return "—";
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  return n.toLocaleString();
}

export default StockAnalyzer;