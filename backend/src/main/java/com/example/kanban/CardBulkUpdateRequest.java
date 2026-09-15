package com.example.kanban;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record CardBulkUpdateRequest(
		@NotEmpty List<Long> cardIds,
		String dueDate,
		String priority) {

	public boolean hasUpdate() {
		return (priority != null && !priority.isBlank()) || dueDate != null;
	}

}
