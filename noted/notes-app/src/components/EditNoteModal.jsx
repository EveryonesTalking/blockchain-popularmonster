import React from "react";
import "../css/modal.css";

const EditNoteModal = ({ note, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <button className="modal-close" onClick={onClose}>×</button>

                <h2 className="modal-title">Edit Note</h2>

                <input
                    className="modal-input"
                    type="text"
                    defaultValue={note?.title || ""}
                    placeholder="Note title"
                />

                <textarea
                    className="modal-textarea"
                    defaultValue={note?.content || ""}
                    placeholder="Note content"
                ></textarea>

                <div className="modal-actions">
                    <button className="modal-btn modal-btn-primary">Save Changes</button>
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>Cancel</button>
                </div>

            </div>
        </div>
    );
};

export default EditNoteModal;
