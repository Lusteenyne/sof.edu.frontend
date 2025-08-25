import React, { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentDashboard from "./StudentDashboard";
import StudentCourses from "./StudentCourses";
import StudentProfile from "./StudentProfile";
import StudentResults from "./StudentResults";
import StudentPaymentPage from "./StudentPaymentPage";
import StudentNotifications from "./StudentNotifications";
import StudentAssignment from "./StudentAssignment";
import StudentChat from "./StudentChat";

import "./StudentContainer.css";

const StudentContainer = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="student-container-wrapper">
      <StudentSidebar
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeSection={activeSection}
      />

      <div
        className={`student-main-content ${
          isSidebarOpen ? "student-main-expanded" : "student-main-collapsed"
        }`}
      >
        <div className="student-main-header">
          <h1 className="student-main-title">Student Dashboard</h1>
        </div>

        {activeSection === "dashboard" && <StudentDashboard />}
        {activeSection === "courses" && <StudentCourses />}
        {activeSection === "results" && <StudentResults />}
        {activeSection === "profile" && <StudentProfile />}
        {activeSection === "payment" && <StudentPaymentPage />}
        {activeSection === "notifications" && <StudentNotifications />}
        {activeSection === "assignments" && <StudentAssignment />}
        {activeSection === "chat" && <StudentChat />}
        {activeSection === "support" && <div>Support Center</div>}
      </div>
    </div>
  );
};

export default StudentContainer;
