import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';
import { FaIdCard, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { ClipLoader } from "react-spinners";
import 'react-toastify/dist/ReactToastify.css';
import { MdEngineering } from 'react-icons/md';
import logo from '../assets/BADMAN.jpg';

const LoginForm = () => {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setFormData({ ...formData, [e.target.name]: value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const err = {};
    if (!formData.studentId) err.studentId = 'Student ID is required';
    if (!formData.password) err.password = 'Password is required';
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
      console.log("Submitting login for studentId:", formData.studentId);

      const response = await fetch('https://sof-edu-backend.onrender.com/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        toast.error("Invalid server response");
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(data.message || 'Unauthorized: Invalid credentials');
        } else if (response.status === 403) {
          toast.error(data.message || 'Access forbidden');
        } else {
          toast.error(data.message || 'Login failed');
        }
      } else {
        toast.success('Login successful');
        if (data.token) {
          localStorage.setItem('student_token', data.token);
        }
        if (data.student?.firstname) {
          localStorage.setItem('studentFirstname', data.student.firstname);
        }
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Login error (network or server issue):', error);
      toast.error('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lsf-wrapper">
      <div className="lsf-left-panel">
        <img src={logo} alt="Logo" className="lsf-logo" />
        <h1>SOFCE</h1>
        <p>
          Welcome back!<br />Please enter your details to Login.
        </p>
      </div>

      <div className="lsf-right-panel">
        <form className="lsf-form" onSubmit={handleSubmit}>
          <h2 className="lsf-form-title"><MdEngineering /> Student Login</h2>

          <div className="lsf-form-group">
            <FaIdCard className="lsf-icon" />
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="lsf-input"
              placeholder=" "
              required
            />
            <label className="lsf-label">Student ID</label>
            {errors.studentId && <small className="lsf-error">{errors.studentId}</small>}
          </div>

          <div className="lsf-form-group">
            <FaLock className="lsf-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="lsf-input"
              placeholder=" "
              required
            />
            <label className="lsf-label">Password</label>
            <span
              className="lsf-toggle-icon"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <small className="lsf-error">{errors.password}</small>}
          </div>

          <div className="lsf-extra-links">
            <Link to="/student/forgot-password" className="lsf-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="lsf-btn" disabled={loading}>
            {loading ? <ClipLoader size={14} color="#fff" /> : "Login"}
          </button>

          <p className="lsf-footer-text">
            Don't have an account?
            <Link to="/signup-student" className="lsf-link"> Sign up</Link>
          </p>
        </form>
        <p className="lsf-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default LoginForm;
