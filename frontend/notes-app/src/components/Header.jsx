import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileDropdown from "./FileDropdown";
import EditDropdown from "./EditDropdown";
import AccountDropdown from "./AccountDropdown";
import LoginPopup from "./LoginPopup";
import RegisterPopup from "./RegisterPopup";
import { useAuth } from "../context/AuthContext";
import '../css/Header.css';

const Header = ({ onBackToHome, onNewFile, onFindReplaceClick, onSave, editorRef }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleDropdownToggle = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };
  const closeDropdowns = () => setOpenDropdown(null);

  const handleLoginClick = () => { setShowLoginPopup(true); closeDropdowns(); };
  const handleRegisterClick = () => { setShowRegisterPopup(true); closeDropdowns(); };
  const handleCloseLogin = () => setShowLoginPopup(false);
  const handleCloseRegister = () => setShowRegisterPopup(false);
  const handleSwitchToRegister = () => { setShowLoginPopup(false); setShowRegisterPopup(true); };
  const handleSwitchToLogin = () => { setShowRegisterPopup(false); setShowLoginPopup(true); };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      const header = document.querySelector(".header");
      if (header && !header.contains(event.target)) closeDropdowns();
    };
    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <>
      <header className="header">
        <div className="menu-bar">
          <button
            onClick={() => navigate("/")}
            className="back-btn"
            style={{
              background: "#1a1f3a",
              color: "#e7e9ff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
              boxShadow: "0 2px 8px rgba(44,46,76,0.09)",
              marginRight: "12px"
            }}
          >
            ← Back
          </button>

          <div className="menu-item">
            <button className="menu-button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("file"); }}>
              File
            </button>
            <FileDropdown 
              isOpen={openDropdown === "file"} 
              onClose={closeDropdowns} 
              onNewFile={onNewFile}
              onSave={onSave}
            />
          </div>

          <div className="menu-item">
            <button className="menu-button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("edit"); }}>
              Edit
            </button>
            <EditDropdown
              isOpen={openDropdown === "edit"}
              onClose={closeDropdowns}
              editorRef={{ editorRef }}
              onFindReplaceClick={onFindReplaceClick}
            />
          </div>
        </div>

        <div className="account-section" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {user && (
            <span style={{ fontWeight: 500 }}>{user.username}</span>
          )}
          <button className="account-button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleDropdownToggle("account"); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <AccountDropdown
            isOpen={openDropdown === "account"}
            onClose={closeDropdowns}
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            user={user}
            logout={logout}
          />
        </div>
      </header>
      <LoginPopup isOpen={showLoginPopup} onClose={handleCloseLogin} onSwitchToRegister={handleSwitchToRegister} />
      <RegisterPopup isOpen={showRegisterPopup} onClose={handleCloseRegister} onSwitchToLogin={handleSwitchToLogin} />
    </>
  );
};

export default Header;