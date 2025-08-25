import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentPaymentPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import paystackLogo from '../assets/paystack.png';
import LoadingSpinner from './LoadingSpinner';

const StudentPaymentPage = () => {
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('student_token');

  useEffect(() => {
    if (!token) {
      navigate('/login-student');
      toast.warn('Please log in first');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/student/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setStudent(data);
        else toast.error(data.message || 'Failed to load profile');
      } catch {
        toast.error('Error fetching student profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await fetch('https://sof-edu-backend.onrender.com/student/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const formatted = Array.isArray(data)
            ? data.map(p => ({
                ...p,
                amount: p.amountExpected || 0,
                paid: p.amountPaid || 0,
                balance: (p.amountExpected || 0) - (p.amountPaid || 0),
              }))
            : [];
          setPayments(formatted);
        } else {
          toast.warn(data.message || 'Could not load payments');
        }
      } catch {
        toast.error('Error fetching payment records');
      }
    };

    fetchProfile();
    fetchPayments();
  }, [token, navigate]);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images or PDF receipts are allowed');
      return;
    }

    setReceipt(file);
    const formData = new FormData();
    formData.append('receipt', file);
    setUploading(true);

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/student/payments/upload-transfer-receipt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Receipt uploaded successfully');
        setReceipt(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        const refreshed = await fetch('https://sof-edu-backend.onrender.com/student/payments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshedData = await refreshed.json();
        if (refreshed.ok) {
          const formatted = Array.isArray(refreshedData)
            ? refreshedData.map(p => ({
                ...p,
                amount: p.amountExpected || 0,
                paid: p.amountPaid || 0,
                balance: (p.amountExpected || 0) - (p.amountPaid || 0),
              }))
            : [];
          setPayments(formatted);
        }
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const verifyPayment = async (reference) => {
    if (verifying) return;
    setVerifying(true);

    try {
      const res = await fetch(
        `https://sof-edu-backend.onrender.com/student/payments/verify-paystack/${reference}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success('Payment verified successfully!');
        navigate(`/payment-success?reference=${reference}`);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch {
      toast.error('Waiting for administration verification');
    } finally {
      setVerifying(false);
    }
  };

  const initiatePaystack = async () => {
    if (loadingPayment || !student) return;
    setLoadingPayment(true);

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/student/payments/initiate-paystack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'Payment initiation failed');
        return;
      }

      const handler = window.PaystackPop.setup({
        key: 'pk_test_910c018e2755e72aabab02f830453d1d2fd6a8ce',
        email: student.email,
        amount: data.amount * 100,
        metadata: data.metadata,
        callback: function (response) {
          toast.info('Verifying payment...');
          verifyPayment(response.reference);
        },
        onClose: function () {
          toast.warn('Payment window closed');
        },
      });

      handler.openIframe();
    } catch {
      toast.error('Could not initiate Paystack payment');
    } finally {
      setLoadingPayment(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!student) return null;

  return (
    <div className="spp-container">
      <ToastContainer position="top-right" />
      <h1 className="spp-header">Transaction History</h1>
      <p className="spp-name">
        Student Name: <strong>{student.firstname || 'N/A'} {student.lastname || ''}</strong>
      </p>
      <p className="spp-note">Your payment records are shown below.</p>

      <div className="spp-summary">
        <h2>Payment Summary</h2>
        <div className="spp-table-wrapper">
          <table className="spp-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Level</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((pmt, index) => (
                  <tr key={index}>
                    <td>{pmt.session}</td>
                    <td>{pmt.level}</td>
                    <td>₦{pmt.amount.toLocaleString()}</td>
                    <td>₦{pmt.paid.toLocaleString()}</td>
                    <td>₦{pmt.balance.toLocaleString()}</td>
                    <td>{pmt.status}</td>
                    <td>
                      {pmt.receiptURL ? (
                        <a href={pmt.receiptURL} target="_blank" rel="noopener noreferrer">View</a>
                      ) : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="spp-empty">No payment history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="spp-extra">
        <p className="spp-acceptance">Acceptance Fee: ₦20,000</p>
        <button
          className="spp-btn spp-paystack-btn"
          onClick={initiatePaystack}
          disabled={loadingPayment || verifying}
        >
          {loadingPayment ? (
            <span className="spp-spinner"></span>
          ) : (
            <>
              <img src={paystackLogo} alt="Paystack" className="spp-paystack-logo" />
              Click Here to Make Payment
            </>
          )}
        </button>

        <p className="spp-info">
          After completing your payment, you will be notified once it is verified by the bursary.
        </p>

        <div className="spp-upload">
          <label htmlFor="receipt-upload">Upload Receipt:</label>
          <input
            ref={fileInputRef}
            type="file"
            id="receipt-upload"
            accept="image/*,application/pdf"
            onChange={handleReceiptUpload}
          />
          {receipt && <p>Selected: {receipt.name}</p>}
          {uploading && <p>Uploading...</p>}
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentPage;
