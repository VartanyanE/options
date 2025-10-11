import React, { useState } from "react";
import axios from "axios";

const StockPrice = () => {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrice = async () => {
    if (!ticker) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await axios.get(`http://localhost:5050/api/price/${ticker}`);
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch price. Check ticker or backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter ticker symbol (e.g. AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        style={{
          padding: "10px",
          fontSize: "16px",
          borderRadius: "8px",
          marginRight: "10px",
        }}
      />
      <button
        onClick={fetchPrice}
        style={{
          padding: "10px 15px",
          fontSize: "16px",
          borderRadius: "8px",
          background: "#007BFF",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Get Price
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>{data.ticker}</h2>
          <p>Close: ${data.close}</p>
          <p>High: ${data.high}</p>
          <p>Low: ${data.low}</p>
          <p>Volume: {data.volume.toLocaleString()}</p>
          <p>
            Timestamp: {new Date(data.timestamp).toLocaleString("en-US")}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockPrice;