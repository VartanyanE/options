import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const WealthTracker = () => {
  const navigate = useNavigate();

  // === STATE ===
  const [cryptoAssets, setCryptoAssets] = useState([]);
  const [stockAssets, setStockAssets] = useState([]);
  const [checking, setChecking] = useState("");
  const [savings, setSavings] = useState("");
  const [realEstateEquity, setRealEstateEquity] = useState("");
  const [cashOnHand, setCashOnHand] = useState("");

  const [cryptoPrices, setCryptoPrices] = useState({});
  const [stockPrices, setStockPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [error, setError] = useState("");

  // === LOAD FROM LOCAL STORAGE ===
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wealthTracker");
      if (!saved) return;
      const parsed = JSON.parse(saved);

      if (parsed.cryptoAssets) setCryptoAssets(parsed.cryptoAssets);
      if (parsed.stockAssets) setStockAssets(parsed.stockAssets);
      if (parsed.checking != null) setChecking(String(parsed.checking));
      if (parsed.savings != null) setSavings(String(parsed.savings));
      if (parsed.realEstateEquity != null)
        setRealEstateEquity(String(parsed.realEstateEquity));
      if (parsed.cashOnHand != null) setCashOnHand(String(parsed.cashOnHand));
    } catch (err) {
      console.error("LocalStorage load error:", err);
    }
  }, []);

  // === SAVE TO LOCAL STORAGE ===
  useEffect(() => {
    const payload = {
      cryptoAssets,
      stockAssets,
      checking,
      savings,
      realEstateEquity,
      cashOnHand,
    };
    localStorage.setItem("wealthTracker", JSON.stringify(payload));
  }, [
    cryptoAssets,
    stockAssets,
    checking,
    savings,
    realEstateEquity,
    cashOnHand,
  ]);

  // === HELPERS ===
  const toNumber = (val) => {
    const n = parseFloat(val);
    return Number.isNaN(n) ? 0 : n;
  };

  const formatCurrency = (val) => {
    const n = Number(val);
    if (Number.isNaN(n)) return "$0";
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  // === ASSET HANDLERS ===
  const addCrypto = () =>
    setCryptoAssets((prev) => [
      ...prev,
      { id: Date.now(), symbol: "", amount: "" },
    ]);

  const updateCrypto = (id, field, value) =>
    setCryptoAssets((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );

  const removeCrypto = (id) =>
    setCryptoAssets((prev) => prev.filter((c) => c.id !== id));

  const addStock = () =>
    setStockAssets((prev) => [
      ...prev,
      { id: Date.now(), ticker: "", shares: "" },
    ]);

  const updateStock = (id, field, value) =>
    setStockAssets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );

  const removeStock = (id) =>
    setStockAssets((prev) => prev.filter((s) => s.id !== id));

  // === FETCH PRICES ===
  const refreshPrices = async () => {
    setLoadingPrices(true);
    setError("");

    try {
      // Crypto symbols to fetch
      const cryptoSymbols = [
        ...new Set(
          cryptoAssets
            .map((c) => c.symbol.trim().toUpperCase())
            .filter((s) => s.length > 0)
        ),
      ];

      const newCryptoPrices = { ...cryptoPrices };
      await Promise.all(
        cryptoSymbols.map(async (sym) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/crypto/${sym}`);
            const data = await res.json();
            if (data.price) newCryptoPrices[sym] = data.price;
          } catch (err) {
            console.error("Crypto fetch error:", sym, err);
          }
        })
      );

      // Stock tickers
      const stockTickers = [
        ...new Set(
          stockAssets
            .map((s) => s.ticker.trim().toUpperCase())
            .filter((t) => t.length > 0)
        ),
      ];

      const newStockPrices = { ...stockPrices };
      await Promise.all(
        stockTickers.map(async (t) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/price/${t}`);
            const data = await res.json();
            if (data.close) newStockPrices[t] = data.close;
          } catch (err) {
            console.error("Stock fetch error:", t, err);
          }
        })
      );

      setCryptoPrices(newCryptoPrices);
      setStockPrices(newStockPrices);
    } catch (err) {
      console.error("Refresh error:", err);
      setError("Some prices could not be loaded.");
    }

    setLoadingPrices(false);
  };

  // === TOTALS ===
  const cryptoTotal = cryptoAssets.reduce((sum, c) => {
    const sym = c.symbol.trim().toUpperCase();
    const amount = toNumber(c.amount);
    const price = cryptoPrices[sym] || 0;
    return sum + amount * price;
  }, 0);

  const stockTotal = stockAssets.reduce((sum, s) => {
    const t = s.ticker.trim().toUpperCase();
    const shares = toNumber(s.shares);
    const price = stockPrices[t] || 0;
    return sum + shares * price;
  }, 0);

  const bankTotal = toNumber(checking) + toNumber(savings);
  const realEstateTotal = toNumber(realEstateEquity);
  const cashTotal = toNumber(cashOnHand);

  const netWorth =
    cryptoTotal + stockTotal + bankTotal + realEstateTotal + cashTotal;

  // === RENDER ===
  return (
    <div style={{ maxWidth: "520px", margin: "auto", padding: "18px" }}>
      {/* Back Button */}
      {/* Top Navigation */}{" "}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        style={headerCard}
      >
        <div>
          <h2 style={{ margin: 0, color: "#EAEAEA" }}>💰 Wealth Tracker</h2>
          <p style={{ margin: 0, color: "#8f8f8f", fontSize: ".8rem" }}>
            Track crypto, stocks & all assets in one place
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={refreshPrices}
          style={refreshBtn}
        >
          {loadingPrices ? "Refreshing…" : "Refresh Prices"}
        </motion.button>
      </motion.div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <button style={navBtn} onClick={() => navigate("/")}>
          📰 News
        </button>

        <button style={navBtn} onClick={() => navigate("/options")}>
          📈 Options
        </button>

        {/* <button style={navBtn} onClick={() => navigate("/analyzer")}>
          📊 Analyzer
        </button> */}

        <button style={{ ...navBtn, borderColor: "#00D27A", color: "#00D27A" }}>
          💰 Wealth
        </button>

        <button style={navBtn} onClick={() => navigate("/dividends")}>
          💸 Dividends
        </button>
      </div>
      {/* Header */}
      {error && <p style={{ color: "#FF4D4D" }}>{error}</p>}
      {/* CRYPTO SECTION */}
      <Section title="Crypto Holdings">
        <AnimatePresence>
          {cryptoAssets.map((c) => {
            const sym = c.symbol.trim().toUpperCase();
            const price = cryptoPrices[sym] || 0;
            const value = price * toNumber(c.amount);

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={assetBox}
              >
                {/* Inputs row */}
                <div style={assetInputRow}>
                  <input
                    placeholder="Symbol (BTC)"
                    value={c.symbol}
                    onChange={(e) =>
                      updateCrypto(c.id, "symbol", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <input
                    placeholder="Amount"
                    value={c.amount}
                    onChange={(e) =>
                      updateCrypto(c.id, "amount", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <button onClick={() => removeCrypto(c.id)} style={deleteBtn}>
                    ✖
                  </button>
                </div>

                {/* Values row */}
                <div style={valueRow}>
                  <div>
                    <span style={labelStyle}>Value:</span>{" "}
                    <span style={valueStyle}>
                      {value > 0 ? formatCurrency(value) : "$0"}
                    </span>
                  </div>

                  {price > 0 && (
                    <div>
                      <span style={labelStyle}>Price:</span>{" "}
                      <span style={valueStyle}>${price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button onClick={addCrypto} style={addBtn}>
          + Add Crypto
        </button>
      </Section>
      {/* STOCK SECTION */}
      <Section title="Stock Holdings">
        <AnimatePresence>
          {stockAssets.map((s) => {
            const t = s.ticker.trim().toUpperCase();
            const price = stockPrices[t] || 0;
            const value = price * toNumber(s.shares);

            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={assetBox}
              >
                <div style={assetInputRow}>
                  <input
                    placeholder="Ticker (AAPL)"
                    value={s.ticker}
                    onChange={(e) =>
                      updateStock(s.id, "ticker", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <input
                    placeholder="Shares"
                    value={s.shares}
                    onChange={(e) =>
                      updateStock(s.id, "shares", e.target.value)
                    }
                    style={inputStyle}
                  />

                  <button onClick={() => removeStock(s.id)} style={deleteBtn}>
                    ✖
                  </button>
                </div>

                <div style={valueRow}>
                  <div>
                    <span style={labelStyle}>Value:</span>{" "}
                    <span style={valueStyle}>
                      {value > 0 ? formatCurrency(value) : "$0"}
                    </span>
                  </div>

                  {price > 0 && (
                    <div>
                      <span style={labelStyle}>Price:</span>{" "}
                      <span style={valueStyle}>${price.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button onClick={addStock} style={addBtn}>
          + Add Stock
        </button>
      </Section>
      {/* BANK */}
      <Section title="Bank Accounts">
        <input
          placeholder="Checking"
          value={checking}
          onChange={(e) => setChecking(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Savings"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
          style={inputStyle}
        />

        <p style={summaryText}>
          Total: <span style={valueStyle}>{formatCurrency(bankTotal)}</span>
        </p>
      </Section>
      {/* REAL ESTATE */}
      <Section title="Real Estate Equity">
        <input
          placeholder="Equity"
          value={realEstateEquity}
          onChange={(e) => setRealEstateEquity(e.target.value)}
          style={inputStyle}
        />

        <p style={summaryText}>
          Equity:{" "}
          <span style={valueStyle}>{formatCurrency(realEstateTotal)}</span>
        </p>
      </Section>
      {/* CASH */}
      <Section title="Cash On Hand">
        <input
          placeholder="Cash"
          value={cashOnHand}
          onChange={(e) => setCashOnHand(e.target.value)}
          style={inputStyle}
        />

        <p style={summaryText}>
          Cash: <span style={valueStyle}>{formatCurrency(cashTotal)}</span>
        </p>
      </Section>
      {/* TOTAL NET WORTH */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={netWorthBox}
      >
        <h3 style={{ margin: 0, color: "#EAEAEA" }}>Total Net Worth</h3>

        <div style={totalValue}>{formatCurrency(netWorth)}</div>
      </motion.div>
    </div>
  );
};

/* ======= STYLES ======= */

const backBtn = {
  background: "transparent",
  border: "1px solid #2e2e2e",
  padding: "6px 12px",
  borderRadius: "8px",
  color: "#EAEAEA",
  fontSize: ".85rem",
  cursor: "pointer",
  marginBottom: "12px",
};

const headerCard = {
  background:
    "linear-gradient(90deg, rgba(0,210,122,0.1), rgba(0,168,95,0.15))",
  border: "1px solid rgba(0,210,122,0.4)",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const refreshBtn = {
  padding: "8px 12px",
  background: "transparent",
  borderRadius: "8px",
  border: "1px solid rgba(0,210,122,0.5)",
  color: "#00D27A",
  fontSize: ".8rem",
  cursor: "pointer",
};

const Section = ({ title, children }) => (
  <div
    style={{
      background: "#111",
      border: "1px solid #1e1e1e",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "14px",
    }}
  >
    <h3 style={{ margin: 0, marginBottom: "10px", color: "#EAEAEA" }}>
      {title}
    </h3>
    {children}
  </div>
);

const inputStyle = {
  padding: "8px 10px",
  borderRadius: "10px",
  border: "1px solid #2e2e2e",
  backgroundColor: "#1a1a1a",
  color: "#EAEAEA",
  fontSize: ".9rem",
  outline: "none",

  /* 🔑 FIX */
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
};

const addBtn = {
  marginTop: "6px",
  padding: "6px 10px",
  background: "transparent",
  borderRadius: "8px",
  border: "1px dashed #444",
  color: "#B5B5B5",
  fontSize: ".8rem",
  cursor: "pointer",
};

const assetBox = {
  padding: "10px",
  borderRadius: "10px",
  background: "#141414",
  border: "1px solid #2c2c2c",
  marginBottom: "10px",
};

const assetInputRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "8px",
  marginBottom: "6px",
  alignItems: "center",
};

const valueRow = {
  fontSize: ".85rem",
  color: "#B5B5B5",
  lineHeight: "1.3",
};

const labelStyle = {
  color: "#888",
};

const valueStyle = {
  color: "#F5C542",
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  color: "#FF4D4D",
  cursor: "pointer",
  fontSize: "1rem",
};

const summaryText = {
  marginTop: "6px",
  color: "#B5B5B5",
  fontSize: ".85rem",
};

const netWorthBox = {
  marginTop: "18px",
  padding: "18px",
  background:
    "radial-gradient(circle at top left, rgba(0,210,122,0.2), #141414)",
  borderRadius: "14px",
  border: "1px solid #2a2a2a",
  textAlign: "center",
};

const totalValue = {
  marginTop: "6px",
  fontSize: "1.5rem",
  fontWeight: "700",
  color: "#F5C542",
};
const navBtn = {
  padding: "6px 10px",
  background: "transparent",
  borderRadius: "10px",
  border: "1px solid rgba(0,210,122,0.5)",
  color: "#B5B5B5",
  fontSize: ".8rem",
  fontWeight: "600",
  cursor: "pointer",
};

export default WealthTracker;
