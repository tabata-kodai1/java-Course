package com.example.kanban;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

	@Mock
	private CardRepository cardRepository;

	@Mock
	private ColumnRepository columnRepository;

	@InjectMocks
	private CardService cardService;

	@Test
	void updateCard_updatesExistingCardFields() {
		Card card = new Card();
		Column column = new Column();
		card.setColumn(column);
		card.setTitle("元のタイトル");
		card.setDescription("元の説明");
		card.setDueDate("2026-01-01");
		card.setPriority("medium");
		card.setPosition(0);

		when(cardRepository.findById(1L)).thenReturn(Optional.of(card));
		when(cardRepository.save(any(Card.class))).thenAnswer(invocation -> invocation.getArgument(0));

		CardUpdateRequest request = new CardUpdateRequest("更新後タイトル", "更新後の説明", "2026-02-01", "high", 2);

		CardResponse response = cardService.updateCard(1L, request);

		assertThat(response.title()).isEqualTo("更新後タイトル");
		assertThat(response.description()).isEqualTo("更新後の説明");
		assertThat(response.dueDate()).isEqualTo("2026-02-01");
		assertThat(response.priority()).isEqualTo("high");
		assertThat(response.position()).isEqualTo(2);
	}

	@Test
	void updateCard_throwsNotFound_whenCardDoesNotExist() {
		when(cardRepository.findById(99L)).thenReturn(Optional.empty());

		CardUpdateRequest request = new CardUpdateRequest("タイトル", "説明", "2026-02-01", "low", 0);

		assertThatThrownBy(() -> cardService.updateCard(99L, request))
				.isInstanceOf(ResponseStatusException.class);
	}

}
