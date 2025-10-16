import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import UtilizationGrid from "./components/UtilizationGrid";
import "./App.css";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="layout">
        <Sidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <div className="main-content">
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onMobileToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />
          <div className="page">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/utilization" element={<UtilizationGrid />} />
            </Routes>
          </div>
        </div>

        {mobileSidebarOpen && (
          <div
            className="overlay"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
        )}
      </div>
    </Router>
  );
}

export default App;
