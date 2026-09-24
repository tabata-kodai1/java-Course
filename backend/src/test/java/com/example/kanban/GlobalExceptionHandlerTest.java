package com.example.kanban;

import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

  @Mock private CardService cardService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new CardController(cardService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @Test
  void notFoundFromService_isReturnedAs404() throws Exception {
    doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found: 999999"))
        .when(cardService)
        .deleteCard(999999L);

    mockMvc
        .perform(delete("/api/cards/999999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.detail").value("Card not found: 999999"));
  }

  @Test
  void badRequestFromService_isReturnedAs400() throws Exception {
    doThrow(
            new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "priority or dueDate must be provided"))
        .when(cardService)
        .bulkUpdateCards(org.mockito.ArgumentMatchers.any());

    mockMvc
        .perform(
            patch("/api/cards/bulk")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"cardIds\":[1]}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.detail").value("priority or dueDate must be provided"));
  }

  @Test
  void malformedJson_isReturnedAs400() throws Exception {
    mockMvc
        .perform(
            post("/api/columns/1/cards").contentType(MediaType.APPLICATION_JSON).content("{bad"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400));
  }

  @Test
  void validationError_isReturnedAs400WithFieldErrors() throws Exception {
    mockMvc
        .perform(
            post("/api/columns/1/cards")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.detail").value("Validation failed"))
        .andExpect(jsonPath("$.errors.title").exists());
  }

  @Test
  void pathVariableTypeMismatch_isReturnedAs400() throws Exception {
    mockMvc.perform(delete("/api/cards/abc")).andExpect(status().isBadRequest());
  }

  @Test
  void unsupportedMethod_isReturnedAs405() throws Exception {
    mockMvc.perform(put("/api/cards/1")).andExpect(status().isMethodNotAllowed());
  }

  @Test
  void unexpectedException_isReturnedAs500WithoutDetails() throws Exception {
    doThrow(new RuntimeException("boom")).when(cardService).deleteCard(1L);

    mockMvc
        .perform(delete("/api/cards/1"))
        .andExpect(status().isInternalServerError())
        .andExpect(jsonPath("$.detail").value("Unexpected error occurred"));
  }
}
