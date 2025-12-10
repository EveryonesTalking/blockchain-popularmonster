import React, { useState } from "react";
import AddNoteModal from "../components/AddNoteModal";
import EditNoteModal from "../components/EditNoteModal";
import "../css/notesdashboard.css";
import Header from "../components/Navbar";

export default function NotesDashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const notes = [
        { id: 1, title: "First Note", content: "This is the first sample note." },
        { id: 2, title: "Second Note", content: "This is the second sample note." },
        { id: 3, title: "Third Note", content: "Here is the third note example." },
        { id: 4, title: "Fourth Note", content: "Another sample note for testing." },
        { id: 5, title: "Fifth Note", content: "This note contains some content." },
        { id: 6, title: "Sixth Note", content: "More testing notes to display." },
    ];

    const displayedNotes = notes.slice(0, 6);

    return (
        <div className="db-container">
            <Header />

            <div className="db-main">
                <div className="db-notes-grid">
                    {displayedNotes.map((note) => (
                        <div
                            key={note.id}
                            className="db-note-card"
                            onClick={() => {
                                setSelectedNote(note);
                                setShowEditModal(true);
                            }}
                        >
                            <h3 className="db-note-title">{note.title}</h3>
                            <p className="db-note-preview">{note.content}</p>
                        </div>
                    ))}
                </div>


                <button
                    className="db-add-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    +
                </button>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <AddNoteModal onClose={() => setShowAddModal(false)} />
                </div>
            )}

            {showEditModal && selectedNote && (
                <div className="modal-overlay">
                    <EditNoteModal
                        note={selectedNote}
                        onClose={() => setShowEditModal(false)}
                    />
                </div>
            )}

        </div>
    );
}
