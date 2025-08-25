import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdEngineering } from 'react-icons/md';

import './TeacherResetPassword.css';
import logo from '../assets/BADMAN.jpg';
import LoadingSpinner from './LoadingSpinner';

const TeacherResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('teacherResetEmail');

  const [code, setCode] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(true);
  const [codeError, setCodeError] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Email missing. Start from Forgot Password page.');
      navigate('/teacher/forgot-password');
    }
  }, [email, navigate]);

  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/\D/, '');
    if (!value) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (index < 5) inputsRef.current[index + 1].focus();
  };

  const handleCodeKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      setCodeError('Enter the 6-digit code');
      return;
    }

    setLoading(true);
    setCodeError('');
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/teacher/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCodeError(data.message || 'Invalid code');
      } else {
        toast.success('Code verified!');
        setShowCodeModal(false);
      }
    } catch (err) {
      console.error('Code verification error:', err);
      setCodeError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://sof-edu-backend.onrender.com/teacher/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.join(''), newPassword }),
      });

      const data = await res.json();
      if (!res.ok) toast.error(data.message || 'Reset failed');
      else {
        toast.success(data.message || 'Password reset successful');
        setTimeout(() => navigate('/login-teacher'), 2000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trp-wrapper">
      {loading && (
        <div className="trp-global-spinner">
          <LoadingSpinner />
        </div>
      )}

      <div className="trp-left-panel">
        <img src={logo} alt="Logo" className="trp-logo" />
        <h1>SOFCE</h1>
        <p>Reset your password safely. Enter your new password to continue.</p>
      </div>

      <div className="trp-right-panel">
        {showCodeModal ? (
          <div className="trp-modal-overlay">
            <div className="trp-modal">
              <h2>Enter Verification Code</h2>
              <div className="trp-code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(e, index)}
                    onKeyDown={(e) => handleCodeKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="trp-code-input"
                  />
                ))}
              </div>
              {codeError && <p className="trp-error">{codeError}</p>}
              <button
                className="trp-btn"
                onClick={handleVerifyCode}
                disabled={loading}
              >
                Verify Code
              </button>
            </div>
          </div>
        ) : (
          <form className="trp-form" onSubmit={handleSubmit}>
            <h2 className="trp-form-title">
              <MdEngineering /> Reset Password
            </h2>
            <div className="trp-form-group">
              <FaLock className="trp-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="trp-input"
                placeholder=" "
                required
              />
              <label className="trp-label">New Password</label>
              <span
                className="trp-toggle-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" className="trp-btn" disabled={loading}>
              Reset Password
            </button>
          </form>
        )}

        <p className="trp-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default TeacherResetPassword;
