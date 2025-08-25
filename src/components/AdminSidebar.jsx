import React from "react";
import {
  MdDashboard,
  MdSettings,
  MdAssessment,
} from "react-icons/md";
import {
  FaUserTie,
  FaBook,
  FaUserGraduate,
  FaMoneyBill,
  FaSignOutAlt,
  FaBell,
  FaComments,
  FaBars,
  FaUserCircle,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = ({
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  activeSection,
}) => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "superDashboard", icon: <MdDashboard />, label: "Dashboard" },
    { key: "teachers", icon: <FaUserTie />, label: "Teachers" },
    { key: "students", icon: <FaUserGraduate />, label: "Students / Classes" },
    { key: "courses", icon: <FaBook />, label: "Courses" },
    { key: "billing", icon: <FaMoneyBill />, label: "Billing" },
    { key: "notifications", icon: <FaBell />, label: "Notifications" },
    { key: "profile", icon: <FaUserCircle />, label: "Profile" },
    { key: "exams", icon: <MdAssessment />, label: "Exams" },
    { key: "chat", icon: <FaComments />, label: "Chat" },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("admin_token");
      navigate("/login-superadmin");
    }
  };

  return (
    <div
      className={`admin-sidebar ${
        isSidebarOpen ? "admin-sidebar-open" : "admin-sidebar-closed"
      }`}
    >
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        <button
          className="admin-toggle-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <ul className="admin-sidebar-menu">
        {menuItems.map(({ key, icon, label }) => (
          <li
            key={key}
            onClick={() => setActiveSection(key)}
            title={label}
            className={`admin-sidebar-item ${
              activeSection === key ? "admin-sidebar-active" : ""
            }`}
          >
            <span className="admin-sidebar-icon">{icon}</span>
            <span className="admin-sidebar-label">{label}</span>
          </li>
        ))}
      </ul>

      <div className="admin-sidebar-logout" onClick={handleLogout}>
        <FaSignOutAlt className="admin-sidebar-icon" />
        <span className="admin-sidebar-label">Logout</span>
      </div>
    </div>
  );
};

export default AdminSidebar;
