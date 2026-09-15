package com.example.kanban;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

  private final ColumnRepository columnRepository;

  public DataSeeder(ColumnRepository columnRepository) {
    this.columnRepository = columnRepository;
  }

  @Override
  public void run(String... args) {
    if (columnRepository.count() > 0) {
      return;
    }

    Column todo = newColumn("未着手", 0);
    addCard(todo, "サンプルカードA", "最初のタスクです", "high", 0);
    addCard(todo, "サンプルカードB", null, "medium", 1);

    Column inProgress = newColumn("進行中", 1);
    addCard(inProgress, "サンプルカードC", "対応中のタスクです", "low", 0);

    Column done = newColumn("完了", 2);

    columnRepository.saveAll(java.util.List.of(todo, inProgress, done));
  }

  private Column newColumn(String title, int position) {
    Column column = new Column();
    column.setTitle(title);
    column.setPosition(position);
    return column;
  }

  private void addCard(
      Column column, String title, String description, String priority, int position) {
    Card card = new Card();
    card.setTitle(title);
    card.setDescription(description);
    card.setPriority(priority);
    card.setPosition(position);
    card.setColumn(column);
    column.getCards().add(card);
  }
}
