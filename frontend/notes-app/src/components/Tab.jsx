import React from 'react';
import '../css/TabSystem.css';

const Tab = ({ 
  id, 
  title, 
  isActive, 
  hasUnsavedChanges, 
  onClick, 
  onClose 
}) => {
  const handleCloseClick = (e) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div 
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="tab-title">
        {title}
        {hasUnsavedChanges && <span className="unsaved-indicator" title="Unsaved changes">●</span>}
      </span>
      <button 
        className="tab-close-btn" 
        onClick={handleCloseClick}
        title="Close Tab"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path 
            d="M18 6L6 18M6 6l12 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default Tab;