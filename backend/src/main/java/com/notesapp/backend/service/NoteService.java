package com.notesapp.backend.service;

import com.notesapp.backend.model.Block;
import com.notesapp.backend.model.Note;
import com.notesapp.backend.model.User;
import com.notesapp.backend.repository.BlockRepository;
import com.notesapp.backend.repository.NoteRepository;
import com.notesapp.backend.repository.UserRepository;
import com.notesapp.backend.util.HashUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BlockRepository blockRepository;

    /**
     * Get all notes
     */
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    /**
     * Get notes by user ID
     */
    public Optional<List<Note>> getNotesByUserId(Long userId) {
        return userRepository.findById(userId)
                .map(noteRepository::findByUser);
    }

    /**
     * Get a single note by ID
     */
    public Optional<Note> getNoteById(Long noteId) {
        return noteRepository.findById(noteId);
    }

    /**
     * Create a new note for a user (with txHash from Cardano payment)
     */
    public Optional<Note> createNote(Long userId, Note note) {
        return userRepository.findById(userId).map(user -> {
            note.setUser(user);
            note.setCreatedAt(LocalDateTime.now());
            note.setUpdatedAt(LocalDateTime.now());
            // txHash is already set from the controller
            
            Note savedNote = noteRepository.save(note);
            createBlockchainBlock(savedNote);
            
            return savedNote;
        });
    }

    /**
     * Update an existing note (no payment required)
     */
    public Optional<Note> updateNote(Long noteId, Note updatedNote) {
        return noteRepository.findById(noteId).map(existingNote -> {
            // Update fields
            if (updatedNote.getTitle() != null) {
                existingNote.setTitle(updatedNote.getTitle());
            }
            if (updatedNote.getContent() != null) {
                existingNote.setContent(updatedNote.getContent());
            }
            
            // Update timestamp
            existingNote.setUpdatedAt(LocalDateTime.now());
            
            Note savedNote = noteRepository.save(existingNote);
            createBlockchainBlock(savedNote);
            
            return savedNote;
        });
    }

    /**
     * Delete a note by ID
     */
    public boolean deleteNote(Long noteId) {
        return noteRepository.findById(noteId).map(note -> {
            noteRepository.delete(note);
            return true;
        }).orElse(false);
    }

    /**
     * Create a blockchain block for a note
     */
    private void createBlockchainBlock(Note note) {
        Block previousBlock = blockRepository.findTopByOrderByBlockIdDesc();
        String previousHash = (previousBlock != null) ? previousBlock.getHash() : "0";
        
        String dataToHash = note.getNoteId() 
                + note.getTitle()
                + note.getContent() 
                + note.getUser().getUserId() 
                + note.getUpdatedAt()
                + (note.getTxHash() != null ? note.getTxHash() : "")
                + previousHash;
        
        String newHash = HashUtil.sha256(dataToHash);
        Block newBlock = new Block(note, previousHash, newHash);
        blockRepository.save(newBlock);
    }
}