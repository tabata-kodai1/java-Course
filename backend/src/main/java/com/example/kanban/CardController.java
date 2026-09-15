package com.example.kanban;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

	@PatchMapping("/api/cards/{cardId}")
	public CardResponse updateCard(@PathVariable Long cardId, @Valid @RequestBody CardUpdateRequest request) {
		return cardService.updateCard(cardId, request);
	}

	@DeleteMapping("/api/cards/{cardId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCard(@PathVariable Long cardId) {
		cardService.deleteCard(cardId);
	}

	@PatchMapping("/api/cards/{cardId}/move")
	public CardResponse moveCard(@PathVariable Long cardId, @Valid @RequestBody CardMoveRequest request) {
		return cardService.moveCard(cardId, request);
	}

	@PatchMapping("/api/cards/bulk")
	public List<CardResponse> bulkUpdateCards(@Valid @RequestBody CardBulkUpdateRequest request) {
		return cardService.bulkUpdateCards(request);
	}

	@PatchMapping("/api/columns/{columnId}/cards/sort-by-due-date")
	public List<CardResponse> sortColumnByDueDate(@PathVariable Long columnId) {
		return cardService.sortColumnByDueDate(columnId);
	}

	@PatchMapping("/api/columns/{columnId}/cards/sort-by-priority")
	public List<CardResponse> sortColumnByPriority(@PathVariable Long columnId) {
		return cardService.sortColumnByPriority(columnId);
	}

}
