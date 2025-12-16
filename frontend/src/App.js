import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OptionTracker from "./components/OptionTracker";
import StockAnalyzer from "./components/StockAnalyzer";
import WealthTracker from "./components/WealthTracker";
import DividendTracker from "./components/DividendTracker";
import NewsDashboard from "./components/NewsDashboard";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<NewsDashboard />} />
          <Route path="/options" element={<OptionTracker />} />
          <Route path="/analyzer" element={<StockAnalyzer />} />
          <Route path="/wealth" element={<WealthTracker />} />
          <Route path="/dividends" element={<DividendTracker />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
