import React, { useState } from "react";
import Header from "../components/Navbar";
import AddNoteModal from "../components/AddNoteModal";
import EditNoteModal from "../components/EditNoteModal";

export default function NotesDashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const notes = [
        { id: 1, title: "First Note", content: "This is the first sample note." },
        { id: 2, title: "Second Note", content: "This is the second sample note." },
    ];

    return (
        <div>
            <Header />

            <button onClick={() => setShowAddModal(true)}>+ Add Note</button>

            <div>
                {notes.map((note) => (
                    <div
                        key={note.id}
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

            {showAddModal && <AddNoteModal onClose={() => setShowAddModal(false)} />}
            {showEditModal && <EditNoteModal note={selectedNote} onClose={() => setShowEditModal(false)} />}
        </div>
    );
}
