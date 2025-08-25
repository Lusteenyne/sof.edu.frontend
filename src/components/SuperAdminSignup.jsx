import React, { useState } from 'react';
import './SuperAdminSignup.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaShieldAlt,
} from 'react-icons/fa';
import { ClipLoader } from "react-spinners";
import { MdEngineering } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/BADMAN.jpg';

const securityQuestions = [
  "What is your mother's maiden name?",
  "What was your first pet's name?",
  "What was the name of your first school?",
  "What city were you born in?",
];

const SuperAdminSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    securityQuestion: '',
    securityAnswer: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateStepOne = () => {
    const err = {};
    if (!formData.firstName.trim()) err.firstName = 'First name is required.';
    if (!formData.lastName.trim()) err.lastName = 'Last name is required.';
    if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = 'Invalid email.';
    if (!/^\+?\d{7,15}$/.test(formData.phone)) err.phone = 'Invalid phone number.';
    if (!formData.gender) err.gender = 'Gender is required.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStepTwo = () => {
    const err = {};
    
    if (formData.password.length < 6) err.password = 'Minimum 6 characters.';
    if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match.';
    if (!formData.securityQuestion) err.securityQuestion = 'Select a security question.';
    if (!formData.securityAnswer.trim()) err.securityAnswer = 'Provide an answer.';
    if (!formData.agreeToTerms) err.agreeToTerms = 'You must agree to continue.';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStepOne()) setStep(2);
    else toast.error('Fix errors before continuing');
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStepTwo()) {
      toast.error('Fix errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      toast.success('Registration successful!');
      setTimeout(() => navigate('/login-superadmin'), 2000);
    } catch (err) {
      toast.error(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sas-wrapper">
      <div className="sas-left-panel">
        <img src={logo} alt="Logo" className="sas-logo" />
      <h1>SOFCE</h1>
        <p>Create your Admin account<br />to manage the portal.</p>
      </div>

      <div className="sas-right-panel">
        <form className="sas-form" onSubmit={handleSubmit} noValidate>
          <h2 className="sas-form-title"><MdEngineering /> Admin Signup</h2>

          {step === 1 && (
            <>
              <div className="sas-form-group">
                <FaUser className="sas-icon" />
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder=" " />
                <label className={formData.firstName ? 'float' : ''}>First Name</label>
                {errors.firstName && <small className="sas-error">{errors.firstName}</small>}
              </div>

              <div className="sas-form-group">
                <FaUser className="sas-icon" />
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder=" " />
                <label className={formData.lastName ? 'float' : ''}>Last Name</label>
                {errors.lastName && <small className="sas-error">{errors.lastName}</small>}
              </div>

              <div className="sas-form-group">
                <FaEnvelope className="sas-icon" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder=" " />
                <label className={formData.email ? 'float' : ''}>Email</label>
                {errors.email && <small className="sas-error">{errors.email}</small>}
              </div>

              <div className="sas-form-group">
                <FaPhone className="sas-icon" />
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder=" " />
                <label className={formData.phone ? 'float' : ''}>Phone</label>
                {errors.phone && <small className="sas-error">{errors.phone}</small>}
              </div>

              <div className="sas-form-group">
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {errors.gender && <small className="sas-error">{errors.gender}</small>}
              </div>

              <div className="sas-btn-group">
                <button type="button" className="sas-btn" onClick={handleNext}>Next</button>
              </div>
              <p className="sas-footer-text">
            Already have an account?
            <Link to="/login-superadmin" className="sas-link"> Login</Link>
          </p>
            </>
          )}

          {step === 2 && (
            <>
              <div className="sas-form-group">
                <FaLock className="sas-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label className={formData.password ? 'float' : ''}>Password</label>
                <span className="sas-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.password && <small className="sas-error">{errors.password}</small>}
              </div>

              <div className="sas-form-group">
                <FaLock className="sas-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label className={formData.confirmPassword ? 'float' : ''}>Confirm Password</label>
                <span className="sas-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {errors.confirmPassword && <small className="sas-error">{errors.confirmPassword}</small>}
              </div>

              <div className="sas-form-group">
                <FaShieldAlt className="sas-icon" />
                <select name="securityQuestion" value={formData.securityQuestion} onChange={handleChange}>
                  <option value="">Select Security Question</option>
                  {securityQuestions.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {errors.securityQuestion && <small className="sas-error">{errors.securityQuestion}</small>}
              </div>

              <div className="sas-form-group">
                <input
                  type="text"
                  name="securityAnswer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  placeholder=" "
                />
                <label className={formData.securityAnswer ? 'float' : ''}>Security Answer</label>
                {errors.securityAnswer && <small className="sas-error">{errors.securityAnswer}</small>}
              </div>

              <div className="sas-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  I agree to the <a href="/terms" target="_blank">Terms & Conditions</a>
                </label>
                {errors.agreeToTerms && <small className="sas-error">{errors.agreeToTerms}</small>}
              </div>

              <div className="sas-btn-group">
                <button type="button" className="sas-btn-outline" onClick={handleBack}>Back</button>
                <button type="submit" className="sas-btn" disabled={loading}>
                   {loading ? <ClipLoader size={14} color="#fff" /> : "Sign Up"}
          
                </button>
              </div>
            </>
          )}

          
        </form>
           {/* <p className="sas-footer">Powered by BADMAN</p> */}
      </div>

      <ToastContainer position="top-right" autoClose={4000} />
    </div>
  );
};

export default SuperAdminSignup;
