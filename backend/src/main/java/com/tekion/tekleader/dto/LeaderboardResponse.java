package com.tekion.tekleader.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private String month;
    private Integer totalManagers;
    private Integer filteredManagers;
    private Integer page;
    private Integer size;
    private Integer totalPages;
    private List<ManagerEntry> managers;
    private Statistics statistics;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerEntry {
        private Integer rank;
        private Integer rankChange;
        private ManagerInfo manager;
        private String functionalHead;
        private Integer headcount;
        private Integer oneOnOnes;
        private Integer notUtilising;
        private BigDecimal utilization;
        private BigDecimal teamSizeScore;
        private BigDecimal consistencyScore;
        private BigDecimal finalScore;
        private String classificationBand;
        private List<BadgeInfo> badges;
        private Integer badgeCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerInfo {
        private String id;
        private String displayName;
        private String email;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeInfo {
        private String id;
        private String code;
        private String name;
        private String iconKey;
        private String color;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Statistics {
        private BigDecimal averageFinalScore;
        private BigDecimal averageUtilization;
        private Map<String, Integer> bandDistribution;
    }
}

