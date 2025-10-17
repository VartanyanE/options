import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { SiBitcoin, SiEthereum, SiRipple } from "react-icons/si";
import "./MarketBar.css";

const MarketBar = () => {
  const [data, setData] = useState([]);

  const iconMap = {
    BTC: <SiBitcoin color="#f7931a" size={20} />,
    ETH: <SiEthereum color="#3c3c3d" size={20} />,
    XRP: <SiRipple color="#00aae4" size={20} />,
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/crypto/marketbar");
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching crypto market bar:", err.message);
    }
  };

  return (
    <motion.div
      className="market-bar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="ticker"
        animate={{ x: [0, -250, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
      >
        {data.map((coin) => (
          <motion.div
            key={coin.name}
            className="coin"
            whileHover={{ scale: 1.05 }}
          >
            <div className="coin-icon">{iconMap[coin.name]}</div>
            <div className="coin-info">
              <span className="coin-name">{coin.name}</span>
              <span className="coin-price">
                {coin.price
                  ? `$${coin.price.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`
                  : "--"}
              </span>
              <span
                className={`coin-change ${
                  coin.change >= 0 ? "up" : "down"
                }`}
              >
                {coin.change ? `${coin.change}%` : "--"}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default MarketBar;