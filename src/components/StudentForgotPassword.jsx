import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './StudentForgotPassword.css';
import { FaEnvelope } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdEngineering } from 'react-icons/md';
import logo from '../assets/BADMAN.jpg';

const StudentForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const err = {};
    if (!email) err.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) err.email = 'Invalid email format';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Fix errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5003/student/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Forgot Password Response:', data);

      if (!response.ok) {
        toast.error(data.message || 'Request failed');
      } else {
        toast.success('Password reset email sent!');
        // Store email for reset-password page
        localStorage.setItem('resetEmail', email);
        navigate('/student/reset-password', { state: { email } });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sfp-wrapper">
      <div className="sfp-left-panel">
        <img src={logo} alt="Logo" className="sfp-logo" />
        <h1>SOFCE</h1>
        <p>Forgot your password? Enter your email to reset it.</p>
      </div>

      <div className="sfp-right-panel">
        <form className="sfp-form" onSubmit={handleSubmit}>
          <h2 className="sfp-form-title">
            <MdEngineering /> Forgot Password
          </h2>

          <div className="sfp-form-group">
            <FaEnvelope className="sfp-icon" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className="sfp-input"
              placeholder=" "
              required
            />
            <label className="sfp-label">Email Address</label>
            {errors.email && <small className="sfp-error">{errors.email}</small>}
          </div>

          <button type="submit" className="sfp-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <p className="sfp-footer-text">
            Remember your password? <Link to="/login-student" className="sfp-link">Login</Link>
          </p>
        </form>
        <p className="sfp-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default StudentForgotPassword;
