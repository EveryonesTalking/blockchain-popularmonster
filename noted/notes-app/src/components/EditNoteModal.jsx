import React from "react";
import "../css/modal.css";

const EditNoteModal = ({ note, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h2>Edit Note (Placeholder)</h2>

                <input
                    type="text"
                    defaultValue={note?.title || ""}
                    placeholder="Note title"
                />

                <textarea
                    defaultValue={note?.content || ""}
                    placeholder="Note content"
                ></textarea>

                <button>Save Changes</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default EditNoteModal;
