package com.example.kanban;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ColumnController {

	private final ColumnService columnService;

	public ColumnController(ColumnService columnService) {
		this.columnService = columnService;
	}

	@GetMapping("/api/columns")
	public List<ColumnResponse> getColumns() {
		return columnService.getColumns();
	}

}
