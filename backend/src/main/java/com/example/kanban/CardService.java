package com.example.kanban;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CardService {

	private final CardRepository cardRepository;
	private final ColumnRepository columnRepository;

	public CardService(CardRepository cardRepository, ColumnRepository columnRepository) {
		this.cardRepository = cardRepository;
		this.columnRepository = columnRepository;
	}

	@Transactional
	public CardResponse createCard(Long columnId, CardCreateRequest request) {
		Column column = columnRepository.findById(columnId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + columnId));

		int nextPosition = cardRepository.findMaxPositionByColumnId(columnId).orElse(-1) + 1;

		Card card = new Card();
		card.setColumn(column);
		card.setTitle(request.title());
		card.setDescription(request.description());
		card.setDueDate(request.dueDate());
		if (request.priority() != null && !request.priority().isBlank()) {
			card.setPriority(request.priority());
		}
		card.setPosition(nextPosition);

		Card saved = cardRepository.save(card);
		return CardResponse.from(saved);
	}

}
