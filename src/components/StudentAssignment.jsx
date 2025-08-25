import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './StudentAssignment.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [timers, setTimers] = useState({});
  const [grades, setGrades] = useState({});
  const [editMode, setEditMode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('student_token');
      if (!token) {
        toast.error('Session expired. Please login again.');
        return navigate('/login-student');
      }

      try {
        const [assignmentRes, submissionRes] = await Promise.all([
          axios.get('https://sof-edu.onrender.com/student/assignments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://sof-edu.onrender.com/student/submissions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const submissions = submissionRes.data.submissions;

        const merged = assignmentRes.data.assignments.map((assignment) => {
          const submission = submissions.find(
            (sub) => sub.assignmentId._id === assignment._id
          );
          return {
            ...assignment,
            submission: submission || null,
          };
        });

        setAssignments(merged);
      } catch (err) {
        console.error('Error fetching assignments or submissions:', err);
        toast.error('Failed to fetch data.');
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers = {};
      assignments.forEach((assignment) => {
        updatedTimers[assignment._id] = getTimeRemaining(assignment.deadline);
      });
      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [assignments]);

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end - now;

    if (diff <= 0) return 'Deadline passed';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e, assignmentId, isUpdate = false) => {
    e.preventDefault();
    const token = localStorage.getItem('student_token');
    if (!token) {
      toast.error('Please login again.');
      return navigate('/login-student');
    }

    const formData = new FormData();
    formData.append('message', message);
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const url = isUpdate
        ? `https://sof-edu.onrender.com/student/assignments/${assignmentId}/update`
        : `https://sof-edu.onrender.com/student/assignments/${assignmentId}/submit`;

      const method = isUpdate ? axios.put : axios.post;

      await method(url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(isUpdate ? 'Submission updated!' : 'Submitted successfully!');
      setMessage('');
      setFiles([]);
      setEditMode(null);
      window.location.reload();
    } catch (err) {
      console.error('Submission failed:', err);
      toast.error('Failed to submit assignment.');
    }
  };

  const fetchGrade = async (assignmentId) => {
    const token = localStorage.getItem('student_token');
    try {
      const res = await axios.get(
        `https://sof-edu.onrender.com/student/assignment/${assignmentId}/grade`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGrades((prev) => ({
        ...prev,
        [assignmentId]: res.data,
      }));
    } catch (error) {
      console.error('Error fetching grade:', error);
      toast.error('Failed to fetch grade.');
    }
  };

  const toggleExpanded = (id, isSubmitted) => {
    const newId = expandedId === id ? null : id;
    setExpandedId(newId);
    if (newId && isSubmitted && !grades[id]) {
      fetchGrade(id);
    }
  };

  const generatePDF = (assignment, previewOnly = false) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Assignment: ${assignment.title}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Description:`, 10, 30);
    doc.text(assignment.description, 10, 40, { maxWidth: 180 });
    doc.text(`Deadline: ${new Date(assignment.deadline).toLocaleString()}`, 10, 60);

    if (previewOnly) {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      doc.save(`${assignment.title.replace(/\s+/g, '_')}_assignment.pdf`);
    }
  };

  return (
    <div className="student-assignment-wrapper">
      <h2 className="student-assignment-title">Available Assignments</h2>

      <ul className="student-assignment-list">
        {assignments.map((assignment) => {
          const isSubmitted = !!assignment.submission;
          const isDeadlinePassed = new Date(assignment.deadline) < new Date();
          const isEditing = editMode === assignment._id;

          return (
            <li key={assignment._id} className="student-assignment-item">
              <div
                className="student-assignment-header"
                onClick={() => toggleExpanded(assignment._id, isSubmitted)}
              >
                <span>
                  <strong>{assignment.course?.code || 'Course'}:</strong>{' '}
                  {assignment.course?.title || 'N/A'}
                </span>
                {expandedId === assignment._id ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedId === assignment._id && (
                <div className="student-assignment-details">
                  <h3>{assignment.title}</h3>
                  <p><strong>Description:</strong> {assignment.description}</p>
                  <p><strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}</p>
                  <p><strong>Time Remaining:</strong> {timers[assignment._id]}</p>
                  <p><strong>Status:</strong> {isSubmitted ? 'Submitted' : 'Pending'}</p>

                  {grades[assignment._id] && (
                    <p><strong>Grade:</strong> {grades[assignment._id].score} / 100</p>
                  )}

                  <div className="pdf-buttons">
                    <button onClick={() => generatePDF(assignment, true)} className="preview-button">
                      Preview PDF
                    </button>
                    <button onClick={() => generatePDF(assignment)} className="download-button">
                      Download PDF
                    </button>
                  </div>

                  {isSubmitted && !isEditing && (
                    <>
                      <div className="submitted-info">
                        <p><strong>Your Message:</strong> {assignment.submission.message}</p>
                        <p><strong>Submitted Files:</strong></p>
                        <ul>
                          {assignment.submission.fileUrls.map((file, i) => (
                            <li key={i}>
                              <a
                                href={`http://localhost:5003${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.split('/').pop()}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {!isDeadlinePassed && (
                        <button
                          className="edit-button"
                          onClick={() => {
                            setEditMode(assignment._id);
                            setMessage(assignment.submission.message);
                          }}
                        >
                          Edit Submission
                        </button>
                      )}
                    </>
                  )}

                  {!isDeadlinePassed && (!isSubmitted || isEditing) && (
                    <form
                      className="student-assignment-form"
                      onSubmit={(e) =>
                        handleSubmit(e, assignment._id, isSubmitted)
                      }
                    >
                      <textarea
                        className="student-assignment-textarea"
                        placeholder="Write your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        required
                      />
                      <input
                        type="file"
                        className="student-assignment-file-input"
                        multiple
                        onChange={handleFileChange}
                      />
                      {files.length > 0 && (
                        <div className="file-preview">
                          <strong>Selected Files:</strong>
                          <ul>
                            {files.map((file, index) => (
                              <li key={index}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <button className="student-assignment-submit-button" type="submit">
                        {isSubmitted ? 'Update Submission' : 'Submit Assignment'}
                      </button>
                    </form>
                  )}

                  {isDeadlinePassed && isSubmitted && (
                    <p style={{ color: 'gray', marginTop: '10px' }}>
                      Deadline has passed. Editing disabled.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StudentAssignment;
