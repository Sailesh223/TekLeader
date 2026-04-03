package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "feed_posts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedPost {

    @Id
    private String id;

    // Post type: USER_POST, BADGE_AWARD, ACHIEVEMENT, MILESTONE
    @Indexed
    private String type;

    // Author (for USER_POST) or Subject (for system-generated posts)
    @Indexed
    private String authorId;
    private String authorName;

    // Content
    private String content;

    // For user posts: images, attachments
    private List<String> mediaUrls;

    // For system posts: badge/achievement details
    private Map<String, Object> metadata;

    // Visibility: PUBLIC, TEAM, PRIVATE
    @Builder.Default
    private String visibility = "PUBLIC";

    // Engagement
    @Builder.Default
    private Integer likeCount = 0;

    @Builder.Default
    private Integer commentCount = 0;

    @Builder.Default
    private List<String> likes = new ArrayList<>();

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // For pinned posts
    @Builder.Default
    private Boolean isPinned = false;
}

