import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './StudentCourses.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const StudentCourses = () => {
  const [student, setStudent] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [submittedCourses, setSubmittedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem('student_token');

  useEffect(() => {
    if (!token) {
      toast.error('No token found. Redirecting to login...');
      navigate('/login-student');
      return;
    }

    const fetchData = async () => {
      try {
        const [studentRes, availableRes, submittedRes] = await Promise.all([
          axios.get('https://sof-edu-backend.onrender.com/student/info', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://sof-edu-backend.onrender.com/student/courses/matching', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://sof-edu-backend.onrender.com/student/courses/submitted', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudent(studentRes.data || {});
        setAvailableCourses(availableRes.data.courses || []);
        setSubmittedCourses(submittedRes.data.courses || []);
      } catch (err) {
        console.error('Error loading data:', err);
        if (err.response && err.response.status === 403) {
          toast.error('Please complete your profile before accessing courses.');
        } else {
          toast.error('Failed to load data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Only allow adding courses that are not submitted or approved
  const handleAddCourse = (course) => {
    const existing = submittedCourses.find(
      (c) => c.course._id === course._id && c.status !== 'failed'
    );
    if (existing) {
      toast.warn('You cannot add a course you already submitted or approved.');
      return;
    }

    if (!selectedCourses.some((c) => c._id === course._id)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleRemoveCourse = (id) => {
    setSelectedCourses(selectedCourses.filter((c) => c._id !== id));
  };

  const handleSubmitCourses = async () => {
    if (selectedCourses.length === 0) {
      toast.warn('Please select at least one course to submit.');
      return;
    }

    try {
      await axios.post(
        'https://sof-edu-backend.onrender.com/student/courses/submit',
        { courseIds: selectedCourses.map((c) => c._id) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Courses submitted for approval!');

      const newSubmitted = selectedCourses.map((course) => ({
        course,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }));

      setSubmittedCourses((prev) => [...prev, ...newSubmitted]);
      setSelectedCourses([]);
    } catch (err) {
      console.error('Failed to submit courses:', err);
      toast.error(err.response?.data?.message || 'Course submission failed.');
    }
  };

  const enrichedSubmittedCourses = useMemo(() => {
    return submittedCourses.map(({ course, status, createdAt }, index) => ({
      _id: course?._id || `submitted-${index}`,
      code: course?.code || 'N/A',
      title: course?.title || 'Untitled',
      unit: course?.unit || 0,
      status: status || 'pending',
      createdAt,
    }));
  }, [submittedCourses]);

  const totalUnits = useMemo(() => {
    return enrichedSubmittedCourses.reduce((sum, c) => sum + (c.unit || 0), 0);
  }, [enrichedSubmittedCourses]);

  if (loading) return <LoadingSpinner />;

  const {
    firstname,
    lastname,
    fullName,
    studentId,
    level,
    department,
    semester,
    session,
  } = student || {};

  const displayName = firstname && lastname ? `${firstname} ${lastname}` : fullName || 'N/A';

  return (
    <div className="student-courses-container">
      <ToastContainer />
      <h2>Course Registration</h2>

      <div className="student-info-card">
        <p><strong>Full Name:</strong> {displayName}</p>
        <p><strong>Student ID:</strong> {studentId || 'N/A'}</p>
        <p><strong>Level:</strong> {level || 'N/A'}</p>
        <p><strong>Department:</strong> {department || 'N/A'}</p>
        <p><strong>Semester:</strong> {semester || 'N/A'}</p>
        <p><strong>Session Year:</strong> {session || 'N/A'}</p>
      </div>

      <div className="student-courses-section">
        <h3>Available Courses</h3>
        <ul className="student-courses-list">
          {availableCourses.map((course) => {
            const submitted = submittedCourses.find((c) => c.course._id === course._id);
            const isDisabled = submitted && submitted.status !== 'failed';
            return (
              <li key={course._id}>
                <span>{course.code} - {course.title} ({course.unit} unit{course.unit !== 1 ? 's' : ''})</span>
                <button
                  type="button"
                  onClick={() => handleAddCourse(course)}
                  disabled={isDisabled}
                >
                  {submitted
                    ? submitted.status === 'failed'
                      ? 'Resubmit'
                      : submitted.status === 'approved'
                      ? 'Approved'
                      : 'Submitted'
                    : 'Add'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selectedCourses.length > 0 && (
        <div className="student-courses-section">
          <h3>Selected Courses (Not Submitted)</h3>
          <ul className="selected-courses-list">
            {selectedCourses.map((course) => (
              <li key={course._id}>
                <span>{course.code} - {course.title} ({course.unit} unit{course.unit !== 1 ? 's' : ''})</span>
                <button type="button" onClick={() => handleRemoveCourse(course._id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="submit-button"
            onClick={handleSubmitCourses}
          >
            Submit Selected Courses
          </button>
        </div>
      )}

      <h3>Submitted Courses</h3>
      <table className="student-courses-table">
        <thead>
          <tr>
            <th>S/N</th>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Unit</th>
            <th>Status</th>
            <th>Date Registered</th>
          </tr>
        </thead>
        <tbody>
          {enrichedSubmittedCourses.length > 0 ? (
            enrichedSubmittedCourses.map((course, index) => (
              <tr key={course._id}>
                <td data-label="S/N">{index + 1}</td>
                <td data-label="Course Code">{course.code}</td>
                <td data-label="Course Title">{course.title}</td>
                <td data-label="Unit">{course.unit}</td>
                <td
                  className={course.status === 'approved' ? 'approved' : course.status === 'failed' ? 'failed' : 'pending'}
                  data-label="Status"
                >
                  {course.status === 'approved' ? 'Approved' : course.status === 'failed' ? 'Failed' : 'Pending'}
                </td>
                <td data-label="Date Registered">
                  {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                No submitted courses yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="course-summary">
        <strong>Total Units:</strong> {totalUnits}
      </div>
    </div>
  );
};

export default StudentCourses;
