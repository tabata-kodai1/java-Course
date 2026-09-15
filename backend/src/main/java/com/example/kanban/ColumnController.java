package com.example.kanban;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ColumnController {

  private final ColumnService columnService;

  public ColumnController(ColumnService columnService) {
    this.columnService = columnService;
  }

  @GetMapping("/api/columns")
  public List<ColumnResponse> getColumns(@RequestParam(required = false) String q) {
    return columnService.getColumns(q);
  }

  @PostMapping("/api/columns")
  @ResponseStatus(HttpStatus.CREATED)
  public ColumnResponse createColumn(@Valid @RequestBody ColumnCreateRequest request) {
    return columnService.createColumn(request);
  }

  @PatchMapping("/api/columns/{columnId}")
  public ColumnResponse updateColumn(
      @PathVariable Long columnId, @Valid @RequestBody ColumnUpdateRequest request) {
    return columnService.updateColumn(columnId, request);
  }

  @DeleteMapping("/api/columns/{columnId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteColumn(@PathVariable Long columnId) {
    columnService.deleteColumn(columnId);
  }
}
