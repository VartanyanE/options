import React, { useState, useEffect } from "react";
import axios from "axios";
import OptionCard from "./OptionCard";
import { AnimatePresence, motion } from "framer-motion";
import MarketBar from "./MarketBar";

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

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("options", JSON.stringify(options));
  }, [options]);

  const fetchLivePrice = async (ticker) => {
    try {
      const res = await axios.get(`/api/price/${ticker}`);
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
    setShowForm(false);
  };

  const handleDelete = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <MarketBar />

      <div
        style={{
          padding: "20px",
          maxWidth: "480px",
          margin: "auto",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm((prev) => !prev)}
          style={{
            width: "100%",
            padding: "14px",
            background: showForm
              ? "linear-gradient(90deg, #FF4D4D, #A83232)"
              : "linear-gradient(90deg, #00D27A, #00A85F)",
            color: "#000",
            fontWeight: "600",
            border: "none",
            borderRadius: "12px",
            marginBottom: "18px",
            cursor: "pointer",
            fontSize: "16px",
            letterSpacing: "0.3px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
          }}
        >
          {showForm ? "Close" : "+ Add New Option"}
        </motion.button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                overflow: "hidden",
                background: "linear-gradient(145deg, #111111, #1b1b1b)",
                padding: "20px",
                borderRadius: "18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                border: "1px solid #1f1f1f",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
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
                  onChange={(e) =>
                    setForm({ ...form, breakeven: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, premium: e.target.value })
                  }
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  style={submitButton}
                >
                  Save Option
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout style={{ marginTop: "10px" }}>
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
                  marginTop: "10px",
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
    </>
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

const submitButton = {
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