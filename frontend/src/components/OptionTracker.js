import React, { useState, useEffect } from "react";
import axios from "axios";
import OptionCard from "./OptionCard";
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
  const [contracts, setContracts] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Load / Save ---------- */
  useEffect(() => {
    const saved = localStorage.getItem("options");
    if (saved) setOptions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("options", JSON.stringify(options));
  }, [options]);

  /* ---------- Actions ---------- */
  const handleAddOption = (e) => {
    e.preventDefault();
    if (!ticker || !strike || !breakeven || !exp || !contracts) return;

    const newOption = {
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      strike,
      breakeven,
      exp,
      premium: premium || "",
      contracts,
      livePrice: null,
      percentChange: null,
    };

    setOptions([newOption, ...options]);

    setTicker("");
    setStrike("");
    setBreakeven("");
    setExp("");
    setPremium("");
    setContracts("");
  };

  const handleDelete = (id) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

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
              contracts: newValues.contracts ?? opt.contracts,
            }
          : opt
      )
    );
  };

  const handleRefresh = async () => {
    if (options.length === 0) return;
    setLoading(true);

    const updated = await Promise.all(
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
          return opt;
        }
      })
    );

    setOptions(updated);
    setLoading(false);
  };

  return (
    <div style={page}>
      {/* ===== TOP NAV ===== */}{" "}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleRefresh}
        style={headerCard}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src="/icon-512.png" alt="Option Tracker Icon" style={icon} />
          <div>
            <h2 style={title}>Option Tracker</h2>
            <p style={subtitle}>Weekly Options • Steady Income</p>
          </div>
        </div>
      </motion.div>
      <motion.div style={navBar}>
        <NavButton label="📰 News" onClick={() => navigate("/")} />
        <NavButton label="📈 Options" active />
        {/* <NavButton label="📊 Analyzer" onClick={() => navigate("/analyzer")} /> */}
        <NavButton label="💰 Wealth" onClick={() => navigate("/wealth")} />
        <NavButton
          label="💸 Dividends"
          onClick={() => navigate("/dividends")}
        />
      </motion.div>
      {/* ===== HEADER ===== */}
      {/* ===== ADD OPTION ===== */}
      <form onSubmit={handleAddOption} style={card}>
        <h3 style={sectionTitle}>➕ Add Option</h3>

        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Ticker"
          style={input}
        />
        <input
          value={strike}
          onChange={(e) => setStrike(e.target.value)}
          placeholder="Strike"
          style={input}
        />
        <input
          value={breakeven}
          onChange={(e) => setBreakeven(e.target.value)}
          placeholder="Breakeven"
          style={input}
        />
        <input
          value={exp}
          onChange={(e) => setExp(e.target.value)}
          placeholder="Expiration"
          style={input}
        />
        <input
          value={premium}
          onChange={(e) => setPremium(e.target.value)}
          placeholder="Premium (optional)"
          style={input}
        />
        <input
          value={contracts}
          onChange={(e) => setContracts(e.target.value)}
          placeholder="# Contracts"
          style={input}
        />

        <button style={primaryBtn}>Add Option</button>
      </form>
      {loading && (
        <p style={{ color: "#00D27A", textAlign: "center" }}>
          Refreshing prices…
        </p>
      )}
      {/* ===== OPTIONS LIST ===== */}
      <AnimatePresence>
        {options.map((opt) => (
          <OptionCard
            key={opt.id}
            option={opt}
            onDelete={() => handleDelete(opt.id)}
            onEdit={(vals) => handleEdit(opt.id, vals)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ===== SMALL COMPONENTS ===== */
const NavButton = ({ label, onClick, active }) => (
  <button
    onClick={onClick}
    style={{
      ...navBtn,
      borderColor: active ? "#00D27A" : "rgba(0,210,122,0.3)",
      color: active ? "#00D27A" : "#B5B5B5",
    }}
  >
    {label}
  </button>
);

/* ===== STYLES ===== */
const page = { maxWidth: "520px", margin: "auto", padding: "18px" };

const navBar = {
  display: "flex",
  gap: "8px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const navBtn = {
  padding: "8px 10px",
  background: "transparent",
  borderRadius: "10px",
  border: "1px solid rgba(0,210,122,0.5)",
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
};

const headerCard = {
  background:
    "linear-gradient(90deg, rgba(0,210,122,0.1), rgba(0,168,95,0.15))",
  border: "1px solid rgba(0,210,122,0.4)",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "22px",
  boxShadow: "0 0 18px rgba(0,255,136,0.08)",
};

const icon = {
  width: "42px",
  height: "42px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,255,136,0.4)",
};

const title = {
  margin: 0,
  color: "#EAEAEA",
  fontSize: "1.1rem",
  fontWeight: "600",
};

const subtitle = {
  margin: 0,
  color: "#8f8f8f",
  fontSize: "0.8rem",
};

const card = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "20px",
};

const sectionTitle = { marginTop: 0, color: "#EAEAEA", fontSize: "1rem" };

const input = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  width: "100%",
  marginBottom: "8px",
  boxSizing: "border-box",
};

const primaryBtn = {
  width: "100%",
  padding: "10px",
  background: "linear-gradient(90deg, #00D27A, #00A85F)",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};

export default OptionTracker;
