
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SuperAdminBilling.css';
import LoadingSpinner from './LoadingSpinner';

const SuperAdminBilling = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [schoolFee, setSchoolFee] = useState(0);
  const [editingFee, setEditingFee] = useState(false);
  const [newFee, setNewFee] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login-superadmin');
      return;
    }
    const init = async () => {
      try {
        setLoading(true);
        await fetchStudents();
        await fetchSchoolFee();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  useEffect(() => {
    if (students.length > 0) loadAllPayments();
  }, [students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5003/admin/students', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data.students);
      toast.success(`Fetched ${res.data.students.length} students`);
    } catch {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolFee = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:5003/admin/payments/config', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchoolFee(res.data.amount);
    } catch {
      toast.error('Failed to fetch school fee config');
    } finally {
      setLoading(false);
    }
  };

  const loadAllPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const allPayments = [];

      for (const student of students) {
        try {
          const res = await axios.get(
            `http://localhost:5003/admin/payments/student/${student._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          allPayments.push(...res.data.payments);
        } catch {}
      }

      setPayments(allPayments);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFee = () => {
    setEditingFee(true);
    setNewFee(schoolFee.toString());
  };

  const saveSchoolFee = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        'http://localhost:5003/admin/payments/config',
        { amount: Number(newFee) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchoolFee(Number(newFee));
      setEditingFee(false);
      toast.success('School fee updated');
    } catch {
      toast.error('Failed to update fee');
    } finally {
      setLoading(false);
    }
  };

  const getStudentId = (p) =>
    typeof p.studentId === 'object' ? p.studentId._id : p.studentId;

  const updatePaymentStatus = async (paymentId, status) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      await axios.patch(
        `http://localhost:5003/admin/payments/${paymentId}/verify`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Payment ${status}d`);
      loadAllPayments();
    } catch {
      toast.error(`Failed to ${status} payment`);
    } finally {
      setLoading(false);
    }
  };

  const groupPaymentsByStudent = () => {
    const grouped = {};
    for (const payment of payments) {
      const student = students.find(s => getStudentId(payment) === s._id);
      if (!student) continue;
      const sid = student._id;
      if (!grouped[sid]) {
        grouped[sid] = {
          student,
          payments: [],
          hasPending: false,
        };
      }
      if (payment.status === 'pending') grouped[sid].hasPending = true;
      grouped[sid].payments.push(payment);
    }
    return grouped;
  };

  const groupedArray = Object.values(groupPaymentsByStudent());

  const filteredGroups = groupedArray
    .filter(({ student }) => {
      const fullName = `${student.firstname} ${student.lastname}`.toLowerCase();
      const matric = student.studentId.toLowerCase();
      return (
        (fullName.includes(searchQuery.toLowerCase()) || matric.includes(searchQuery.toLowerCase())) &&
        (!semesterFilter || student.semester === semesterFilter) &&
        (!departmentFilter || student.department === departmentFilter)
      );
    })
    .sort((a, b) => (b.hasPending ? 1 : 0) - (a.hasPending ? 1 : 0));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="sab-container">
      <ToastContainer />
      <h2 className="sab-title">Billing Management</h2>

      <div className="sab-fee-box">
        <strong>School Fee:</strong>{' '}
        {editingFee ? (
          <>
            <input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} />
            <button onClick={saveSchoolFee}>Save</button>
          </>
        ) : (
          <>
            ₦{schoolFee.toLocaleString()}
            <button onClick={handleEditFee}>Edit</button>
          </>
        )}
      </div>

      <div className="sab-filter-bar">
        <input
          type="text"
          placeholder="Search by name or matric"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)}>
          <option value="">All Semesters</option>
          {[...new Set(students.map(s => s.semester))].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
          <option value="">All Departments</option>
          {[...new Set(students.map(s => s.department))].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <table className="sab-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Matric</th>
            <th>Department</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
            <th>View</th>
          </tr>
        </thead>
        <tbody>
          {filteredGroups.map(({ student, payments }) => {
            const isExpanded = expandedStudent === student._id;
            const latestPayment = payments[0];

            return (
              <React.Fragment key={student._id}>
                <tr>
                  <td data-label="Name">{student.firstname} {student.lastname}</td>
                  <td data-label="Matric">{student.studentId}</td>
                  <td data-label="Department">{student.department}</td>
                  <td data-label="Semester">{student.semester}</td>
                  <td data-label="Status">{payments.some(p => p.status === 'pending') ? 'Pending' : 'Paid'}</td>
                  <td data-label="Actions">
                    {payments.some(p => p.status === 'pending') && (
                      <>
                        <button onClick={() => updatePaymentStatus(latestPayment._id, 'paid')}>Approve</button>
                        <button onClick={() => updatePaymentStatus(latestPayment._id, 'rejected')}>Reject</button>
                      </>
                    )}
                  </td>
                  <td data-label="View">
                    <button onClick={() => setExpandedStudent(prev => prev === student._id ? null : student._id)}>
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {isExpanded && payments.map(payment => (
                  <tr key={payment._id} className="sab-sub-row">
                    <td colSpan={7}>
                      <div className="sab-sub-content">
                        <div><strong>Date:</strong> {new Date(payment.createdAt).toLocaleDateString()}</div>
                        <div><strong>Amount:</strong> ₦{payment.amountPaid}</div>
                        <div><strong>Status:</strong> {payment.status}</div>
                        <div><strong>Session:</strong> {payment.session}</div>
                        <div><strong>Level:</strong> {payment.level}</div>
                        <div>
                          <strong>Receipt:</strong>{' '}
                          {payment.receiptURL ? (
                            <a className="view" href={payment.receiptURL} target="_blank" rel="noreferrer">View</a>
                          ) : 'N/A'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SuperAdminBilling;
