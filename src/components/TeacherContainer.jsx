import React, { useState } from "react";
import TeacherSidebar from "./TeacherSidebar";
import TeacherDashboard from "./TeacherDashboard";
import TeacherProfile from "./TeacherProfile";
import TeacherClasses from "./TeacherClasses";
import TeacherNotifications from "./TeacherNotifications";
import TeacherAssignment from "./TeacherAssignment";
import TeacherChat from "./TeacherChat";
import "./TeacherContainer.css";

const TeacherContainer = () => {
  const [activeSection, setActiveSection] = useState("myDashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="teacher-container-wrapper">
      <TeacherSidebar
        setActiveSection={setActiveSection}
        activeSection={activeSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div
        className={`teacher-main-content ${
          isSidebarOpen ? "teacher-main-expanded" : "teacher-main-collapsed"
        }`}
      >
        <div className="teacher-main-header">
          <h1 className="teacher-main-title">Staff Dashboard</h1>
        </div>

        {activeSection === "myDashboard" && (
          <TeacherDashboard setActiveSection={setActiveSection} />
        )}
        {activeSection === "myProfile" && <TeacherProfile />}
        {activeSection === "myClasses" && <TeacherClasses />}
        {activeSection === "myNotifications" && <TeacherNotifications />}
        {activeSection === "myAssignment" && <TeacherAssignment />}
        {activeSection === "chat" && <TeacherChat />}
        {activeSection === "settings" && <div>Settings</div>}
        {activeSection === "exams" && <div>Exam Center</div>}
      </div>
    </div>
  );
};

export default TeacherContainer;
