import React from 'react';
import UtilizationGrid from './components/UtilizationGrid';
import './App.css'; // Make sure this file exists and includes the styles below

const weekHeaders = [];

const sampleData = [];

function App() {
  return (
    <div className="app-container">
      <h2 className="dashboard-title">Team Weekly Utilization Dashboard</h2>
      <div className="grid-wrapper">
        <UtilizationGrid data={sampleData} weeks={weekHeaders} />
      </div>
    </div>
  );
}

export default App;
