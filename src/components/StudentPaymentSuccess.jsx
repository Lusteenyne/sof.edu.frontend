import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './StudentPaymentSuccess.css';
import LoadingSpinner from './LoadingSpinner'; 

const StudentPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true); 
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const reference = query.get('reference');
    console.log('🔍 Extracted reference from URL:', reference);

    if (reference) {
      verifyPayment(reference);
    } else {
      console.warn('No reference found in URL. Redirecting...');
      navigate('/student-dashboard');
    }
  }, [location.search, navigate]);

  const verifyPayment = async (reference) => {
    try {
      const token = localStorage.getItem('student_token');
      console.log('📡 Sending request to verify payment with reference:', reference);

      const response = await axios.get(
        `https://sof-edu-backend.onrender.com/student/payments/verify-paystack/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Verification response:', response.data);

      const { payment } = response.data || {};
      if (payment) {
        const fullName = `${payment.firstname || ''} ${payment.lastname || ''}`.trim();
        setStudentName(fullName);
        setPaymentDetails({
          amount: payment.amountExpected,
          level: payment.level,
          session: payment.session,
        });

        console.log('Student Name:', fullName);
        console.log('Payment Amount:', payment.amountExpected);
        console.log('Level:', payment.level);
        console.log('Session:', payment.session);
      } else {
        console.warn('No payment data found in response');
      }

      toast.success('Payment verified successfully');
      setTimeout(() => {
        console.log('Redirecting to /student-dashboard...');
        navigate('/student-dashboard');
      }, 7000);
    } catch (err) {
      console.error('Payment verification failed:', err.response?.data || err.message);
      toast.error('Payment verification failed');
      setTimeout(() => {
        console.log('Redirecting to /student-dashboard after failure...');
        navigate('/student-dashboard');
      }, 8000);
    }
  };
 if (loading) return <LoadingSpinner />;
  return (
    <div className="sps-container">
      <div className="sps-card">
        <h1 className="sps-title">Payment Submitted Successfully</h1>

        <p className="sps-message">
          {studentName ? (
            <>
              <strong>{studentName}</strong> has successfully made a payment of{' '}
              <strong>₦{paymentDetails?.amount?.toLocaleString()}</strong> for{' '}
              <strong>{paymentDetails?.level} Level</strong> in the{' '}
              <strong>{paymentDetails?.session}</strong> academic session.
            </>
          ) : (
            <>Your payment has been submitted and is pending approval.</>
          )}
        </p>

        <p className="sps-note">
          Once verified and approved by the bursary department, your payment status will be updated.
          You will be redirected to your dashboard shortly.
        </p>

        <div className="sps-spinner" />
        <p className="sps-redirect">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default StudentPaymentSuccess;
