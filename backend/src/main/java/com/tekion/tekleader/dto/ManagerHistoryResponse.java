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
public class ManagerHistoryResponse {

    private ManagerInfo manager;
    private List<MonthlyPerformance> history;
    private PerformanceSummary summary;
    private List<TeamMember> teamMembers;
    private List<BadgeInfo> allBadges;

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
    public static class MonthlyPerformance {
        private String month;
        private Integer rank;
        private Integer rankChange;
        private BigDecimal finalScore;
        private BigDecimal utilization;
        private BigDecimal teamSizeScore;
        private BigDecimal consistencyScore;
        private String classificationBand;
        private Integer headcount;
        private Integer oneOnOnes;
        private Integer notUtilising;
        private String functionalHead;
        private List<BadgeInfo> badges;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceSummary {
        private Integer totalMonths;
        private Integer bestRank;
        private String bestRankMonth;
        private BigDecimal averageScore;
        private BigDecimal averageUtilization;
        private Integer totalBadges;
        private Integer consecutiveImprovements;
        private String trend; // "improving", "declining", "stable"
        private BigDecimal scoreChange; // Change from previous month
        private Integer rankImprovement; // Positive = improved (lower rank number)
        private String motivationalMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMember {
        private String name;
        private String department;
        private Boolean participated1on1;
        private Integer oneOnOnesCount;
        private Integer oneOnOnesSetUp;
        private Boolean isUtilizing;
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
        private String month;
        private Map<String, Object> metadata;
    }
}

