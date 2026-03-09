package com.tekion.tekleader.service;

import com.tekion.tekleader.dto.LeaderboardResponse;
import com.tekion.tekleader.entity.BadgeAward;
import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.repository.BadgeAwardRepository;
import com.tekion.tekleader.repository.BadgeDefinitionRepository;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final MonthlyMetricRepository monthlyMetricRepository;
    private final BadgeAwardRepository badgeAwardRepository;
    private final ManagerRepository managerRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    
    public LeaderboardResponse getLeaderboard(
        String month,
        String functionalHead,
        String band,
        String search,
        int page,
        int size
    ) {
        List<MonthlyMetric> allMetrics = monthlyMetricRepository.findFilteredMetrics(
            month,
            "all".equals(functionalHead) ? null : functionalHead,
            "all".equals(band) ? null : band
        );

        // Fetch all managers for search filtering
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            Set<String> managerIds = allMetrics.stream()
                .map(MonthlyMetric::getManagerId)
                .collect(Collectors.toSet());

            Map<String, Manager> managerMap = managerRepository.findAllById(managerIds)
                .stream()
                .collect(Collectors.toMap(Manager::getId, m -> m));

            allMetrics = allMetrics.stream()
                .filter(m -> {
                    Manager manager = managerMap.get(m.getManagerId());
                    return manager != null &&
                           manager.getDisplayName().toLowerCase().contains(searchLower);
                })
                .collect(Collectors.toList());
        }

        int totalFiltered = allMetrics.size();
        int totalPages = (int) Math.ceil((double) totalFiltered / size);

        int start = page * size;
        int end = Math.min(start + size, totalFiltered);
        List<MonthlyMetric> pageMetrics = allMetrics.subList(start, end);

        List<LeaderboardResponse.ManagerEntry> entries = pageMetrics.stream()
            .map(this::toManagerEntry)
            .collect(Collectors.toList());

        LeaderboardResponse.Statistics stats = calculateStatistics(allMetrics);

        return LeaderboardResponse.builder()
            .month(month)
            .totalManagers(monthlyMetricRepository.countByMonth(month).intValue())
            .filteredManagers(totalFiltered)
            .page(page)
            .size(size)
            .totalPages(totalPages)
            .managers(entries)
            .statistics(stats)
            .build();
    }
    
    private LeaderboardResponse.ManagerEntry toManagerEntry(MonthlyMetric metric) {
        // Fetch manager
        Manager manager = managerRepository.findById(metric.getManagerId())
            .orElse(null);

        if (manager == null) {
            return null; // Skip if manager not found
        }

        // Fetch badge awards
        List<BadgeAward> awards = badgeAwardRepository
            .findByManagerIdAndMonth(metric.getManagerId(), metric.getMonth());

        // Fetch badge definitions
        Set<String> badgeDefIds = awards.stream()
            .map(BadgeAward::getBadgeDefinitionId)
            .collect(Collectors.toSet());

        Map<String, BadgeDefinition> badgeDefMap = badgeDefinitionRepository.findAllById(badgeDefIds)
            .stream()
            .collect(Collectors.toMap(BadgeDefinition::getId, b -> b));

        List<LeaderboardResponse.BadgeInfo> badges = awards.stream()
            .limit(3)
            .map(award -> {
                BadgeDefinition badgeDef = badgeDefMap.get(award.getBadgeDefinitionId());
                if (badgeDef == null) return null;

                return LeaderboardResponse.BadgeInfo.builder()
                    .id(badgeDef.getId())
                    .code(badgeDef.getCode())
                    .name(badgeDef.getName())
                    .iconKey(badgeDef.getIconKey())
                    .color(badgeDef.getColor())
                    .build();
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        return LeaderboardResponse.ManagerEntry.builder()
            .rank(metric.getRank())
            .rankChange(metric.getRankChange())
            .manager(LeaderboardResponse.ManagerInfo.builder()
                .id(manager.getId())
                .displayName(manager.getDisplayName())
                .email(manager.getEmail())
                .avatarUrl(manager.getAvatarUrl())
                .build())
            .functionalHead(metric.getFunctionalHead())
            .headcount(metric.getHeadcount())
            .oneOnOnes(metric.getOneOnOnes())
            .notUtilising(metric.getNotUtilising())
            .utilization(metric.getUtilization())
            .teamSizeScore(metric.getTeamSizeScore())
            .consistencyScore(metric.getConsistencyScore())
            .finalScore(metric.getFinalScore())
            .classificationBand(metric.getClassificationBand())
            .badges(badges)
            .badgeCount(awards.size())
            .build();
    }
    
    private LeaderboardResponse.Statistics calculateStatistics(List<MonthlyMetric> metrics) {
        if (metrics.isEmpty()) {
            return LeaderboardResponse.Statistics.builder()
                .averageFinalScore(BigDecimal.ZERO)
                .averageUtilization(BigDecimal.ZERO)
                .bandDistribution(new HashMap<>())
                .build();
        }
        
        BigDecimal avgFinalScore = metrics.stream()
            .map(MonthlyMetric::getFinalScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(metrics.size()), 2, RoundingMode.HALF_UP);
        
        BigDecimal avgUtilization = metrics.stream()
            .map(MonthlyMetric::getUtilization)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(metrics.size()), 2, RoundingMode.HALF_UP);
        
        Map<String, Integer> bandDist = metrics.stream()
            .collect(Collectors.groupingBy(
                MonthlyMetric::getClassificationBand,
                Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
            ));
        
        return LeaderboardResponse.Statistics.builder()
            .averageFinalScore(avgFinalScore)
            .averageUtilization(avgUtilization)
            .bandDistribution(bandDist)
            .build();
    }
    
    public List<String> getAvailableMonths() {
        return monthlyMetricRepository.findDistinctMonths().stream()
            .map(MonthlyMetric::getMonth)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> deleteDataByMonth(String month) {
        log.info("Deleting all data for month: {}", month);

        long metricsCount = monthlyMetricRepository.countByMonth(month);
        long badgesCount = badgeAwardRepository.findByMonth(month).size();

        monthlyMetricRepository.deleteByMonth(month);
        badgeAwardRepository.deleteByMonth(month);

        log.info("Deleted {} metrics and {} badges for month: {}", metricsCount, badgesCount, month);

        return Map.of(
            "status", "SUCCESS",
            "month", month,
            "deletedMetrics", metricsCount,
            "deletedBadges", badgesCount
        );
    }

    @Transactional
    public Map<String, Object> deleteAllData() {
        log.info("Deleting all data from database");

        long metricsCount = monthlyMetricRepository.count();
        long badgesCount = badgeAwardRepository.count();

        monthlyMetricRepository.deleteAll();
        badgeAwardRepository.deleteAll();

        log.info("Deleted {} metrics and {} badges", metricsCount, badgesCount);

        return Map.of(
            "status", "SUCCESS",
            "deletedMetrics", metricsCount,
            "deletedBadges", badgesCount
        );
    }

    @Transactional
    public void recalculateRankings(String month) {
        log.info("Recalculating rankings for month: {}", month);

        List<MonthlyMetric> metrics = monthlyMetricRepository.findByMonth(month);

        // Fetch all managers for sorting
        Set<String> managerIds = metrics.stream()
            .map(MonthlyMetric::getManagerId)
            .collect(Collectors.toSet());

        Map<String, Manager> managerMap = managerRepository.findAllById(managerIds)
            .stream()
            .collect(Collectors.toMap(Manager::getId, m -> m));

        // Sort by: 1. Final Score (DESC), 2. Utilization (DESC), 3. Not Utilising (ASC), 4. Name (ASC)
        metrics.sort(Comparator
            .comparing((MonthlyMetric m) -> m.getFinalScore(), Comparator.reverseOrder())
            .thenComparing((MonthlyMetric m) -> m.getUtilization(), Comparator.reverseOrder())
            .thenComparing((MonthlyMetric m) -> m.getNotUtilising())
            .thenComparing(m -> {
                Manager manager = managerMap.get(m.getManagerId());
                return manager != null ? manager.getCanonicalName() : "";
            })
        );

        // Assign ranks (rank 1 = highest score)
        for (int i = 0; i < metrics.size(); i++) {
            MonthlyMetric metric = metrics.get(i);
            metric.setRank(i + 1);
            if (i < 5) {
                log.debug("Rank {}: Score={}, Manager ID={}", i + 1, metric.getFinalScore(), metric.getManagerId());
            }
        }

        monthlyMetricRepository.saveAll(metrics);
        log.info("Successfully recalculated rankings for {} managers in month: {}. Top score: {}, Bottom score: {}",
            metrics.size(), month,
            metrics.isEmpty() ? "N/A" : metrics.get(0).getFinalScore(),
            metrics.isEmpty() ? "N/A" : metrics.get(metrics.size() - 1).getFinalScore());
    }
}

