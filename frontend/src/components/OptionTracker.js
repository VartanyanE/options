import React, { useState, useEffect } from "react";
import OptionCard from "./OptionCard";
import API_BASE_URL from "../config";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const OptionTracker = () => {
  const navigate = useNavigate();

  const [ticker, setTicker] = useState("");
  const [expiration, setExpiration] = useState("");
  const [strike, setStrike] = useState("");
  const [premium, setPremium] = useState("");
  const [breakeven, setBreakeven] = useState("");
  const [contracts, setContracts] = useState("");
  const [positions, setPositions] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("optionPositions");
    if (saved) setPositions(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("optionPositions", JSON.stringify(positions));
  }, [positions]);

  const addPosition = () => {
    if (!ticker || !expiration || !strike || !premium || !breakeven || !contracts)
      return;

    const newPosition = {
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      expiration,
      strike,
      premium,
      breakeven,
      contracts,
    };

    setPositions([newPosition, ...positions]);

    setTicker("");
    setExpiration("");
    setStrike("");
    setPremium("");
    setBreakeven("");
    setContracts("");
  };

  const deletePosition = (id) => {
    setPositions(positions.filter((pos) => pos.id !== id));
  };

  return (
    <div className="option-tracker-container" style={{ padding: "16px" }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileTap={{ scale: 0.97 }}
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div>
            <h2
              style={{
                margin: 0,
                color: "#EAEAEA",
                fontSize: "1.1rem",
                fontWeight: "600",
              }}
            >
              💼 Option Tracker
            </h2>
            <p
              style={{
                margin: 0,
                color: "#8f8f8f",
                fontSize: "0.8rem",
              }}
            >
              Weekly Options • Steady Income
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          {/* Analyzer Button */}
          <button
            onClick={() => navigate("/analyzer")}
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
            📊 Analyzer
          </button>

          {/* ⭐ NEW Wealth Tracker Button ⭐ */}
          <button
            onClick={() => navigate("/wealth")}
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
            💰 Wealth
          </button>
        </div>
      </motion.div>

      {/* INPUT CARD */}
      <div
        className="input-card"
        style={{
          background: "#111",
          border: "1px solid #1f1f1f",
          borderRadius: "14px",
          padding: "14px",
          marginBottom: "18px",
        }}
      >
        <h3 style={{ marginTop: 0, color: "#EAEAEA" }}>Add Position</h3>

        <div className="inputs" style={{ display: "grid", gap: "8px" }}>
          <input
            type="text"
            placeholder="Ticker (TSLA)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Strike"
            value={strike}
            onChange={(e) => setStrike(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Premium"
            value={premium}
            onChange={(e) => setPremium(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Breakeven Price"
            value={breakeven}
            onChange={(e) => setBreakeven(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="# Contracts"
            value={contracts}
            onChange={(e) => setContracts(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          onClick={addPosition}
          style={{
            marginTop: "8px",
            padding: "10px",
            background: "transparent",
            borderRadius: "10px",
            border: "1px solid rgba(0,210,122,0.5)",
            color: "#00D27A",
            fontSize: "0.9rem",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Add Position
        </button>
      </div>

      {/* POSITION CARDS */}
      <div className="positions-list">
        {positions.map((pos) => (
          <OptionCard key={pos.id} data={pos} onDelete={deletePosition} />
        ))}
      </div>
    </div>
  );
};

/* ===== INPUT STYLE ===== */
const inputStyle = {
  padding: "10px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #2e2e2e",
  borderRadius: "10px",
  color: "#EAEAEA",
  fontSize: "0.9rem",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
};

export default OptionTracker;