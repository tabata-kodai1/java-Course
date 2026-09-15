package com.example.kanban;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ColumnRepository extends JpaRepository<Column, Long> {

  @Query("SELECT DISTINCT c FROM Column c LEFT JOIN FETCH c.cards ORDER BY c.position")
  List<Column> findAllWithCards();

  @Query("SELECT MAX(c.position) FROM Column c")
  Optional<Integer> findMaxPosition();

  List<Column> findAllByOrderByPositionAsc();
}
