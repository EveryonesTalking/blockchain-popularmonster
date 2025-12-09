package com.notesapp.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.notesapp.backend.model.User;
import com.notesapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/avatars")
public class UserAvatarController {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/{id}/upload")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded.");
            }

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "notes-app/avatars",
                            "public_id", "user_" + id,
                            "overwrite", true
                    )
            );

            String imageUrl = uploadResult.get("secure_url").toString();

            return userRepository.findById(id)
                    .map(user -> {
                        user.setAvatarUrl(imageUrl);
                        userRepository.save(user);

                        // Ensure frontend receives avatarUrl field
                        Map<String, Object> response = new HashMap<>();
                        response.put("avatarUrl", imageUrl);
                        response.put("userId", id);

                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }
}
