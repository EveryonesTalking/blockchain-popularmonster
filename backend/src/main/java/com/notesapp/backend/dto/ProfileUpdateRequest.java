package com.notesapp.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProfileUpdateRequest {

    private String username;
    private String email;
    private String password;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    public ProfileUpdateRequest() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
