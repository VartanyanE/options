import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const OptionCard = ({ option, onDelete }) => {
  const { ticker, strike, breakeven, exp, livePrice } = option;
  const [news, setNews] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(`/api/news/${ticker}`);
        setNews(res.data);
      } catch (err) {
        console.error("News fetch error:", err.message);
      }
    };
    fetchNews();
  }, [ticker]);

  // ITM/OTM logic
  let status = "";
  let statusColor = "#999";
  if (livePrice && strike) {
    const strikeNum = parseFloat(strike);
    const liveNum = parseFloat(livePrice);
    if (liveNum < strikeNum) {
      status = "ITM";
      statusColor = "#FF4D4D";
    } else {
      status = "OTM";
      statusColor = "#00FF88";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      layout
      style={{
        position: "relative",
        background: "linear-gradient(145deg, #141414, #1c1c1c)",
        color: "#EAEAEA",
        padding: "18px",
        borderRadius: "16px",
        marginBottom: "14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        border: "1px solid #1f1f1f",
      }}
    >
      {/* ❌ Delete Icon */}
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          background: "transparent",
          border: "none",
          color: "#FF4D4D",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ×
      </button>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <h2
          style={{
            color: "#00FF88",
            fontSize: "1.2rem",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          {ticker}
        </h2>
        <span style={{ fontSize: "0.9rem", color: "#aaa" }}>Exp: {exp}</span>
      </div>

      {/* Option Data */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p style={infoText}>Strike</p>
          <p style={infoValue}>${strike}</p>
        </div>
        <div>
          <p style={infoText}>Breakeven</p>
          <p style={infoValue}>${breakeven}</p>
        </div>
        <div>
          <p style={infoText}>Live</p>
          <p
            style={{
              ...infoValue,
              color: livePrice >= breakeven ? "#00FF88" : "#FF4D4D",
            }}
          >
            ${livePrice || "—"}
          </p>
        </div>
      </div>

      {/* ITM/OTM Badge */}
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
        <span
          style={{
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${statusColor}`,
            color: statusColor,
            borderRadius: "8px",
            padding: "4px 10px",
            fontSize: "0.9rem",
            fontWeight: "500",
            letterSpacing: "0.4px",
          }}
        >
          {status || "—"}
        </span>
      </div>

      {/* 🗞️ Latest News */}
      {news && (
        <div style={{ marginTop: "16px", borderTop: "1px solid #222", paddingTop: "10px" }}>
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#40C4FF",
              textDecoration: "none",
              fontSize: "0.95rem",
              fontWeight: "600",
            }}
          >
            🗞️ {news.title}
          </a>
          <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "4px" }}>
            {news.publisher} — {new Date(news.published).toLocaleDateString()}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const infoText = {
  fontSize: "0.8rem",
  color: "#888",
  marginBottom: "4px",
};

const infoValue = {
  fontSize: "1rem",
  fontWeight: "500",
  color: "#EAEAEA",
};

export default OptionCard;