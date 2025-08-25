import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./StudentResults.css";
import LoadingSpinner from "./LoadingSpinner";

const StudentResults = ({ studentId }) => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [outstandingCourses, setOutstandingCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("student_token");

    // Redirect if token not found
    if (!token) {
      toast.warn("Please log in first");
      navigate("/login-student");
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5003/student/approved-results",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Full Response:", res.data);

        const { student, results, cgpa, outstandingCourses } = res.data;
        setStudentInfo(student);
        setResults(results);
        setCgpa(cgpa);
        setOutstandingCourses(outstandingCourses);

        toast.success("Results loaded successfully");
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to load student results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId, navigate]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sr-container">
      <ToastContainer />
      <h1 className="sr-title">{studentInfo?.fullName ?? "Student Results"}</h1>
      <p className="sr-student-id">
        Student ID: {studentInfo?.studentId ?? studentId}
      </p>

      <h2 className="sr-subtitle">All Your Results Are Listed Below</h2>

      <div className="sr-table-container">
        <table className="sr-table">
          <thead>
            <tr>
              <th>SESSION</th>
              <th>SEMESTER</th>
              <th>LEVEL</th>
              <th>CODE</th>
              <th>SCORE</th>
              <th>UNIT</th>
              <th>GRADE</th>
              <th>POINT</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(results) && results.length > 0 ? (
              results.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.session ?? "N/A"}</td>
                  <td>{res.semester ?? "N/A"}</td>
                  <td>{res.level ?? "N/A"}</td>
                  <td>{res.code ?? "N/A"}</td>
                  <td>{res.score ?? "N/A"}</td>
                  <td>{res.unit ?? "N/A"}</td>
                  <td>{res.grade ?? "N/A"}</td>
                  <td>{res.point ?? "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No approved results available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sr-outstanding">
        <h3>Outstanding Courses:</h3>
        {Array.isArray(outstandingCourses) && outstandingCourses.length > 0 ? (
          <ul>
            {outstandingCourses.map((course, idx) => (
              <li key={idx}>
                {typeof course === "object"
                  ? `${course.code} — Point: ${course.point}`
                  : course}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nil</p>
        )}
      </div>

      <div className="sr-cgpa">
        <h3>CGPA (Current Semester): {cgpa ?? "N/A"}</h3>
      </div>
    </div>
  );
};

export default StudentResults;
