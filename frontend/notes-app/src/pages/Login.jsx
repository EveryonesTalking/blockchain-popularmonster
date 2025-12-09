// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const user = res.data;

      login({
        id: user.user_id || user.userId,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url || null,
        token: user.token,
      });

      navigate("/landing");

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE - Form */}
      <div className="login-left">
        <div className="login-form-wrapper">
          
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#6366f1"/>
                <path d="M16 18h16M16 24h16M16 30h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="login-title">Notes App</h1>
            <p className="login-subtitle">Login to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            
            {/* Email Input */}
            <div className="input-group">
              <label className="input-label">
                <svg className="input-icon" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <path d="M3 7l9 6 9-6"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your Email"
                  className="input-field"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label className="input-label">
                <svg className="input-icon" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M12 17v-2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="input-field"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8
                               a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4
                               c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19
                               m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </label>
            </div>

            {/* Options */}
            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button type="button" className="forgot-link">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Logging in..." : "Login"}
            </button>

            {/* Switch to Register */}
            <div className="login-switch">
              Not a member?{' '}
              <button 
                type="button" 
                className="switch-link"
                onClick={() => navigate("/register")}
              >
                Create New Account
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT SIDE - Hero */}
      <div className="login-right">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to Notes App</h2>
          <p className="hero-description">
            Organize your thoughts, ideas, and tasks in one beautiful place.
          </p>
          <div className="hero-features">
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Easy to use interface</span>
            </div>
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Organize with colors</span>
            </div>
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Secure and private</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;