import React, { useState } from 'react';
import './TeacherLogin.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { MdEngineering } from 'react-icons/md';
import { ClipLoader } from "react-spinners";
import logo from '../assets/BADMAN.jpg';

const TeacherLogin = () => {
  const [formData, setFormData] = useState({
    teacherId: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const err = {};
    if (!formData.teacherId.trim()) err.teacherId = 'Teacher ID is required';
    if (!formData.password) err.password = 'Password is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5003/teacher/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Login failed');

      if (result.token) {
        localStorage.setItem('teacher_token', result.token);
        toast.success('Logged in successfully!');
        setTimeout(() => navigate('/teacher-dashboard'), 1500);
      } else {
        toast.error('No token received from server.');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tl-wrapper">
      <div className="tl-left-panel">
        <img src={logo} alt="Logo" className="tl-logo" />
        <h1>SOFCE</h1>
        <p>Please enter your details to login</p>
      </div>

      <div className="tl-right-panel">
        <form className="tl-form" onSubmit={handleSubmit} noValidate>
         <h2 className="tl-form-title"><MdEngineering /> Staff Login</h2>

          <div className="tl-form-group">
            <FaUser className="tl-icon" />
            <input
              type="text"
              name="teacherId"
              value={formData.teacherId}
              onChange={handleChange}
              placeholder=" "
              className="tl-input"
              autoComplete="username"
            />
            <label className="tl-label">Staff ID</label>
            {errors.teacherId && <small className="tl-error">{errors.teacherId}</small>}
          </div>

          <div className="tl-form-group tl-password">
            <FaLock className="tl-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              className="tl-input"
              autoComplete="current-password"
            />
            <label className="tl-label">Password</label>
            <button
              type="button"
              className="tl-toggle-icon"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && <small className="tl-error">{errors.password}</small>}
          </div>

          <div className="tl-extra-links">
            <Link to="/teacher/forgot-password" className="tl-link">Forgot Password?</Link>
          </div>

          <button type="submit"  disabled={loading} className="tl-btn">
             {loading ? <ClipLoader size={14} color="#fff" /> : "Login"}
          </button>

          <p className="tl-footer-text">
            Don't have an account? <Link to="/signup-teacher" className="tl-link">Sign Up</Link>
          </p>
        </form>
        <p className="tl-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
      
    </div>
  );
};

export default TeacherLogin;
