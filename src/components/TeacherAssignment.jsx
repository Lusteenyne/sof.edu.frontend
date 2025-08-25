import React, { useState, useEffect } from 'react';
import './TeacherAssignment.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrashAlt } from 'react-icons/fa';
import LoadingSpinner from './LoadingSpinner';

const TeacherAssignment = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [editId, setEditId] = useState(null);
  const [visibleSubmissionsAssignmentId, setVisibleSubmissionsAssignmentId] = useState(null);

  const token = localStorage.getItem('teacher_token');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/teacher/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  useEffect(() => {
    if (selectedCourseId) fetchAssignments();
  }, [selectedCourseId]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`https://sof-edu-backend.onrender.com/teacher/course/${selectedCourseId}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await fetch(`https://sof-edu-backend.onrender.com/teacher/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : data.submissions || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !deadline || !selectedCourseId) {
      toast.error('All fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('deadline', deadline);
    if (file) formData.append('files', file);

    setSubmitting(true);

    try {
      const url = editId
        ? `https://sof-edu-backend.onrender.com/teacher/assignments/${editId}`
        : `https://sof-edu-backend.onrender.com/teacher/course/${selectedCourseId}/give-assignments`;
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();

      if (res.ok) {
        toast.success(editId ? 'Assignment updated.' : 'Assignment posted.');
        setTitle('');
        setDescription('');
        setDeadline('');
        setFile(null);
        setEditId(null);
        fetchAssignments();
      } else toast.error(data.message || 'Submission failed');
    } catch (err) {
      toast.error('Server error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDeadline(new Date(assignment.deadline).toISOString().slice(0, 16));
    setEditId(assignment._id);
    setFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await fetch(`https://sof-edu-backend.onrender.com/teacher/assignments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Assignment deleted');
        fetchAssignments();
      } else toast.error('Failed to delete');
    } catch (err) {
      toast.error('Server error');
    }
  };

  const handleGradeSubmit = async (submissionId, score) => {
    if (score === undefined || score === null || isNaN(score)) {
      toast.error('Invalid score');
      return;
    }

    try {
      const res = await fetch(`https://sof-edu-backend.onrender.com/teacher/assignments/submission/${submissionId}/grade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(score) }),
      });

      if (res.ok) {
        toast.success('Score saved');
        fetchSubmissions(visibleSubmissionsAssignmentId);
      } else toast.error('Failed to save score');
    } catch (err) {
      toast.error('Server error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="teacher-assignment-wrapper">
      <h2>Assignments</h2>

      <label>
        Select Course:
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="teacher-assignment-input"
        >
          <option value="">-- Choose a course --</option>
          {courses.map((cw) => {
            const c = cw.course || cw;
            return (
              <option key={c._id} value={c._id}>
                {c.code || 'Code'} - {c.title || 'Title'} ({cw.department || ''})
              </option>
            );
          })}
        </select>
      </label>

      {selectedCourseId && (
        <>
          <form className="teacher-assignment-form" onSubmit={handleSubmit}>
            <label>Title:
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>

            <label>Description:
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </label>

            <label>Deadline:
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </label>

            <label>Attach Document (optional):
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : editId ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </form>

          <h3>Existing Assignments</h3>
          <ul className="assignment-list">
            {assignments.map((a) => (
              <li key={a._id}>
                <strong>{a.title}</strong> - Due: {new Date(a.deadline).toLocaleString()}
                {a.fileUrls?.length > 0 && (
                  <div>
                    <a href={`https://sof-edu-backend.onrender.com${a.fileUrls[0]}`} target="_blank" rel="noopener noreferrer" download>
                      Download File
                    </a>
                  </div>
                )}
                <button onClick={() => handleEdit(a)}>Edit</button>
                <button onClick={() => handleDelete(a._id)} style={{ marginLeft: '10px', color: 'red' }}>
                  <FaTrashAlt />
                </button>
                <button
                  onClick={() => {
                    const nextId = visibleSubmissionsAssignmentId === a._id ? null : a._id;
                    setVisibleSubmissionsAssignmentId(nextId);
                    if (nextId) fetchSubmissions(a._id);
                  }}
                  style={{ marginLeft: '10px' }}
                >
                  {visibleSubmissionsAssignmentId === a._id ? 'Hide Submissions' : 'View Submissions'}
                </button>

                {visibleSubmissionsAssignmentId === a._id && (
                  <div className="submission-list">
                    <h3>Submitted Assignments</h3>
                    {submissions.length === 0 ? (
                      <p>No submissions yet.</p>
                    ) : (
                      submissions.map((s) => (
                        <div key={s._id} className="submission-card">
                          <p><strong>Student:</strong> {s.studentId ? `${s.studentId.firstname} ${s.studentId.lastname}` : 'Unknown'}</p>
                          <p><strong>Level:</strong> {s.studentId?.level || 'N/A'}</p>
                          <p><strong>Department:</strong> {s.studentId?.department || 'N/A'}</p>
                          <p><strong>Message:</strong> {s.message}</p>
                          <p><strong>Submitted At:</strong> {new Date(s.submittedAt).toLocaleString()}</p>
                          {s.fileUrls?.map((url, idx) => (
                            <div key={idx}>
                              <a href={`https://sof-edu-backend.onrender.com${url}`} target="_blank" rel="noopener noreferrer" download>
                                View / Download File
                              </a>
                            </div>
                          ))}
                          <div className="grade-section">
                            <label>Score:</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={s.localScore ?? (s.score ?? '')}
                                onChange={(e) => {
                                  const updated = submissions.map(sub =>
                                    sub._id === s._id ? { ...sub, localScore: Number(e.target.value) } : sub
                                  );
                                  setSubmissions(updated);
                                }}
                                style={{ width: '80px', marginRight: '5px' }}
                              />
                              /100
                            </div>
                            <button
                              onClick={() => handleGradeSubmit(s._id, s.localScore ?? s.score)}
                              disabled={(s.localScore ?? s.score) === s.score}
                            >
                              {s.score ? 'Update' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default TeacherAssignment;
