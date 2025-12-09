package com.notesapp.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blockchain_ledger")
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "block_id")
    private Long blockId;

    @OneToOne
    @JoinColumn(name = "note_id", nullable = false)
    private Note note;

    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "previous_hash")
    private String previousHash;

    private String hash;

    // --- Constructors ---
    public Block() {
        // Required by JPA
    }

    public Block(Note note, String previousHash, String hash) {
        this.note = note;
        this.previousHash = previousHash;
        this.hash = hash;
        this.timestamp = LocalDateTime.now();
    }

    // --- Getters & Setters ---
    public Long getBlockId() {
        return blockId;
    }

    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getPreviousHash() {
        return previousHash;
    }

    public void setPreviousHash(String previousHash) {
        this.previousHash = previousHash;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }
}


