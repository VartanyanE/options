import React from "react";
import { motion } from "framer-motion";

const OptionCard = ({ option, onDelete }) => {
  const { ticker, strike, breakeven, exp, livePrice } = option;

  // Determine ITM or OTM status
  let status = "";
  let statusColor = "#999";

  if (livePrice && strike) {
    const strikeNum = parseFloat(strike);
    const liveNum = parseFloat(livePrice);

    // Since you’re selling puts by default, ITM means live < strike
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
        background: "linear-gradient(145deg, #141414, #1c1c1c)",
        color: "#EAEAEA",
        padding: "18px",
        borderRadius: "16px",
        marginBottom: "14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
        border: "1px solid #1f1f1f",
      }}
    >
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
        <span
          style={{
            fontSize: "0.9rem",
            color: "#aaa",
          }}
        >
          Exp: {exp}
        </span>
      </div>

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
              color:
                livePrice >= breakeven ? "#00FF88" : "#FF4D4D",
            }}
          >
            ${livePrice || "—"}
          </p>
        </div>
      </div>

      {/* ITM/OTM badge */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "center",
        }}
      >
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
          {status ? status : "—"}
        </span>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        style={{
          marginTop: "14px",
          width: "100%",
          background: "transparent",
          border: "1px solid #FF4D4D",
          color: "#FF4D4D",
          padding: "8px",
          borderRadius: "10px",
          fontWeight: "500",
          letterSpacing: "0.5px",
          cursor: "pointer",
        }}
      >
        Delete
      </motion.button>
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