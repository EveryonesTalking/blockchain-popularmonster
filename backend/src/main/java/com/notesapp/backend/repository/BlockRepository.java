package com.notesapp.backend.repository;

import com.notesapp.backend.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {
    Block findTopByOrderByBlockIdDesc();  // fetch last block
}
