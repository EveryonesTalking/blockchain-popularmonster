import React, { useState } from "react";
import AddNoteModal from "../components/AddNoteModal";
import EditNoteModal from "../components/EditNoteModal";
import "../css/notesdashboard.css";

function NotesDashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    // Hardcoded sample notes
    const notes = [
        { id: 1, title: "First Note", content: "This is the first sample note." },
        { id: 2, title: "Second Note", content: "This is the second sample note." }
    ];

    return (
        <div className="ND-container">
            <h1 className="ND-title">Notes Dashboard</h1>

            <button
                className="ND-add-btn"
                onClick={() => setShowAddModal(true)}
            >
                + Add Note
            </button>

            <div className="ND-notes-list">
                {notes.map(note => (
                    <div
                        key={note.id}
                        className="ND-note-card"
                        onClick={() => {
                            setSelectedNote(note);
                            setShowEditModal(true);
                        }}
                    >
                        <h3>{note.title}</h3>
                        <p>{note.content}</p>
                    </div>
                ))}
            </div>

            {showAddModal && (
                <AddNoteModal onClose={() => setShowAddModal(false)} />
            )}

            {showEditModal && (
                <EditNoteModal
                    note={selectedNote}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}

export default NotesDashboard;
