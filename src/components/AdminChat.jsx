import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

          
import "./AdminChat.css";
import { FaEye } from "react-icons/fa";

const AdminChat = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userType, setUserType] = useState("teacher"); 
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const token = localStorage.getItem("admin_token");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!token) return 
      navigate("/login-superadmin");
      
    
    fetchTeachers();
    fetchStudents();
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedUser && userType && selectedUser._id) {
      fetchMessagesFor(userType, selectedUser._id);
    }
  }, [selectedUser?._id, userType]);

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


  const getDisplayName = (user) => {
    if (userType === "contact") {
      return `${user.name} (${user.email})`;
    }
    return `${user.firstName || user.firstname || ""} ${user.lastName || user.lastname || ""}`;
  };

 //fetch
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers);
    } catch (err) {
      console.error("Teacher fetch error:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error("Student fetch error:", err);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/get-contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data);
    } catch (err) {
      console.error("Contact fetch error:", err);
    }
  };

  const fetchMessagesFor = async (type, id) => {
    setLoading(true);
    try {
      if (type === "contact") {
        const personMessages = contacts.filter((c) => c.email === selectedUser.email);

        const allMessages = [];
        personMessages.forEach((c) => {
          allMessages.push({
            sender: c.name,
            text: c.message,
            timestamp: c.createdAt
          });
          c.replies.forEach((r) => {
            allMessages.push({
              sender: r.sender === "admin" ? "Admin" : c.name,
              text: r.message,
              timestamp: r.sentAt
            });
          });
        });

        allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(allMessages);
        setLoading(false);
        return;
      } else {
        const url =
          type === "teacher"
            ? `https://sof-edu-backend.onrender.com/admin/messages?teacherId=${id}`
            : `https://sof-edu-backend.onrender.com/admin/messages?studentId=${id}`;

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedMessages = res.data.map((msg) => ({
          ...msg,
          sender: msg.sender === "Admin" ? "Admin" : getDisplayName(selectedUser),
        }));

        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Message fetch error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;

    const tempId = Date.now();
    const messageText = text;

    setSending(true);
    setText("");

    // Temporary message bubble
    setMessages((prev) => [
      ...prev,
      {
        _id: tempId,
        sender: "Admin",
        text: "Sending...",
        timestamp: new Date().toISOString(),
        isTemp: true
      }
    ]);

    try {
      if (userType === "contact") {
        await axios.post(
          "https://sof-edu-backend.onrender.com/admin/send-reply",
          { messageId: selectedUser._id, replyMessage: messageText },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchContacts();
        fetchMessagesFor("contact", selectedUser._id);
      } else {
        const url =
          userType === "teacher"
            ? "https://sof-edu-backend.onrender.com/admin/messages/send"
            : "https://sof-edu-backend.onrender.com/admin/messages/send-to-student";

        const res = await axios.post(
          url,
          {
            [`${userType}Id`]: selectedUser._id,
            text: messageText,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? { ...res.data, sender: "Admin" } : m
          )
        );
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId ? { ...m, text: "Failed to send" } : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.put(
        `https://sof-edu-backend.onrender.com/admin/editMessage/${editingId}`,
        { newText: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = messages.map((msg) =>
        msg._id === editingId ? { ...res.data, sender: "Admin" } : msg
      );
      setMessages(updated);
      setEditingId(null);
      setText("");
    } catch (err) {
      console.error("Edit error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://sof-edu-backend.onrender.com/admin/deleteMessage/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(messages.filter((msg) => msg._id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  
  const users =
    userType === "teacher" ? teachers : userType === "student" ? students : (
      Object.values(
        contacts.reduce((acc, c) => {
          acc[c.email] = c;
          return acc;
        }, {})
      )
    );

  const groupedUsers =
    userType === "contact"
      ? { Contacts: users }
      : users.reduce((acc, user) => {
          const group =
            userType === "teacher"
              ? `${user.department || "No Department"}`
              : `${user.department || "No Department"} - Level ${user.level || "N/A"}`;
          if (!acc[group]) acc[group] = [];
          acc[group].push(user);
          return acc;
        }, {});

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <h3>Contacts</h3>
        <select
          value={userType}
          onChange={(e) => {
            setUserType(e.target.value);
            setSelectedUser(null);
            setSearchTerm("");
          }}
        >
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
          <option value="contact">Contact Messages</option>
        </select>

        <input
          className="admin-chat-search"
          placeholder={`Search ${userType}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />

        {Object.entries(groupedUsers).map(([group, groupUsers]) => (
          <div key={group}>
            {userType !== "contact" && (
              <div
                className="user-group-header"
                onClick={() =>
                  setExpandedGroups((prev) => ({
                    ...prev,
                    [group]: !prev[group],
                  }))
                }
              >
                {group} {expandedGroups[group] ? "▲" : "▼"}
              </div>
            )}
            {(userType === "contact" || expandedGroups[group]) && (
              <div className="admin-chat-user-list">
                {groupUsers
                  .filter((u) =>
                    getDisplayName(u).toLowerCase().includes(searchTerm)
                  )
                  .map((user) => (
                    <div
                      key={user._id}
                      className={`admin-chat-user-item ${
                        selectedUser?._id === user._id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setText("");
                        setEditingId(null);
                      }}
                    >
                      <div className="admin-chat-user-name">
                        {getDisplayName(user)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="admin-chat-main">
        <div className="admin-chat-header">
          {selectedUser ? (
            <h4>Chat with {getDisplayName(selectedUser)}</h4>
          ) : (
            <h4>Select a {userType} to begin</h4>
          )}
        </div>

        <div className="admin-chat-messages">
          {!selectedUser ? (
            <p>Please select a {userType} to view messages.</p>
          ) : loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            
            messages.map((msg, index) => (
              <div
                key={index}
                className={`admin-chat-bubble ${
                  msg.sender === "Admin" ? "admin" : "other"
                }`}
              >
                <div className="admin-chat-meta">
                  {msg.sender} - {new Date(msg.timestamp).toLocaleString()}
                </div>
                <div className="admin-chat-text">{msg.text}</div>
                {userType !== "contact" && msg.sender === "Admin" && !msg.isTemp && (
                  <div className="admin-chat-actions">
                    <FaEye
                      className="eye-icon"
                      onClick={() =>
                        setShowDeleteConfirm((prev) =>
                          prev === msg._id ? null : msg._id
                        )
                      }
                    />
                    {showDeleteConfirm === msg._id && (
                      <div className="admin-chat-dropdown">
                        <div
                          className="admin-chat-dropdown-item"
                          onClick={() => {
                            setEditingId(msg._id);
                            setText(msg.text);
                            setShowDeleteConfirm(null);
                          }}
                        >
                          Edit
                        </div>
                        <div
                          className="admin-chat-dropdown-item"
                          onClick={() => handleDelete(msg._id)}
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {selectedUser && (
          <div className="admin-chat-input-area">
            <input
              type="text"
              value={text}
              placeholder="Type a message..."
              onChange={(e) => setText(e.target.value)}
            />
            {editingId ? (
              <>
                <button onClick={handleEdit} disabled={sending}>
                  {sending ? <ClipLoader size={14} color="#fff" /> : "Update"}
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
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

export default AdminChat;
