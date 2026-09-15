package com.example.kanban;

public record CardResponse(
    Long id, String title, String description, String dueDate, String priority, Integer position) {

  public static CardResponse from(Card card) {
    return new CardResponse(
        card.getId(),
        card.getTitle(),
        card.getDescription(),
        card.getDueDate(),
        card.getPriority(),
        card.getPosition());
  }
}
