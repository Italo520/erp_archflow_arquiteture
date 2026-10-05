package com.archflow.core.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("GlobalExceptionHandler Unit Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Should return ProblemDetail 400 when BusinessException is thrown")
    void shouldHandleBusinessException() {
        // Arrange
        BusinessException ex = new BusinessException("E-mail já cadastrado");

        // Act
        ProblemDetail response = exceptionHandler.handleBusinessException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(response.getTitle()).isEqualTo("Business Rule Violation");
        assertThat(response.getDetail()).isEqualTo("E-mail já cadastrado");
        assertThat(response.getProperties()).containsKey("timestamp");
    }

    @Test
    @DisplayName("Should return ProblemDetail 404 when ResourceNotFoundException is thrown")
    void shouldHandleResourceNotFoundException() {
        // Arrange
        ResourceNotFoundException ex = new ResourceNotFoundException("Usuário", "id", "123");

        // Act
        ProblemDetail response = exceptionHandler.handleResourceNotFoundException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(response.getTitle()).isEqualTo("Resource Not Found");
        assertThat(response.getDetail()).isEqualTo("Usuário não encontrado com id: '123'");
    }

    @Test
    @DisplayName("Should return ProblemDetail 401 when BadCredentialsException is thrown")
    void shouldHandleBadCredentialsException() {
        // Arrange
        BadCredentialsException ex = new BadCredentialsException("Bad credentials");

        // Act
        ProblemDetail response = exceptionHandler.handleBadCredentialsException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getTitle()).isEqualTo("Invalid Credentials");
        assertThat(response.getDetail()).isEqualTo("E-mail ou senha inválidos.");
    }

    @Test
    @DisplayName("Should return ProblemDetail 401 when UnauthorizedException is thrown")
    void shouldHandleUnauthorizedException() {
        // Arrange
        UnauthorizedException ex = new UnauthorizedException("Token inválido");

        // Act
        ProblemDetail response = exceptionHandler.handleUnauthorizedException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(response.getTitle()).isEqualTo("Unauthorized");
        assertThat(response.getDetail()).isEqualTo("Token inválido");
    }

    @Test
    @DisplayName("Should return ProblemDetail 403 when AccessDeniedException is thrown")
    void shouldHandleAccessDeniedException() {
        // Arrange
        AccessDeniedException ex = new AccessDeniedException("Access denied");

        // Act
        ProblemDetail response = exceptionHandler.handleAccessDeniedException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(response.getTitle()).isEqualTo("Access Denied");
        assertThat(response.getDetail()).isEqualTo("Você não tem permissão para acessar este recurso.");
    }

    @Test
    @DisplayName("Should return ProblemDetail 500 when generic Exception is thrown")
    void shouldHandleGeneralException() {
        // Arrange
        RuntimeException ex = new RuntimeException("Null pointer simulated");

        // Act
        ProblemDetail response = exceptionHandler.handleGeneralException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(response.getTitle()).isEqualTo("Internal Server Error");
        assertThat(response.getDetail()).isEqualTo("Ocorreu um erro interno inesperado no servidor.");
    }

    @Test
    @DisplayName("Should return ProblemDetail 400 with invalidParams for MethodArgumentNotValidException")
    void shouldHandleValidationException() throws NoSuchMethodException {
        // Arrange
        Method dummyMethod = String.class.getMethod("toString");
        MethodParameter parameter = new MethodParameter(dummyMethod, -1);
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "email", "Formato de e-mail inválido"));
        bindingResult.addError(new FieldError("target", "password", "A senha deve conter no mínimo 8 caracteres"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        // Act
        ProblemDetail response = exceptionHandler.handleValidationException(ex);

        // Assert
        assertThat(response.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(response.getTitle()).isEqualTo("Validation Error");
        assertThat(response.getProperties()).containsKey("invalidParams");

        @SuppressWarnings("unchecked")
        Map<String, String> invalidParams = (Map<String, String>) response.getProperties().get("invalidParams");
        assertThat(invalidParams).containsEntry("email", "Formato de e-mail inválido");
        assertThat(invalidParams).containsEntry("password", "A senha deve conter no mínimo 8 caracteres");
    }
}
