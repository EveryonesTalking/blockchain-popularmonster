import React from "react";

const EditDropdown = ({ isOpen, onClose, editorRef, onFindReplaceClick }) => {
  const editOptions = [
    { label: "Undo", action: () => document.execCommand("undo") },
    { label: "Cut", action: () => document.execCommand("cut") },
    { label: "Copy", action: () => document.execCommand("copy") },
    { label: "Paste", action: async () => {
        try {
          const text = await navigator.clipboard.readText();
          const active = document.activeElement;
          if (active && (active.tagName === "TEXTAREA" || active.tagName === "INPUT")) {
            const start = active.selectionStart ?? 0;
            const end = active.selectionEnd ?? 0;
            const value = active.value ?? "";
            active.value = value.slice(0, start) + text + value.slice(end);
            active.selectionStart = active.selectionEnd = start + text.length;
            active.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } catch (err) {
          console.error("Paste failed:", err);
          alert("Paste failed: " + (err.message || ""));
        }
      }
    },
    { label: "Select All", action: () => document.execCommand("selectAll") },
    { label: "Find / Replace", action: () => { if (onFindReplaceClick) onFindReplaceClick(); } },
    { label: "--- More options coming soon ---", action: () => {} },
  ];

  const handleItemClick = (option) => {
    if (!option.label.includes('---')) {
      option.action();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dropdown show">
      {editOptions.map((option, index) => (
        <div
          key={index}
          className={`dropdown-item ${option.label.includes('---') ? 'placeholder' : ''}`}
          onMouseDown={e => { e.preventDefault(); handleItemClick(option); }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default EditDropdown;
