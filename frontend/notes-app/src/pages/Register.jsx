// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';
import api from "../api/client";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || submitting) return;
    
    setSubmitting(true);
    try {
      await api.post("/users/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      alert('Registration successful! Please login.');
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err?.response?.data || "Registration failed";
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {/* LEFT SIDE - Form */}
      <div className="register-left">
        <div className="register-form-wrapper">
          
          {/* Header */}
          <div className="register-header">
            <div className="register-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#6366f1"/>
                <path d="M16 18h16M16 24h16M16 30h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="register-title">Notes App</h1>
            <p className="register-subtitle">Create your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            
            {/* Username Input */}
            <div className="input-group">
              <label className="input-label">
                <svg className="input-icon" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your Username"
                  className={`input-field ${errors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

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
                  className={`input-field ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
              {errors.email && <span className="error-text">{errors.email}</span>}
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
                  className={`input-field ${errors.password ? 'error' : ''}`}
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
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="input-group">
              <label className="input-label">
                <svg className="input-icon" width="20" height="20"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M12 17v-2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Creating Account..." : "Create Account"}
            </button>

            {/* Switch to Login */}
            <div className="register-switch">
              Already have an account?{' '}
              <button 
                type="button" 
                className="switch-link"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* RIGHT SIDE - Hero */}
      <div className="register-right">
        <div className="hero-content">
          <h2 className="hero-title">Join Notes App Today</h2>
          <p className="hero-description">
            Create an account and start organizing your thoughts in seconds.
          </p>
          <div className="hero-features">
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Free to use</span>
            </div>
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="feature">
              <svg width="24" height="24"
                viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span>Start organizing instantly</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Register;