import React, { useEffect, useState } from 'react';
import './SuperAdminNotifications.css';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

function SuperAdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const token = localStorage.getItem('admin_token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login-superadmin');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/admin/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch notifications');

        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, navigate]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/admin/notifications/mark-read', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to mark notifications as read');

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarking(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="san-notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <>
          <button
            onClick={markAllRead}
            disabled={marking}
            className="san-mark-read-btn"
          >
            {marking ? 'Marking...' : 'Mark All as Read'}
          </button>
          <ul className="san-notifications-list">
            {notifications.map(({ _id, message, type, isRead, createdAt }) => (
              <li
                key={_id}
                className={`san-notification-item ${isRead ? 'san-read' : 'san-unread'} san-${type}`}
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

export default SuperAdminNotifications;
