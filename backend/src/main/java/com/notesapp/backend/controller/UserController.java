package com.notesapp.backend.controller;

import com.notesapp.backend.dto.LoginRequest;
import com.notesapp.backend.dto.LoginResponse;
import com.notesapp.backend.dto.ProfileUpdateRequest;
import com.notesapp.backend.dto.RegisterRequest;
import com.notesapp.backend.model.User;
import com.notesapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================================
    // Helper: generate simple token (demo)
    // =====================================
    private String generateToken() {
        return "TOKEN-" + UUID.randomUUID();
    }

    // =====================================
    // BASIC CRUD
    // =====================================

    // GET all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================
    // REGISTER
    // =====================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        // Check if email is used
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email is already taken.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        // (for demo) store raw password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAvatarUrl(null);  // uploaded later from profile
        user.setToken(null);

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // =====================================
    // LOGIN
    // =====================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");
        }

        User user = optionalUser.get();

        // Compare passwords (raw for demo)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password.");
        }

        // generate token
        String token = generateToken();
        user.setToken(token);
        userRepository.save(user);

        // build response
        LoginResponse response = new LoginResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    // =====================================
    // PROFILE UPDATE (username/email/pass/avatar)
    // =====================================
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request
    ) {
        return userRepository.findById(id)
                .map(user -> {

                    if (request.getUsername() != null) {
                        user.setUsername(request.getUsername());
                    }

                    if (request.getEmail() != null) {
                        user.setEmail(request.getEmail());
                    }

                    if (request.getPassword() != null) {
                        user.setPassword(passwordEncoder.encode(request.getPassword()));
                    }

                    // Cloudinary / Supabase URL
                    if (request.getAvatarUrl() != null) {
                        user.setAvatarUrl(request.getAvatarUrl());
                    }

                    User updated = userRepository.save(user);
                    return ResponseEntity.ok(updated);

                })
                .orElse(ResponseEntity.notFound().build());
    }
}
