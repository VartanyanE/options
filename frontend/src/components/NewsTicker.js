// src/components/NewsTicker.js
import React, { useEffect, useState } from "react";
import "./NewsTicker.css";

const NewsTicker = () => {
  const [headlines, setHeadlines] = useState([]);

  const fetchNews = async () => {
    try {
      const response = await fetch(
        `${window.location.origin.includes("localhost")
          ? "http://localhost:5050"
          : "https://your-render-backend-url.onrender.com"}/api/news`
      );
      const data = await response.json();
      setHeadlines(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!headlines.length)
    return (
      <div className="news-ticker">
        <div className="ticker-content">
          <span className="ticker-item">Loading latest financial news…</span>
        </div>
      </div>
    );

  // duplicate headlines for seamless loop
  const feed = [...headlines, ...headlines];

  return (
    <div className="news-ticker">
      <div className="ticker-track">
        {feed.map((h, i) => (
          <span
            key={i}
            className="ticker-item"
            onClick={() => window.open(h.url || "#", "_blank")}
          >
            💬 {h.title || h}
          </span>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;