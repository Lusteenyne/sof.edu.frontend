import React from "react";
import {
  MdDashboard,
  MdSettings,

  MdAssessment,
  MdSupport,
} from "react-icons/md";
import {
  FaBook,
  FaBell,
  FaMoneyBill,
  FaUserCircle,
  FaSignOutAlt,
  FaComment,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

const StudentSidebar = ({
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "dashboard", icon: <MdDashboard />, label: "My Dashboard" },
    { key: "courses", icon: <FaBook />, label: "My Courses" },
    { key: "results", icon: <MdAssessment />, label: "My Results" },
    { key: "notifications", icon: <FaBell />, label: "Notifications" },
    { key: "payment", icon: <FaMoneyBill />, label: "My Payment" },
    { key: "profile", icon: <FaUserCircle />, label: "My Profile" },
    { key: "assignments", icon: <FaBook />, label: "Assignments" },
  
    { key: "chat", icon: <FaComment />, label: "Chat" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("student_token");
      navigate("/login-student");
    }
  };

  return (
    <div
      className={`student-sidebar ${
        isSidebarOpen ? "student-sidebar-open" : "student-sidebar-closed"
      }`}
    >
      {/* Sidebar Header */}
      <div className="student-sidebar-header">
        <h2 className="student-sidebar-title">Student Panel</h2>
        <button
          className="student-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="student-sidebar-menu">
        {menuItems.map(({ key, icon, label }) => (
          <li
            key={key}
            onClick={() => setActiveSection(key)}
            title={label}
            className={`student-sidebar-item ${
              activeSection === key ? "student-sidebar-active" : ""
            }`}
          >
            <span className="student-sidebar-icon">{icon}</span>
            <span className="student-sidebar-label">{label}</span>
          </li>
        ))}
      </ul>

      {/* Logout Section */}
      <div className="student-sidebar-logout" onClick={handleLogout}>
        <FaSignOutAlt className="student-sidebar-icon" />
        <span className="student-sidebar-label">Logout</span>
      </div>
    </div>
  );
};

export default StudentSidebar;
