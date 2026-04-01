package com.tekion.tekleader.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeAwardedEvent implements Serializable {
    
    private String managerId;
    private String managerName;
    private String badgeCode;
    private String badgeName;
    private String month;
    private String awardedBy;
    private String reason;
    private LocalDateTime awardedAt;
    private boolean isPremium;
}

