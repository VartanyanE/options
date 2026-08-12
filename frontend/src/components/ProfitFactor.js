import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "profitFactorTrades";

const ProfitFactor = () => {
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState("");
  const [resultType, setResultType] = useState("profit");
  const [profitLoss, setProfitLoss] = useState("");
  const [trades, setTrades] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const strategies = useMemo(() => {
    const grouped = new Map();

    trades.forEach((trade) => {
      const key = trade.strategy.toLowerCase();
      const current = grouped.get(key) || {
        name: trade.strategy,
        trades: [],
      };

      current.trades.push(trade);
      grouped.set(key, current);
    });

    return Array.from(grouped.values()).map((group) => {
      const wins = group.trades.filter((trade) => trade.profitLoss > 0);
      const losses = group.trades.filter((trade) => trade.profitLoss < 0);
      const grossProfit = wins.reduce(
        (total, trade) => total + trade.profitLoss,
        0
      );
      const grossLoss = Math.abs(
        losses.reduce((total, trade) => total + trade.profitLoss, 0)
      );
      const totalProfitLoss = group.trades.reduce(
        (total, trade) => total + trade.profitLoss,
        0
      );
      const decidedTrades = wins.length + losses.length;

      return {
        ...group,
        wins: wins.length,
        losses: losses.length,
        totalProfitLoss,
        winRate: decidedTrades ? (wins.length / decidedTrades) * 100 : 0,
        profitFactor:
          grossLoss === 0 ? (grossProfit > 0 ? Infinity : null) : grossProfit / grossLoss,
      };
    });
  }, [trades]);

  const addTrade = (event) => {
    event.preventDefault();

    const trimmedStrategy = strategy.trim();
    const parsedAmount = Number(profitLoss);

    if (
      !trimmedStrategy ||
      profitLoss === "" ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      return;
    }

    const parsedProfitLoss =
      resultType === "loss" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);

    setTrades((current) => [
      ...current,
      {
        id: Date.now(),
        strategy: trimmedStrategy,
        profitLoss: parsedProfitLoss,
      },
    ]);
    setStrategy("");
    setResultType("profit");
    setProfitLoss("");
  };

  const deleteStrategy = (name) => {
    setTrades((current) =>
      current.filter(
        (trade) => trade.strategy.toLowerCase() !== name.toLowerCase()
      )
    );
  };

  return (
    <div style={page}>
      <div style={headerCard}>
        <div>
          <h2 style={title}>📊 Profit Factor</h2>
          <p style={subtitle}>Compare the performance of your strategies</p>
        </div>
      </div>

      <div style={navBar} aria-label="Primary navigation">
        <NavButton label="📊 Profit Factor" active />
        <NavButton label="📈 Options" onClick={() => navigate("/options")} />
      </div>

      <form onSubmit={addTrade} style={card}>
        <h3 style={sectionTitle}>Add Trade Result</h3>
        <input
          style={input}
          value={strategy}
          onChange={(event) => setStrategy(event.target.value)}
          placeholder="Strategy name (ATM Straddle)"
          aria-label="Strategy name"
        />
        <div style={resultInputRow}>
          <select
            style={resultTypeSelect}
            value={resultType}
            onChange={(event) => setResultType(event.target.value)}
            aria-label="Trade result type"
          >
            <option value="profit">Profit</option>
            <option value="loss">Loss</option>
          </select>
          <input
            style={amountInput}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={profitLoss}
            onChange={(event) => setProfitLoss(event.target.value)}
            placeholder="Amount (125.50)"
            aria-label="Trade amount"
          />
        </div>
        <button type="submit" style={primaryButton}>
          Add Trade
        </button>
      </form>

      <section aria-labelledby="strategy-results-title">
        <h3 id="strategy-results-title" style={sectionTitle}>
          Strategy Results
        </h3>

        {strategies.length === 0 ? (
          <div style={emptyState}>
            Add a trade above to start calculating your strategy performance.
          </div>
        ) : (
          strategies.map((item) => (
            <article key={item.name.toLowerCase()} style={resultCard}>
              <div style={cardHeader}>
                <h4 style={strategyTitle}>{item.name}</h4>
                <button
                  type="button"
                  onClick={() => deleteStrategy(item.name)}
                  style={deleteButton}
                  aria-label={`Delete ${item.name}`}
                >
                  Delete
                </button>
              </div>
              <Metric label="Trades" value={item.trades.length} />
              <Metric
                label="Win / Loss"
                value={`${item.wins} / ${item.losses} (${item.winRate.toFixed(0)}%)`}
              />
              <Metric
                label="Profit Factor"
                value={
                  item.profitFactor === Infinity
                    ? "∞"
                    : item.profitFactor === null
                    ? "—"
                    : item.profitFactor.toFixed(2)
                }
                accent
              />
              <Metric
                label="Total P/L"
                value={formatCurrency(item.totalProfitLoss)}
                tone={
                  item.totalProfitLoss > 0
                    ? "profit"
                    : item.totalProfitLoss < 0
                    ? "loss"
                    : "neutral"
                }
              />
            </article>
          ))
        )}
      </section>
    </div>
  );
};

const NavButton = ({ label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    style={active ? activeNavButton : navButton}
    aria-current={active ? "page" : undefined}
  >
    {label}
  </button>
);

const formatCurrency = (value) =>
  Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Metric = ({ label, value, accent, tone }) => (
  <p style={metricRow}>
    <span style={metricLabel}>{label}</span>
    <span
      style={
        tone === "profit"
          ? profitValue
          : tone === "loss"
          ? lossValue
          : accent
          ? metricAccent
          : metricValue
      }
    >
      {value}
    </span>
  </p>
);

const page = { maxWidth: "520px", margin: "auto", padding: "18px" };

const headerCard = {
  background:
    "linear-gradient(90deg, rgba(0,210,122,0.1), rgba(0,168,95,0.15))",
  border: "1px solid rgba(0,210,122,0.4)",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "18px",
};

const title = { margin: 0, color: "#EAEAEA" };

const subtitle = {
  margin: 0,
  color: "#8f8f8f",
  fontSize: "0.8rem",
};

const navBar = {
  display: "flex",
  gap: "8px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const navButton = {
  padding: "6px 10px",
  background: "transparent",
  borderRadius: "10px",
  border: "1px solid rgba(0,210,122,0.5)",
  color: "#B5B5B5",
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
};

const activeNavButton = {
  ...navButton,
  borderColor: "#00D27A",
  color: "#00D27A",
};

const card = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "14px",
  padding: "16px",
  marginBottom: "20px",
};

const sectionTitle = {
  margin: "0 0 12px",
  color: "#EAEAEA",
  fontSize: "1rem",
};

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

const resultInputRow = {
  display: "grid",
  gridTemplateColumns: "minmax(105px, 0.8fr) minmax(0, 1.4fr)",
  gap: "8px",
  marginBottom: "8px",
};

const resultTypeSelect = {
  ...input,
  marginBottom: 0,
  cursor: "pointer",
};

const amountInput = {
  ...input,
  marginBottom: 0,
};

const primaryButton = {
  width: "100%",
  padding: "10px",
  background: "linear-gradient(90deg, #00D27A, #00A85F)",
  color: "#000",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};

const resultCard = {
  ...card,
  marginBottom: "14px",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "10px",
};

const strategyTitle = {
  margin: 0,
  color: "#EAEAEA",
  fontSize: "1rem",
};

const deleteButton = {
  padding: "4px 7px",
  background: "transparent",
  border: "1px solid #444",
  borderRadius: "6px",
  color: "#FF6B6B",
  cursor: "pointer",
};

const metricRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  margin: "8px 0",
};

const metricLabel = { color: "#B5B5B5" };
const metricValue = { color: "#EAEAEA", fontWeight: "600" };
const metricAccent = { color: "#F5C542", fontWeight: "600" };
const profitValue = { color: "#00D27A", fontWeight: "600" };
const lossValue = { color: "#FF6B6B", fontWeight: "600" };

const emptyState = {
  ...card,
  color: "#8f8f8f",
  fontSize: "0.85rem",
  lineHeight: 1.5,
};

export default ProfitFactor;
