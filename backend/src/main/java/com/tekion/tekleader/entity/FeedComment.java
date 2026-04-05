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

@Document(collection = "feed_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedComment {

    @Id
    private String id;

    @Indexed
    private String postId;

    @Indexed
    private String authorId;
    private String authorName;

    private String content;

    @CreatedDate
    @Indexed
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

