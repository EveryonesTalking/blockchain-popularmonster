import React from "react";
import "../css/modal.css";

const AddNoteModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>Add Note (Placeholder)</h2>

                <input
                    type="text"
                    placeholder="Enter note title..."
                />

                <textarea
                    placeholder="Enter note content..."
                ></textarea>

                <button>Add Note</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AddNoteModal;
