package com.example.kanban;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CardUpdateRequest(
    @NotBlank String title,
    String description,
    @Pattern(regexp = CardValidation.DUE_DATE_REGEX, message = CardValidation.DUE_DATE_MESSAGE)
        String dueDate,
    @Pattern(regexp = CardValidation.PRIORITY_REGEX, message = CardValidation.PRIORITY_MESSAGE)
        String priority,
    @NotNull Integer position) {}
