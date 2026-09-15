package com.example.kanban;

import jakarta.validation.constraints.NotNull;

public record CardMoveRequest(
		@NotNull Long columnId,
		@NotNull Integer position) {

}
