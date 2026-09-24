package com.example.kanban;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class CardRequestValidationTest {

  private static final CardResponse SAMPLE = new CardResponse(1L, "t", null, null, "medium", 0);

  @Mock private CardService cardService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new CardController(cardService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  private org.springframework.test.web.servlet.ResultActions createCard(String json)
      throws Exception {
    return mockMvc.perform(
        post("/api/columns/1/cards").contentType(MediaType.APPLICATION_JSON).content(json));
  }

  @Test
  void create_rejectsUnknownPriority() throws Exception {
    createCard("{\"title\":\"t\",\"priority\":\"urgent\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.priority").exists());
  }

  @Test
  void create_rejectsMalformedDueDate() throws Exception {
    createCard("{\"title\":\"t\",\"dueDate\":\"2026/01/31\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.dueDate").exists());
  }

  @Test
  void create_rejectsImpossibleMonth() throws Exception {
    createCard("{\"title\":\"t\",\"dueDate\":\"2026-13-01\"}")
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.dueDate").exists());
  }

  @Test
  void create_acceptsValidValues() throws Exception {
    when(cardService.createCard(eq(1L), any())).thenReturn(SAMPLE);

    createCard("{\"title\":\"t\",\"priority\":\"high\",\"dueDate\":\"2026-01-31\"}")
        .andExpect(status().isCreated());
  }

  @Test
  void create_acceptsOmittedAndEmptyPriority() throws Exception {
    when(cardService.createCard(eq(1L), any())).thenReturn(SAMPLE);

    createCard("{\"title\":\"t\"}").andExpect(status().isCreated());
    createCard("{\"title\":\"t\",\"priority\":\"\"}").andExpect(status().isCreated());
  }

  @Test
  void update_rejectsUnknownPriorityAndMalformedDueDate() throws Exception {
    mockMvc
        .perform(
            patch("/api/cards/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"title\":\"t\",\"priority\":\"x\",\"dueDate\":\"tomorrow\",\"position\":0}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.priority").exists())
        .andExpect(jsonPath("$.errors.dueDate").exists());
  }

  @Test
  void update_acceptsValidValues() throws Exception {
    when(cardService.updateCard(eq(1L), any())).thenReturn(SAMPLE);

    mockMvc
        .perform(
            patch("/api/cards/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"title\":\"t\",\"priority\":\"low\",\"dueDate\":\"2026-12-31\",\"position\":0}"))
        .andExpect(status().isOk());
  }

  @Test
  void bulkUpdate_rejectsUnknownPriority() throws Exception {
    mockMvc
        .perform(
            patch("/api/cards/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cardIds\":[1],\"priority\":\"urgent\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.priority").exists());
  }

  @Test
  void bulkUpdate_acceptsValidValues() throws Exception {
    when(cardService.bulkUpdateCards(any())).thenReturn(List.of(SAMPLE));

    mockMvc
        .perform(
            patch("/api/cards/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cardIds\":[1],\"priority\":\"high\",\"dueDate\":\"2026-03-01\"}"))
        .andExpect(status().isOk());
  }
}
