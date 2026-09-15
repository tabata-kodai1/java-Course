package com.example.kanban;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

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

	@Transactional
	public CardResponse updateCard(Long cardId, CardUpdateRequest request) {
		Card card = cardRepository.findById(cardId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + cardId));

		card.setTitle(request.title());
		card.setDescription(request.description());
		card.setDueDate(request.dueDate());
		if (request.priority() != null && !request.priority().isBlank()) {
			card.setPriority(request.priority());
		}
		card.setPosition(request.position());

		Card saved = cardRepository.save(card);
		return CardResponse.from(saved);
	}

	@Transactional
	public void deleteCard(Long cardId) {
		Card card = cardRepository.findById(cardId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + cardId));

		Long columnId = card.getColumn().getId();
		cardRepository.delete(card);

		List<Card> siblings = cardRepository.findByColumnIdOrderByPositionAsc(columnId);
		renumber(siblings);
	}

	@Transactional
	public CardResponse moveCard(Long cardId, CardMoveRequest request) {
		Card card = cardRepository.findById(cardId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: " + cardId));
		Column targetColumn = columnRepository.findById(request.columnId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + request.columnId()));

		Long sourceColumnId = card.getColumn().getId();
		boolean sameColumn = sourceColumnId.equals(request.columnId());

		if (sameColumn) {
			List<Card> siblings = cardRepository.findByColumnIdOrderByPositionAsc(sourceColumnId);
			siblings.removeIf(c -> c.getId().equals(cardId));
			int targetIndex = clampIndex(request.position(), siblings.size());
			siblings.add(targetIndex, card);
			renumber(siblings);
		} else {
			List<Card> sourceSiblings = cardRepository.findByColumnIdOrderByPositionAsc(sourceColumnId);
			sourceSiblings.removeIf(c -> c.getId().equals(cardId));
			renumber(sourceSiblings);

			List<Card> targetSiblings = cardRepository.findByColumnIdOrderByPositionAsc(request.columnId());
			card.setColumn(targetColumn);
			int targetIndex = clampIndex(request.position(), targetSiblings.size());
			targetSiblings.add(targetIndex, card);
			renumber(targetSiblings);
		}

		return CardResponse.from(cardRepository.findById(cardId).orElseThrow());
	}

	private int clampIndex(int index, int size) {
		if (index < 0) {
			return 0;
		}
		if (index > size) {
			return size;
		}
		return index;
	}

	private void renumber(List<Card> cards) {
		List<Card> toSave = new ArrayList<>(cards.size());
		for (int i = 0; i < cards.size(); i++) {
			Card c = cards.get(i);
			c.setPosition(i);
			toSave.add(c);
		}
		cardRepository.saveAll(toSave);
	}

	@Transactional
	public List<CardResponse> bulkUpdateCards(CardBulkUpdateRequest request) {
		if (!request.hasUpdate()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "priority or dueDate must be provided");
		}

		List<Card> cards = cardRepository.findByIdIn(request.cardIds());
		if (cards.size() != request.cardIds().size()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more cards not found");
		}

		for (Card card : cards) {
			if (request.priority() != null && !request.priority().isBlank()) {
				card.setPriority(request.priority());
			}
			if (request.dueDate() != null) {
				card.setDueDate(request.dueDate());
			}
		}

		return cardRepository.saveAll(cards).stream().map(CardResponse::from).toList();
	}

	@Transactional
	public List<CardResponse> sortColumnByDueDate(Long columnId) {
		columnRepository.findById(columnId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + columnId));

		List<Card> cards = cardRepository.findByColumnIdOrderByPositionAsc(columnId);
		cards.sort(Comparator.comparing(
				Card::getDueDate,
				Comparator.nullsLast(Comparator.naturalOrder())));

		renumber(cards);
		return cards.stream().map(CardResponse::from).toList();
	}

	private static final List<String> PRIORITY_ORDER = List.of("low", "medium", "high");

	@Transactional
	public List<CardResponse> sortColumnByPriority(Long columnId) {
		columnRepository.findById(columnId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Column not found: " + columnId));

		List<Card> cards = cardRepository.findByColumnIdOrderByPositionAsc(columnId);
		cards.sort(Comparator.comparingInt(c -> PRIORITY_ORDER.indexOf(c.getPriority())));

		renumber(cards);
		return cards.stream().map(CardResponse::from).toList();
	}

}
