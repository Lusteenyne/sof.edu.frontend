import React, { useEffect, useState } from 'react';
import './TeacherNotifications.css';
import LoadingSpinner from './LoadingSpinner'; 

function TeacherNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const token = localStorage.getItem('teacher_token');
  console.log('Teacher token:', token);
  if (!token) {
    return <p>Please log in to view notifications.</p>;
  }

  useEffect(() => {
    console.log('Fetching teacher notifications...');
    fetch('https://sof-edu-backend.onrender.com/teacher/notifications', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        console.log('Fetch response status:', res.status);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        return res.json();
      })
      .then(data => {
        console.log('Fetched notifications:', data.notifications);
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [token]);

  const markAllRead = () => {
    console.log('Marking all notifications as read...');
    setMarking(true);
    fetch('https://sof-edu-backend.onrender.com/teacher/notifications/mark-read', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        console.log('Mark read response status:', res.status);
        if (!res.ok) throw new Error('Failed to mark notifications as read');
        return res.json();
      })
      .then(() => {
        console.log('Marked notifications as read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setMarking(false);
      })
      .catch(err => {
        console.error('Mark read error:', err);
        setMarking(false);
      });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="tea-notifications-container">
      <h2>Staff Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications.</p>
      ) : (
        <>
          <button
            onClick={markAllRead}
            disabled={marking}
            className="tea-mark-read-btn"
          >
            {marking ? 'Marking...' : 'Mark All as Read'}
          </button>
          <ul className="tea-notifications-list">
            {notifications.map(({ _id, message, type, isRead, createdAt }) => (
              <li
                key={_id}
                className={`tea-notification-item ${
                  isRead ? 'tea-read' : 'tea-unread'
                } tea-${type}`}
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

export default TeacherNotifications;
