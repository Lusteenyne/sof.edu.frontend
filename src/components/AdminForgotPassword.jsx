import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminForgotPassword.css';
import { FaEnvelope } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdminPanelSettings } from 'react-icons/md';
import logo from '../assets/BADMAN.jpg';

const AdminForgotPassword = () => {
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
      const response = await fetch('https://sof-edu.onrender.com/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Admin Forgot Password Response:', data);

      if (!response.ok) {
        toast.error(data.message || 'Request failed');
      } else {
        toast.success('Password reset email sent!');
        // Store email for reset-password page
        localStorage.setItem('adminResetEmail', email);
        navigate('/admin/reset-password', { state: { email } });
      }
    } catch (error) {
      console.error('Admin forgot password error:', error);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="afp-wrapper">
      <div className="afp-left-panel">
        <img src={logo} alt="Logo" className="afp-logo" />
        <h1>SOFCE</h1>
        <p>Forgot your password? Enter your email to reset it.</p>
      </div>

      <div className="afp-right-panel">
        <form className="afp-form" onSubmit={handleSubmit}>
          <h2 className="afp-form-title">
            <MdAdminPanelSettings />Forgot Password
          </h2>

          <div className="afp-form-group">
            <FaEnvelope className="afp-icon" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className="afp-input"
              placeholder=" "
              required
            />
            <label className="afp-label">Email Address</label>
            {errors.email && <small className="afp-error">{errors.email}</small>}
          </div>

          <button type="submit" className="afp-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>

          <p className="afp-footer-text">
            Remember your password? <Link to="/login-superadmin" className="afp-link">Login</Link>
          </p>
        </form>
        <p className="afp-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default AdminForgotPassword;
