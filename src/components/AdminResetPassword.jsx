import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdEngineering } from 'react-icons/md';
import './AdminResetPassword.css';
import logo from '../assets/BADMAN.jpg';
import LoadingSpinner from './LoadingSpinner';

const AdminResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('adminResetEmail');

  const [code, setCode] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(true);
  const [codeError, setCodeError] = useState('');
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('Email is missing. Please start from Forgot Password page.');
      navigate('/admin/forgot-password');
    }
  }, [email, navigate]);

  const handleCodeChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ''); // only digits
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
    const enteredCode = code.map(d => d.trim()).join(''); // trim inputs
    console.log('Verifying code:', enteredCode, 'for email:', email);

    if (enteredCode.length !== 6) {
      setCodeError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setCodeError('');

    try {
      const res = await fetch('http://localhost:5003/admin/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      const data = await res.json();
      console.log('Verify Code Response:', data);

      if (!res.ok) {
        setCodeError(data.message || 'Invalid or expired code');
      } else {
        toast.success('Code verified successfully!');
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

    const enteredCode = code.map(d => d.trim()).join('');
    console.log('Resetting password with code:', enteredCode, 'for email:', email);

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5003/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode, newPassword }),
      });

      const data = await res.json();
      console.log('Reset Password Response:', data);

      if (!res.ok) {
        toast.error(data.message || 'Reset failed');
      } else {
        toast.success(data.message || 'Password reset successful');
        setTimeout(() => navigate('/login-superadmin'), 2000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="arp-wrapper">
      {loading && (
        <div className="arp-global-spinner">
          <LoadingSpinner />
        </div>
      )}

      <div className="arp-left-panel">
        <img src={logo} alt="Logo" className="arp-logo" />
        <h1>SOFCE</h1>
        <p>Reset your password safely. Enter your new password to continue.</p>
      </div>

      <div className="arp-right-panel">
        {showCodeModal ? (
          <div className="arp-modal-overlay">
            <div className="arp-modal">
              <h2>Enter Verification Code</h2>
              <div className="arp-code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(e, index)}
                    onKeyDown={(e) => handleCodeKeyDown(e, index)}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="arp-code-input"
                  />
                ))}
              </div>
              {codeError && <p className="arp-error">{codeError}</p>}
              <button className="arp-btn" onClick={handleVerifyCode} disabled={loading}>
                Verify Code
              </button>
            </div>
          </div>
        ) : (
          <form className="arp-form" onSubmit={handleSubmit}>
            <h2 className="arp-form-title">Reset Password</h2>
            <div className="arp-form-group">
              <FaLock className="arp-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="arp-input"
                placeholder=" "
                required
              />
              <label className="arp-label">New Password</label>
              <span className="arp-toggle-icon" onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" className="arp-btn" disabled={loading}>
              Reset Password
            </button>
          </form>
        )}

        <p className="arp-footer">Powered by BADMAN</p>
        <ToastContainer position="top-right" autoClose={4000} />
      </div>
    </div>
  );
};

export default AdminResetPassword;
