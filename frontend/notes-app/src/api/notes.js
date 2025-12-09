import api from "./client";

// GET all notes
export const getAllNotes = () => api.get("/notes");

// GET all notes by a specific user
export const getNotesByUser = (userId) => api.get(`/notes/user/${userId}`);

// GET a single note by ID
export const getNoteById = (id) => api.get(`/notes/${id}`);

// CREATE a new note for a user (requires txHash from Cardano payment)
export const createNote = (userId, noteData) => 
  api.post(`/notes/user/${userId}`, noteData);

// UPDATE an existing note (no payment required)
export const updateNote = (id, noteData) => 
  api.put(`/notes/${id}`, noteData);

// DELETE a note by ID
export const deleteNote = (id) => api.delete(`/notes/${id}`);