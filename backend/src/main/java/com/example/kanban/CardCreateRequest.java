package com.example.kanban;

import jakarta.validation.constraints.NotBlank;

public record CardCreateRequest(
		@NotBlank String title,
		String description,
		String dueDate,
		String priority) {

}
