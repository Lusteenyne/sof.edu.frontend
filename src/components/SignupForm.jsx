import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupForm.css';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { ClipLoader } from "react-spinners";
import { MdEngineering } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import logo from '../assets/BADMAN.jpg';

const departments = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Computer Engineering',
  'Agricultural Engineering',
];

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checkEmailExists = async (email) => {
    try {
      const res = await fetch(`https://sof-edu-backend.onrender.com/student/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return data.exists;
    } catch (err) {
      console.error('Check email error:', err);
      return false;
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateStep1 = () => {
    const err = {};
    if (!formData.firstName) err.firstName = 'First name is required';
    if (!formData.lastName) err.lastName = 'Last name is required';
    if (!formData.department) err.department = 'Select a department';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = () => {
    const err = {};
    if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = 'Valid email is required';
    if (formData.password.length < 6) err.password = 'Minimum 6 characters';
    if (formData.password !== formData.confirmPassword) err.confirmPassword = 'Passwords do not match';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
    else toast.error("Please fix errors on Step 1");
  };

  const handleBack = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) {
      toast.error("Please fix errors on Step 2");
      return;
    }

    setLoading(true);
    const exists = await checkEmailExists(formData.email);
    if (exists) {
      setErrors(prev => ({ ...prev, email: 'Email already in use' }));
      toast.error("Email already in use");
      setLoading(false);
      return;
    }

    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      department: formData.department,
      email: formData.email,
      password: formData.password,
      semester: 'First',
      level: '100'
    };

    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/student/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || 'Signup failed');
        return;
      }

      toast.success('Signup successful!');
      setTimeout(() => navigate('/login-student'), 1500);
    } catch (err) {
      toast.error('Server error. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ssu-wrapper">
      <div className="ssu-left-panel">
        <img src={logo} alt="Logo" className="ssu-logo" />
        <h1>SOFCE</h1>
        
        <p>Welcome to the Student Portal Registration <br/> Create your student account to get started.</p>
      </div>

      <div className="ssu-right-panel">
        <form className="ssu-form" onSubmit={handleSubmit}>
          <h2><MdEngineering /> Student Signup</h2>

          <div className="ssu-step-indicator">
            <span className={step === 1 ? 'active' : ''}></span>
            <span className={step === 2 ? 'active' : ''}></span>
          </div>

          {step === 1 && (
            <>
              {[{ name: 'firstName', icon: <FaUser />, label: 'First Name' },
                { name: 'lastName', icon: <FaUser />, label: 'Last Name' }].map(({ name, icon, label }) => (
                <div className="ssu-form-group" key={name}>
                  {icon && <span className="ssu-icon">{icon}</span>}
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder=" "
                    required
                  />
                  <label>{label}</label>
                  {errors[name] && <span className="ssu-error">{errors[name]}</span>}
                </div>
              ))}

              <div className="ssu-form-group">
                <MdEngineering className="ssu-icon" />
                <select name="department" value={formData.department} onChange={handleChange} required>
                  <option value="" disabled>Select Department</option>
                  {departments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                <label>Department</label>
                {errors.department && <span className="ssu-error">{errors.department}</span>}
              </div>

              <div className="ssu-btn-group">
                <button type="button" className="ssu-btn" onClick={handleNext}>Next</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="ssu-form-group">
                <FaEnvelope className="ssu-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Please provide a valid email"
                  required
                />
                <label>Email</label>
                {errors.email && <span className="ssu-error">{errors.email}</span>}
              </div>

              {['password', 'confirmPassword'].map((field) => (
                <div className="ssu-form-group" key={field}>
                  <FaLock className="ssu-icon" />
                  <input
                    type={(field === 'password' && showPassword) || (field === 'confirmPassword' && showConfirmPassword) ? 'text' : 'password'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder=" "
                    required
                  />
                  <label>{field === 'password' ? 'Password' : 'Confirm Password'}</label>
                  <span
                    className="ssu-toggle-icon"
                    onClick={() =>
                      field === 'password'
                        ? setShowPassword(prev => !prev)
                        : setShowConfirmPassword(prev => !prev)
                    }
                  >
                    {(field === 'password' ? showPassword : showConfirmPassword) ? <FaEyeSlash /> : <FaEye />}
                  </span>
                  {errors[field] && <span className="ssu-error">{errors[field]}</span>}
                </div>
              ))}

              <div className="ssu-btn-group">
                <button type="button" className="ssu-btn-outline" onClick={handleBack}>Back</button>
                <button type="submit"className="ssu-btn"  disabled={loading}>
                  {loading ? <ClipLoader size={14} color="#fff" /> : "Sign Up"}
                </button>
              </div>
            </>
          )}

         <div className="ssu-login-redirect">
  <span>Already have an account?</span>
  <a href="/login-student" className="ssu-login-link">Login</a>
</div>

        </form>
        {/* <p className="ssu-footer">Powered by BADMAN</p> */}
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default SignupForm;
