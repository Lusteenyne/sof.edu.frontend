import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherClasses.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './LoadingSpinner';

const TeacherClasses = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [submittedResults, setSubmittedResults] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('teacher_token');

  useEffect(() => {
    if (!token) {
      toast.error('Authentication required. Redirecting to login...');
      navigate('/login-teacher');
      return;
    }

    const fetchCourses = async () => {
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/teacher/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('teacher_token');
          navigate('/login');
        } else if (res.ok) {
          setCourses(data);
        } else {
          toast.error(data.message || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        toast.error('Error loading courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [token, navigate]);

  const fetchSubmittedResults = async (courseId) => {
    try {
      const res = await fetch(
        `https://sof-edu-backend.onrender.com/teacher/course/${courseId}/submitted-results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.status === 401) {
        toast.error('Session expired. Redirecting...');
        localStorage.removeItem('teacher_token');
        navigate('/login');
      } else if (res.ok) {
        setSubmittedResults(data || []);
      } else {
        toast.error(data.message || 'Failed to load submitted results');
        setSubmittedResults([]);
      }
    } catch (err) {
      console.error('Error fetching submitted results:', err);
      toast.error('Could not load submitted results');
      setSubmittedResults([]);
    }
  };

  const fetchStudents = async (courseId) => {
    const course = courses.find((c) => `${c._id}` === `${courseId}`);
    if (!course) return;

    setSelectedCourse(course);
    setStudents([]);
    setGrades({});
    setSubmittedResults([]);
    setLoadingStudents(true);

    try {
      const res = await fetch(
        `https://sof-edu-backend.onrender.com/teacher/course/${courseId}/students`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.status === 401) {
        toast.error('Session expired. Redirecting...');
        localStorage.removeItem('teacher_token');
        navigate('/login');
      } else if (res.ok) {
        setStudents(data);
        fetchSubmittedResults(courseId);
      } else {
        toast.error(data.message || 'Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Error loading students');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (submittedResults.length > 0) {
      const existingGrades = {};
      submittedResults.forEach((res) => {
        const studentId = res.student?._id || res.studentId;
        existingGrades[studentId] = {
          score: res.score || '',
          grade: res.grade || '',
          point: res.point || '',
          semester: res.semester || '',
          mode: 'edit',
        };
      });
      setGrades(existingGrades);
    } else {
      setGrades({});
    }
  }, [submittedResults]);

  const calculateGradeAndPoint = (score) => {
    if (score >= 70) return { grade: 'A', point: 5 };
    if (score >= 60) return { grade: 'B', point: 4 };
    if (score >= 50) return { grade: 'C', point: 3 };
    if (score >= 45) return { grade: 'D', point: 2 };
    if (score >= 40) return { grade: 'E', point: 1 };
    return { grade: 'F', point: 0 };
  };

  const handleGradeDetailChange = (studentId, field, value) => {
    setGrades((prev) => {
      const updated = { ...prev[studentId], [field]: value };
      if (field === 'score') {
        const parsedScore = parseFloat(value);
        if (!isNaN(parsedScore)) {
          const { grade, point } = calculateGradeAndPoint(parsedScore);
          updated.grade = grade;
          updated.point = point;
        } else {
          updated.grade = '';
          updated.point = '';
        }
      }
      return {
        ...prev,
        [studentId]: updated,
      };
    });
  };

  const isFormValid = () => {
    return students.every((student) => {
      const g = grades[student._id];
      return g?.score !== '' && g?.grade !== '' && g?.point !== '' && g?.semester !== '';
    });
  };

  const handleSubmitGrades = async () => {
    if (!selectedCourse || !isFormValid()) {
      toast.error('Please complete all grade fields for all students.');
      return;
    }

    setSubmitting(true);

    const formattedGrades = Object.entries(grades).map(([studentId, data]) => ({
      studentId,
      score: data.score,
      grade: data.grade,
      point: data.point,
      semester: data.semester,
      unit: selectedCourse.unit,
      code: selectedCourse.code,
      mode: data.mode || 'new',
    }));

    try {
      const res = await fetch(
        `https://sof-edu-backend.onrender.com/teacher/course/${selectedCourse._id}/submit-results`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ results: formattedGrades }),
        }
      );

      const result = await res.json();

      if (res.status === 401) {
        toast.error('Session expired. Redirecting...');
        localStorage.removeItem('teacher_token');
        navigate('/login');
      } else if (res.ok) {
        toast.success('Results submitted (or updated) successfully!');
        fetchSubmittedResults(selectedCourse._id);
      } else {
        toast.error(result.message || 'Failed to submit results');
      }
    } catch (err) {
      console.error('Error submitting grades:', err);
      toast.error('Server error submitting results');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCourses) return <LoadingSpinner />;

  return (
    <div className="teacher-classes-container">
      <h2>Staff Classes</h2>

      <div className="teacher-classes-course-list">
        {courses.map((course) => (
          <button
            key={course._id}
            className={`teacher-classes-course-btn ${selectedCourse?._id === course._id ? 'selected' : ''}`}
            onClick={() => fetchStudents(course._id)}
          >
            {course.name} ({course.code})
          </button>
        ))}
      </div>

      {selectedCourse && (
        <>
          <h3>Students in {selectedCourse.name}</h3>
          {loadingStudents ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p>No students registered for this course.</p>
          ) : (
            <div className="teacher-classes-table-wrapper">
              <table className="teacher-classes-student-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Level</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Point</th>
                    <th>Semester</th>
                    <th>Unit</th>
                    <th>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const submittedResult = submittedResults.find(
                      (res) => (res.student?._id || res.studentId) === student._id
                    );
                    const isPending = submittedResult?.status?.toLowerCase() === 'pending';

                    return (
                      <tr key={student._id} className={isPending ? 'pending-row' : ''}>
                        <td>{student.studentId}</td>
                        <td>{student.firstname} {student.lastname}</td>
                        <td>{student.department}</td>
                        <td>{student.level}</td>
                        <td>
                          <input
                            type="number"
                            value={grades[student._id]?.score || ''}
                            onChange={(e) =>
                              handleGradeDetailChange(student._id, 'score', e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={grades[student._id]?.grade || ''}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={grades[student._id]?.point || ''}
                            readOnly
                          />
                        </td>
                        <td>
                          <select
                            value={grades[student._id]?.semester || ''}
                            onChange={(e) =>
                              handleGradeDetailChange(student._id, 'semester', e.target.value)
                            }
                          >
                            <option value="">--Select--</option>
                            <option value="First Semester">First Semester</option>
                            <option value="Second Semester">Second Semester</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" value={selectedCourse.unit} readOnly />
                        </td>
                        <td>
                          <input type="text" value={selectedCourse.code} readOnly />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <button
            className="teacher-classes-submit-btn"
            onClick={handleSubmitGrades}
            disabled={!isFormValid() || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Results'}
          </button>
        </>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default TeacherClasses;
