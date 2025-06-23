import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUsersList } from '../Services/userService';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './styles.css';

const UtilizationGrid = () => {
  const [users, setUsers] = useState([]);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [tasksByUser, setTasksByUser] = useState({});
  const [days, setDays] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    generateWeekStartDates(selectedStartDate);
  }, [selectedStartDate]);

  const generateWeekStartDates = (startDate) => {
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let i = -6; i <= 6; i++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() + i * 7);
      const options = { month: 'short', day: 'numeric' };
      weeks.push(weekStart.toLocaleDateString('en-US', options));
    }
    setDays(weeks);
  };

  useEffect(() => {
    getUsersList()
      .then(setUsers)
      .catch(err => console.error('Error loading users:', err));
  }, []);

  useEffect(() => {
    const fetchTasksForVisibleUsers = async () => {
      const indexOfLastUser = currentPage * usersPerPage;
      const indexOfFirstUser = indexOfLastUser - usersPerPage;
      const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

      for (const user of currentUsers) {
        if (!tasksByUser[user.id]) {
          const tasks = await fetchTasksForUser(user.id);
          setTasksByUser(prev => ({ ...prev, [user.id]: tasks }));
        }
      }
    };

    if (users.length) fetchTasksForVisibleUsers();
  }, [users, currentPage]);

  const API_KEY = 'apikey';
  const PASSWORD = '0b78127b3361cb3c7186fdc1b23bc152f905108d70a6c3e65761a86117557a5a';
  const authHeader = 'Basic ' + btoa(`${API_KEY}:${PASSWORD}`);

  const fetchTasksForUser = async (userId) => {
    const url = `/api/v3/work_packages?filters=[{"assignee":{"operator":"=","values":["${userId}"]}}]`;
    try {
      const res = await axios.get(url, { headers: { Authorization: authHeader } });
      return res.data._embedded?.elements || [];
    } catch (error) {
      console.error(`Error fetching tasks for user ${userId}:`, error.message);
      return [];
    }
  };

  const toggleExpand = async (user) => {
    const isExpanding = expandedUserId !== user.id;
    setExpandedUserId(isExpanding ? user.id : null);

    if (isExpanding && !tasksByUser[user.id]) {
      const tasks = await fetchTasksForUser(user.id);
      setTasksByUser(prev => ({ ...prev, [user.id]: tasks }));
    }
  };

  const getCellColor = (percent) => {
    if (percent >= 100) return '#4caf5073';
    if (percent >= 50) return '#79bcf578';
    if (percent >= 10) return '#ffeb3b66';
    return '#ea57956b';
  };

  const getWorkingDays = (start, end) => {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const parseISO8601DurationToHours = (duration) => {
    const match = duration.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);
    if (!match) return 0;
    const days = parseInt(match[1]) || 0;
    const hours = parseInt(match[2]) || 0;
    const minutes = parseInt(match[3]) || 0;
    return days * 8 + hours + minutes / 60;
  };

  const calculateEffortThisWeek = (task, weekStart, weekEnd) => {
    const startDate = new Date(task.startDate || task.start);
    const endDate = new Date(task.dueDate || task.end);

    const estimatedHours = typeof task.estimatedTime === 'string'
      ? parseISO8601DurationToHours(task.estimatedTime)
      : task.estimatedTime || 0;

    if (startDate > weekEnd || endDate < weekStart || !estimatedHours) return 0;

    const totalWorkingDays = getWorkingDays(startDate, endDate);
    if (totalWorkingDays === 0) return 0;

    const overlapStart = new Date(Math.max(startDate, weekStart));
    const overlapEnd = new Date(Math.min(endDate, weekEnd));
    const overlapDays = getWorkingDays(overlapStart, overlapEnd);

    const effort = ((estimatedHours / totalWorkingDays) * overlapDays).toFixed(1);
    return parseFloat(effort);
  };

  const mapTasksToWeeks = (tasks) => {
    const weekMap = {};
    days.forEach(day => (weekMap[day] = []));

    tasks.forEach(task => {
      const start = new Date(task.startDate || task.start);
      const end = new Date(task.dueDate || task.end);

      days.forEach(day => {
        const [month, date] = day.split(' ');
        const weekStart = new Date(`${month} ${date}, ${new Date().getFullYear()}`);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        if ((start <= weekEnd && end >= weekStart)) {
          weekMap[day].push(task);
        }
      });
    });

    return weekMap;
  };

  const calculateUtilization = (userId, day) => {
    const tasks = tasksByUser[userId] || [];
    const weekMap = mapTasksToWeeks(tasks);
    const count = weekMap[day]?.length || 0;
    const percent = Math.min((count / 5) * 100, 100);
    return Math.round(percent);
  };
   


  //pagination 
  
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const currentPageNavigation = ()=>{

    if(currentPage !== 0)
      setCurrentPage(1) 
  }

  const handleWeekNavigation = (direction) => {
    const newDate = new Date(selectedStartDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setSelectedStartDate(newDate);
  };

  return (
    <div className="util-grid">
      <div className="week-filter">
        <button className="navbtn" onClick={() => handleWeekNavigation(-1)}><FaChevronLeft className="nav-icon" style={{ marginRight: 6, color: '#0a738e' }} /> <span>Previous Weeks</span></button>
            
        <button className="navbtn" onClick={() => handleWeekNavigation(1)}><span>Next Weeks</span> <FaChevronRight style={{ marginRight: 6, color: '#0a738e' }} /></button>
        <div className="legend">
          <span className="legend-item" style={{ backgroundColor: '#4caf5073' }}>100%+</span>
          <span className="legend-item" style={{ backgroundColor: '#79bcf578' }}>50–99%</span>
          <span className="legend-item" style={{ backgroundColor: '#ffeb3b66' }}>10–49%</span>
          <span className="legend-item" style={{ backgroundColor: '#ea57956b' }}>0–9%</span>
        </div>
      </div>

      <div className="grid-header">
        <div className="header-row">
          <div className="employee-cell teammember">Team Member</div>
          {days.map((day, index) => (
            <div key={index} className="month-header">{day}</div>
          ))}
        </div>
      </div>

      <div className="grid-body">
        {currentUsers.map(user => {
          const isExpanded = expandedUserId === user.id;
          const tasks = tasksByUser[user.id] || [];
          const weekMap = mapTasksToWeeks(tasks);

          const taskRows = isExpanded
            ? tasks.map(task => {
              const taskWeeks = days.filter(day =>
                weekMap[day]?.some(t => t.id === task.id)
              );
              return taskWeeks.length > 0 ? { task, taskWeeks } : null;
            }).filter(Boolean)
            : [];

          return (
            <React.Fragment key={user.id}>
              <div className="row">
                <div className="employee-cell teamname">
                  <button className="expand-btn" onClick={() => toggleExpand(user)}>
                    {isExpanded ? '−' : '+'}
                  </button>
                  {user.name}
                </div>
                {days.map((day, idx) => {
                  const percent = calculateUtilization(user.id, day);
                  return (
                    <div
                      key={idx}
                      className="month-cell"
                      style={{ backgroundColor: getCellColor(percent) }}
                    >
                      <span className="project-percent">{percent}%</span>
                    </div>
                  );
                })}
              </div>

              {isExpanded && taskRows.map(({ task, taskWeeks }) => (
                <div className="row task-row" key={task.id}>
                  <div className="employee-cell teamname task-cell">
                    <small>{task.subject}</small>
                  </div>
                  {days.map((day, idx) => {
                    const [month, date] = day.split(' ');
                    const weekStart = new Date(`${month} ${date}, ${new Date().getFullYear()}`);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);

                    const effort = calculateEffortThisWeek(task, weekStart, weekEnd);
                    return (
                      <div
                        key={idx}
                        className="month-cell task-cell"
                        style={{ backgroundColor: effort > 0 ? '#e0f7fa' : 'transparent' }}
                      >
                        {effort > 0 && <span className="effort-text">{effort}h</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>

      <div className="pagination-controls">
        <button className="pagbtn" onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span style={{ margin: '0 10px' }}>Page {currentPage} of {totalPages}</span>
       
        <button className="pagbtn" onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
        
      </div>
    </div>
  );
};

export default UtilizationGrid;
