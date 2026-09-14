package com.example.kanban;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ColumnService {

	private final ColumnRepository columnRepository;

	public ColumnService(ColumnRepository columnRepository) {
		this.columnRepository = columnRepository;
	}

	@Transactional(readOnly = true)
	public List<ColumnResponse> getColumns() {
		return columnRepository.findAllWithCards().stream()
				.map(ColumnResponse::from)
				.toList();
	}

}
