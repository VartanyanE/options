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

  const [showForm, setShowForm] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const fetchNews = async (ticker) => {
    try {
      const res = await axios.get(`/api/news/${ticker}`);
      return res.data.article;
    } catch (err) {
      console.error("News fetch error:", err.message);
      return null;
    }
  };

  const handleAdd = async () => {
    if (!form.ticker) return;

    const [livePrice, article] = await Promise.all([
      fetchLivePrice(form.ticker),
      fetchNews(form.ticker),
    ]);

    const newOption = { ...form, livePrice, article };
    setOptions((prev) => [...prev, newOption]);
    setForm({ ticker: "", strike: "", breakeven: "", exp: "", premium: "" });
    setShowForm(false);
  };

  const handleDelete = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRefresh = async () => {
    if (!options.length) return;
    const refreshed = await Promise.all(
      options.map(async (opt) => {
        try {
          const livePrice = await fetchLivePrice(opt.ticker);
          const article = await fetchNews(opt.ticker);
          return { ...opt, livePrice, article };
        } catch {
          return opt;
        }
      })
    );
    setOptions(refreshed);

    // ✨ Toast feedback
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
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
      {/* === BRAND IDENTITY STRIP WITH REFRESH === */}
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
          transition: "opacity 0.3s ease",
        }}
        id="brandHeader"
        title="Tap to Refresh Prices & News"
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
                letterSpacing: "0.4px",
              }}
            >
              💼 Cash Flow Strategist
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#8f8f8f",
                letterSpacing: "0.3px",
              }}
            >
              Weekly Options • Steady Income
            </p>
          </div>
        </div>
      </motion.div>

      {/* === COLLAPSIBLE ADD OPTION === */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: "linear-gradient(145deg, #111111, #1b1b1b)",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          border: "1px solid #1f1f1f",
          marginBottom: "20px",
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(90deg, #00D27A, #00A85F)",
            color: "#000",
            fontWeight: "600",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {showForm ? "– Hide Add Option" : "+ Add New Option"}
        </motion.button>

        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
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
              Save Option
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* === OPTION CARDS === */}
      <AnimatePresence>
        {options.map((opt, idx) => (
          <OptionCard
            key={opt.ticker + idx}
            option={opt}
            onDelete={() => handleDelete(idx)}
          />
        ))}
      </AnimatePresence>

      {/* === REFRESH TOAST === */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#00D27A",
              color: "#000",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: "600",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              zIndex: 999,
            }}
          >
            Prices Refreshed ✅
          </motion.div>
        )}
      </AnimatePresence>
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
};

export default OptionTracker;