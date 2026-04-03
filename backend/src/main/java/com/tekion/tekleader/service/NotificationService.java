package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.Notification;
import com.tekion.tekleader.entity.TeamMember;
import com.tekion.tekleader.event.AchievementUnlockedEvent;
import com.tekion.tekleader.event.BadgeAwardedEvent;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.NotificationRepository;
import com.tekion.tekleader.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ManagerRepository managerRepository;
    private final TeamMemberRepository teamMemberRepository;

    public void createBadgeAwardNotifications(BadgeAwardedEvent event) {
        log.info("Creating notifications for badge award: {} to {}", event.getBadgeName(), event.getManagerName());

        Manager manager = managerRepository.findById(event.getManagerId()).orElse(null);
        if (manager == null) {
            log.warn("Manager not found: {}", event.getManagerId());
            return;
        }

        Set<String> notifyUserIds = new HashSet<>();

        notifyUserIds.add(event.getManagerId());
        
        List<TeamMember> teamMembers = teamMemberRepository.findByManagerId(event.getManagerId());
        notifyUserIds.addAll(teamMembers.stream().map(TeamMember::getId).collect(Collectors.toList()));
        
        List<Manager> allManagers = managerRepository.findAll();
        allManagers.stream()
            .filter(m -> m.getDirectorName() != null && m.getDirectorName().equals(manager.getDirectorName()))
            .forEach(m -> notifyUserIds.add(m.getId()));

        allManagers.stream()
            .filter(m -> m.getFunctionalHead() != null && m.getFunctionalHead().equals(manager.getFunctionalHead()))
            .forEach(m -> notifyUserIds.add(m.getId()));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("badgeCode", event.getBadgeCode());
        metadata.put("month", event.getMonth());
        metadata.put("isPremium", event.isPremium());

        for (String userId : notifyUserIds) {
            String title = userId.equals(event.getManagerId()) 
                ? "🎉 You received a badge!"
                : "🏆 " + event.getManagerName() + " received a badge!";
            
            String message = userId.equals(event.getManagerId())
                ? String.format("Congratulations! You've been awarded the '%s' badge for %s.", event.getBadgeName(), event.getMonth())
                : String.format("%s has been awarded the '%s' badge for %s. %s", 
                    event.getManagerName(), event.getBadgeName(), event.getMonth(), 
                    event.getReason() != null ? event.getReason() : "");

            Notification notification = Notification.builder()
                .userId(userId)
                .type("BADGE_AWARDED")
                .title(title)
                .message(message)
                .actorId(event.getManagerId())
                .actorName(event.getManagerName())
                .referenceId(event.getManagerId())
                .referenceType("BADGE_AWARD")
                .metadata(metadata)
                .priority(event.isPremium() ? "HIGH" : "MEDIUM")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

            notificationRepository.save(notification);
        }

        log.info("Created {} notifications for badge award", notifyUserIds.size());
    }

    public void createAchievementNotifications(AchievementUnlockedEvent event) {
        log.info("Creating notifications for achievement: {} for {}", event.getTitle(), event.getManagerName());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("achievementType", event.getAchievementType());
        metadata.putAll(event.getMetadata());

        Notification notification = Notification.builder()
            .userId(event.getManagerId())
            .type("ACHIEVEMENT_UNLOCKED")
            .title("🌟 Achievement Unlocked!")
            .message(String.format("Congratulations! You've unlocked '%s': %s", event.getTitle(), event.getDescription()))
            .actorId(event.getManagerId())
            .actorName(event.getManagerName())
            .referenceId(event.getAchievementId())
            .referenceType("ACHIEVEMENT")
            .metadata(metadata)
            .priority("HIGH")
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();

        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unreadNotifications);
    }
}

