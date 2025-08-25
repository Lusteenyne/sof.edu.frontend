import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarCheck,
  FaRegClock,
  FaBell,
} from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import "react-toastify/dist/ReactToastify.css";
import "./SuperAdminDashboard.css";

const SuperAdminDashboard = ({ setActiveSection }) => {
  const [adminInfo, setAdminInfo] = useState({ name: "SuperAdmin", imageUrl: "" });
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    approvedTeachers: 0,
    totalRevenue: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Session expired. Please log in again.");
       navigate("/login-superadmin");
        return;
      }

      

      try {
        const [infoRes, statsRes, notifRes] = await Promise.all([
          axios.get("https://sof-edu-backend.onrender.com/admin/info", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu-backend.onrender.com/admin/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://sof-edu-backend.onrender.com/admin/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const { data } = infoRes.data;
        const { firstName, lastName, profilePhoto } = data || {};

        const fullName = [firstName, lastName].filter(Boolean).join(" ");
        setAdminInfo({
          name: fullName || "SuperAdmin",
          imageUrl: profilePhoto || "",
        });

        setDashboardStats(statsRes.data);
        setNotifications(notifRes.data.notifications || []);

        toast.success("Dashboard loaded");
      } catch (error) {
        console.error("Dashboard error:", error);
        if (error.response?.status === 401) {
          toast.error("Unauthorized. Please log in again.");
          localStorage.removeItem("admin_token");
          return navigate("/login-superadmin");
        }
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleToggleNotifications = async () => {
    setShowNotifications((prev) => !prev);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    if (!showNotifications && notifications.length > 0) {
      try {
        await axios.patch(
          "https://sof-edu-backend.onrender.com/admin/notifications/mark-read",
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const updatedNotifications = notifications.map((n) => ({
          ...n,
          isRead: true,
        }));
        setNotifications(updatedNotifications);
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  };

  const summaryData = [
    {
      title: "Total Students",
      value: dashboardStats.totalStudents,
      icon: <FaUserGraduate />,
    },
    {
      title: "Total Teachers",
      value: dashboardStats.totalTeachers,
      icon: <FaChalkboardTeacher />,
    },
    {
      title: "Approved Teachers",
      value: dashboardStats.approvedTeachers,
      icon: <FaClipboardList />,
    },
    {
      title: "Total School Fees",
      value: `₦${Number(dashboardStats.totalRevenue || 0).toLocaleString()}`,
      icon: <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>₦</span>,
    },
    {
      title: "Attendance Today",
      value: "92%",
      icon: <FaCalendarCheck />,
    },
    {
      title: "Upcoming Exams",
      value: 6,
      icon: <FaRegClock />,
    },
  ];

  if (loading) return <LoadingSpinner message="Preparing your admin dashboard..." />;

  return (
    <div className="superadmin-dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="superadmin-header">
        <div className="superadmin-profile-pic">
          {adminInfo.imageUrl ? (
            <img
              src={adminInfo.imageUrl}
              alt="Admin"
              onError={(e) => {
                e.target.onerror = null;
                setAdminInfo((prev) => ({ ...prev, imageUrl: "" }));
              }}
            />
          ) : (
            <span>
              {adminInfo.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          )}
        </div>

        <h2>Welcome back, {adminInfo.name}</h2>

        <div className="superadmin-notification-wrapper">
          <div
            className="superadmin-notification-icon"
            title="Notifications"
            onClick={handleToggleNotifications}
          >
            <FaBell />
            {notifications.some((n) => !n.isRead) && (
              <span className="superadmin-notification-count">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="superadmin-notification-dropdown">
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
                        {notif.type.toUpperCase()}
                      </strong>
                      <p>{notif.message}</p>
                      <small>
                        {new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(notif.createdAt))}
                      </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="superadmin-summary-cards">
        {summaryData.map((item, idx) => (
          <div className="superadmin-summary-card" key={idx}>
            <div className="superadmin-summary-icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
