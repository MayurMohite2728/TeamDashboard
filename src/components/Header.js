import React from "react";
import { FaSignOutAlt, FaBars } from "react-icons/fa";
import "./Header.css";

const Header = ({ sidebarCollapsed, onMobileToggle }) => {
  const userName = "Jasmine";
  return (
    <div className="dashboard-header">
      <div className="header-left">
        
        <span className="header-title">EIM & GIS Team Utilization Dashboard</span>
      </div>
      <div className="header-right">
        <img
          src="/profilepic.png"
          alt="profile"
          className="profile-pic"
        />
        <span className="welcome-text">Welcome, {userName}</span>
        <FaSignOutAlt className="logout-icon" title="Sign Out" />
      </div>
    </div>
  );
};

export default Header;
