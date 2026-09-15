package com.example.kanban;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    return columns.stream().map(column -> ColumnResponse.fromMatching(column, needle)).toList();
  }

  @Transactional
  public ColumnResponse createColumn(ColumnCreateRequest request) {
    int nextPosition = columnRepository.findMaxPosition().orElse(-1) + 1;

    Column column = new Column();
    column.setTitle(request.title());
    column.setPosition(nextPosition);

    Column saved = columnRepository.save(column);
    return ColumnResponse.from(saved);
  }

  @Transactional
  public ColumnResponse updateColumn(Long columnId, ColumnUpdateRequest request) {
    Column column =
        columnRepository
            .findById(columnId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Column not found: " + columnId));

    column.setTitle(request.title());

    Column saved = columnRepository.save(column);
    return ColumnResponse.from(saved);
  }

  @Transactional
  public void deleteColumn(Long columnId) {
    Column column =
        columnRepository
            .findById(columnId)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Column not found: " + columnId));

    columnRepository.delete(column);

    List<Column> remaining = columnRepository.findAllByOrderByPositionAsc();
    renumber(remaining);
  }

  private void renumber(List<Column> columns) {
    List<Column> toSave = new ArrayList<>(columns.size());
    for (int i = 0; i < columns.size(); i++) {
      Column column = columns.get(i);
      column.setPosition(i);
      toSave.add(column);
    }
    columnRepository.saveAll(toSave);
  }
}
