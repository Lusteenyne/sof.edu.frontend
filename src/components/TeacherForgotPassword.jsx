import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope } from 'react-icons/fa';
import logo from '../assets/BADMAN.jpg';
import { MdEngineering } from 'react-icons/md';
import './TeacherForgotPassword.css';

const TeacherForgotPassword = () => {
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
      const response = await fetch('http://localhost:5003/teacher/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Teacher Forgot Password Response:', data);

      if (!response.ok) {
        toast.error(data.message || 'Request failed');
      } else {
        toast.success(data.message || 'Reset code sent!');
        localStorage.setItem('teacherResetEmail', email);
        navigate('/teacher/reset-password', { state: { email } });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tfp-wrapper">
      <div className="tfp-left-panel">
        <img src={logo} alt="Logo" className="tfp-logo" />
        <h1>SOFCE</h1>
        <p>Forgot your password? Enter your email to reset it.</p>
      </div>

      <div className="tfp-right-panel">
        <form className="tfp-form" onSubmit={handleSubmit}>
          <h2 className="tfp-form-title">
            <MdEngineering /> Forgot Password
          </h2>

          <div className="tfp-form-group">
            <FaEnvelope className="tfp-icon" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className="tfp-input"
              placeholder=" "
              required
            />
            <label className="tfp-label">Email Address</label>
            {errors.email && <small className="tfp-error">{errors.email}</small>}
          </div>

          <button type="submit" className="tfp-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <p className="tfp-footer-text">
            Remember your password? <Link to="/login-teacher" className="tfp-link">Login</Link>
          </p>
        </form>
        <p className="tfp-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default TeacherForgotPassword;
