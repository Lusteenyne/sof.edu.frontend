// TeacherSignupPage.jsx
import React, { useState } from 'react';
import './TeacherSignupForm.css';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash,
} from 'react-icons/fa';
import { MdEngineering } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ClipLoader } from "react-spinners";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/BADMAN.jpg';

const departments = [
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
  'Computer Engineering', 'Agricultural Engineering',
];

const TeacherSignupPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '', firstName: '', lastName: '', email: '',
    department: '', password: '', confirmPassword: '',
    cv: null, certificate: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStepOne = () => {
    const err = {};
    if (!formData.title) err.title = 'Title is required';
    if (!formData.firstName) err.firstName = 'First name is required';
    if (!formData.lastName) err.lastName = 'Last name is required';
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) err.email = 'Valid email is required';
    if (!formData.department) err.department = 'Department is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStepTwo = () => {
    const err = {};
    if (!formData.password || formData.password.length < 6) err.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match';
    if (!formData.cv) err.cv = 'CV is required';
    if (!formData.certificate) err.certificate = 'Certificate is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStepOne()) setStep(2);
    else toast.error("Please fix the errors in Step 1.");
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStepTwo()) {
      toast.error("Please fix the errors in Step 2.");
      return;
    }

    setLoading(true);
    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val) payload.append(key, val);
    });

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/teacher/register', {
        method: 'POST',
        body: payload,
      });

      const result = await res.json();
      if (!res.ok) toast.error(result.message || 'Signup failed');
      else {
        toast.success('Registration successful!');
        setTimeout(() => navigate('/login-teacher'), 2000);
      }
    } catch {
      toast.error('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, type = 'text', icon = null, isPassword = false, show = false, toggle = null) => (
    <div className="tsf-form-group">
      {icon && <span className="tsf-icon">{icon}</span>}
      <input
        type={isPassword ? (show ? 'text' : 'password') : type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        placeholder=""
      />
      <label>{label}</label>
      {isPassword && toggle && (
        <span className="tsf-toggle-icon" onClick={toggle}>
          {show ? <FaEyeSlash /> : <FaEye />}
        </span>
      )}
      {errors[name] && <span className="tsf-error">{errors[name]}</span>}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="tsf-form-group">
      <select name={name} value={formData[name]} onChange={handleChange}>
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <label>{label}</label>
      {errors[name] && <span className="tsf-error">{errors[name]}</span>}
    </div>
  );

  return (
    <div className="tsf-wrapper">
      <div className="tsf-left-panel">
        <img src={logo} alt="Logo" className="tsf-logo" />
        <h1>SOFCE</h1>
        <p>Welcome to the Staff Portal Registration</p>
      </div>
      <motion.div
        className="tsf-right-panel"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        <form className="tsf-form" onSubmit={handleSubmit}>
          <h2><MdEngineering /> Staff Signup</h2>

          <div className="tsf-step-indicator">
            <span className={step >= 1 ? 'active' : ''}></span>
            <span className={step === 2 ? 'active' : ''}></span>
          </div>

          {step === 1 && (
            <>
              {renderSelect('title', 'Title', ['Engr', 'Dr', 'Prof'])}
              {renderInput('firstName', 'First Name', 'text', <FaUser />)}
              {renderInput('lastName', 'Last Name', 'text', <FaUser />)}
              {renderInput('email', 'Email', 'email', <FaEnvelope />)}
              {renderSelect('department', 'Department', departments)}

              <div className="tsf-btn-group">
                <button type="button"className="tsf-btn" onClick={handleNext}>Next</button>
              </div>
              {/* Login redirect only on Step 1 */}
    <div className="tsf-login-redirect">
      <span>Already have an account?</span>
      <a href="/login-teacher" className="tsf-login-link">Login</a>
    </div>
            </>
          )}

          {step === 2 && (
            <>
              {renderInput('password', 'Password', 'password', <FaLock />, true, showPassword, () => setShowPassword(!showPassword))}
              {renderInput('confirmPassword', 'Confirm Password', 'password', <FaLock />, true, showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}

              {[{ name: 'cv', label: 'Upload CV' }, { name: 'certificate', label: 'Upload Certificate' }].map(({ name, label }) => (
                <div className="tsf-form-group" key={name}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFormData({ ...formData, [name]: e.target.files[0] })}
                  />
                  <label>{label}</label>
                  {errors[name] && <span className="tsf-error">{errors[name]}</span>}
                </div>
              ))}

              <div className="tsf-btn-group">
                <button type="button" className="tsf-btn-outline" onClick={handleBack}>Back</button>
                <button type="submit"className="tsf-btn" disabled={loading}>
                 {loading ? <ClipLoader size={14} color="#fff" /> : "Sign Up"}
                </button>
              </div>
            </>
          )}
 

        </form>

        {/* <p className="tsf-footer">Powered by BADMAN</p> */}
        <ToastContainer position="top-right" autoClose={3000} />
      </motion.div>
    </div>
  );
};

export default TeacherSignupPage;
