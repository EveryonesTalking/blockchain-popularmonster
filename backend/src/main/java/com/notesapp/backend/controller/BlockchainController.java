package com.notesapp.backend.controller;

import com.notesapp.backend.model.Block;
import com.notesapp.backend.repository.BlockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blocks")
public class BlockchainController {

    @Autowired
    private BlockRepository blockRepository;

    // --- Get all blocks ---
    @GetMapping
    public List<Block> getAllBlocks() {
        return blockRepository.findAll();
    }

    // --- Get a block by ID ---
    @GetMapping("/{id}")
    public ResponseEntity<Block> getBlockById(@PathVariable Long id) {
        return blockRepository.findById(id)
                .map(block -> ResponseEntity.ok(block))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/validate")
    public ResponseEntity<String> validateChain() {
        List<Block> blocks = blockRepository.findAll();

        for (int i = 1; i < blocks.size(); i++) {
            Block previous = blocks.get(i - 1);
            Block current = blocks.get(i);

            // Recompute hash consistently
            String dataToHash = current.getNote().getNoteId()
                    + current.getNote().getContent()
                    + current.getNote().getUser().getUserId()
                    + current.getPreviousHash();
            String recalculatedHash = com.notesapp.backend.util.HashUtil.sha256(dataToHash);

            // Check if hashes match
            if (!current.getHash().equals(recalculatedHash)) {
                return ResponseEntity.ok("Blockchain is INVALID at block " + current.getBlockId());
            }

            // Check if previousHash matches
            if (!current.getPreviousHash().equals(previous.getHash())) {
                return ResponseEntity.ok("Blockchain is BROKEN at block " + current.getBlockId());
            }
        }

        return ResponseEntity.ok("Blockchain is VALID. Total blocks: " + blocks.size());
    }
}
