package com.tekion.tekleader.controller;

import com.tekion.tekleader.entity.Notification;
import com.tekion.tekleader.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        log.info("Fetching notifications for user: {}", userId);
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        log.info("Fetching unread count for user: {}", userId);
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}

