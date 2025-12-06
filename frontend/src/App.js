import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OptionTracker from "./components/OptionTracker";
import StockAnalyzer from "./components/StockAnalyzer"; // NEW
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<OptionTracker />} />
          <Route path="/analyzer" element={<StockAnalyzer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;