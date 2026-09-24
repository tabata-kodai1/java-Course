package com.example.kanban;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Spring MVCの標準例外(ResponseStatusException・不正なJSON・型の不一致・未対応メソッド等)は
 * ResponseEntityExceptionHandlerに任せて正しいステータスで返し、想定外の例外だけを500にする。
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
      MethodArgumentNotValidException ex,
      HttpHeaders headers,
      HttpStatusCode status,
      WebRequest request) {
    ProblemDetail problem =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");

    Map<String, String> fieldErrors = new HashMap<>();
    ex.getBindingResult()
        .getFieldErrors()
        .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));
    problem.setProperty("errors", fieldErrors);

    return handleExceptionInternal(ex, problem, headers, status, request);
  }

  @ExceptionHandler(Exception.class)
  public ProblemDetail handleUnexpected(Exception ex) {
    log.error("Unexpected error", ex);
    return ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error occurred");
  }
}
