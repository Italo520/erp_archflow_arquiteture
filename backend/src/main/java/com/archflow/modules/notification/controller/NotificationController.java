package com.archflow.modules.notification.controller;

import com.archflow.modules.notification.entity.Notification;
import com.archflow.modules.notification.repository.NotificationRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Endpoint Server-Sent Events (SSE) nativo para notificações em tempo real.
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@RequestParam(defaultValue = "global") String userId) {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1 hora de timeout
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        try {
            // Envia evento de boas-vindas inicial para confirmar a conexão SSE
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(Map.of("message", "Conectado ao fluxo de notificações do ArchFlow", "userId", userId)));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }

    /**
     * Disparar evento para um usuário via SSE e persistir no banco.
     */
    public void sendNotification(String userId, Notification notification) {
        notification.setUserId(userId);
        notification.setCreatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);

        List<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("NEW_NOTIFICATION")
                            .data(saved));
                } catch (IOException e) {
                    emitters.remove(emitter);
                }
            }
        }
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam(defaultValue = "global") String userId) {
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return notificationRepository.findById(id)
                .map(n -> {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                    return ResponseEntity.ok(notificationRepository.save(n));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam(defaultValue = "global") String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
