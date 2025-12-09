import React from 'react';

const FileDropdown = ({ isOpen, onClose, onNewFile, onSave }) => {
  const fileOptions = [
    'New File',
    'Save',
    '--- More options coming soon ---'
  ];

  const handleItemClick = (option) => {
    if (!option.includes('---')) {
      console.log('File option clicked:', option);
      
      // Handle specific file options
      if (option === 'New File' && onNewFile) {
        onNewFile();
      } else if (option === 'Save' && onSave) {
        onSave();
      }
      
      onClose();
    }
  };

  const handleMouseDown = (e, option) => {
    e.preventDefault(); // Prevent focus change and selection loss
    handleItemClick(option);
  };

  if (!isOpen) return null;

  return (
    <div className="dropdown show">
      {fileOptions.map((option, index) => (
        <div 
          key={index}
          className={`dropdown-item ${option.includes('---') ? 'placeholder' : ''}`}
          onMouseDown={(e) => handleMouseDown(e, option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
};

export default FileDropdown;