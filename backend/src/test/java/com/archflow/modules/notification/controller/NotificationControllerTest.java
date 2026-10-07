package com.archflow.modules.notification.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.notification.entity.Notification;
import com.archflow.modules.notification.repository.NotificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = NotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("NotificationController - Testes da Camada Web e Notificações SSE")
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificationRepository notificationRepository;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    private Notification buildNotification(String id, String userId, String title, String message, String type, boolean read) {
        Notification notification = new Notification();
        notification.setId(id);
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(read);
        notification.setCreatedAt(LocalDateTime.now());
        if (read) {
            notification.setReadAt(LocalDateTime.now());
        }
        return notification;
    }

    @Nested
    @DisplayName("GET /api/v1/notifications/stream")
    class SseStreamTests {

        @Test
        @DisplayName("TC-NTF-01: Deve conectar ao stream SSE e emitir evento inicial CONNECTED")
        void shouldConnectToSseStreamSuccessfully() throws Exception {
            MvcResult result = mockMvc.perform(get("/api/v1/notifications/stream")
                            .param("userId", "user-123")
                            .accept(MediaType.TEXT_EVENT_STREAM_VALUE))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_EVENT_STREAM_VALUE))
                    .andReturn();

            String responseContent = result.getResponse().getContentAsString();
            assertTrue(responseContent.contains("event:CONNECTED"));
            assertTrue(responseContent.contains("user-123"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/notifications")
    class GetNotificationsTests {

        @Test
        @DisplayName("TC-NTF-02: Deve listar notificações do usuário por ordem decrescente (ECP Válido)")
        void shouldListNotificationsForUser() throws Exception {
            Notification n1 = buildNotification("n1", "user-1", "Nova Vistoria", "Vistoria agendada amanhã", "INFO", false);
            Notification n2 = buildNotification("n2", "user-1", "Prazo Próximo", "Entrega da planta em 2 dias", "WARNING", true);

            when(notificationRepository.findByUserIdOrderByCreatedAtDesc("user-1"))
                    .thenReturn(List.of(n1, n2));

            mockMvc.perform(get("/api/v1/notifications")
                            .param("userId", "user-1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is("n1")))
                    .andExpect(jsonPath("$[0].title", is("Nova Vistoria")))
                    .andExpect(jsonPath("$[0].read", is(false)))
                    .andExpect(jsonPath("$[1].id", is("n2")))
                    .andExpect(jsonPath("$[1].read", is(true)));
        }
    }

    @Nested
    @DisplayName("PATCH /api/v1/notifications/{id}/read")
    class MarkAsReadTests {

        @Test
        @DisplayName("TC-NTF-03: Deve marcar notificação existente como lida (Transição de Estado)")
        void shouldMarkNotificationAsRead() throws Exception {
            Notification n = buildNotification("n1", "user-1", "Aprovação", "Cliente aprovou prancha", "SUCCESS", false);

            when(notificationRepository.findById("n1")).thenReturn(Optional.of(n));
            when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

            mockMvc.perform(patch("/api/v1/notifications/n1/read")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is("n1")))
                    .andExpect(jsonPath("$.read", is(true)));

            verify(notificationRepository).save(any(Notification.class));
        }

        @Test
        @DisplayName("TC-NTF-04: Deve retornar 404 quando notificação não existir (Error Guessing)")
        void shouldReturn404WhenNotificationNotFound() throws Exception {
            when(notificationRepository.findById("inexistente")).thenReturn(Optional.empty());

            mockMvc.perform(patch("/api/v1/notifications/inexistente/read")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/notifications/mark-all-read")
    class MarkAllReadTests {

        @Test
        @DisplayName("TC-NTF-05: Deve marcar todas as notificações do usuário como lidas em lote")
        void shouldMarkAllNotificationsAsRead() throws Exception {
            Notification n1 = buildNotification("n1", "user-1", "Alerta 1", "Msg 1", "INFO", false);
            Notification n2 = buildNotification("n2", "user-1", "Alerta 2", "Msg 2", "INFO", false);

            when(notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc("user-1"))
                    .thenReturn(List.of(n1, n2));

            mockMvc.perform(post("/api/v1/notifications/mark-all-read")
                            .param("userId", "user-1")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());

            verify(notificationRepository).saveAll(any());
        }
    }
}
