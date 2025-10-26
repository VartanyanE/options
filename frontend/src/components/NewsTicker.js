// src/components/NewsTicker.js
import React, { useEffect, useState } from "react";
import "./NewsTicker.css";

const NewsTicker = () => {
  const [headlines, setHeadlines] = useState([]);

  const fetchNews = async () => {
    try {
      // dynamically pick backend URL
      const backendURL = window.location.origin.includes("localhost")
        ? "http://localhost:5050"
        : "https://cash-flow-strategist-api.onrender.com";

      // ✅ call the backend proxy instead of Polygon directly
      const response = await fetch(`${backendURL}/api/global-news`);
      const data = await response.json();

      // Polygon returns { results: [...] }
      if (data.results) {
        setHeadlines(data.results.slice(0, 10)); // limit to top 10
      } else {
        setHeadlines(data);
      }
    } catch (error) {
      console.error("Error fetching global news:", error);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (!headlines.length) {
    return (
      <div className="news-ticker">
        <div className="ticker-content">
          <span className="ticker-item">Loading latest market news…</span>
        </div>
      </div>
    );
  }

  // Duplicate headlines for seamless scroll
  const feed = [...headlines, ...headlines];

  return (
    <div className="news-ticker">
      <div className="ticker-track">
        {feed.map((h, i) => (
          <span
            key={i}
            className="ticker-item"
            onClick={() => window.open(h.article_url || h.url || "#", "_blank")}
          >
            📰 {h.title || h.headline || "Untitled"}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;