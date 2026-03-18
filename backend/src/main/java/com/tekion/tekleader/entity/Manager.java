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

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "managers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Manager {

    @Id
    private String id;

    private String displayName;

    @Indexed(unique = true)
    private String canonicalName;

    private String email;

    private String avatarUrl;

    private String role;

    private String directorName;

    private String functionalHead;

    @Builder.Default
    private BigDecimal overallXP = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal seasonalXP = BigDecimal.ZERO;

    @Builder.Default
    private Integer currentStreak = 0;

    @Builder.Default
    private Integer longestStreak = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

