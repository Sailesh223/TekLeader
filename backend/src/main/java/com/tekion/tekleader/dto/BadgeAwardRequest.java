package com.tekion.tekleader.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeAwardRequest {
    private String managerId;
    private String badgeCode;
    private String month;
    private String awardedBy;
    private String reason;
}

