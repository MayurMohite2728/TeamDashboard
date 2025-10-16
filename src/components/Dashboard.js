import React from "react";
import { FaEye } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const Dashboard = ({ onShowDetails }) => {
  const employees = [
    { name: "Mayur Mohite", utilization: 100, project: "Ashghal CDMS" },
    { name: "Jasmine Thomas", utilization: 45, project: "Ashghal CDMS" },
    { name: "Pratiksha Chikane ", utilization: 110, project: "Ashghal PDLM" },
    { name: "Priyanka Chavan", utilization: 60, project: "Qatar Foundation" },
  ];

  const projectData = [
    { name: "Project A", running: 8 },
    { name: "Project B", running: 5 },
    { name: "Project C", running: 12 },
    { name: "Project D", running: 3 },
    { name: "Project E", running: 7 },
  ];

  const getStatusText = (util) => {
    if (util > 100) return { text: "Over Utilized", colorClass: "status-red" };
    if (util === 100) return { text: "Fully Utilized", colorClass: "status-green" };
    return { text: "Under Utilized", colorClass: "status-yellow" };
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="card stat-card default">
          <h3>Average Team Utilization</h3>
          <p className="stat-value">
            {Math.round(
              employees.reduce((sum, e) => sum + e.utilization, 0) / employees.length
            )}
            %
          </p>
        </div>
        <div className="card stat-card warning">
          <h3>Under Utilized Resources</h3>
          <p className="stat-value">{employees.filter(e => e.utilization < 50).length}</p>
        </div>
        <div className="card stat-card danger">
          <h3>Over Utilized Resources</h3>
          <p className="stat-value">{employees.filter(e => e.utilization > 100).length}</p>
        </div>
        <div className="card stat-card success">
          <h3>Running Projects</h3>
          <p className="stat-value">{employees.length}</p>
        </div>
      </div>

      <div className="card graph-widget">
        <h3>Projects Running Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={projectData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="running" fill="#1a67a3" barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card table-card">
        <div className="employee-header">
          <h3>Employee Utilization</h3>
          <h4 className="details-link" onClick={onShowDetails}>
            More Details
          </h4>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Utilization</th>
              <th>Project</th>
              <th>Status</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => {
              const status = getStatusText(emp.utilization);
              return (
                <tr key={i}>
                  <td>{emp.name}</td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${status.colorClass}`}
                        style={{ width: `${Math.min(emp.utilization, 120)}%` }}
                      >
                        {emp.utilization}%
                      </div>
                    </div>
                  </td>
                  <td>{emp.project}</td>
                  <td>
                    <span className={`status ${status.colorClass}`}>{status.text}</span>
                  </td>
                  <td>
                    <FaEye
                      className="view-icon"
                      onClick={() => alert(`Viewing details for ${emp.name}`)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
