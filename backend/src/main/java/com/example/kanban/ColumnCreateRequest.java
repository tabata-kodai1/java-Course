package com.example.kanban;

import jakarta.validation.constraints.NotBlank;

public record ColumnCreateRequest(@NotBlank String title) {}
