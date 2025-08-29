import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import "./SuperAdminStudents.css";
import LoadingSpinner from "./LoadingSpinner"; 

// Debounce Hook
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// StudentDetails Component
const StudentDetails = ({
  student,
  results,
  approveCourse,
  approveAllCourses,
  rejectCourse,
  approveGrade,
  getCourseTitleById,
  submitToTeacher,
  onUpdateStudent,
}) => {
  const groupedBySemester = useMemo(() => {
    const grouped = {};
    results.forEach((grade) => {
      const semester = grade.semester || "Unknown";
      if (!grouped[semester]) grouped[semester] = [];
      grouped[semester].push(grade);
    });
    return grouped;
  }, [results]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    level: student.level || "",
    semester: student.semester || "",
    department: student.department || "",
  });

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.patch(
        `https://sof-edu-backend.onrender.com/admin/students/${student._id}/update`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student details updated");
      onUpdateStudent(); // Refresh
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update student details");
    }
  };
 if (loading) return <LoadingSpinner />;
  return (
    <div className="sas-student-profile-dropdown">
      <div className="sas-edit-controls">
        <button onClick={() => setIsEditing((prev) => !prev)}>
          {isEditing ? "Cancel" : "Edit Info"}
        </button>
        {isEditing && <button onClick={handleSave} className="sas-save-btn">Save</button>}
      </div>
{student.profilePhoto && (
        <div className="sas-profile-photo">
          <img src={student.profilePhoto} alt={`${student.firstname} ${student.lastname}`} />
        </div>
      )}
      <p><strong>Student ID:</strong> {student.studentId || "N/A"}</p>

      <p>
        <strong>Level:</strong>{" "}
        {isEditing ? (
          <select name="level" value={editData.level} onChange={handleEditChange}>
            <option value="">Select Level</option>
            {[100, 200, 300, 400, 500].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        ) : (
          student.level || "N/A"
        )}
      </p>

      <p>
        <strong>Department:</strong>{" "}
        {isEditing ? (
          <select name="department" value={editData.department} onChange={handleEditChange}>
            <option value="">Select Department</option>
            <option value="Agricultural Engineering">Agricultural Engineering</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        ) : (
          student.department || "N/A"
        )}
      </p>

      <p>
        <strong>Semester:</strong>{" "}
        {isEditing ? (
          <select name="semester" value={editData.semester} onChange={handleEditChange}>
            <option value="">Select Semester</option>
            <option value="First Semester">First</option>
            <option value="Second Semester">Second</option>
          </select>
        ) : (
          student.semester || "N/A"
        )}
      </p>
      

      {/* Personal Info */}
      <p><strong>Email:</strong> {student.email}</p>
      <p><strong>Registered:</strong> {student.createdAt ? new Date(student.createdAt).toLocaleString() : "N/A"}</p>
      <p><strong>Phone:</strong> {student.phoneNumber || "N/A"}</p>
      <p><strong>Age:</strong> {student.age || "N/A"}</p>
      <p><strong>Gender:</strong> {student.gender || "N/A"}</p>
      <p><strong>Date of Birth:</strong> {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : "N/A"}</p>
      <p><strong>Address:</strong> {student.address || "N/A"}</p>
      <p><strong>Marital Status:</strong> {student.maritalStatus || "N/A"}</p>
      <p><strong>Nationality:</strong> {student.nationality || "N/A"}</p>
      <p><strong>State of Origin:</strong> {student.stateOfOrigin || "N/A"}</p>
      
      
      <p><strong>Payment Status:</strong> {student.paymentStatus || "N/A"}</p>
     
      
     <div className="sas-assigned-courses">
  <h4>Submitted Courses</h4>

  {/* Approve All Button */}
  {student.courses?.some(c => c.status === "pending") && (
    <button 
      onClick={() => approveAllCourses(student._id)} 
      className="sas-approve-all-btn"
    >
      Approve All Courses
    </button>
  )}

  {student.courses?.length ? student.courses.map(({ course, status }) => (
    <div key={course} className="sas-course-status-row">
      <span>{getCourseTitleById(course)}</span>
      <span>Status: {status}</span>
      {status === "pending" && (
        <>
          <button onClick={() => approveCourse(student._id, course)} className="sas-approve-btn">
            <FaCheck /> Approve
          </button>
          <button onClick={() => rejectCourse(student._id, course)} className="sas-reject-btn">
            <FaTimes /> Reject
          </button>
        </>
      )}
    </div>
  )) : <p>No courses submitted yet.</p>}
</div>

      {/* Grades */}
      <div className="sas-student-grades">
        <h4>Grades Submitted by Teachers</h4>
        {Object.keys(groupedBySemester).length ? (
          Object.entries(groupedBySemester).map(([semester, grades]) => (
            <div key={semester}>
              <h5>{semester}</h5>
              <table className="sas-grades-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Point</th>
                    <th>Unit</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((grade, index) => (
                    <tr key={index}>
                      <td>{grade.code}</td>
                      <td>{grade.score}</td>
                      <td>{grade.grade}</td>
                      <td>{grade.point}</td>
                      <td>{grade.unit}</td>
                      <td>{grade.status || "pending"}</td>
                      <td>
                        {grade.status !== "approved" ? (
                          <button onClick={() => approveGrade(student._id, grade)} className="sas-approve-grade-btn">
                            <FaCheck /> Approve
                          </button>
                        ) : (
                          <button onClick={() => submitToTeacher(student._id, grade)} className="sas-submit-grade-btn">
                            <FaCheck /> Submit to Teacher
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : <p>No grades submitted yet.</p>}
      </div>
    </div>
  );
};

// StudentRow
const StudentRow = React.memo(({
  student, index, expandedId, setExpandedId,
  handleDelete, approveCourse, rejectCourse, approveGrade,
  getCourseTitleById, submitToTeacher, studentResults,
  loadStudentResults, updateStudentInfo, fetchStudents
}) => {
  const isExpanded = expandedId === student._id;

  useEffect(() => {
    if (isExpanded && !studentResults[student._id]) {
      loadStudentResults(student._id);
    }
  }, [isExpanded, student._id, studentResults, loadStudentResults]);

  return (
    <>
      <tr>
        <td>{index + 1}</td>
        <td>{student.firstname} {student.lastname}</td>
        <td>{student.email}</td>
        <td>{student.department}</td>
        <td>{student.level}</td>
        <td>{student.semester || "N/A"}</td>
        <td>
          <button onClick={() => handleDelete(student._id)} className="sas-delete-btn">
            <FaTrash />
          </button>
        </td>
        <td>
          <button onClick={() => setExpandedId(prev => prev === student._id ? null : student._id)} className="sas-view-btn">
            {isExpanded ? <FaEyeSlash /> : <FaEye />} {isExpanded ? "" : ""}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="8">
            <StudentDetails
              student={student}
              results={studentResults[student._id] || []}
              approveCourse={approveCourse}
              approveAllCourses={approveAllCourses}
              rejectCourse={rejectCourse}
              approveGrade={approveGrade}
              getCourseTitleById={getCourseTitleById}
              submitToTeacher={submitToTeacher}
              updateStudentInfo={updateStudentInfo}
              onUpdateStudent={fetchStudents}
            />
          </td>
        </tr>
      )}
    </>
  );
});

// SuperAdminStudents
const SuperAdminStudents = () => {

  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentResults, setStudentResults] = useState({});
  const debouncedSearch = useDebounce(search, 300);


  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/login-superadmin"); 
    }
  }, [navigate]);
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get("https://sof-edu-backend.onrender.com/admin/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load courses");
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [fetchStudents, fetchCourses]);

  const loadStudentResults = useCallback(async (studentId) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get(`https://sof-edu-backend.onrender.com/admin/students/${studentId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudentResults(prev => ({ ...prev, [studentId]: res.data.results || [] }));
    } catch (err) {
      toast.error("Failed to fetch student results");
    }
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      await axios.delete(`https://sof-edu-backend.onrender.com/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Student deleted");
      setStudents(prev => prev.filter((s) => s._id !== id));
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  // Approve one course immediately
const approveCourse = async (studentId, courseId) => {
  toast.info("Approving course...");
  try {
    const token = localStorage.getItem("admin_token");
    await axios.patch(
      `https://sof-edu-backend.onrender.com/admin/students/${studentId}/courses/${courseId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("Course approved");
    fetchStudents();
  } catch (err) {
    toast.error("Failed to approve course");
  }
};

// Approve ALL courses for one student immediately
const approveAllCourses = async (studentId) => {
  toast.info("Approving all courses...");
  try {
    const token = localStorage.getItem("admin_token");
    await axios.patch(
      `https://sof-edu-backend.onrender.com/admin/students/${studentId}/approve-courses`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success("All courses approved");
    fetchStudents();
  } catch (err) {
    toast.error("Failed to approve all courses");
  }
};



  const rejectCourse = async (studentId, courseId) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.patch(
        `https://sof-edu-backend.onrender.com/admin/students/${studentId}/courses/${courseId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Course rejected");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to reject course");
    }
  };

  const approveGrade = async (studentId, grade) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.patch(
        `https://sof-edu-backend.onrender.com/admin/students/${studentId}/results/approve`,
        { code: grade.code, semester: grade.semester },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Grade approved");
      fetchStudents();
      loadStudentResults(studentId);
    } catch (err) {
      toast.error("Failed to approve grade");
    }
  };

  const submitToTeacher = async (studentId, grade) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.post(
        `https://sof-edu-backend.onrender.com/admin/students/${studentId}/results/submit-to-teacher`,
        { grade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Grade submitted to teacher");
    } catch (err) {
      toast.error("Failed to submit grade to teacher");
    }
  };

  const updateStudentInfo = async (studentId, data) => {
    try {
      const token = localStorage.getItem("admin_token");
      await axios.patch(
        `https://sof-edu-backend.onrender.com/admin/students/${studentId}/update-info`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Student info updated");
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update student info");
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      s.firstname?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.lastname?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [students, debouncedSearch]);

  const getCourseTitleById = useCallback((id) => {
    const course = courses.find((c) => c._id === id);
    return course ? `${course.code} - ${course.title}` : `Unknown Course (${id})`;
  }, [courses]);
 if (loading) return <LoadingSpinner />;
  return (
    <div className="sas-superadmin-students">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="sas-students-header">
        <h2>Student Management</h2>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : filteredStudents.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="sas-students-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Level</th>
              <th>Semester</th>
              <th>Actions</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <StudentRow
                key={student._id}
                student={student}
                index={index}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                handleDelete={handleDelete}
                approveCourse={approveCourse}
                 approveAllCourses={approveAllCourses}
                rejectCourse={rejectCourse}
                approveGrade={approveGrade}
                getCourseTitleById={getCourseTitleById}
                submitToTeacher={submitToTeacher}
                studentResults={studentResults}
                loadStudentResults={loadStudentResults}
                updateStudentInfo={updateStudentInfo}
                fetchStudents={fetchStudents}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SuperAdminStudents;
