package com.example.kanban;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record CardBulkUpdateRequest(
    @NotEmpty List<Long> cardIds,
    @Pattern(regexp = CardValidation.DUE_DATE_REGEX, message = CardValidation.DUE_DATE_MESSAGE)
        String dueDate,
    @Pattern(regexp = CardValidation.PRIORITY_REGEX, message = CardValidation.PRIORITY_MESSAGE)
        String priority) {

  public boolean hasUpdate() {
    return (priority != null && !priority.isBlank()) || dueDate != null;
  }
}
