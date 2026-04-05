package com.tekion.tekleader.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementUnlockedEvent implements Serializable {
    
    private String achievementId;
    private String managerId;
    private String managerName;
    private String achievementType;
    private String title;
    private String description;
    private Map<String, Object> metadata;
    private LocalDateTime unlockedAt;
}

