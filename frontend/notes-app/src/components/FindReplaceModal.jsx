import React, { useState, useRef, useEffect } from "react";

const FindReplaceModal = ({ onClose, onFindReplace }) => {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const [position, setPosition] = useState(null);
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Center the modal on mount
  useEffect(() => {
    if (modalRef.current && position === null) {
      const modalRect = modalRef.current.getBoundingClientRect();
      const centerX = (window.innerWidth - modalRect.width) / 2;
      const centerY = (window.innerHeight - modalRect.height) / 2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [position]);

  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleReplace = () => {
    if (!findText) {
      alert("Please enter text to find");
      return;
    }
    onFindReplace(findText, replaceText);
    onClose();
  };

  return (
    <div
      className="find-replace-backdrop"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        ref={modalRef}
        className="find-replace-modal"
        style={{
          position: "absolute",
          top: position?.y || "50%",
          left: position?.x || "50%",
          transform: position ? "none" : "translate(-50%, -50%)",
          cursor: dragging ? "grabbing" : "default",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          className="modal-header"
          onMouseDown={handleMouseDown}
          style={{ cursor: "grab", fontWeight: "bold", marginBottom: "10px", color: "#f1f5f9" }}
        >
          Find & Replace
        </div>

        <input
          type="text"
          placeholder="Find..."
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
        />
        <input
          type="text"
          placeholder="Replace with..."
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
        />
        <div className="find-replace-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleReplace}>Replace All</button>
        </div>
      </div>
    </div>
  );
};

export default FindReplaceModal;