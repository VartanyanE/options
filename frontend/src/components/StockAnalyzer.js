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

  const formatNumber = (num) => {
    const n = Number(num);
    if (!n || Number.isNaN(n)) return "—";
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
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
      const res = await fetch(
        `${API_BASE_URL}/api/invest/${ticker.toUpperCase()}`
      );
      if (!res.ok) throw new Error("Bad response from server");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Analyze error:", err);
      setError("Unable to analyze this ticker. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quote = result?.quote || {};
  const fundamentals = result?.fundamentals || {};
  const analysis = result?.analysis || {};

  // compute dividend yield percent safely
  const dividendYieldPct =
    typeof fundamentals.dividendYield === "number"
      ? (fundamentals.dividendYield * 100).toFixed(2) + "%"
      : "—";

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Back to Option Tracker */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/")}
        style={{
          background: "transparent",
          border: "1px solid #2e2e2e",
          color: "#EAEAEA",
          padding: "6px 10px",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "14px",
          fontSize: "0.85rem",
        }}
      >
        ← Back to Options
      </motion.button>

      {/* Header card */}
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
        <h2
          style={{
            margin: 0,
            color: "#EAEAEA",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          📊 Stock Analyzer
        </h2>
        <p
          style={{
            marginTop: "6px",
            color: "#999",
            fontSize: "0.85rem",
          }}
        >
          Enter a stock ticker to get a quick AI-powered summary of trend,
          fundamentals, and key risks. Not financial advice.
        </p>

        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
          }}
        >
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="AAPL"
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #2e2e2e",
              backgroundColor: "#1a1a1a",
              color: "#EAEAEA",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={analyze}
            style={{
              padding: "10px 14px",
              background: "linear-gradient(90deg, #00D27A, #00A85F)",
              color: "#000",
              fontWeight: "600",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {loading ? "Analyzing…" : "Analyze"}
          </motion.button>
        </div>

        {error && (
          <p
            style={{
              marginTop: "8px",
              color: "#FF4D4D",
              fontSize: "0.8rem",
            }}
          >
            {error}
          </p>
        )}
      </motion.div>

      {/* Result card */}
      {result && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: "linear-gradient(145deg, #141414, #1c1c1c)",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #2a2a2a",
            color: "#EAEAEA",
          }}
        >
          <h2
            style={{
              color: "#00D27A",
              marginBottom: "10px",
              fontSize: "1.2rem",
            }}
          >
            {quote.ticker}{" "}
            {fundamentals.longName && `• ${fundamentals.longName}`}
          </h2>

          {/* Quote block */}
          <div style={{ marginTop: "10px" }}>
            <p>
              Price:{" "}
              <span style={{ color: "#F5C542" }}>
                {quote.close != null ? `$${quote.close}` : "—"}
              </span>
            </p>
            <p>
              Change:{" "}
              <span style={{ color: "#F5C542" }}>
                {quote.percentChange != null
                  ? safePercent(quote.percentChange)
                  : "—"}
              </span>
            </p>
          </div>

          {/* Fundamentals */}
          <h3 style={{ color: "#EAEAEA", marginTop: "20px" }}>
            Fundamentals
          </h3>

          <p>
            Market Cap:{" "}
            <span style={{ color: "#F5C542" }}>
              {formatNumber(fundamentals.marketCap)}
            </span>
          </p>

          <p>
            P/E Ratio:{" "}
            <span style={{ color: "#F5C542" }}>
              {fundamentals.trailingPE != null
                ? fundamentals.trailingPE
                : "—"}
            </span>
          </p>

          <p>
            Dividend Yield:{" "}
            <span style={{ color: "#F5C542" }}>{dividendYieldPct}</span>
          </p>

          {/* AI Analysis */}
          <h3 style={{ color: "#EAEAEA", marginTop: "20px" }}>AI Analysis</h3>

          <p>
            <strong style={{ color: "#EAEAEA" }}>Trend:</strong>{" "}
            <span style={{ color: "#F5C542" }}>
              {analysis.trend || "—"}
            </span>
          </p>

          <p>
            <strong style={{ color: "#EAEAEA" }}>Fundamentals:</strong>{" "}
            <span style={{ color: "#F5C542" }}>
              {analysis.fundamentalsView || "—"}
            </span>
          </p>

          <p>
            <strong style={{ color: "#EAEAEA" }}>Risks:</strong>{" "}
            <span style={{ color: "#F5C542" }}>
              {analysis.risks || "—"}
            </span>
          </p>

          <p style={{ marginTop: "10px" }}>
            <strong style={{ color: "#EAEAEA" }}>Score:</strong>{" "}
            <span
              style={{
                color:
                  Number(analysis.score) >= 7
                    ? "#00FF88"
                    : Number(analysis.score) >= 4
                    ? "#FFD95C"
                    : "#FF4D4D",
                fontWeight: "700",
              }}
            >
              {analysis.score != null ? analysis.score : "—"}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StockAnalyzer;