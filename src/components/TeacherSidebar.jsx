import React from "react";
import {
  MdDashboard,
} from "react-icons/md";
import {
  FaUserCircle,
  FaChalkboardTeacher,
  FaClipboardList,
  FaBell,
  FaComments,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./TeacherSidebar.css";

const TeacherSidebar = ({
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "myDashboard", icon: <MdDashboard />, label: "Dashboard" },
    { key: "myProfile", icon: <FaUserCircle />, label: "My Profile" },
    { key: "myClasses", icon: <FaChalkboardTeacher />, label: "My Classes" },
    { key: "myNotifications", icon: <FaBell />, label: "Notifications" },
    { key: "myAssignment", icon: <FaClipboardList />, label: "Assignments" },
    { key: "chat", icon: <FaComments />, label: "Chat" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("teacher_token");
      navigate("/login-teacher");
    }
  };

  return (
    <div
      className={`teacher-sidebar ${
        isSidebarOpen ? "teacher-sidebar-open" : "teacher-sidebar-closed"
      }`}
    >
      {/* Sidebar Header */}
      <div className="teacher-sidebar-header">
        <h2 className="teacher-sidebar-title">Staff Panel</h2>
        <button
          className="teacher-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="teacher-sidebar-menu">
        {menuItems.map(({ key, icon, label }) => (
          <li
            key={key}
            onClick={() => setActiveSection(key)}
            title={label}
            className={`teacher-sidebar-item ${
              activeSection === key ? "teacher-sidebar-active" : ""
            }`}
          >
            <span className="teacher-sidebar-icon">{icon}</span>
            <span className="teacher-sidebar-label">{label}</span>
          </li>
        ))}
      </ul>

      {/* Logout Section */}
      <div className="teacher-sidebar-logout" onClick={handleLogout}>
        <FaSignOutAlt className="teacher-sidebar-icon" />
        <span className="teacher-sidebar-label">Logout</span>
      </div>
    </div>
  );
};

export default TeacherSidebar;
