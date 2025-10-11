import React from "react";
import { motion } from "framer-motion";

const OptionCard = ({ option, onDelete }) => {
  const { ticker, strike, breakeven, exp, premium, livePrice, article } = option;

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
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "linear-gradient(145deg, #141414, #1c1c1c)",
        color: "#EAEAEA",
        padding: "18px",
        borderRadius: "16px",
        marginBottom: "14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        border: "1px solid #1f1f1f",
        position: "relative",
      }}
    >
      {/* Delete X */}
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "transparent",
          color: "#FF4D4D",
          border: "none",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        ✖
      </button>

      <h2
        style={{
          color: "#00FF88",
          fontSize: "1.2rem",
          fontWeight: "600",
          marginBottom: "8px",
        }}
      >
        {ticker}
      </h2>

      <p style={{ fontSize: "0.9rem", color: "#aaa" }}>Exp: {exp}</p>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
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
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <span
          style={{
            border: `1px solid ${statusColor}`,
            color: statusColor,
            borderRadius: "8px",
            padding: "3px 10px",
            fontSize: "0.9rem",
          }}
        >
          {status || "—"}
        </span>
      </div>

      {/* News Section */}
      {article && (
        <div
          style={{
            marginTop: "14px",
            borderTop: "1px solid #2e2e2e",
            paddingTop: "10px",
          }}
        >
          <p style={{ color: "#999", fontSize: "0.8rem", marginBottom: "4px" }}>
            {article.source} • {new Date(article.published).toLocaleDateString()}
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#FFC857", // warm gold tone
              fontSize: "0.9rem",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            
            {article.title}
          </a>
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