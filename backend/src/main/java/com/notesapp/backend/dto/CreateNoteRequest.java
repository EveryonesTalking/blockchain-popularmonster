package com.notesapp.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateNoteRequest {

    private String title;
    private String content;

    @JsonProperty("txHash")
    private String txHash;

    public CreateNoteRequest() {}

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTxHash() {
        return txHash;
    }

    public void setTxHash(String txHash) {
        this.txHash = txHash;
    }
}