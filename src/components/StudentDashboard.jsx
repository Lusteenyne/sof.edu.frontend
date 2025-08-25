import React, { useEffect, useState } from "react";
import {
  FaBook,
  FaClipboardList,
  FaCalendarAlt,
  FaBell,
  FaUser,
  FaChartLine,
  FaIdBadge,
  FaBuilding,
  FaGraduationCap,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner"; 
import "react-toastify/dist/ReactToastify.css";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    imageUrl: "",
    studentId: "",
    department: "",
    level: "",
    cgpa: "",
    paymentStatus: "",
  });

  const [dashboardStats, setDashboardStats] = useState({
    enrolledCourses: 0,
    completedExams: 0,
    upcomingExams: 0,
    attendance: "",
    performanceScore: "",
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true); 

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      const token = localStorage.getItem("student_token");

      if (!token) {
        toast.error("Session expired. Please log in again.");
        navigate("/login-student");
        return ;
      }



      try {
        const [infoRes, statsRes, notifRes] = await Promise.all([
          axios.get("https://sof-edu-backend.onrender.com/student/info", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu-backend.onrender.com/student/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu-backend.onrender.com/student/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const {
          fullName,
          profilepic,
          studentId,
          department,
          level,
          cgpa,
          paymentStatus,
        } = infoRes.data;

        setStudentInfo({
          name: fullName || "Student",
          imageUrl: profilepic || "",
          studentId,
          department,
          level,
          cgpa,
          paymentStatus,
        });

        setDashboardStats(statsRes.data);
        setNotifications(notifRes.data.notifications || []);

        toast.success("Dashboard loaded");
      } catch (error) {
        console.error("Dashboard error:", error);
        if (error.response?.status === 401) {
          toast.error("Unauthorized. Please log in again.");
          localStorage.removeItem("student_token");
          return navigate("/login-student");
        }
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false); 
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleToggleNotifications = async () => {
    setShowNotifications((prev) => !prev);

    const token = localStorage.getItem("student_token");
    if (!token) return;

    if (!showNotifications && notifications.some((n) => !n.isRead)) {
      try {
        await axios.patch(
          "https://sof-edu-backend.onrender.com/student/notifications/mark-read",
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  const summaryData = [
    { title: "Enrolled Courses", value: dashboardStats.enrolledCourses, icon: <FaBook /> },
    { title: "Matric Number", value: studentInfo.studentId, icon: <FaIdBadge /> },
    { title: "Level", value: studentInfo.level, icon: <FaGraduationCap /> },
    { title: "Current CGPA", value: studentInfo.cgpa || "N/A", icon: <FaChartLine /> },
    { title: "Department", value: studentInfo.department, icon: <FaBuilding /> },
    {
      title: "Payment Status",
      value: (
        <span
          style={{
            color:
              studentInfo.paymentStatus === "Paid"
                ? "green"
                : studentInfo.paymentStatus === "Overdue"
                ? "red"
                : "orange",
            fontWeight: "bold",
          }}
        >
          {studentInfo.paymentStatus || "Pending"}
        </span>
      ),
      icon: <FaIdBadge />,
    },
  ];

  
  if (loading) return <LoadingSpinner message="Preparing your student dashboard..." />;

  return (
    <div className="student-dashboard">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header */}
      <div className="student-header">
        <div className="profile-pic">
          {studentInfo.imageUrl ? (
            <img src={studentInfo.imageUrl} alt="Student" />
          ) : (
            <span>
              {studentInfo.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>

        <h2>Welcome back, {studentInfo.name}</h2>

        <div className="notification-wrapper">
          <div
            className="notification-icon"
            title="Notifications"
            onClick={handleToggleNotifications}
          >
            <FaBell />
            {notifications.some((n) => !n.isRead) && (
              <span className="notification-count">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <p>No notifications</p>
              ) : (
                <ul>
                  {notifications.map((notif, i) => (
                    <li key={i}>
                      <strong
                        style={{
                          color:
                            notif.type === "success"
                              ? "green"
                              : notif.type === "warning"
                              ? "orange"
                              : "blue",
                        }}
                      >
                        {notif.type?.toUpperCase() || "INFO"}
                      </strong>
                      <p>{notif.message || "No message"}</p>
                      <small>
                        {notif.createdAt
                          ? new Intl.DateTimeFormat("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(notif.createdAt))
                          : "Unknown time"}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards with Student Info */}
      <div className="summary-cards">
        {summaryData.map((item, idx) => (
          <div className="summary-card" key={idx}>
            <div className="summary-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
