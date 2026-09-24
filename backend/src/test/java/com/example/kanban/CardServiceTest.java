package com.example.kanban;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

  @Mock private CardRepository cardRepository;

  @Mock private ColumnRepository columnRepository;

  @InjectMocks private CardService cardService;

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

    CardUpdateRequest request = new CardUpdateRequest("更新後タイトル", "更新後の説明", "2026-02-01", "high", 0);

    CardResponse response = cardService.updateCard(1L, request);

    assertThat(response.title()).isEqualTo("更新後タイトル");
    assertThat(response.description()).isEqualTo("更新後の説明");
    assertThat(response.dueDate()).isEqualTo("2026-02-01");
    assertThat(response.priority()).isEqualTo("high");
    assertThat(response.position()).isEqualTo(0);
    verify(cardRepository, never()).findByColumnIdOrderByPositionAsc(any());
  }

  @Test
  void updateCard_renumbersSiblings_whenPositionChanges() {
    Card first = cardWithId(10L, "first", 0);
    Card target = cardWithId(1L, "target", 1);
    Card last = cardWithId(12L, "last", 2);
    Column column = new Column();
    for (Card c : List.of(first, target, last)) {
      c.setColumn(column);
    }

    when(cardRepository.findById(1L)).thenReturn(Optional.of(target));
    when(cardRepository.findByColumnIdOrderByPositionAsc(any()))
        .thenReturn(new ArrayList<>(List.of(first, target, last)));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
    when(cardRepository.save(any(Card.class))).thenAnswer(invocation -> invocation.getArgument(0));

    CardResponse response =
        cardService.updateCard(1L, new CardUpdateRequest("target", null, null, null, 0));

    assertThat(response.position()).isEqualTo(0);
    assertThat(first.getPosition()).isEqualTo(1);
    assertThat(last.getPosition()).isEqualTo(2);
  }

  @Test
  void updateCard_clampsPosition_whenOutOfRange() {
    Card first = cardWithId(10L, "first", 0);
    Card target = cardWithId(1L, "target", 1);
    Column column = new Column();
    first.setColumn(column);
    target.setColumn(column);

    when(cardRepository.findById(1L)).thenReturn(Optional.of(target));
    when(cardRepository.findByColumnIdOrderByPositionAsc(any()))
        .thenReturn(new ArrayList<>(List.of(first, target)));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
    when(cardRepository.save(any(Card.class))).thenAnswer(invocation -> invocation.getArgument(0));

    CardResponse response =
        cardService.updateCard(1L, new CardUpdateRequest("target", null, null, null, 99));

    assertThat(response.position()).isEqualTo(1);
    assertThat(first.getPosition()).isEqualTo(0);
  }

  @Test
  void moveCard_withinSameColumn_reordersAndRenumbers() {
    Card first = cardWithId(10L, "first", 0);
    Card second = cardWithId(11L, "second", 1);
    Card third = cardWithId(12L, "third", 2);
    Column column = new Column();
    ReflectionTestUtils.setField(column, "id", 5L);
    for (Card c : List.of(first, second, third)) {
      c.setColumn(column);
    }

    when(cardRepository.findById(10L)).thenReturn(Optional.of(first), Optional.of(first));
    when(columnRepository.findById(5L)).thenReturn(Optional.of(column));
    when(cardRepository.findByColumnIdOrderByPositionAsc(5L))
        .thenReturn(new ArrayList<>(List.of(first, second, third)));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

    CardResponse response = cardService.moveCard(10L, new CardMoveRequest(5L, 2));

    assertThat(response.position()).isEqualTo(2);
    assertThat(second.getPosition()).isEqualTo(0);
    assertThat(third.getPosition()).isEqualTo(1);
  }

  private static Card cardWithId(Long id, String title, int position) {
    Card card = new Card();
    ReflectionTestUtils.setField(card, "id", id);
    card.setTitle(title);
    card.setPosition(position);
    return card;
  }

  @Test
  void updateCard_throwsNotFound_whenCardDoesNotExist() {
    when(cardRepository.findById(99L)).thenReturn(Optional.empty());

    CardUpdateRequest request = new CardUpdateRequest("タイトル", "説明", "2026-02-01", "low", 0);

    assertThatThrownBy(() -> cardService.updateCard(99L, request))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void bulkUpdateCards_appliesPriorityAndDueDateToAllTargetCards() {
    Card card1 = new Card();
    card1.setTitle("カード1");
    card1.setPriority("low");
    Card card2 = new Card();
    card2.setTitle("カード2");
    card2.setPriority("low");

    when(cardRepository.findByIdIn(List.of(1L, 2L))).thenReturn(List.of(card1, card2));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

    CardBulkUpdateRequest request =
        new CardBulkUpdateRequest(List.of(1L, 2L), "2026-03-01", "high");

    List<CardResponse> responses = cardService.bulkUpdateCards(request);

    assertThat(responses).hasSize(2);
    assertThat(responses)
        .allSatisfy(
            r -> {
              assertThat(r.priority()).isEqualTo("high");
              assertThat(r.dueDate()).isEqualTo("2026-03-01");
            });
  }

  @Test
  void bulkUpdateCards_throwsBadRequest_whenNeitherPriorityNorDueDateProvided() {
    CardBulkUpdateRequest request = new CardBulkUpdateRequest(List.of(1L), null, null);

    assertThatThrownBy(() -> cardService.bulkUpdateCards(request))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void bulkUpdateCards_throwsNotFound_whenSomeCardsDoNotExist() {
    Card card1 = new Card();
    card1.setTitle("カード1");

    when(cardRepository.findByIdIn(List.of(1L, 99L))).thenReturn(List.of(card1));

    CardBulkUpdateRequest request = new CardBulkUpdateRequest(List.of(1L, 99L), null, "high");

    assertThatThrownBy(() -> cardService.bulkUpdateCards(request))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void sortColumnByDueDate_ordersCardsByDueDateAscendingWithNullsLast() {
    Column column = new Column();

    Card noDueDate = new Card();
    noDueDate.setTitle("期限なし");
    noDueDate.setColumn(column);

    Card later = new Card();
    later.setTitle("後の期限");
    later.setDueDate("2026-05-01");
    later.setColumn(column);

    Card earlier = new Card();
    earlier.setTitle("先の期限");
    earlier.setDueDate("2026-01-01");
    earlier.setColumn(column);

    when(columnRepository.findById(1L)).thenReturn(Optional.of(column));
    when(cardRepository.findByColumnIdOrderByPositionAsc(1L))
        .thenReturn(new java.util.ArrayList<>(List.of(noDueDate, later, earlier)));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

    List<CardResponse> responses = cardService.sortColumnByDueDate(1L);

    assertThat(responses).extracting(CardResponse::title).containsExactly("先の期限", "後の期限", "期限なし");
    assertThat(responses).extracting(CardResponse::position).containsExactly(0, 1, 2);
  }

  @Test
  void sortColumnByDueDate_throwsNotFound_whenColumnDoesNotExist() {
    when(columnRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> cardService.sortColumnByDueDate(99L))
        .isInstanceOf(ResponseStatusException.class);
  }

  @Test
  void sortColumnByPriority_ordersCardsFromLowToHigh() {
    Column column = new Column();

    Card high = new Card();
    high.setTitle("高優先度");
    high.setPriority("high");
    high.setColumn(column);

    Card low = new Card();
    low.setTitle("低優先度");
    low.setPriority("low");
    low.setColumn(column);

    Card medium = new Card();
    medium.setTitle("中優先度");
    medium.setPriority("medium");
    medium.setColumn(column);

    when(columnRepository.findById(1L)).thenReturn(Optional.of(column));
    when(cardRepository.findByColumnIdOrderByPositionAsc(1L))
        .thenReturn(new java.util.ArrayList<>(List.of(high, low, medium)));
    when(cardRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

    List<CardResponse> responses = cardService.sortColumnByPriority(1L);

    assertThat(responses).extracting(CardResponse::title).containsExactly("低優先度", "中優先度", "高優先度");
    assertThat(responses).extracting(CardResponse::position).containsExactly(0, 1, 2);
  }

  @Test
  void sortColumnByPriority_throwsNotFound_whenColumnDoesNotExist() {
    when(columnRepository.findById(99L)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> cardService.sortColumnByPriority(99L))
        .isInstanceOf(ResponseStatusException.class);
  }
}
