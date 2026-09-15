package com.example.kanban;

import jakarta.validation.constraints.NotBlank;

public record ColumnUpdateRequest(@NotBlank String title) {}
