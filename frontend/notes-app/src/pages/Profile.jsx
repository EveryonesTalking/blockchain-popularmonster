// src/pages/Profile.jsx
import React, { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../css/Profile.css";

export default function Profile() {
  const { user, setUser } = useAuth();

  const [username, setUsername] = useState(user?.username || "");
  const [email] = useState(user?.email || ""); // Read-only
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(
    user?.avatarUrl ? user.avatarUrl : "/default-avatar.png"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.substring(0, 2).toUpperCase();
  };

  // Check if user has avatar
  const hasAvatar = () => {
    return user?.avatarUrl && user.avatarUrl !== "/default-avatar.png";
  };

  // Upload to Cloudinary
  const uploadToCloudinary = async () => {
    if (!avatarFile) return user?.avatarUrl || null;

    const formData = new FormData();
    formData.append("file", avatarFile);
    formData.append("upload_preset", "notes_avatar_preset");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dkoc2gprs/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log("CLOUDINARY RESPONSE:", data);
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary error:", err);
      throw new Error("Failed uploading avatar");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      let avatarUrl = user.avatarUrl;

      // Upload image first if there's a new one
      if (avatarFile) {
        avatarUrl = await uploadToCloudinary();
      }

      const body = {
        username,
        email,
        password: password || null,
        avatar_url: avatarUrl || null,
      };

      // Update in backend
      const res = await api.put(`/users/${user.id}`, body);

      const updatedUser = {
        id: user.id,
        username: res.data.username,
        email: res.data.email,

        // FIX: Normalize all cases
        avatarUrl: res.data.avatarUrl || res.data.avatar_url || null,
        avatar_url: res.data.avatarUrl || res.data.avatar_url || null,

        token: user.token,
      };

      // update global user
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated!");
      setPassword(""); // Clear password field after save
      setAvatarFile(null); // Clear file selection
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Could not update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <h1 className="profile-main-title">Profile Settings</h1>
        <p className="profile-subtitle">Manage your account information and preferences</p>
      </div>

      <div className="profile-card-modern">
        {/* Avatar Banner Section */}
        <div className="avatar-banner">
          <div className="avatar-content">
            <div className="avatar-container">
              {hasAvatar() || avatarFile ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="avatar-initials">
                  {getUserInitials()}
                </div>
              )}
              <label className="avatar-overlay">
                <svg className="camera-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setAvatarFile(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                />
              </label>
            </div>
            <p className="avatar-hint">Click to change avatar</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="form-container">
          <div className="form-fields">
            {/* Username */}
            <div className="input-field">
              <label className="field-label">
                <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-control"
                placeholder="Enter your username"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="input-field">
              <label className="field-label">
                <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
                <span className="field-note">(Cannot be changed)</span>
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="input-control input-readonly"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div className="input-field">
              <label className="field-label">
                <svg className="field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                New Password
                <span className="field-note">(Optional)</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                placeholder="Enter new password to change"
              />
            </div>
          </div>

          {/* Save Button */}
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <svg className="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <svg className="info-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <div className="info-content">
          <h3 className="info-title">Profile Security</h3>
          <p className="info-text">Your email address is linked to your account and cannot be modified for security reasons. Contact support if you need to update it.</p>
        </div>
      </div>
    </div>
  );
}