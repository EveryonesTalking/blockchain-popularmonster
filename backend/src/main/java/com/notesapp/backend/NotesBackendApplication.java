package com.notesapp.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NotesBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(NotesBackendApplication.class, args);
		System.out.println("-------------------------------------------------------");
		System.out.println("Backend successfully started no known errors for now.");
		System.out.println("-------------------------------------------------------");
	}

}
