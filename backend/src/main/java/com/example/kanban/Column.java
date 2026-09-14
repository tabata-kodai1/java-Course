package com.example.kanban;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

@Entity
@Table(name = "columns")
public class Column {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@jakarta.persistence.Column(nullable = false)
	private String title;

	@jakarta.persistence.Column(nullable = false)
	private Integer position;

	@OneToMany(mappedBy = "column", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("position ASC")
	private List<Card> cards = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	public List<Card> getCards() {
		return cards;
	}

}
