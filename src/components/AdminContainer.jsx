import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import SuperAdminDashboard from "./SuperAdminDashboard";
import SuperAdminTeachers from "./SuperAdminTeachers";
import SuperAdminStudents from "./SuperAdminStudents";
import SuperAdminCourses from "./SuperAdminCourses";
import SuperAdminProfile from "./SuperAdminProfile";
import SuperAdminBilling from "./SuperAdminBilling";
import SuperAdminNotification from "./SuperAdminNotifications";
import AdminChat from "./AdminChat";

import "./AdminContainer.css";

const AdminContainer = () => {
  const [activeSection, setActiveSection] = useState("superDashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="admin-container-wrapper">
      {/* Sidebar */}
      <AdminSidebar
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeSection={activeSection}
      />

      {/* Main Content */}
      <div
        className={`admin-main-content ${
          isSidebarOpen ? "admin-main-expanded" : "admin-main-collapsed"
        }`}
      >
        {/* Page Header */}
        <div className="admin-main-header">
          <h1 className="admin-main-title">Admin Dashboard</h1>
        </div>

        {/* Section Rendering */}
        {activeSection === "superDashboard" && (
          <SuperAdminDashboard setActiveSection={setActiveSection} />
        )}
        {activeSection === "teachers" && <SuperAdminTeachers />}
        {activeSection === "students" && <SuperAdminStudents />}
        {activeSection === "courses" && <SuperAdminCourses />}
        {activeSection === "billing" && <SuperAdminBilling />}
        {activeSection === "profile" && <SuperAdminProfile />}
        {activeSection === "notifications" && <SuperAdminNotification />}
        {activeSection === "exams" && <div>Exam Management</div>}
        {activeSection === "chat" && <AdminChat />}
      </div>
    </div>
  );
};

export default AdminContainer;
