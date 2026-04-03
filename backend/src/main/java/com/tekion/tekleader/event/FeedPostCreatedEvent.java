package com.tekion.tekleader.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedPostCreatedEvent implements Serializable {
    
    private String postId;
    private String type;
    private String authorId;
    private String authorName;
    private String content;
    private List<String> mentionedUserIds;
    private LocalDateTime createdAt;
}

