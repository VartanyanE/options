import React, { useState } from "react";
import { motion } from "framer-motion";

const OptionCard = ({ option, onDelete, onEdit }) => {
  const { ticker, strike, breakeven, exp, premium, livePrice, article } = option;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    strike,
    breakeven,
    exp,
    premium,
  });

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

  const handleSave = () => {
    onEdit(editForm);
    setIsEditing(false);
  };

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
      {/* Action Buttons */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          gap: "8px",
        }}
      >
        {isEditing ? null : (
          <button
            onClick={() => setIsEditing(true)}
            style={iconBtnStyle("#FFC857")}
            title="Edit Option"
          >
            ✏️
          </button>
        )}
        <button
          onClick={onDelete}
          style={iconBtnStyle("#FF4D4D")}
          title="Delete Option"
        >
          ✖
        </button>
      </div>

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

      {isEditing ? (
        // === Edit Mode Form ===
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "10px",
          }}
        >
          <label style={labelStyle}>Strike</label>
          <input
            style={inputStyle}
            value={editForm.strike}
            onChange={(e) =>
              setEditForm({ ...editForm, strike: e.target.value })
            }
          />

          <label style={labelStyle}>Breakeven</label>
          <input
            style={inputStyle}
            value={editForm.breakeven}
            onChange={(e) =>
              setEditForm({ ...editForm, breakeven: e.target.value })
            }
          />

          <label style={labelStyle}>Exp Date</label>
          <input
            style={inputStyle}
            value={editForm.exp}
            onChange={(e) =>
              setEditForm({ ...editForm, exp: e.target.value })
            }
          />

          <label style={labelStyle}>Premium</label>
          <input
            style={inputStyle}
            value={editForm.premium}
            onChange={(e) =>
              setEditForm({ ...editForm, premium: e.target.value })
            }
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              style={saveBtnStyle("#00D27A")}
            >
              Save ✅
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsEditing(false)}
              style={saveBtnStyle("#555")}
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      ) : (
        // === Display Mode ===
        <>
          <p style={{ fontSize: "0.9rem", color: "#aaa" }}>Exp: {exp}</p>

          {/* --- Metrics Row (Now includes Premium) --- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            <div>
              <p style={infoText}>Strike</p>
              <p style={infoValue}>${strike}</p>
            </div>
            <div>
              <p style={infoText}>Breakeven</p>
              <p style={infoValue}>${breakeven}</p>
            </div>
            <div>
              <p style={infoText}>Premium</p>
              <p style={{ ...infoValue, color: "#FFC857" }}>
                ${premium || "—"}
              </p>
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
              <p
                style={{
                  color: "#999",
                  fontSize: "0.8rem",
                  marginBottom: "4px",
                }}
              >
                {article.source} •{" "}
                {new Date(article.published).toLocaleDateString()}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#FFC857",
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
        </>
      )}
    </motion.div>
  );
};

const iconBtnStyle = (color) => ({
  background: "transparent",
  color,
  border: "none",
  fontSize: "1rem",
  cursor: "pointer",
});

const labelStyle = {
  fontSize: "0.8rem",
  color: "#aaa",
};

const inputStyle = {
  padding: "8px 10px",
  borderRadius: "8px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  fontSize: "0.9rem",
  outline: "none",
};

const saveBtnStyle = (bg) => ({
  background: bg,
  border: "none",
  color: "#000",
  fontWeight: "600",
  borderRadius: "10px",
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: "0.9rem",
});

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