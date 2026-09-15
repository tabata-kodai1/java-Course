package com.example.kanban;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CardRepository extends JpaRepository<Card, Long> {

	@Query("SELECT MAX(c.position) FROM Card c WHERE c.column.id = :columnId")
	Optional<Integer> findMaxPositionByColumnId(@Param("columnId") Long columnId);

}
