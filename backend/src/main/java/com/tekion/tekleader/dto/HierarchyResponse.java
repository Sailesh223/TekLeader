package com.tekion.tekleader.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class HierarchyResponse {
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FunctionalHeadNode {
        private String name;
        private List<DirectorNode> directors;
        private Integer totalManagers;
        private Integer totalTeamMembers;
        private BigDecimal avgScore;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DirectorNode {
        private String id;
        private String name;
        private String email;
        private String avatarUrl;
        private List<ManagerNode> managers;
        private Integer totalTeamMembers;
        private BigDecimal avgScore;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManagerNode {
        private String id;
        private String displayName;
        private String email;
        private String avatarUrl;
        private String classificationBand;
        private BigDecimal finalScore;
        private BigDecimal utilization;
        private Integer headcount;
        private List<TeamMemberNode> teamMembers;
        private List<BadgeInfo> badges;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberNode {
        private String name;
        private String department;
        private Boolean isUtilizing;
        private Integer oneOnOnesCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BadgeInfo {
        private String code;
        private String name;
        private String iconKey;
        private String color;
    }
}

