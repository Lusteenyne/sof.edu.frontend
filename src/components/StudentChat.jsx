import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import "./StudentChat.css";

const StudentChat = () => {
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isAdminChat, setIsAdminChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false); 
  const [dropdownVisibleId, setDropdownVisibleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ admin: 0, teachers: {} });
  const [editingMessageId, setEditingMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("student_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login-student");
    fetchTeachers();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    if (selectedTeacher && !isAdminChat) {
      fetchMessagesWithTeacher(selectedTeacher._id);
    }
  }, [selectedTeacher]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatDateLabel = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isSameDay = (d1, d2) =>
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    if (isSameDay(date, now)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString(undefined, { weekday: "long" });
    }

    return date.toLocaleDateString();
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const res = await axios.get("https://sof-edu.onrender.com/student/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data || []);
    } catch (err) {
      console.error("Error fetching teachers:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get(
        "https://sof-edu.onrender.com/student/messages/unread-counts",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnreadCounts(res.data);
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  const fetchMessagesWithTeacher = async (teacherId) => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await axios.get(
        `https://sof-edu.onrender.com/student/messages/teacher?teacherId=${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formatted = res.data.map((msg) => ({
        ...msg,
        sender: msg.sender?.startsWith("Student")
          ? "You"
          : `${selectedTeacher.title} ${selectedTeacher.firstName} ${selectedTeacher.lastName}`,
        bubbleType: msg.sender?.startsWith("Student") ? "student" : "teacher",
        isRead: msg.isRead,
      }));
      setMessages(formatted);
      fetchUnreadCounts();
    } catch (err) {
      console.error("Error fetching teacher messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesWithAdmin = async () => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await axios.get("https://sof-edu.onrender.com/student/messages/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map((msg) => ({
        ...msg,
        sender: msg.sender?.startsWith("Student") ? "You" : "Admin",
        bubbleType: msg.sender?.startsWith("Student") ? "student" : "admin",
        isRead: msg.isRead,
      }));
      setMessages(formatted);
      fetchUnreadCounts();
    } catch (err) {
      console.error("Error fetching admin messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
  if (!text.trim()) return;

  setSending(true);

  const tempId = Date.now();
  const messageText = text;

  setText("");

  // Show temporary message bubble with real text
  setMessages((prev) => [
    ...prev,
    {
      _id: tempId,
      sender: "Me", 
      text: "Sending...",
      timestamp: new Date().toISOString(),
      isTemp: true,
      bubbleType: "student",
    },
  ]);

  try {
    const url = isAdminChat
      ? "https://sof-edu.onrender.com/student/messages/admin"
      : "https://sof-edu.onrender.com/student/messages/teacher";

    const payload = isAdminChat
      ? { text: messageText }
      : { teacherId: selectedTeacher._id, text: messageText };

    await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Refresh the conversation with latest messages
    if (isAdminChat) fetchMessagesWithAdmin();
    else fetchMessagesWithTeacher(selectedTeacher._id);

  } catch (err) {
    console.error("Error sending message:", err);

    
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === tempId ? { ...msg, text: `${messageText} (failed)` } : msg
      )
    );
  } finally {
    setSending(false);
  }
};


  const handleUpdateMessage = async () => {
    if (!text.trim() || !editingMessageId) return;
    setSending(true);
    try {
      await axios.put(
        `https://sof-edu.onrender.com/student/editMessage/${editingMessageId}`,
        { newText: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (isAdminChat) fetchMessagesWithAdmin();
      else fetchMessagesWithTeacher(selectedTeacher._id);

      setText("");
      setEditingMessageId(null);
    } catch (err) {
      console.error("Error updating message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await axios.delete(`https://sof-edu.onrender.com/student/deleteMessage/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isAdminChat) fetchMessagesWithAdmin();
      else fetchMessagesWithTeacher(selectedTeacher._id);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const groupedTeachers = teachers.reduce((acc, teacher) => {
    const group = teacher.department || "Unknown Dept";
    if (!acc[group]) acc[group] = [];
    acc[group].push(teacher);
    return acc;
  }, {});

  return (
    <div className="student-chat-container">
      <div className="student-chat-sidebar">
        <h3>Chat Options</h3>
        <input
          className="student-chat-search"
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />

        <div
          className={`student-chat-user-item ${isAdminChat ? "selected" : ""}`}
          onClick={() => {
            setIsAdminChat(true);
            setSelectedTeacher(null);
            setText("");
            fetchMessagesWithAdmin();
          }}
        >
          <div className="chat-user-name">
            Admin
            {unreadCounts.admin > 0 && (
              <span className="unread-badge">{unreadCounts.admin}</span>
            )}
          </div>
        </div>

        {loadingTeachers ? (
          <div className="spinner-container">
            <ClipLoader size={35} color="#3b82f6" />
          </div>
        ) : teachers.length === 0 ? (
          <p className="no-teachers">No teachers found for your enrolled courses.</p>
        ) : (
          Object.entries(groupedTeachers).map(([group, teacherList]) => (
            <div key={group}>
              <div
                className="student-user-group-header"
                onClick={() =>
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [group]: !prev[group],
                  }))
                }
              >
                {group} {expandedGroups[group] ? "▲" : "▼"}
              </div>
              {expandedGroups[group] &&
                teacherList
                  .filter((t) =>
                    `${t.title} ${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm)
                  )
                  .map((teacher) => (
                    <div
                      key={teacher._id}
                      className={`student-chat-user-item ${
                        selectedTeacher?._id === teacher._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setIsAdminChat(false);
                        setSelectedTeacher(teacher);
                        setText("");
                        fetchMessagesWithTeacher(teacher._id);
                      }}
                    >
                      <div className="chat-user-name">
                        {teacher.title} {teacher.firstName} {teacher.lastName}
                        {unreadCounts.teachers?.[teacher._id] > 0 && (
                          <span className="unread-badge">
                            {unreadCounts.teachers[teacher._id]}
                          </span>
                        )}
                      </div>
                      <div className="chat-user-subtext">
                        <small>
                          {teacher.assignedCourses?.length > 0
                            ? teacher.assignedCourses
                                .map((c) => c.code || c.title || "Untitled")
                                .join(", ")
                            : "No courses assigned"}
                        </small>
                      </div>
                    </div>
                  ))}
            </div>
          ))
        )}
      </div>

      <div className="student-chat-main">
        <div className="student-chat-header">
          <h4>
            {isAdminChat
              ? "Chat with Admin"
              : selectedTeacher
              ? `Chat with ${selectedTeacher.title} ${selectedTeacher.firstName} ${selectedTeacher.lastName}`
              : "Select a chat"}
          </h4>
        </div>

        <div className="student-chat-messages">
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            Object.entries(
              messages.reduce((acc, msg) => {
                const label = formatDateLabel(msg.timestamp);
                acc[label] = acc[label] || [];
                acc[label].push(msg);
                return acc;
              }, {})
            ).map(([label, msgs]) => (
              <div key={label}>
                <div className="date-label">{label}</div>
                {msgs.map((msg) => (
                  <div
                    key={msg._id}
                    className={`student-chat-bubble ${msg.bubbleType} ${
                      msg.isRead === false && msg.bubbleType !== "student" ? "unread" : ""
                    }`}
                  >
                    <div className="student-chat-meta">
                      {msg.sender} –{" "}
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="student-chat-text">{msg.text}</div>

                    {msg.bubbleType === "student" && (
                      <div className="student-chat-actions">
                        <FaEye
                          className="dropdown-icon"
                          onClick={() =>
                            setDropdownVisibleId(
                              dropdownVisibleId === msg._id ? null : msg._id
                            )
                          }
                        />
                        {dropdownVisibleId === msg._id && (
                          <div className="dropdown-menu">
                            <button
                              onClick={() => {
                                setText(msg.text);
                                setEditingMessageId(msg._id);
                                setDropdownVisibleId(null);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="delete"
                              onClick={() => {
                                handleDeleteMessage(msg._id);
                                setDropdownVisibleId(null);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {(selectedTeacher || isAdminChat) && (
          <div className="student-chat-input-area">
            <input
              type="text"
              value={text}
              placeholder="Type a message..."
              onChange={(e) => setText(e.target.value)}
              disabled={sending}
            />
            {editingMessageId ? (
              <>
                <button onClick={handleUpdateMessage} disabled={sending}>
                  {sending ? <ClipLoader size={14} color="#fff" /> : "Update"}
                </button>
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setText("");
                  }}
                  disabled={sending}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={handleSend} disabled={sending}>
                {sending ? <ClipLoader size={14} color="#fff" /> : "Send"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentChat;
