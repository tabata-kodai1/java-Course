package com.example.kanban;

import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ColumnService {

	private final ColumnRepository columnRepository;

	public ColumnService(ColumnRepository columnRepository) {
		this.columnRepository = columnRepository;
	}

	@Transactional(readOnly = true)
	public List<ColumnResponse> getColumns(String keyword) {
		String trimmed = keyword == null ? "" : keyword.trim();
		List<Column> columns = columnRepository.findAllWithCards();

		if (trimmed.isEmpty()) {
			return columns.stream().map(ColumnResponse::from).toList();
		}

		String needle = trimmed.toLowerCase(Locale.ROOT);
		return columns.stream()
				.map(column -> ColumnResponse.fromMatching(column, needle))
				.toList();
	}

}
