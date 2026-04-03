package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "user_created_idx", def = "{'userId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "user_read_idx", def = "{'userId': 1, 'isRead': 1}")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    // User who receives the notification
    @Indexed
    private String userId;

    // Notification type: BADGE_AWARDED, ACHIEVEMENT_UNLOCKED, LEADERBOARD_MILESTONE, FEED_POST, FEED_COMMENT
    @Indexed
    private String type;

    // Title of the notification
    private String title;

    // Detailed message
    private String message;

    // Actor who triggered the notification (e.g., functional head who awarded badge)
    private String actorId;
    private String actorName;

    // Reference to related entity
    private String referenceId;       // e.g., badgeAwardId, feedPostId
    private String referenceType;     // e.g., BADGE_AWARD, FEED_POST, ACHIEVEMENT

    // Metadata for additional context
    private Map<String, Object> metadata;

    // Read status
    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime readAt;

    @CreatedDate
    private LocalDateTime createdAt;

    // Priority: HIGH, MEDIUM, LOW
    @Builder.Default
    private String priority = "MEDIUM";
}

