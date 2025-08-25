import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeacherChat.css";
import { ClipLoader } from "react-spinners";
import { FaEye } from "react-icons/fa";

const TeacherChat = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAdminChat, setIsAdminChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dropdownVisibleId, setDropdownVisibleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ admin: 0, students: {} });
  const [editingMessageId, setEditingMessageId] = useState(null);

  const token = localStorage.getItem("teacher_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login-teacher");
      return;
    }
    fetchStudents();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    if (selectedStudent && !isAdminChat) {
      fetchMessagesWithStudent(selectedStudent._id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5003/teacher/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const studentsArray = res.data.students;
      setStudents(Array.isArray(studentsArray) ? studentsArray : []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await axios.get("http://localhost:5003/teacher/unread-counts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCounts(res.data);
    } catch (err) {
      console.error("Error fetching unread counts:", err);
    }
  };

  const fetchMessagesWithStudent = async (studentId) => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await axios.get(
        `http://localhost:5003/teacher/messages/student?studentId=${studentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formatted = res.data.map((msg) => {
        let senderLabel = "Unknown";
        let bubbleType = "student";

        if (msg.sender?.startsWith("Teacher")) {
          senderLabel = "You";
          bubbleType = "teacher";
        } else if (msg.sender?.startsWith("Student")) {
          if (msg.studentId && typeof msg.studentId === "object" && msg.studentId.firstname) {
            senderLabel = `${msg.studentId.firstname} ${msg.studentId.lastname}`;
          } else if (selectedStudent && selectedStudent.firstname) {
            senderLabel = `${selectedStudent.firstname} ${selectedStudent.lastname}`;
          } else {
            senderLabel = "Student";
          }
          bubbleType = "student";
        }
        return { ...msg, sender: senderLabel, bubbleType };
      });
      setMessages(formatted);
      fetchUnreadCounts();
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesWithAdmin = async () => {
    setLoading(true);
    setMessages([]);
    try {
      const res = await axios.get("http://localhost:5003/teacher/messages/admin-thread", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formatted = res.data.map((msg) => {
        let senderLabel = msg.sender === "Admin" ? "Admin" : "You";
        let bubbleType = msg.sender === "Admin" ? "admin" : "teacher";
        return { ...msg, sender: senderLabel, bubbleType };
      });
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

  

  setMessages((prev) => [...prev, 

    {
      _id: tempId,
    sender: "You",
    bubbleType: "teacher",  
    text: "Sending...",
    timestamp: new Date().toISOString(),
    isTemp: true,
    }
  ]);
  

  try {
    const url = isAdminChat
      ? "http://localhost:5003/teacher/messages/send-admin"
      : "http://localhost:5003/teacher/messages/send";

    const payload = isAdminChat ? { text } : { studentId: selectedStudent._id, text };

    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === tempId
          ? { ...res.data, sender: "You", bubbleType: "teacher" }
          : msg
      )
    );
    setText("");
  } catch (err) {
    console.error("Error sending message:", err);
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === tempId
          ? { ...msg, text: `${msg.text} (Failed)`, sending: false }
          : msg
      )
    );
  } finally {
    setSending(false);
  }
};

  const handleUpdateMessage = async () => {
    if (!text.trim() || !editingMessageId) return;

    try {
      await axios.put(
        `http://localhost:5003/teacher/editMessage/${editingMessageId}`,
        { newText: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      isAdminChat ? fetchMessagesWithAdmin() : fetchMessagesWithStudent(selectedStudent._id);
      setText("");
      setEditingMessageId(null);
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await axios.delete(
        `http://localhost:5003/teacher/deleteMessage/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      isAdminChat ? fetchMessagesWithAdmin() : fetchMessagesWithStudent(selectedStudent._id);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const groupedStudents = students.reduce((acc, student) => {
    const group = `${student.department || "No Dept"} - Level ${student.level || "?"}`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(student);
    return acc;
  }, {});

  return (
    <div className="teacher-chat-container">
      <div className="teacher-chat-sidebar">
        <h3>Students</h3>
        <input
          className="teacher-chat-search"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
        <div
          className={`teacher-chat-user-item ${isAdminChat ? "selected" : ""}`}
          onClick={() => {
            setIsAdminChat(true);
            setSelectedStudent(null);
            setEditingMessageId(null);
            setText("");
            fetchMessagesWithAdmin();
          }}
        >
          <div className="teacher-chat-user-name">
            Admin{" "}
            {unreadCounts.admin > 0 && <span className="unread-badge">{unreadCounts.admin}</span>}
          </div>
        </div>

        {Object.entries(groupedStudents).map(([group, groupStudents]) => (
          <div key={group}>
            <div
              className="teacher-user-group-header"
              onClick={() =>
                setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }))
              }
            >
              {group} {expandedGroups[group] ? "▲" : "▼"}
            </div>
            {expandedGroups[group] && (
              <div className="teacher-chat-user-list">
                {groupStudents
                  .filter((s) =>
                    `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchTerm)
                  )
                  .map((student) => (
                    <div
                      key={student._id}
                      className={`teacher-chat-user-item ${
                        selectedStudent?._id === student._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setIsAdminChat(false);
                        setSelectedStudent(student);
                        setEditingMessageId(null);
                        setText("");
                        fetchMessagesWithStudent(student._id);
                      }}
                    >
                      <div className="teacher-chat-user-name">
                        {student.firstname} {student.lastname}
                        {unreadCounts.students?.[student._id] > 0 && (
                          <span className="unread-badge">
                            {unreadCounts.students[student._id]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="teacher-chat-main">
        <div className="teacher-chat-header">
          <h4>
            {isAdminChat
              ? "Chat with Admin"
              : selectedStudent
              ? `Chat with ${selectedStudent.firstname} ${selectedStudent.lastname}`
              : "Check your messages"}
          </h4>
        </div>

        <div className="teacher-chat-messages">
          {loading ? (
            <p>Loading messages...</p>
          ) : (
            (() => {
              let lastDate = null;
              return messages.map((msg) => {
                const msgDate = new Date(msg.timestamp);
                const msgDateStr = msgDate.toDateString();

                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(today.getDate() - 1);

                let dateLabel = "";
                if (msgDateStr === today.toDateString()) {
                  dateLabel = "Today";
                } else if (msgDateStr === yesterday.toDateString()) {
                  dateLabel = "Yesterday";
                } else {
                  dateLabel = msgDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                }

                const showDate = msgDateStr !== lastDate;
                lastDate = msgDateStr;

                return (
                  <React.Fragment key={msg._id || `${msg.timestamp}-${Math.random()}`}>
                    {showDate && <div className="teacher-chat-date-label">{dateLabel}</div>}
                    <div className={`teacher-chat-bubble ${msg.bubbleType}`}>
                      <div className="teacher-chat-meta">
                        {msg.sender} –{" "}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {msg.sending && "(Sending...)"}
                      </div>
                      <div className="teacher-chat-text">{msg.text}</div>

                      {msg.bubbleType === "teacher" && !msg.sending && (
                        <div className="teacher-chat-actions">
                          <FaEye
                            className="dropdown-icon"
                            onClick={() =>
                              setDropdownVisibleId(dropdownVisibleId === msg._id ? null : msg._id)
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
                  </React.Fragment>
                );
              });
            })()
          )}
        </div>

        {(selectedStudent || isAdminChat) && (
          <div className="teacher-chat-input-area">
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

export default TeacherChat;
