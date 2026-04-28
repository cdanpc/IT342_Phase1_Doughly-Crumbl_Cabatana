package edu.cit.cabatana.doughlycrumbl.controller;

import edu.cit.cabatana.doughlycrumbl.dto.response.NotificationResponse;
import edu.cit.cabatana.doughlycrumbl.features.auth.CustomUserDetails;
import edu.cit.cabatana.doughlycrumbl.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getForUser(userDetails.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userDetails.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markRead(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllRead(userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
