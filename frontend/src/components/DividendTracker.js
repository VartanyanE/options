import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const DividendTracker = () => {
  const navigate = useNavigate();

  const [holdings, setHoldings] = useState([]);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [distribution, setDistribution] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [nextPayout, setNextPayout] = useState("");

  /* ================= LOAD / SAVE ================= */
  useEffect(() => {
    const saved = localStorage.getItem("dividendHoldings");
    if (saved) setHoldings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("dividendHoldings", JSON.stringify(holdings));
  }, [holdings]);

  /* ================= HELPERS ================= */
  const freqMap = { weekly: 52, monthly: 12, quarterly: 4 };

  const addInterval = (date, freq) => {
    const d = new Date(date);
    if (freq === "weekly") d.setDate(d.getDate() + 7);
    if (freq === "monthly") d.setMonth(d.getMonth() + 1);
    if (freq === "quarterly") d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  };

  const formatMoney = (v) =>
    Number(v || 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  /* ================= ACTIONS ================= */
  const addHolding = async () => {
    if (!ticker || !shares || !distribution || !nextPayout) return;

    let price = 0;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/price/${ticker.toUpperCase()}`
      );
      const data = await res.json();
      price = data.close;
    } catch {}

    const newHolding = {
      id: Date.now(),
      ticker: ticker.toUpperCase(),
      shares: Number(shares),
      distribution: Number(distribution),
      frequency,
      nextPayout,
      price,
      editing: false,
    };

    setHoldings([newHolding, ...holdings]);

    setTicker("");
    setShares("");
    setDistribution("");
    setFrequency("monthly");
    setNextPayout("");
  };

  const deleteHolding = (id) => {
    setHoldings(holdings.filter((h) => h.id !== id));
  };

  const toggleEdit = (id, on) => {
    setHoldings(holdings.map((h) => (h.id === id ? { ...h, editing: on } : h)));
  };

  const updateHolding = (id, field, value) => {
    setHoldings(
      holdings.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  };

  return (
    <div style={page}>
      {/* BACK */}
      {/* Top Navigation */}{" "}
      <motion.div style={headerCard}>
        <div>
          <h2 style={{ margin: 0, color: "#EAEAEA" }}>💸 Dividend Tracker</h2>
          <p style={{ margin: 0, color: "#8f8f8f", fontSize: "0.8rem" }}>
            Track dividend income & payout schedules
          </p>
        </div>
      </motion.div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <button style={navBtn} onClick={() => navigate("/")}>
          📰 News
        </button>

        <button style={navBtn} onClick={() => navigate("/options")}>
          📈 Options
        </button>

        <button style={navBtn} onClick={() => navigate("/wealth")}>
          💰 Wealth
        </button>

        <button style={{ ...navBtn, borderColor: "#00D27A", color: "#00D27A" }}>
          💸 Dividends
        </button>
      </div>
      {/* HEADER */}
      {/* ADD FORM */}
      <div style={card}>
        <h3 style={sectionTitle}>Add Dividend Holding</h3>

        <input
          style={input}
          placeholder="Ticker (SCHD)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
        <input
          style={input}
          placeholder="Shares Held"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
        />
        <input
          style={input}
          placeholder="Distribution Per Share"
          value={distribution}
          onChange={(e) => setDistribution(e.target.value)}
        />

        <select
          style={input}
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>

        <input
          style={input}
          type="date"
          value={nextPayout}
          onChange={(e) => setNextPayout(e.target.value)}
        />

        <button style={primaryBtn} onClick={addHolding}>
          Add Holding
        </button>
      </div>
      {/* HOLDINGS */}
      <AnimatePresence>
        {holdings.map((h) => {
          const payout = h.shares * h.distribution;
          const annual = payout * freqMap[h.frequency];
          const assetValue = h.shares * h.price;

          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={card}
            >
              {/* HEADER ROW */}
              <div style={rowBetween}>
                <h3 style={{ margin: 0, color: "#00D27A" }}>{h.ticker}</h3>

                <div style={{ display: "flex", gap: "6px" }}>
                  {!h.editing ? (
                    <>
                      <button
                        style={editBtn}
                        onClick={() => toggleEdit(h.id, true)}
                      >
                        ✏️
                      </button>
                      <button
                        style={deleteBtn}
                        onClick={() => deleteHolding(h.id)}
                      >
                        ✖
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={saveBtn}
                        onClick={() => toggleEdit(h.id, false)}
                      >
                        Save
                      </button>
                      <button
                        style={cancelBtn}
                        onClick={() => toggleEdit(h.id, false)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* BODY */}
              {!h.editing ? (
                <>
                  <Row label="Shares" value={h.shares} />
                  <Row label="Price" value={formatMoney(h.price)} />
                  <Row label="Asset Value" value={formatMoney(assetValue)} />
                  <Row
                    label={`Payout (${h.frequency})`}
                    value={formatMoney(payout)}
                  />
                  <Row label="Annual Income" value={formatMoney(annual)} />

                  <p style={dateText}>
                    Next Payout: <span style={gold}>{h.nextPayout}</span>
                  </p>
                  <p style={dateText}>
                    Following:{" "}
                    <span style={gold}>
                      {addInterval(h.nextPayout, h.frequency)}
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <input
                    style={input}
                    value={h.shares}
                    onChange={(e) =>
                      updateHolding(h.id, "shares", Number(e.target.value))
                    }
                  />
                  <input
                    style={input}
                    value={h.distribution}
                    onChange={(e) =>
                      updateHolding(
                        h.id,
                        "distribution",
                        Number(e.target.value)
                      )
                    }
                  />

                  <select
                    style={input}
                    value={h.frequency}
                    onChange={(e) =>
                      updateHolding(h.id, "frequency", e.target.value)
                    }
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>

                  <input
                    style={input}
                    type="date"
                    value={h.nextPayout}
                    onChange={(e) =>
                      updateHolding(h.id, "nextPayout", e.target.value)
                    }
                  />
                </>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/* ================= STYLES ================= */
const page = { maxWidth: "520px", margin: "auto", padding: "18px" };
const headerCard = {
  background:
    "linear-gradient(90deg, rgba(0,210,122,0.1), rgba(0,168,95,0.15))",
  border: "1px solid rgba(0,210,122,0.4)",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "18px",
};
const card = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "14px",
};
const sectionTitle = { marginTop: 0, color: "#EAEAEA", fontSize: "1rem" };
const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "8px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  background: "#1a1a1a",
  color: "#EAEAEA",
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
const backBtn = {
  background: "transparent",
  border: "1px solid #2e2e2e",
  color: "#EAEAEA",
  padding: "6px 10px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "14px",
  fontSize: "0.85rem",
};
const rowBetween = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const editBtn = {
  background: "transparent",
  border: "1px solid #444",
  color: "#EAEAEA",
  borderRadius: "6px",
  cursor: "pointer",
  padding: "4px 6px",
};
const deleteBtn = {
  background: "transparent",
  border: "1px solid #444",
  color: "#FF6B6B",
  borderRadius: "6px",
  cursor: "pointer",
  padding: "4px 6px",
};
const saveBtn = {
  background: "transparent",
  border: "1px solid #00D27A",
  color: "#00D27A",
  borderRadius: "6px",
  cursor: "pointer",
  padding: "4px 6px",
};
const navBtn = {
  padding: "6px 10px",
  background: "transparent",
  borderRadius: "10px",
  border: "1px solid rgba(0,210,122,0.5)",
  color: "#B5B5B5",
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
};
const cancelBtn = {
  background: "transparent",
  border: "1px solid #777",
  color: "#B5B5B5",
  borderRadius: "6px",
  cursor: "pointer",
  padding: "4px 6px",
};
const gold = { color: "#F5C542", fontWeight: "600" };
const dateText = { color: "#B5B5B5", fontSize: "0.85rem" };

const Row = ({ label, value }) => (
  <p
    style={{
      display: "flex",
      justifyContent: "space-between",
      margin: "6px 0",
    }}
  >
    <span style={{ color: "#B5B5B5" }}>{label}</span>
    <span style={gold}>{value}</span>
  </p>
);

export default DividendTracker;
