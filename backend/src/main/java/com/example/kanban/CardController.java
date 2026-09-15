package com.example.kanban;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CardController {

	private final CardService cardService;

	public CardController(CardService cardService) {
		this.cardService = cardService;
	}

	@PostMapping("/api/columns/{columnId}/cards")
	@ResponseStatus(HttpStatus.CREATED)
	public CardResponse createCard(@PathVariable Long columnId, @Valid @RequestBody CardCreateRequest request) {
		return cardService.createCard(columnId, request);
	}

}
