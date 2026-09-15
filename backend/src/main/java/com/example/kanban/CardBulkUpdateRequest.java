package com.example.kanban;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CardBulkUpdateRequest(@NotEmpty List<Long> cardIds, String dueDate, String priority) {

  public boolean hasUpdate() {
    return (priority != null && !priority.isBlank()) || dueDate != null;
  }
}
