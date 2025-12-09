// src/components/LoginPopup.jsx
import React, { useState } from 'react';
import '../css/AuthPopup.css';
import { listUsers } from "../api/users";
import { useAuth } from "../context/AuthContext";

const LoginPopup = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false); // kept for UI; persistence handled by AuthContext
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await listUsers(); // GET /users
      const users = Array.isArray(res.data) ? res.data : [];

      const match = users.find(u =>
        String(u.email || '').toLowerCase() === String(formData.email).toLowerCase() &&
        String(u.password || '') === String(formData.password)
      );

      if (!match) {
        alert('Invalid email or password');
        return;
      }

      // Persist via AuthContext (writes to localStorage)
      login({
        id: match.userId ?? match.id,
        username: match.username,
        email: match.email,
      });

      onClose();
    } catch (err) {
      console.error(err);
      alert('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Placeholder for future OAuth flow
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-popup" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>×</button>

        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-avatar">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4C22.2091 4 24 5.79086 24 8V12C24 14.2091 22.2091 16 20 16C17.7909 16 16 14.2091 16 12V8C16 5.79086 17.7909 4 20 4Z" fill="#8B5CF6"/>
                <path d="M12 20C12 16.6863 14.6863 14 18 14H22C25.3137 14 28 16.6863 28 20V32C28 34.2091 26.2091 36 24 36H16C13.7909 36 12 34.2091 12 32V20Z" fill="#6366F1"/>
                <circle cx="17" cy="22" r="1.5" fill="white"/>
                <circle cx="23" cy="22" r="1.5" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 className="auth-title">NOTES APP</h1>
          <p className="auth-subtitle">Login to your account</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label className="auth-label">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <input
                type="email"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                required
                autoComplete="email"
              />
            </label>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">
              <svg className="auth-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  {showPassword ? (
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                  ) : (
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                  )}
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  {showPassword && <path d="m1 1 22 22" stroke="currentColor" strokeWidth="2"/>}
                </svg>
              </button>
            </label>
          </div>

          <div className="auth-options">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="auth-checkmark"></span>
              Remember me
            </label>
            <button type="button" className="auth-forgot-link">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <button className="auth-google-btn" onClick={handleGoogleLogin}>
          <svg className="auth-google-icon" width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button> */}

        <div className="auth-switch">
          Not a member?{" "}
          <button
            type="button"
            className="auth-switch-link"
            onClick={onSwitchToRegister}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
