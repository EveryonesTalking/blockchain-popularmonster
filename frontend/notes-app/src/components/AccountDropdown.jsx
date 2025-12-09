// src/components/AccountDropdown.jsx
import React from 'react';

const AccountDropdown = ({ isOpen, onClose, onLoginClick, onRegisterClick, user, logout }) => {
  const accountOptions = user
    ? [{ label: 'Logout', action: logout }]
    : [
        { label: 'Login', action: onLoginClick },
        { label: 'Register', action: onRegisterClick }
      ];

  const handleItemClick = (option) => {
    option.action();
    onClose();
  };

  const handleMouseDown = (e, option) => {
    e.preventDefault();
    handleItemClick(option);
  };

  if (!isOpen) return null;

  return (
    <div className="dropdown show account-dropdown">
      {accountOptions.map((option, index) => (
        <div
          key={index}
          className="dropdown-item"
          onMouseDown={(e) => handleMouseDown(e, option)}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default AccountDropdown;
