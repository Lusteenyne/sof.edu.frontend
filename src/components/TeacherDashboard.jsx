import React, { useEffect, useState, useRef } from "react";
import {
  FaChalkboardTeacher,
  FaBell,
  FaUserGraduate,
  FaIdBadge,
  FaBuilding,
  FaFileAlt,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "react-toastify/dist/ReactToastify.css";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [teacherInfo, setTeacherInfo] = useState({
    name: "Teacher",
    imageUrl: "",
    teacherId: "",
    department: "",
  });
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    submittedAssignments: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("teacher_token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login-teacher");
        return;
      }

      try {
        const [infoRes, statsRes, notifRes, submissionsRes] = await Promise.all([
          axios.get("https://sof-edu.onrender.com/teacher/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu.onrender.com/teacher/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu.onrender.com/teacher/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu.onrender.com/teacher/assignments/submissions/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { title, firstName, lastName, profilePhoto, teacherId, department } =
          infoRes.data;

        setTeacherInfo({
          name: `${title || ""} ${firstName || ""} ${lastName || ""}`.trim(),
          imageUrl: profilePhoto || "",
          teacherId: teacherId || "N/A",
          department: department || "N/A",
        });

        setStats({
          totalClasses: statsRes.data.totalClasses ?? 0,
          totalStudents: statsRes.data.totalStudents ?? 0,
          submittedAssignments: submissionsRes.data.submissions?.length || 0,
        });

        setNotifications(notifRes.data.notifications || []);
      } catch (error) {
        console.error("Dashboard error:", error);
        if ([401, 403].includes(error.response?.status)) {
          toast.error("Unauthorized. Please log in again.");
          localStorage.removeItem("teacher_token");
          navigate("/login-teacher");
        } else {
          toast.error("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleToggleNotifications = async () => {
    setShowNotifications((prev) => !prev);
    const token = localStorage.getItem("teacher_token");
    if (!token) return;

    if (!debounceRef.current && notifications.some((n) => !n.isRead)) {
      debounceRef.current = true;
      try {
        await axios.patch(
          "https://sof-edu.onrender.com/teacher/notifications/mark-read",
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {
        toast.error("Failed to update notifications");
      } finally {
        setTimeout(() => {
          debounceRef.current = false;
        }, 1000);
      }
    }
  };

  const getInitials = (name) =>
    name && typeof name === "string"
      ? name
          .split(" ")
          .slice(0, 2)
          .map((n) => n.charAt(0))
          .join("")
          .toUpperCase()
      : "T";

  const summaryData = [
    { title: "Total Classes", value: stats.totalClasses, icon: <FaChalkboardTeacher /> },
    { title: "Total Students", value: stats.totalStudents, icon: <FaUserGraduate /> },
    { title: "Staff ID", value: teacherInfo.teacherId, icon: <FaIdBadge /> },
    { title: "Department", value: teacherInfo.department, icon: <FaBuilding /> },
    {
      title: "Submitted Assignments",
      value: stats.submittedAssignments,
      icon: <FaFileAlt />,
    },
  ];

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div className="teacher-dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="teacher-dashboard-header">
        <div className="teacher-dashboard-profile">
          <div className="teacher-dashboard-pic">
            {teacherInfo.imageUrl ? (
              <img src={teacherInfo.imageUrl} alt="Teacher" />
            ) : (
              <span>{getInitials(teacherInfo.name)}</span>
            )}
          </div>
          <div className="teacher-dashboard-name">
            Welcome, {teacherInfo.name}
          </div>
        </div>

        <div className="teacher-dashboard-notification-wrapper">
          <div className="teacher-dashboard-notification-icon" onClick={handleToggleNotifications}>
            <FaBell />
            {notifications.some((n) => !n.isRead) && (
              <span className="teacher-dashboard-notification-count">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="teacher-dashboard-notification-dropdown">
              {notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <ul>
                  {notifications.map((notif, i) => (
                    <li key={i} className={notif.isRead ? "" : "unread"}>
                      <strong style={{ color: notif.type === "error" ? "red" : notif.type === "success" ? "green" : "blue" }}>
                        {notif.type?.toUpperCase() || "INFO"}
                      </strong>
                      <p>{notif.message}</p>
                      <small>{new Date(notif.createdAt).toLocaleString()}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="teacher-dashboard-cards">
        {summaryData.map((card, idx) => (
          <div className="teacher-dashboard-card" key={idx}>
            <div className="teacher-dashboard-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
