import React, { useState, useEffect } from "react";
import axios from "axios";
import { getUsersList } from "../Services/userService";
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from "react-icons/fa";
import "./styles.css";

const UtilizationGrid = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [tasksByUser, setTasksByUser] = useState({});
  const [days, setDays] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [expandedProjectsByUser, setExpandedProjectsByUser] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const usersPerPage = 10;

  const API_KEY = "apikey";
  const PASSWORD ="a8aaace68a649dc60b395684b18fa4a313e838bff8e62fb77fcb28a86e2ec4c7";
  const authHeader = "Basic " + btoa(`${API_KEY}:${PASSWORD}`);

  useEffect(() => {
    generateWeekStartDates(selectedStartDate);
  }, [selectedStartDate]);

  const generateWeekStartDates = (startDate) => {
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let i = -4; i <= 6; i++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + i * 7);
      const options = { month: "short", day: "numeric" };
      weeks.push(weekStart.toLocaleDateString("en-US", options));
    }
    setDays(weeks);
  };

  useEffect(() => {
    setLoading(true);
    getUsersList()
      .then(setUsers)
      .catch((err) => console.error("Error loading users:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Updated function with dynamic pageSize and pagination
  const fetchTasksForUser = async (userId, visibleWeeks) => {
    setLoading(true);
    const baseUrl = `https://vmi2493325.contaboserver.net/api/v3/work_packages`;
    const filters = `[{"assignee":{"operator":"=","values":["${userId}"]}}]`;

    let allTasks = [];
    let offset = 1;
    const pageSize = 100; // Initial page size (can be adjusted)
    let total = 0;
    
    try {
      while (true) {
        const url = `${baseUrl}?filters=${encodeURIComponent(
          filters
        )}&pageSize=${pageSize}&offset=${offset}`;
        const res = await axios.get(url, {
          headers: { Authorization: authHeader },
        });

        const data = res.data._embedded?.elements || [];
        allTasks = [...allTasks, ...data];

        total = res.data.total || data.length;
        if (allTasks.length >= total) break;

        offset += 1;
      }

      if (!visibleWeeks?.length) return allTasks;

      const firstWeekStart = new Date(
        `${visibleWeeks[0]}, ${new Date().getFullYear()}`
      );
      const lastWeekEnd = new Date(
        `${visibleWeeks[visibleWeeks.length - 1]}, ${new Date().getFullYear()}`
      );
      lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);

      return allTasks.filter((task) => {
        const startDate = new Date(task.startDate || task.start);
        const endDate = new Date(task.dueDate || task.end);
        return startDate <= lastWeekEnd && endDate >= firstWeekStart;
      });
    } catch (error) {
      console.error(`Error fetching tasks for user ${userId}:`, error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTasksForVisibleUsers = async () => {
      const indexOfLastUser = currentPage * usersPerPage;
      const indexOfFirstUser = indexOfLastUser - usersPerPage;
      const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

      for (const user of currentUsers) {
        const tasks = await fetchTasksForUser(user.id, days);
        setTasksByUser((prev) => ({ ...prev, [user.id]: tasks }));
      }
    };

    if (users.length) fetchTasksForVisibleUsers();
  }, [users, currentPage, days]);

  const toggleExpand = async (user) => {
    const isExpanding = expandedUserId !== user.id;
    setExpandedUserId(isExpanding ? user.id : null);
    if (isExpanding && !tasksByUser[user.id]) {
      const tasks = await fetchTasksForUser(user.id, days);
      setTasksByUser((prev) => ({ ...prev, [user.id]: tasks }));
    }
  };

  const toggleProjectExpand = (userId, projectId) => {
    setExpandedProjectsByUser((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [projectId]: !prev[userId]?.[projectId],
      },
    }));
  };

  const getCellColor = (percent) => {
    if (percent >= 100) return "#4caf5073";
    if (percent >= 50) return "#79bcf578";
    if (percent >= 10) return "#ffeb3b66";
    return "#f1f1f1";
  };

  const getWorkingDays = (start, end) => {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 5 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const parseISO8601DurationToHours = (duration) => {
    const match = duration?.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);
    if (!match) return 0;
    const days = parseInt(match[1]) || 0;
    const hours = parseInt(match[2]) || 0;
    const minutes = parseInt(match[3]) || 0;
    return days * 8 + hours + (minutes / 60);
  };

  const calculateEffortThisWeek = (task, weekStart, weekEnd) => {
    const startDate = new Date(task.startDate || task.start);
    const endDate = new Date(task.dueDate || task.end);
    const estimatedHours =
      typeof task.estimatedTime === "string"
        ? parseISO8601DurationToHours(task.estimatedTime)
        : task.estimatedTime || 0;

    if (startDate > weekEnd || endDate < weekStart || !estimatedHours) return 0;

    const totalWorkingDays = getWorkingDays(startDate, endDate);
    if (totalWorkingDays === 0) return 0;

    const overlapStart = new Date(Math.max(startDate, weekStart));
    const overlapEnd = new Date(Math.min(endDate, weekEnd));
    const overlapDays = getWorkingDays(overlapStart, overlapEnd);
     
    
    const effort = (
      (estimatedHours / totalWorkingDays) * overlapDays  
    ).toFixed(1);
    return parseFloat(effort);
  };

  const isOnLeaveForWeek = (tasks, weekStart, weekEnd) => {
    return tasks.some(
      (t) =>
        (t._links?.type?.title === "Annual Leave" ||
          t.subject?.toLowerCase()?.includes("leave")) &&
        new Date(t.startDate || t.start) <= weekEnd &&
        new Date(t.dueDate || t.end) >= weekStart
    );
  };

  const WEEKLY_CAPACITY_HOURS = 40;

  const calculateUtilization = (tasks, weekStart, weekEnd) => {
    if (isOnLeaveForWeek(tasks, weekStart, weekEnd)) return "LEAVE";
    
    let totalEffort = 0;
    tasks.forEach((task) => {
      totalEffort += calculateEffortThisWeek(task, weekStart, weekEnd);
    });

    return Math.round(Math.min((totalEffort / WEEKLY_CAPACITY_HOURS) * 100));
  };






  // Pagination + search
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const displayedUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleWeekNavigation = (direction) => {
    const newDate = new Date(selectedStartDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedStartDate(newDate);
  };

  return (
    <div className="util-grid">
      {loading && (
        <div className="loader-bar">
          <div className="bar"></div>
        </div>
      )}

      <div className="week-filter">
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            marginRight: 10,
            padding: "5px 10px",
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />

        <button className="navbtn" onClick={() => handleWeekNavigation(-1)}>
          <FaChevronLeft style={{ marginRight: 6, color: "#0a738e" }} /> Previous
          Weeks
        </button>

        <button
          className="navbtn"
          onClick={() => setSelectedStartDate(new Date())}
        >
          <FaCalendarDay style={{ marginRight: 6, color: "#0a738e" }} />
          Current Week
        </button>

        <button className="navbtn" onClick={() => handleWeekNavigation(1)}>
          Next Weeks <FaChevronRight style={{ marginRight: 6, color: "#0a738e" }} />
        </button>
      </div>

      <div className="grid-header">
        <div className="header-row">
          <div className="employee-cell teammember">Team Member</div>
          {days.map((day, index) => (
            <div key={index} className="month-header">
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-body">
        {displayedUsers.map((user) => {
          const isExpanded = expandedUserId === user.id;
          const tasks = tasksByUser[user.id] || [];

          const [visibleStart, visibleEnd] = [
            new Date(`${days[0]}, ${new Date().getFullYear()}`),
            new Date(`${days[days.length - 1]}, ${new Date().getFullYear()}`),
          ];
          visibleEnd.setDate(visibleEnd.getDate() + 6);

          const validTasks = tasks.filter((t) => {
            const s = new Date(t.startDate || t.start);
            const e = new Date(t.dueDate || t.end);
            return s <= visibleEnd && e >= visibleStart;
          });

          const projects = Array.from(
            validTasks.reduce((map, task) => {
              const project = task._links?.project?.title || "Unknown Project";
              if (!map.has(project)) map.set(project, []);
              map.get(project).push(task);
              return map;
            }, new Map())
          );

          return (
            <React.Fragment key={user.id}>
              {/* User row */}
              <div className="row">
                <div className="employee-cell teamname ellipsis-text">
                  <button
                    className="expand-btn"
                    onClick={() => toggleExpand(user)}
                  >
                    {isExpanded ? "−" : "+"}
                  </button>
                  {user.name}
                </div>
                {days.map((day, idx) => {
                  const [month, date] = day.split(" ");
                  const weekStart = new Date(
                    `${month} ${date}, ${new Date().getFullYear()}`
                  );
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 6);

                  const utilization = calculateUtilization(tasks, weekStart, weekEnd);

                  if (utilization === "LEAVE") {
                    return (
                      <div
                        key={idx}
                        className="month-cell"
                        style={{
                          backgroundColor: "#df6565ff",
                          color: "#fff",
                          fontWeight: 600,
                        }}
                      >
                        On Leave
                      </div>
                    );
                  }

                  return (
                    <div
                      key={idx}
                      className="month-cell"
                      style={{ backgroundColor: getCellColor(utilization) }}
                    >
                      <span className="project-percent">{utilization}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Project rows */}
              {isExpanded &&
                projects.map(([projectName, projectTasks]) => {
                  const isProjectExpanded =
                    expandedProjectsByUser[user.id]?.[projectName] || false;

                  return (
                    <React.Fragment key={projectName}>
                      <div className="row task-row">
                        <div
                          className="employee-cell teamname task-cell ellipsis-text"
                          style={{ height: "100px" }}
                        >
                          <button
                            className="expand-btn"
                            onClick={() =>
                              toggleProjectExpand(user.id, projectName)
                            }
                          >
                            {isProjectExpanded ? "−" : "+"}
                          </button>
                          Project - {projectName}
                        </div>

                        {days.map((day, idx) => {
                          const [month, date] = day.split(" ");
                          const weekStart = new Date(
                            `${month} ${date}, ${new Date().getFullYear()}`
                          );
                          const weekEnd = new Date(weekStart);
                          weekEnd.setDate(weekStart.getDate() + 6);

                          const utilization = calculateUtilization(
                            projectTasks,
                            weekStart,
                            weekEnd
                          );

                          return (
                            <div
                              key={idx}
                              className="month-cell task-cell"
                              style={{ backgroundColor: getCellColor(utilization) }}
                            >
                              {utilization > 0 && (
                                <span className="project-percent">
                                  {utilization}%
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {isProjectExpanded &&
                        projectTasks.map((task) => (
                          <div className="row task-row" key={task.id}>
                            <div className="employee-cell teamname task-cell ellipsis-text">
                              {task.subject || "No task subject"}
                            </div>
                            {days.map((day, idx) => {
                              const [month, date] = day.split(" ");
                              const weekStart = new Date(
                                `${month} ${date}, ${new Date().getFullYear()}`
                              );
                              const weekEnd = new Date(weekStart);
                              weekEnd.setDate(weekStart.getDate() + 6);

                              const effort = calculateEffortThisWeek(
                                task,
                                weekStart,
                                weekEnd
                              );
                              return (
                                <div
                                  key={idx}
                                  className="month-cell task-cell"
                                  style={{
                                    backgroundColor:
                                      effort > 0 ? "#e0f7fa" : "transparent",
                                  }}
                                >
                                  {effort > 0 && (
                                    <span className="effort-text">{effort}h</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          );
        })}
      </div>

      <div className="pagination-controls">
        <button
          className="pagbtn"
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagbtn"
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UtilizationGrid;
