package com.example.kanban;

import java.util.List;
import java.util.Locale;

public record ColumnResponse(Long id, String title, Integer position, List<CardResponse> cards) {

  public static ColumnResponse from(Column column) {
    return new ColumnResponse(
        column.getId(),
        column.getTitle(),
        column.getPosition(),
        column.getCards().stream().map(CardResponse::from).toList());
  }

  public static ColumnResponse fromMatching(Column column, String lowerCaseKeyword) {
    return new ColumnResponse(
        column.getId(),
        column.getTitle(),
        column.getPosition(),
        column.getCards().stream()
            .filter(card -> matches(card, lowerCaseKeyword))
            .map(CardResponse::from)
            .toList());
  }

  private static boolean matches(Card card, String lowerCaseKeyword) {
    return containsIgnoreCase(card.getTitle(), lowerCaseKeyword)
        || containsIgnoreCase(card.getDescription(), lowerCaseKeyword);
  }

  private static boolean containsIgnoreCase(String value, String lowerCaseKeyword) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(lowerCaseKeyword);
  }
}
