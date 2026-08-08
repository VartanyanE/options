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

  const safeNumber = (val) => {
    const n = Number(val);
    if (Number.isNaN(n) || n === 0) return "—";
    return n.toLocaleString();
  };

  const safePercent = (val) => {
    const n = Number(val);
    if (Number.isNaN(n)) return "—";
    return n.toFixed(2) + "%";
  };

  const analyze = async () => {
    if (!ticker) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ✅ FIXED ROUTE
      const res = await fetch(
        `${API_BASE_URL}/api/price/${ticker.toUpperCase()}`
      );

      if (!res.ok) throw new Error("Bad response from server");

      const data = await res.json();

      setResult({
        ticker: data.ticker,
        price: data.close,
        percentChange: data.percentChange,
        open: data.open,
        high: data.high,
        low: data.low,
        previousClose: data.previousClose,

        // These may be missing depending on data source
        marketCap: data.marketCap ?? null,
        pe: data.trailingPE ?? null,
        dividendYield: data.dividendYield ?? null,
      });
    } catch (err) {
      console.error("Analyze error:", err);
      setError("Unable to analyze this ticker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Back */}
      {/* Top Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <button style={navBtn} onClick={() => navigate("/")}>
          📊 Profit Factor
        </button>

        <button style={navBtn} onClick={() => navigate("/options")}>
          📈 Options
        </button>

        <button style={{ ...navBtn, borderColor: "#00D27A", color: "#00D27A" }}>
          📊 Analyzer
        </button>

        <button style={navBtn} onClick={() => navigate("/wealth")}>
          💰 Wealth
        </button>

        <button style={navBtn} onClick={() => navigate("/dividends")}>
          💸 Dividends
        </button>
      </div>

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
        <h2 style={{ margin: 0, color: "#EAEAEA", fontSize: "1.1rem" }}>
          📊 Stock Analyzer
        </h2>

        <p style={{ marginTop: "6px", color: "#999", fontSize: "0.85rem" }}>
          Quick snapshot of price and fundamentals. Not financial advice.
        </p>

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={inputStyle}
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={analyze}
            style={analyzeBtn}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </motion.button>
        </div>

        {error && (
          <p style={{ marginTop: "8px", color: "#FF4D4D", fontSize: "0.8rem" }}>
            {error}
          </p>
        )}
      </motion.div>

      {/* Results */}
      {result && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "linear-gradient(145deg, #141414, #1c1c1c)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #2a2a2a",
            color: "#EAEAEA",
          }}
        >
          <h2 style={{ color: "#00D27A", marginBottom: "10px" }}>
            {result.ticker}
          </h2>

          <p>
            Price: <span style={valueStyle}>${result.price}</span>
          </p>
          <p>
            Change:{" "}
            <span style={valueStyle}>{safePercent(result.percentChange)}</span>
          </p>

          <h3 style={{ marginTop: "20px" }}>Fundamentals</h3>

          <p>
            Market Cap:{" "}
            <span style={valueStyle}>
              {result.marketCap ? safeNumber(result.marketCap) : "—"}
            </span>
          </p>

          <p>
            P/E Ratio:{" "}
            <span style={valueStyle}>
              {result.pe != null ? result.pe : "—"}
            </span>
          </p>

          <p>
            Dividend Yield:{" "}
            <span style={valueStyle}>
              {result.dividendYield != null
                ? safePercent(result.dividendYield * 100)
                : "—"}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

/* ===== Styles ===== */

const inputStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const analyzeBtn = {
  padding: "10px 14px",
  background: "linear-gradient(90deg, #00D27A, #00A85F)",
  color: "#000",
  fontWeight: "600",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const valueStyle = {
  color: "#F5C542",
  fontWeight: "600",
};
const navBtn = {
  padding: "6px 10px",
  background: "transparent",
  borderRadius: "10px",
  border: "1px solid rgba(0,210,122,0.5)",
  color: "#B5B5B5",
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
};

export default StockAnalyzer;
