import React from "react";
import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaTable, FaBars, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ collapsed, onCollapse, mobileOpen, onMobileToggle }) => {
  return (
    <div
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "open" : ""
      }`}
    >
      <div className="sidebar-header">
        <FaBars className="menu-toggle" onClick={onCollapse} />
        {!collapsed && <div className="logo">Mannai</div>}
      </div>

      {/* ✅ Navigation Menu */}
      <ul className="menu">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={mobileOpen ? onMobileToggle : undefined}
          >
            <FaTachometerAlt />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/utilization"
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={mobileOpen ? onMobileToggle : undefined}
          >
            <FaTable />
            {!collapsed && <span>Utilization Grid</span>}
          </NavLink>
        </li>
      </ul>

     
    </div>
  );
};

export default Sidebar;
