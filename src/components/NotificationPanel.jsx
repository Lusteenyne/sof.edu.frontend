import React from "react";
import "./NotificationPanel.css";

const mockNotifications = [
  { id: 1, message: "New teacher registered: Mr. Smith", time: "2 mins ago", read: false },
  { id: 2, message: "Exam scheduled: Math - Class 10", time: "10 mins ago", read: false },
  { id: 3, message: "System login failed: Unknown IP", time: "30 mins ago", read: true },
  { id: 4, message: "Student joined: Sarah Johnson", time: "1 hour ago", read: false },
];

const NotificationPanel = () => {
  return (
    <div className="notif-panel">
      <h3 className="notif-title">Notifications</h3>
      <ul className="notif-list">
        {mockNotifications.map((notif) => (
          <li
            key={notif.id}
            className={`notif-item ${notif.read ? "read" : "unread"}`}
          >
            <p>{notif.message}</p>
            <span className="notif-time">{notif.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationPanel;
