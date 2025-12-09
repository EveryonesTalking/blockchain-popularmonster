package com.notesapp.backend.controller;

import com.notesapp.backend.dto.CreateNoteRequest;
import com.notesapp.backend.model.Note;
import com.notesapp.backend.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    @Autowired
    private NoteService noteService;

    /**
     * Get all notes
     * GET /notes
     */
    @GetMapping
    public ResponseEntity<List<Note>> getAllNotes() {
        List<Note> notes = noteService.getAllNotes();
        return ResponseEntity.ok(notes);
    }

    /**
     * Get all notes by a specific user
     * GET /notes/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Note>> getNotesByUser(@PathVariable Long userId) {
        return noteService.getNotesByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a single note by ID
     * GET /notes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return noteService.getNoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create a new note for a user (requires txHash for payment verification)
     * POST /notes/user/{userId}
     * Body: { "title": "...", "content": "...", "txHash": "..." }
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createNote(@PathVariable Long userId, @RequestBody CreateNoteRequest request) {
        // Validate txHash is provided
        if (request.getTxHash() == null || request.getTxHash().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Transaction hash (txHash) is required. Please complete payment first.");
        }

        // Create note entity from request
        Note note = new Note();
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());
        note.setTxHash(request.getTxHash());

        return noteService.createNote(userId, note)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing note (no payment required for updates)
     * PUT /notes/{id}
     * Body: { "title": "...", "content": "..." }
     */
    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note note) {
        return noteService.updateNote(id, note)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a note by ID
     * DELETE /notes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id) {
        if (noteService.deleteNote(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}