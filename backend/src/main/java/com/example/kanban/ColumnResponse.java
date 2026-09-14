package com.example.kanban;

import java.util.List;

public record ColumnResponse(
		Long id,
		String title,
		Integer position,
		List<CardResponse> cards) {

	public static ColumnResponse from(Column column) {
		return new ColumnResponse(
				column.getId(),
				column.getTitle(),
				column.getPosition(),
				column.getCards().stream().map(CardResponse::from).toList());
	}

}
