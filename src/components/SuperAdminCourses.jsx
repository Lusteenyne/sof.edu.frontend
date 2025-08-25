import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaSave, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "./SuperAdminCourses.css";

const departments = [
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Agricultural Engineering",
];

const semesters = ["First Semester", "Second Semester"];
const levels = ["100", "200", "300", "400", "500"];

const SuperAdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    unit: "",
    level: "100",
    semester: "First Semester",
    department: departments[0],
  });
  const [editingId, setEditingId] = useState(null);
  const [editedCourse, setEditedCourse] = useState({});

  const navigate = useNavigate();
  const token = localStorage.getItem("admin_token");

  useEffect(() => {
    if (!token) {
      navigate("/login-superadmin");
      return;
    }
    fetchCourses();
  }, [navigate, token]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get("https://sof-edu.onrender.com/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      const courseList = Array.isArray(data)
        ? data
        : Array.isArray(data.courses)
        ? data.courses
        : [];
      setCourses(courseList);
    } catch (err) {
      toast.error("Failed to load courses");
      setCourses([]);
    }
  };

  const handleAddCourse = async () => {
    const { code, title, unit } = newCourse;
    if (!code || !title || !unit) {
      toast.error("Please fill in all course fields");
      return;
    }

    try {
      await axios.post("https://sof-edu.onrender.com/admin/courses", newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course added successfully");
      setNewCourse({
        code: "",
        title: "",
        unit: "",
        level: "100",
        semester: "First Semester",
        department: departments[0],
      });
      fetchCourses();
    } catch (err) {
      toast.error("Failed to add course");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`https://sof-edu.onrender.com/admin/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course deleted");
      fetchCourses();
    } catch (err) {
      toast.error("Error deleting course");
    }
  };

  const handleEdit = (course) => {
    setEditingId(course._id);
    setEditedCourse({ ...course });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.patch(
        `https://sof-edu.onrender.com/admin/courses/${editingId}`,
        editedCourse,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Course updated");
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      toast.error("Error updating course");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedCourse({ ...editedCourse, [name]: value });
  };

  const groupCourses = () => {
    const grouped = {};
    courses.forEach((course) => {
      const { department, level, semester } = course;
      if (!grouped[department]) grouped[department] = {};
      if (!grouped[department][level]) grouped[department][level] = {};
      if (!grouped[department][level][semester])
        grouped[department][level][semester] = [];
      grouped[department][level][semester].push(course);
    });
    return grouped;
  };

  const groupedCourses = groupCourses();

  return (
    <div className="sadmin-courses-container">
      <ToastContainer />
      <h2>Course Management</h2>

      <div className="sadmin-add-course-form">
        <h3>Add Course</h3>
        <input
          type="text"
          name="code"
          placeholder="Course Code"
          value={newCourse.code}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={newCourse.title}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="unit"
          placeholder="Unit"
          value={newCourse.unit}
          onChange={handleInputChange}
        />
        <select name="level" value={newCourse.level} onChange={handleInputChange}>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level} Level
            </option>
          ))}
        </select>
        <select name="semester" value={newCourse.semester} onChange={handleInputChange}>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
        <select name="department" value={newCourse.department} onChange={handleInputChange}>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <button onClick={handleAddCourse}>
          <FaPlus /> Add
        </button>
      </div>

      <h3>All Courses</h3>

      {departments.map((dept) => (
        <div key={dept} className="sadmin-department-section">
          <h2>{dept}</h2>
          {levels.map((level) => (
            <div key={level} className="sadmin-level-section">
              <h3>{level} Level</h3>
              {semesters.map((sem) => (
                <div key={sem} className="sadmin-semester-section">
                  <h4>{sem}</h4>
                  {groupedCourses[dept]?.[level]?.[sem]?.length > 0 ? (
                    <table className="sadmin-courses-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Code</th>
                          <th>Title</th>
                          <th>Unit</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedCourses[dept][level][sem].map((course, index) => (
                          <tr key={course._id}>
                            <td>{index + 1}</td>
                            <td>
                              {editingId === course._id ? (
                                <input
                                  name="code"
                                  value={editedCourse.code || ""}
                                  onChange={handleEditInputChange}
                                />
                              ) : (
                                course.code
                              )}
                            </td>
                            <td>
                              {editingId === course._id ? (
                                <input
                                  name="title"
                                  value={editedCourse.title || ""}
                                  onChange={handleEditInputChange}
                                />
                              ) : (
                                course.title
                              )}
                            </td>
                            <td>
                              {editingId === course._id ? (
                                <input
                                  name="unit"
                                  type="number"
                                  value={editedCourse.unit || ""}
                                  onChange={handleEditInputChange}
                                />
                              ) : (
                                course.unit
                              )}
                            </td>
                            <td>
                              {editingId === course._id ? (
                                <button onClick={handleSaveEdit}>
                                  <FaSave /> Save
                                </button>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(course)}>
                                    <FaEdit />
                                  </button>
                                  <button onClick={() => handleDeleteCourse(course._id)}>
                                    <FaTrash />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No courses for this semester.</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SuperAdminCourses;
