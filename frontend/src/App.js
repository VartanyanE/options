import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OptionTracker from "./components/OptionTracker";
import StockAnalyzer from "./components/StockAnalyzer";
import ProfitFactor from "./components/ProfitFactor";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ProfitFactor />} />
          <Route path="/options" element={<OptionTracker />} />
          <Route path="/analyzer" element={<StockAnalyzer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
