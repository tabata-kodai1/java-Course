package com.example.kanban;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CardUpdateRequest(
		@NotBlank String title,
		String description,
		String dueDate,
		String priority,
		@NotNull Integer position) {

}
