package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.BadgeAward;
import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.repository.BadgeAwardRepository;
import com.tekion.tekleader.repository.BadgeDefinitionRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BadgeService {
    
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final BadgeAwardRepository badgeAwardRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    
    @Transactional
    public void awardBadgesForMonth(String month) {
        log.info("Awarding badges for month: {}", month);
        
        List<MonthlyMetric> metrics = monthlyMetricRepository.findByMonth(month);
        
        for (MonthlyMetric metric : metrics) {
            awardOneOnOneChampion(metric);
            awardStreakStar(metric);
            awardHeavyLifter(metric);
        }
        
        awardMostImproved(month, metrics);
        
        log.info("Badge awarding completed for month: {}", month);
    }
    
    private void awardOneOnOneChampion(MonthlyMetric currentMetric) {
        String previousMonth = getPreviousMonth(currentMetric.getMonth());
        Optional<MonthlyMetric> prevMetric = monthlyMetricRepository
            .findByManagerIdAndMonth(currentMetric.getManagerId(), previousMonth);

        if (prevMetric.isPresent() &&
            prevMetric.get().getUtilization().compareTo(BigDecimal.valueOf(100)) == 0) {

            BadgeDefinition badge = badgeDefinitionRepository.findByCode("ONE_ON_ONE_CHAMPION")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("previousMonthUtilization", 100.0);
            metadata.put("previousMonth", previousMonth);

            awardBadge(currentMetric.getManagerId(), badge, currentMetric.getMonth(), metadata);
        }
    }
    
    private void awardStreakStar(MonthlyMetric currentMetric) {
        int streakLength = calculateStreak(currentMetric.getManagerId(), currentMetric.getMonth());

        if (streakLength >= 2) {
            BadgeDefinition badge = badgeDefinitionRepository.findByCode("STREAK_STAR")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("streakLength", streakLength);
            metadata.put("currentStreak", true);

            awardBadge(currentMetric.getManagerId(), badge, currentMetric.getMonth(), metadata);
        }
    }
    
    private void awardHeavyLifter(MonthlyMetric metric) {
        if (metric.getHeadcount() >= 7 &&
            metric.getUtilization().compareTo(BigDecimal.valueOf(80)) > 0) {

            BadgeDefinition badge = badgeDefinitionRepository.findByCode("HEAVY_LIFTER")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("headcount", metric.getHeadcount());
            metadata.put("utilization", metric.getUtilization().doubleValue());

            awardBadge(metric.getManagerId(), badge, metric.getMonth(), metadata);
        }
    }
    
    private void awardMostImproved(String month, List<MonthlyMetric> currentMetrics) {
        String previousMonth = getPreviousMonth(month);

        MonthlyMetric mostImproved = currentMetrics.stream()
            .map(current -> {
                Optional<MonthlyMetric> prev = monthlyMetricRepository
                    .findByManagerIdAndMonth(current.getManagerId(), previousMonth);

                if (prev.isEmpty()) return null;

                BigDecimal delta = current.getUtilization().subtract(prev.get().getUtilization());
                return new ImprovementRecord(current, prev.get(), delta);
            })
            .filter(Objects::nonNull)
            .filter(r -> r.delta.compareTo(BigDecimal.ZERO) > 0)
            .max(Comparator
                .comparing((ImprovementRecord r) -> r.delta)
                .thenComparing(r -> r.current.getUtilization())
            )
            .map(r -> r.current)
            .orElse(null);

        if (mostImproved != null) {
            BadgeDefinition badge = badgeDefinitionRepository.findByCode("MOST_IMPROVED")
                .orElseThrow();

            Optional<MonthlyMetric> prev = monthlyMetricRepository
                .findByManagerIdAndMonth(mostImproved.getManagerId(), previousMonth);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("delta", mostImproved.getUtilization()
                .subtract(prev.get().getUtilization()).doubleValue());
            metadata.put("previousUtilization", prev.get().getUtilization().doubleValue());
            metadata.put("currentUtilization", mostImproved.getUtilization().doubleValue());
            metadata.put("previousMonth", previousMonth);

            awardBadge(mostImproved.getManagerId(), badge, month, metadata);
        }
    }
    
    private void awardBadge(String managerId, BadgeDefinition badge, String month, Map<String, Object> metadata) {
        Optional<BadgeAward> existing = badgeAwardRepository
            .findByManagerIdAndBadgeDefinitionIdAndMonth(managerId, badge.getId(), month);

        if (existing.isEmpty()) {
            BadgeAward award = BadgeAward.builder()
                .managerId(managerId)
                .badgeDefinitionId(badge.getId())
                .month(month)
                .metadata(metadata)
                .build();

            badgeAwardRepository.save(award);
            log.debug("Awarded badge {} to manager {} for month {}",
                badge.getCode(), managerId, month);
        }
    }
    
    private int calculateStreak(String managerId, String currentMonth) {
        int streak = 0;
        String month = currentMonth;

        while (true) {
            Optional<MonthlyMetric> metric = monthlyMetricRepository
                .findByManagerIdAndMonth(managerId, month);

            if (metric.isEmpty() ||
                metric.get().getUtilization().compareTo(BigDecimal.valueOf(80)) <= 0) {
                break;
            }

            streak++;
            month = getPreviousMonth(month);
        }

        return streak;
    }
    
    private String getPreviousMonth(String month) {
        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthNum = Integer.parseInt(parts[1]);
        
        monthNum--;
        if (monthNum == 0) {
            monthNum = 12;
            year--;
        }
        
        return String.format("%04d-%02d", year, monthNum);
    }
    
    private record ImprovementRecord(MonthlyMetric current, MonthlyMetric previous, BigDecimal delta) {}
}

