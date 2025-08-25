import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './SuperAdminLogin.css';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { ClipLoader } from "react-spinners";
import 'react-toastify/dist/ReactToastify.css';
import { MdEngineering } from 'react-icons/md';
import logo from '../assets/BADMAN.jpg';

const SuperAdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = 'Valid email is required';
    if (!formData.password || formData.password.length < 6)
      err.password = 'Password must be at least 6 characters';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return toast.error('Please fix the errors');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5003/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Login failed');

      localStorage.setItem('admin_token', result.token);
      toast.success('Login successful!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salogin-wrapper">
      <div className="salogin-left-panel">
        <img src={logo} alt="Logo" className="salogin-logo" />
       <h1>SOFCE</h1>
        <p>Welcome back!<br />Login to access your dashboard.</p>
      </div>

      <div className="salogin-right-panel">
        <form className="salogin-form" onSubmit={handleSubmit}>
          <h2 className="salogin-form-title"> <MdEngineering />Admin Login</h2>

          <div className="salogin-form-group">
            <FiMail className="salogin-icon" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Email</label>
            {errors.email && <small className="salogin-error">{errors.email}</small>}
          </div>

          <div className="salogin-form-group">
            <FiLock className="salogin-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label>Password</label>
            <button
              type="button"
              className="salogin-toggle-icon"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {errors.password && <small className="salogin-error">{errors.password}</small>}
          </div>

          <div className="salogin-extra-links">
            <Link to="/admin/forgot-password" className="salogin-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="salogin-btn" disabled={loading}>
            {loading ? <ClipLoader size={14} color="#fff" /> : "Login"}
          </button>

          <p className="salogin-footer-text">
            Don't have an account?
            <Link to="/signup-superadmin" className="salogin-link"> Sign up</Link>
          </p>
        </form>
         <p className="salogin-footer">Powered by BADMAN</p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default SuperAdminLogin;
