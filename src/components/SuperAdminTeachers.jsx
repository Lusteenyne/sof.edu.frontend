import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSearch,
  FaSave,
  FaFileDownload,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./SuperAdminTeachers.css";
import LoadingSpinner from "./LoadingSpinner"; 

const SuperAdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourses, setSelectedCourses] = useState({});

  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const departments = [
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Agricultural Engineering",
  ];

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login-superadmin"); 
      return;
    }
    fetchTeachers();
  }, []);


  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const teacherList = res.data.teachers || [];
      const updated = teacherList.map((t) => ({
  ...t,
  department: t.department || "", 
  level: "",
  semester: "",
  courses: [],
  availableCourses: [],
}));

      setTeachers(updated);
      console.log("Teachers loaded:", updated);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.patch(
        `https://sof-edu-backend.onrender.com/admin/teachers/${id}/${action}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Teacher ${action}d successfully`);
      fetchTeachers();
    } catch (err) {
      console.error(`Failed to ${action} teacher:`, err);
      toast.error(`Failed to ${action} teacher`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`https://sof-edu-backend.onrender.com/admin/teachers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Teacher deleted");
      fetchTeachers();
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      toast.error("Failed to delete teacher");
    }
  };

  const handleDropdownChange = async (index, field, value) => {
    const updated = [...teachers];
    updated[index][field] = value;

    // Reset dependent fields on department change
    if (field === "department") {
      updated[index].level = "";
      updated[index].semester = "";
      updated[index].availableCourses = [];
    }

    setTeachers(updated);

    const updatedTeacher = updated[index];
    if (
      updatedTeacher.department &&
      updatedTeacher.level &&
      updatedTeacher.semester
    ) {
      fetchCoursesForTeacher(updatedTeacher, index);
    }
  };

  const fetchCoursesForTeacher = async (teacher, index) => {
    const { department, level, semester } = teacher;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
        params: { department, level, semester },
      });

      const updated = [...teachers];
      updated[index].availableCourses = res.data.courses || [];
      setTeachers(updated);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to fetch courses");
    }
  };

  const handleCourseCheckboxChange = (e, teacherId, courseId) => {
  setSelectedCourses((prev) => {
    const currentSet = new Set(prev[teacherId] || []);
    if (e.target.checked) {
      currentSet.add(courseId);
    } else {
      currentSet.delete(courseId);
    }
    return { ...prev, [teacherId]: currentSet };
  });
};


const assignCourses = async (teacherId, index) => {
  if (!teacherId) {
    toast.error("Teacher ID missing");
    return;
  }

  const { department, level, semester } = teachers[index];
  const selected = selectedCourses[teacherId];
  const courses = selected ? Array.from(selected) : [];

  if (courses.length === 0)
    return toast.error("Select at least one course");
  if (!department || !level || !semester)
    return toast.error("Please select department, level, and semester");

  try {
    const token = localStorage.getItem("admin_token");
    await axios.patch(
      `https://sof-edu-backend.onrender.com/admin/teachers/${teacherId}/assign-courses`,
      { courses, department, level, semester },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Courses assigned successfully");
    fetchTeachers();
  } catch (err) {
    console.error("Failed to assign courses:", err.response || err);
    toast.error("Failed to assign courses");
  }
};


  
  const handleRemoveCourse = async (teacherId, courseId, index) => {
    if (!window.confirm("Remove this course from the teacher?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(
        `https://sof-edu-backend.onrender.com/admin/teachers/${teacherId}/remove-course/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Course removed from teacher");
      fetchTeachers();
    } catch (err) {
      console.error("Failed to remove course:", err);
      toast.error("Failed to remove course");
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    [t.firstName, t.lastName, t.email].join(" ").toLowerCase().includes(search.toLowerCase())
  );
 if (loading) return <LoadingSpinner />;
  return (
    <div className="sat-container fade-in">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="sat-header">
        <h2>Teacher Management</h2>
        <div className="sat-search-bar">
          <FaSearch className="sat-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading teachers...</p>
      ) : filteredTeachers.length === 0 ? (
        <p>No teachers found.</p>
      ) : (
        <table className="sat-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
             
              <th>Status</th>
              <th>Delete</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher, index) => (
              <React.Fragment key={teacher._id}>
                <tr>
                  <td>{index + 1}</td>
                  <td>{teacher.firstName} {teacher.lastName}</td>
                  <td> {teacher.email} </td>
                 
                  <td>
                    <span className={`sat-status-badge ${teacher.status}`}>
                      {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {teacher.status === "pending" && (
                      <>
                        <button className="sat-approve-btn" onClick={() => handleAction(teacher._id, "approve")}>
                          <FaCheckCircle /> Approve
                        </button>
                        <button className="sat-reject-btn" onClick={() => handleAction(teacher._id, "reject")}>
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    )}
                    <button className="sat-delete-btn" onClick={() => handleDelete(teacher._id)}>
                      <FaTrash /> 
                    </button>
                  </td>
                  <td>
                    <button
                      className="sat-view-btn"
                      onClick={() =>
                        setExpandedId((prev) => (prev === teacher._id ? null : teacher._id))
                      }
                    >
                      {expandedId === teacher._id ? <FaEyeSlash /> : <FaEye />}
                      {expandedId === teacher._id ? " " : " "}
                    </button>
                  </td>
                </tr>

                {expandedId === teacher._id && (
                  <tr>
                    <td colSpan="6">
                      <div className="sat-dropdown fade-slide">
                        {/* PERSONAL DETAILS */}
                        <p><strong>Full Name:</strong> {teacher.title} {teacher.firstName} {teacher.lastName}</p>
                        <p><strong>Email:</strong> {teacher.email}</p>
                         <p><strong>Department:</strong> {teacher.department}</p>
                        <p><strong>Phone:</strong> {teacher.phoneNumber || "N/A"}</p>
                        <p><strong>Age:</strong> {teacher.age || "N/A"}</p>
                        <p><strong>Gender:</strong> {teacher.gender || "N/A"}</p>
                        <p><strong>Date of Birth:</strong> {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                        <p><strong>Registered On:</strong> {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "N/A"}</p>
                        <p><strong>Address:</strong> {teacher.address || "N/A"}</p>
                        <p><strong>Marital Status:</strong> {teacher.maritalStatus || "N/A"}</p>
                        <p><strong>Nationality:</strong> {teacher.nationality || "N/A"}</p>
                        <p><strong>State of Origin:</strong> {teacher.stateOfOrigin || "N/A"}</p>
<div className="sat-assignment-section">
  {/* Department */}
  <label className="sat-form-label">
    <strong>Department:</strong>
    <select
      className="sat-select"
      value={teacher.department}
      onChange={(e) => handleDropdownChange(index, "department", e.target.value)}
    >
      <option value="">Select department</option>
      {departments.map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>
  </label>

  {/* Level */}
  <label className="sat-form-label">
    <strong>Level:</strong>
    <select
      className="sat-select"
      value={teacher.level}
      onChange={(e) => handleDropdownChange(index, "level", e.target.value)}
    >
      <option value="">Select level</option>
      {[100, 200, 300, 400, 500].map((lvl) => (
        <option key={lvl} value={lvl}>{lvl} Level</option>
      ))}
    </select>
  </label>

  {/* Semester */}
  <label className="sat-form-label">
    <strong>Semester:</strong>
    <select
      className="sat-select"
      value={teacher.semester}
      onChange={(e) => handleDropdownChange(index, "semester", e.target.value)}
    >
      <option value="">Select semester</option>
      <option value="First Semester">First</option>
      <option value="Second Semester">Second</option>
    </select>
  </label>
</div>

<div className="sat-assign-course">
  <label><strong>Assign Courses:</strong></label>
  <div className="sat-checkbox-list">
    {(teacher.availableCourses || []).map((c) => {
      const courseId = c._id;
      const courseName = c.name || c.code || "Unnamed Course";
      const isChecked = selectedCourses[teacher._id]?.has(courseId) || false;

      return (
        <div key={courseId}>
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleCourseCheckboxChange(e, teacher._id, courseId)}
            />
            {courseName}
          </label>
        </div>
      );
    })}
  </div>

  <button
    className="sat-save-course-btn"
    onClick={() => assignCourses(teacher._id, index)}
  >
    <FaSave /> Save
  </button>
</div>


 {teacher.assignedCourses && teacher.assignedCourses.length > 0 && (
                          <div className="sat-assigned-courses">
                            <p><strong>Assigned Courses:</strong></p>
                            <ul>
                              {teacher.assignedCourses.map((ac) => (
                                <li key={ac._id || ac.course?._id}>
                                  {ac.name || ac.course?.name || ac.course?.code || "Unnamed Course"}
                                  <button
                                    className="sat-remove-course-btn"
                                    onClick={() => handleRemoveCourse(teacher._id, ac.course?._id || ac._id, index)}
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}


<p>
  <strong>CV:</strong>{" "}
  {teacher.cvUrl ? (
    <a  className="Cv" href={`https://sof-edu-backend.onrender.com${teacher.cvUrl}`} target="_blank" rel="noreferrer">
      View CV
    </a>
  ) : "Not uploaded"}
</p>

<p>
  <strong>Certificate:</strong>{" "}
  {teacher.certificateUrl ? (
    <a  className="Cv" href={`https://sof-edu-backend.onrender.com${teacher.certificateUrl}`} target="_blank" rel="noreferrer">
      View Certificate
    </a>
  ) : "Not uploaded"}
</p>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SuperAdminTeachers;
