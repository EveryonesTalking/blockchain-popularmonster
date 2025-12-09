import React from 'react';
import Tab from './Tab';
import '../css/TabSystem.css';

const TabSystem = ({ 
  tabs, 
  activeTabId, 
  onTabSelect, 
  onTabClose, 
  onAddTab 
}) => {
  return (
    <div className="tab-system">
      <div className="tab-bar">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              title={tab.title}
              isActive={activeTabId === tab.id}
              hasUnsavedChanges={tab.hasUnsavedChanges}
              onClick={() => onTabSelect(tab.id)}
              onClose={() => onTabClose(tab.id)}
            />
          ))}
        </div>
        <button className="add-tab-btn" onClick={onAddTab} title="New Tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 5v14m-7-7h14" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TabSystem;