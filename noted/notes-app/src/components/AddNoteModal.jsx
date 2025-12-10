import React from "react";
import "../css/modal.css";

const AddNoteModal = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">Add New Note</h2>

                <input
                    className="modal-input"
                    type="text"
                    placeholder="Note title..."
                />

                <textarea
                    className="modal-textarea"
                    placeholder="Write your note here..."
                ></textarea>

                <div className="modal-actions">
                    <button className="modal-btn modal-btn-primary">Add Note</button>
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    );
};

export default AddNoteModal;
