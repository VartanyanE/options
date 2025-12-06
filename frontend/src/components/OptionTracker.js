import React, { useState, useEffect } from "react";
import axios from "axios";
import OptionCard from "./OptionCard";
import StockPrice from "./StockPrice";
import NewsTicker from "./NewsTicker";
import MarketBar from "./MarketBar";
import API_BASE_URL from "../config";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OptionTracker = () => {
  const navigate = useNavigate();

  const [options, setOptions] = useState([]);
  const [ticker, setTicker] = useState("");
  const [strike, setStrike] = useState("");
  const [breakeven, setBreakeven] = useState("");
  const [exp, setExp] = useState("");
  const [premium, setPremium] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------------------
  // Load saved options from localStorage
  // ----------------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("options");
    if (saved) {
      setOptions(JSON.parse(saved));
    }
  }, []);

  // ----------------------------------------
  // Save options to localStorage
  // ----------------------------------------
  useEffect(() => {
    localStorage.setItem("options", JSON.stringify(options));
  }, [options]);

  // ----------------------------------------
  // Add new option card
  // ----------------------------------------
  const handleAddOption = (e) => {
    e.preventDefault();
    if (!ticker || !strike || !breakeven || !exp) return;

    const newOption = {
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      strike,
      breakeven,
      exp,
      premium: premium || "",
      livePrice: null,
      percentChange: null,
    };

    setOptions([newOption, ...options]);

    setTicker("");
    setStrike("");
    setBreakeven("");
    setExp("");
    setPremium("");
  };

  // ----------------------------------------
  // Delete option
  // ----------------------------------------
  const handleDelete = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  // ----------------------------------------
  // Edit option
  // ----------------------------------------
  const handleEdit = (id, newValues) => {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? {
              ...opt,
              strike: newValues.strike,
              breakeven: newValues.breakeven,
              exp: newValues.exp,
              premium: newValues.premium,
            }
          : opt
      )
    );
  };

  // ----------------------------------------
  // Refresh live prices for all tickers
  // ----------------------------------------
  const handleRefresh = async () => {
    if (options.length === 0) return;

    setLoading(true);

    try {
      const updatedOptions = await Promise.all(
        options.map(async (opt) => {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/api/price/${opt.ticker}`
            );
            return {
              ...opt,
              livePrice: res.data.close,
              percentChange: res.data.percentChange,
            };
          } catch {
            return { ...opt };
          }
        })
      );

      setOptions(updatedOptions);
    } catch (err) {
      console.error("Refresh error:", err);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: "480px",
        margin: "auto",
        padding: "18px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* MARKET BAR */}
      <MarketBar />

      {/* GLOBAL NEWS TICKER */}
      <NewsTicker />

      {/* -----------------------------------------
          HEADER SECTION (with Stock Analyzer button)
      ------------------------------------------ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleRefresh}
        style={{
          background:
            "linear-gradient(90deg, rgba(0,210,122,0.1), rgba(0,168,95,0.15))",
          border: "1px solid rgba(0,210,122,0.4)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 0 18px rgba(0,255,136,0.08)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/icon-512.png"
            alt="Cash Flow Strategist Icon"
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0 0 10px rgba(0,255,136,0.4)",
            }}
          />
          <div>
            <h2
              style={{
                margin: 0,
                color: "#EAEAEA",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              💼 Cash Flow Strategist
            </h2>
            <p style={{ margin: 0, color: "#8f8f8f", fontSize: "0.8rem" }}>
              Weekly Options • Steady Income
            </p>
          </div>
        </div>

        {/* Navigate to Stock Analyzer */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate("/analyzer");
          }}
          style={{
            padding: "8px 10px",
            background: "transparent",
            borderRadius: "10px",
            border: "1px solid rgba(0,210,122,0.5)",
            color: "#00D27A",
            fontSize: "0.8rem",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📊 Stock Analyzer
        </button>
      </motion.div>

      {/* -----------------------------------------
          ADD OPTION FORM
      ------------------------------------------ */}
      <form
        onSubmit={handleAddOption}
        style={{
          background: "#111",
          border: "1px solid #1f1f1f",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: "12px",
            color: "#EAEAEA",
            fontSize: "1rem",
          }}
        >
          ➕ Add Option
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Ticker (AAPL)"
            style={inputStyle}
          />
          <input
            value={strike}
            onChange={(e) => setStrike(e.target.value)}
            placeholder="Strike"
            style={inputStyle}
          />
          <input
            value={breakeven}
            onChange={(e) => setBreakeven(e.target.value)}
            placeholder="Breakeven"
            style={inputStyle}
          />
          <input
            value={exp}
            onChange={(e) => setExp(e.target.value)}
            placeholder="Expiration (YYYY-MM-DD)"
            style={inputStyle}
          />
          <input
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
            placeholder="Premium (optional)"
            style={inputStyle}
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            style={{
              padding: "10px 14px",
              background: "linear-gradient(90deg, #00D27A, #00A85F)",
              color: "#000",
              fontWeight: "600",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Add Option
          </motion.button>
        </div>
      </form>

      {/* -----------------------------------------
          OPTIONS LIST
      ------------------------------------------ */}
      {loading && (
        <p style={{ color: "#00D27A", textAlign: "center" }}>
          Refreshing prices…
        </p>
      )}

      <AnimatePresence>
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            onDelete={() => handleDelete(opt.id)}
            onEdit={(newVals) => handleEdit(opt.id, newVals)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// -----------------------------------------
// STYLES
// -----------------------------------------
const inputStyle = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  fontSize: "0.9rem",
  outline: "none",
};

export default OptionTracker;