package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "achievements")
@CompoundIndexes({
    @CompoundIndex(name = "manager_type_idx", def = "{'managerId': 1, 'achievementType': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Achievement {

    @Id
    private String id;

    @Indexed
    private String managerId;

    // Achievement types: GOLD_STREAK, SEASONAL_EXCELLENCE, PERFECT_SCORE
    @Indexed
    private String achievementType;

    private String title;
    private String description;
    private String iconKey;
    private String color;

    // Metadata specific to achievement type
    private Map<String, Object> metadata;

    @CreatedDate
    private LocalDateTime unlockedAt;
}

