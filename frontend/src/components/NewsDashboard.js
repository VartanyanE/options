import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

const NewsDashboard = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/global-news`)
      .then((res) => res.json())
      .then((data) => {
        setNews(Array.isArray(data.results) ? data.results : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("News fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={page}>
      {/* TOP NAV */}

      {/* HEADER */}
      <motion.div style={headerCard}>
        <div>
          <h2 style={{ margin: 0, color: "#EAEAEA" }}>Market News</h2>
          <p style={subtitle}>Stay informed before you deploy capital</p>
        </div>
      </motion.div>
      <div style={navBar}>
        <NavButton label="📰 News" active />
        <NavButton label="📈 Options" onClick={() => navigate("/options")} />
        {/* <NavButton label="📊 Analyzer" onClick={() => navigate("/analyzer")} /> */}
        <NavButton label="💰 Wealth" onClick={() => navigate("/wealth")} />
        <NavButton
          label="💸 Dividends"
          onClick={() => navigate("/dividends")}
        />
      </div>
      {/* CONTENT */}
      {loading ? (
        <p style={{ color: "#00D27A" }}>Loading news…</p>
      ) : (
        <div style={grid}>
          {news.map((n, i) => (
            <motion.a
              key={i}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.02 }}
              style={card}
            >
              <h4 style={headline}>{n.title}</h4>

              <p style={summary}>{n.description}</p>

              <span style={source}>
                {n.source} •{" "}
                {n.published ? new Date(n.published).toLocaleDateString() : ""}
              </span>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- NAV BUTTON ---------- */

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

/* ---------- STYLES ---------- */

const page = {
  maxWidth: "1100px",
  margin: "auto",
  padding: "16px",
};

const navBar = {
  display: "flex",
  gap: "8px",
  marginBottom: "14px",
  flexWrap: "wrap", // ✅ mobile wrap
};

const navBtn = {
  padding: "6px 10px",
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
  marginBottom: "18px",
};

const subtitle = {
  margin: 0,
  color: "#8f8f8f",
  fontSize: "0.8rem",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)", // 👈 always 2 columns
  gap: "12px",
};

const card = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "14px",
  padding: "12px",
  textDecoration: "none",
  display: "flex",
  flexDirection: "column",

  minHeight: "220px", // 👈 creates square-ish cards
};
const headline = {
  margin: "0 0 6px",
  color: "#EAEAEA",
  fontSize: "0.95rem",
};

const summary = {
  fontSize: "0.85rem",
  color: "#B5B5B5",
  marginBottom: "10px",
  flexGrow: 1,
};

const source = {
  fontSize: "0.75rem",
  color: "#F5C542",
};

export default NewsDashboard;
