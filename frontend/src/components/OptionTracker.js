import React, { useState, useEffect } from "react";
import axios from "axios";
import OptionCard from "./OptionCard";
import { AnimatePresence, motion } from "framer-motion";

const OptionTracker = () => {
  const [options, setOptions] = useState(() => {
    try {
      const saved = localStorage.getItem("options");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    ticker: "",
    strike: "",
    breakeven: "",
    exp: "",
    premium: "",
  });

  useEffect(() => {
    localStorage.setItem("options", JSON.stringify(options));
  }, [options]);

  const fetchLivePrice = async (ticker) => {
    try {
      const res = await axios.get(`http://localhost:5050/api/price/${ticker}`);
      return res.data.close;
    } catch (err) {
      console.error("Price fetch error:", err.message);
      return null;
    }
  };

  const handleAdd = async () => {
    if (!form.ticker) return;

    const livePrice = await fetchLivePrice(form.ticker);
    const newOption = { ...form, livePrice };
    setOptions((prev) => [...prev, newOption]);
    setForm({ ticker: "", strike: "", breakeven: "", exp: "", premium: "" });
  };

  const handleDelete = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "480px",
        margin: "auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "linear-gradient(145deg, #111111, #1b1b1b)",
          padding: "24px",
          borderRadius: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          border: "1px solid #1f1f1f",
        }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            color: "#00D27A",
            textAlign: "center",
            marginBottom: "18px",
            fontSize: "1.6rem",
            fontWeight: "600",
            letterSpacing: "0.4px",
          }}
        >
          Cash Flow Strategist
        </motion.h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            style={inputStyle}
            placeholder="Ticker (e.g. AAPL)"
            value={form.ticker}
            onChange={(e) =>
              setForm({ ...form, ticker: e.target.value.toUpperCase() })
            }
          />
          <input
            style={inputStyle}
            placeholder="Strike Price"
            value={form.strike}
            onChange={(e) => setForm({ ...form, strike: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Breakeven"
            value={form.breakeven}
            onChange={(e) => setForm({ ...form, breakeven: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Exp Date (MM/DD)"
            value={form.exp}
            onChange={(e) => setForm({ ...form, exp: e.target.value })}
          />
          <input
            style={inputStyle}
            placeholder="Premium Collected"
            value={form.premium}
            onChange={(e) => setForm({ ...form, premium: e.target.value })}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            style={buttonStyle}
          >
            + Add Option
          </motion.button>
        </div>
      </motion.div>

      <motion.div layout>
        <AnimatePresence>
          {options.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                color: "#777",
                textAlign: "center",
                fontSize: "0.95rem",
                letterSpacing: "0.3px",
              }}
            >
              No options saved yet.
            </motion.p>
          )}
          {options.map((opt, idx) => (
            <OptionCard
              key={opt.ticker + idx}
              option={opt}
              onDelete={() => handleDelete(idx)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  fontSize: "16px",
  outline: "none",
  transition: "border 0.2s ease, background 0.2s ease",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(90deg, #00D27A, #00A85F)",
  color: "#000",
  fontWeight: "600",
  border: "none",
  borderRadius: "12px",
  marginTop: "8px",
  cursor: "pointer",
  fontSize: "16px",
  letterSpacing: "0.3px",
  boxShadow: "0 3px 10px rgba(0,255,136,0.2)",
};

export default OptionTracker;