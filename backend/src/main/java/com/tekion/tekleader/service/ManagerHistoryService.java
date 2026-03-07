package com.tekion.tekleader.service;

import com.tekion.tekleader.dto.ManagerHistoryResponse;
import com.tekion.tekleader.entity.BadgeAward;
import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.entity.TeamMember;
import com.tekion.tekleader.repository.BadgeAwardRepository;
import com.tekion.tekleader.repository.BadgeDefinitionRepository;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import com.tekion.tekleader.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerHistoryService {

    private final ManagerRepository managerRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    private final BadgeAwardRepository badgeAwardRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final TeamMemberRepository teamMemberRepository;

    public ManagerHistoryResponse getManagerHistory(String displayName) {
        // Find manager by display name
        Manager manager = managerRepository.findByCanonicalName(displayName.toLowerCase())
            .orElseThrow(() -> new RuntimeException("Manager not found with name: " + displayName));

        // Get all monthly metrics for this manager
        List<MonthlyMetric> metrics = monthlyMetricRepository
            .findByManagerIdOrderByMonthDesc(manager.getId());

        // Get all badges for this manager
        List<BadgeAward> awards = badgeAwardRepository
            .findByManagerIdOrderByAwardedAtDesc(manager.getId());

        // Get latest month for team members
        String latestMonth = metrics.isEmpty() ? null : metrics.get(0).getMonth();

        // Build response
        return ManagerHistoryResponse.builder()
            .manager(buildManagerInfo(manager))
            .history(buildHistory(metrics, awards))
            .summary(buildSummary(metrics, awards))
            .teamMembers(buildTeamMembers(manager.getId(), latestMonth))
            .allBadges(buildAllBadges(awards))
            .build();
    }

    private ManagerHistoryResponse.ManagerInfo buildManagerInfo(Manager manager) {
        return ManagerHistoryResponse.ManagerInfo.builder()
            .id(manager.getId())
            .displayName(manager.getDisplayName())
            .email(manager.getEmail())
            .avatarUrl(manager.getAvatarUrl())
            .build();
    }

    private List<ManagerHistoryResponse.MonthlyPerformance> buildHistory(
        List<MonthlyMetric> metrics,
        List<BadgeAward> awards
    ) {
        Map<String, List<BadgeAward>> badgesByMonth = awards.stream()
            .collect(Collectors.groupingBy(BadgeAward::getMonth));

        return metrics.stream()
            .map(metric -> {
                List<BadgeAward> monthBadges = badgesByMonth.getOrDefault(metric.getMonth(), Collections.emptyList());
                List<ManagerHistoryResponse.BadgeInfo> badgeInfos = monthBadges.stream()
                    .map(this::toBadgeInfo)
                    .collect(Collectors.toList());

                return ManagerHistoryResponse.MonthlyPerformance.builder()
                    .month(metric.getMonth())
                    .rank(metric.getRank())
                    .rankChange(metric.getRankChange())
                    .finalScore(metric.getFinalScore())
                    .utilization(metric.getUtilization())
                    .teamSizeScore(metric.getTeamSizeScore())
                    .consistencyScore(metric.getConsistencyScore())
                    .classificationBand(metric.getClassificationBand())
                    .headcount(metric.getHeadcount())
                    .oneOnOnes(metric.getOneOnOnes())
                    .notUtilising(metric.getNotUtilising())
                    .functionalHead(metric.getFunctionalHead())
                    .badges(badgeInfos)
                    .build();
            })
            .collect(Collectors.toList());
    }

    private ManagerHistoryResponse.PerformanceSummary buildSummary(
        List<MonthlyMetric> metrics,
        List<BadgeAward> awards
    ) {
        if (metrics.isEmpty()) {
            return ManagerHistoryResponse.PerformanceSummary.builder()
                .totalMonths(0)
                .totalBadges(0)
                .motivationalMessage("Welcome! Start your journey to excellence!")
                .build();
        }

        // Calculate statistics
        int totalMonths = metrics.size();
        MonthlyMetric bestRankMetric = metrics.stream()
            .min(Comparator.comparing(MonthlyMetric::getRank))
            .orElse(metrics.get(0));

        BigDecimal avgScore = metrics.stream()
            .map(MonthlyMetric::getFinalScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);

        BigDecimal avgUtilization = metrics.stream()
            .map(MonthlyMetric::getUtilization)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(totalMonths), 2, RoundingMode.HALF_UP);

        // Calculate trend and improvements
        MonthlyMetric latest = metrics.get(0);
        MonthlyMetric previous = metrics.size() > 1 ? metrics.get(1) : null;

        BigDecimal scoreChange = previous != null
            ? latest.getFinalScore().subtract(previous.getFinalScore())
            : BigDecimal.ZERO;

        Integer rankImprovement = previous != null && latest.getRank() != null && previous.getRank() != null
            ? previous.getRank() - latest.getRank() // Positive = improved (lower rank number)
            : 0;

        String trend = determineTrend(metrics);
        int consecutiveImprovements = calculateConsecutiveImprovements(metrics);
        String motivationalMessage = generateMotivationalMessage(latest, previous, trend, consecutiveImprovements);

        return ManagerHistoryResponse.PerformanceSummary.builder()
            .totalMonths(totalMonths)
            .bestRank(bestRankMetric.getRank())
            .bestRankMonth(bestRankMetric.getMonth())
            .averageScore(avgScore)
            .averageUtilization(avgUtilization)
            .totalBadges(awards.size())
            .consecutiveImprovements(consecutiveImprovements)
            .trend(trend)
            .scoreChange(scoreChange)
            .rankImprovement(rankImprovement)
            .motivationalMessage(motivationalMessage)
            .build();
    }

    private String determineTrend(List<MonthlyMetric> metrics) {
        if (metrics.size() < 2) return "stable";

        int improvements = 0;
        int declines = 0;

        for (int i = 0; i < Math.min(3, metrics.size() - 1); i++) {
            BigDecimal current = metrics.get(i).getFinalScore();
            BigDecimal previous = metrics.get(i + 1).getFinalScore();

            if (current.compareTo(previous) > 0) improvements++;
            else if (current.compareTo(previous) < 0) declines++;
        }

        if (improvements > declines) return "improving";
        if (declines > improvements) return "declining";
        return "stable";
    }

    private int calculateConsecutiveImprovements(List<MonthlyMetric> metrics) {
        int count = 0;
        for (int i = 0; i < metrics.size() - 1; i++) {
            if (metrics.get(i).getFinalScore().compareTo(metrics.get(i + 1).getFinalScore()) > 0) {
                count++;
            } else {
                break;
            }
        }
        return count;
    }

    private String generateMotivationalMessage(
        MonthlyMetric latest,
        MonthlyMetric previous,
        String trend,
        int consecutiveImprovements
    ) {
        if (previous == null) {
            return "🎉 Welcome to TekLeader! Your journey to excellence starts now!";
        }

        BigDecimal scoreChange = latest.getFinalScore().subtract(previous.getFinalScore());
        Integer rankChange = latest.getRankChange();

        // Congratulations for improvements
        if (scoreChange.compareTo(BigDecimal.ZERO) > 0 && rankChange != null && rankChange > 0) {
            if (consecutiveImprovements >= 3) {
                return String.format("🔥 Outstanding! %d months of continuous improvement! You're on fire! Keep up the amazing work!", consecutiveImprovements);
            } else if (latest.getRank() != null && latest.getRank() <= 3) {
                return String.format("🏆 Phenomenal! You're in the TOP 3 (Rank #%d)! You're setting the standard for excellence!", latest.getRank());
            } else if (scoreChange.compareTo(BigDecimal.valueOf(10)) > 0) {
                return String.format("🚀 Incredible progress! Your score jumped by %.1f points! You're crushing it!", scoreChange.doubleValue());
            } else {
                return String.format("✨ Great job! You improved by %.1f points and moved up %d ranks! Keep the momentum going!",
                    scoreChange.doubleValue(), rankChange);
            }
        }

        // Motivation for declines
        if (scoreChange.compareTo(BigDecimal.ZERO) < 0) {
            if (latest.getUtilization().compareTo(BigDecimal.valueOf(80)) > 0) {
                return String.format("💪 Your utilization is strong at %.1f%%! Small adjustments can bring you back on top. You've got this!",
                    latest.getUtilization().doubleValue());
            } else {
                return String.format("🎯 Every champion faces challenges! Focus on improving utilization (currently %.1f%%) and you'll bounce back stronger!",
                    latest.getUtilization().doubleValue());
            }
        }

        // Stable performance
        if ("Gold".equals(latest.getClassificationBand())) {
            return "⭐ Consistent excellence! You're maintaining Gold status. Keep up the great work!";
        } else {
            return String.format("📈 You're doing well! Push a bit harder to reach the next level. You're closer than you think!");
        }
    }

    private List<ManagerHistoryResponse.TeamMember> buildTeamMembers(String managerId, String month) {
        if (month == null) {
            return Collections.emptyList();
        }

        List<TeamMember> teamMembers = teamMemberRepository.findByManagerIdAndMonth(managerId, month);

        return teamMembers.stream()
            .map(tm -> ManagerHistoryResponse.TeamMember.builder()
                .name(tm.getPreferredFullName())
                .department(tm.getDepartment())
                .participated1on1(tm.getOneOnOnesParticipated() != null && tm.getOneOnOnesParticipated() > 0)
                .oneOnOnesCount(tm.getOneOnOnesParticipated() != null ? tm.getOneOnOnesParticipated() : 0)
                .oneOnOnesSetUp(tm.getOneOnOnesSetUp() != null ? tm.getOneOnOnesSetUp() : 0)
                .isUtilizing(tm.getIsUtilizing() != null && tm.getIsUtilizing())
                .build())
            .collect(Collectors.toList());
    }

    private List<ManagerHistoryResponse.BadgeInfo> buildAllBadges(List<BadgeAward> awards) {
        return awards.stream()
            .map(this::toBadgeInfo)
            .collect(Collectors.toList());
    }

    private ManagerHistoryResponse.BadgeInfo toBadgeInfo(BadgeAward award) {
        BadgeDefinition def = badgeDefinitionRepository.findById(award.getBadgeDefinitionId())
            .orElse(null);

        if (def == null) {
            return ManagerHistoryResponse.BadgeInfo.builder()
                .id(award.getId())
                .month(award.getMonth())
                .build();
        }

        return ManagerHistoryResponse.BadgeInfo.builder()
                .id(award.getId())
                .code(def.getCode())
                .name(def.getName())
                .iconKey(def.getIconKey())
                .color(def.getColor())
                .month(award.getMonth())
                .metadata(award.getMetadata())
                .build();
    }
}

