import React, { useEffect, useState } from "react";
import axios from "axios";

const MarketBar = () => {
  const [markets, setMarkets] = useState(null);
  const [flashes, setFlashes] = useState({});

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await axios.get("/api/markets");

        if (markets) {
          const updatedFlashes = {};
          for (const key in res.data) {
            if (res.data[key] !== markets[key]) {
              updatedFlashes[key] =
                res.data[key] > markets[key] ? "up" : "down";
              setTimeout(() => {
                setFlashes((prev) => ({ ...prev, [key]: null }));
              }, 800);
            }
          }
          setFlashes((prev) => ({ ...prev, ...updatedFlashes }));
        }

        setMarkets(res.data);
      } catch (err) {
        console.error("Market fetch error:", err.message);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [markets]);

  if (!markets)
    return (
      <div style={widgetContainer}>
        <p style={{ color: "#777", fontSize: "0.9rem" }}>Loading markets...</p>
      </div>
    );

  const assets = [
    { label: "S&P 500", key: "SPY", symbol: "📈" },
    { label: "NASDAQ 100", key: "QQQ", symbol: "💻" },
    { label: "DOW JONES", key: "DIA", symbol: "🏦" },
    { label: "BTC", key: "BTC", symbol: "₿" },
    { label: "ETH", key: "ETH", symbol: "Ξ" },
    { label: "XRP", key: "XRP", symbol: "✦" },
  ];

  const formatPrice = (key, value) => {
    if (!value) return "—";
    if (key === "BTC") {
      // No decimals for BTC
      return `$${Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }
    // 2 decimals for everything else
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div style={widgetContainer}>
      <h3 style={widgetTitle}>Market Overview</h3>

      <div style={gridContainer}>
        {assets.map(({ label, key, symbol }) => (
          <div key={key} style={assetBox}>
            <p style={assetLabel}>
              {symbol} {label}
            </p>
            <p
              style={{
                ...assetValue,
                color:
                  flashes[key] === "up"
                    ? "#00FF88"
                    : flashes[key] === "down"
                    ? "#FF4D4D"
                    : "#EAEAEA",
                textShadow:
                  flashes[key] === "up"
                    ? "0 0 8px rgba(0,255,136,0.6)"
                    : flashes[key] === "down"
                    ? "0 0 8px rgba(255,77,77,0.5)"
                    : "0 0 6px rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }}
            >
              {formatPrice(key, markets[key])}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// === STYLES === //
const widgetContainer = {
  background: "linear-gradient(145deg, #121212, #1b1b1b)",
  border: "1px solid #202020",
  borderRadius: "16px",
  padding: "18px 12px 20px 12px",
  margin: "18px auto 22px auto",
  width: "94%",
  boxShadow: "0 3px 15px rgba(0,0,0,0.45)",
  textAlign: "center",
  fontFamily: "Inter, sans-serif",
};

const widgetTitle = {
  color: "#00D27A",
  fontWeight: "600",
  fontSize: "1.05rem",
  marginBottom: "12px",
  letterSpacing: "0.6px",
};

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "14px",
  justifyItems: "center",
  alignItems: "center",
};

const assetBox = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "6px",
};

const assetLabel = {
  fontSize: "0.85rem",
  color: "#999",
  marginBottom: "6px",
  letterSpacing: "0.4px",
};

const assetValue = {
  fontSize: "1.2rem",
  fontWeight: "700",
};

export default MarketBar;