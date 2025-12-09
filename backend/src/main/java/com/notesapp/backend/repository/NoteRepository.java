package com.notesapp.backend.repository;

import com.notesapp.backend.model.Note;
import com.notesapp.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    
    // Find all notes by user
    List<Note> findByUser(User user);
    
    // Find notes by user and order by updated date (most recent first)
    List<Note> findByUserOrderByUpdatedAtDesc(User user);
    
    // Find notes by user and order by created date (most recent first)
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    
    // Find notes by title containing (case-insensitive search)
    List<Note> findByTitleContainingIgnoreCase(String title);
    
    // Find notes by user and title containing
    List<Note> findByUserAndTitleContainingIgnoreCase(User user, String title);
    
    // Find notes updated after a certain date
    List<Note> findByUserAndUpdatedAtAfter(User user, LocalDateTime date);
}