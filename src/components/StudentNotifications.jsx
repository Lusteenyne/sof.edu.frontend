import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './StudentNotifications.css';
import LoadingSpinner from './LoadingSpinner';

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('student_token');
    if (!token) {
      navigate('/login-student'); 
      return;
    }

    fetch('https://sof-edu-backend.onrender.com/student/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      })
      .then(data => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [navigate]);

  const markAllRead = () => {
    const token = localStorage.getItem('student_token');
    if (!token) {
      navigate('/student/login');
      return;
    }

    setMarking(true);
    fetch('https://sof-edu-backend.onrender.com/student/notifications/mark-read', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to mark notifications as read');
        return res.json();
      })
      .then(() => {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setMarking(false);
      })
      .catch(err => {
        console.error(err);
        setMarking(false);
      });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="stu-notifications-container">
      <h2>Student Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <>
          <button
            onClick={markAllRead}
            disabled={marking}
            className="stu-mark-read-btn"
          >
            {marking ? 'Marking...' : 'Mark All as Read'}
          </button>
          <ul className="stu-notifications-list">
            {notifications.map(({ _id, message, type, isRead, createdAt }) => (
              <li
                key={_id}
                className={`stu-notification-item ${isRead ? 'stu-read' : 'stu-unread'} stu-${type}`}
              >
                <p>{message}</p>
                <small>{new Date(createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default StudentNotifications;
