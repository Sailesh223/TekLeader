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
        // Criteria: final score >= 90
        if (currentMetric.getFinalScore().compareTo(BigDecimal.valueOf(90)) >= 0) {
            BadgeDefinition badge = badgeDefinitionRepository.findByCode("ONE_ON_ONE_CHAMPION")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("finalScore", currentMetric.getFinalScore().doubleValue());

            awardBadge(currentMetric.getManagerId(), badge, currentMetric.getMonth(), metadata);
        }
    }
    
    private void awardStreakStar(MonthlyMetric currentMetric) {
        // Criteria: N month streak with final score > 80
        int streakLength = calculateStreakByFinalScore(currentMetric.getManagerId(), currentMetric.getMonth());

        if (streakLength >= 2 && currentMetric.getFinalScore().compareTo(BigDecimal.valueOf(80)) > 0) {
            BadgeDefinition badge = badgeDefinitionRepository.findByCode("STREAK_STAR")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("streakLength", streakLength);
            metadata.put("currentStreak", true);
            metadata.put("currentFinalScore", currentMetric.getFinalScore().doubleValue());

            awardBadge(currentMetric.getManagerId(), badge, currentMetric.getMonth(), metadata);
        }
    }
    
    private void awardHeavyLifter(MonthlyMetric metric) {
        // Criteria: team size >= 5 AND final score >= 80
        if (metric.getHeadcount() >= 5 &&
            metric.getFinalScore().compareTo(BigDecimal.valueOf(80)) >= 0) {

            BadgeDefinition badge = badgeDefinitionRepository.findByCode("HEAVY_LIFTER")
                .orElseThrow();

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("headcount", metric.getHeadcount());
            metadata.put("finalScore", metric.getFinalScore().doubleValue());

            awardBadge(metric.getManagerId(), badge, metric.getMonth(), metadata);
        }
    }
    
    private void awardMostImproved(String month, List<MonthlyMetric> currentMetrics) {
        // Criteria: final score prev >= 30, current score >= 60, highest improvement
        String previousMonth = getPreviousMonth(month);

        MonthlyMetric mostImproved = currentMetrics.stream()
            .map(current -> {
                Optional<MonthlyMetric> prev = monthlyMetricRepository
                    .findByManagerIdAndMonth(current.getManagerId(), previousMonth);

                if (prev.isEmpty()) return null;

                // Filter: previous score >= 30 AND current score >= 60
                if (prev.get().getFinalScore().compareTo(BigDecimal.valueOf(30)) < 0 ||
                    current.getFinalScore().compareTo(BigDecimal.valueOf(60)) < 0) {
                    return null;
                }

                BigDecimal delta = current.getFinalScore().subtract(prev.get().getFinalScore());
                return new ImprovementRecord(current, prev.get(), delta);
            })
            .filter(Objects::nonNull)
            .filter(r -> r.delta.compareTo(BigDecimal.ZERO) > 0)
            .max(Comparator
                .comparing((ImprovementRecord r) -> r.delta)
                .thenComparing(r -> r.current.getFinalScore())
            )
            .map(r -> r.current)
            .orElse(null);

        if (mostImproved != null) {
            BadgeDefinition badge = badgeDefinitionRepository.findByCode("MOST_IMPROVED")
                .orElseThrow();

            Optional<MonthlyMetric> prev = monthlyMetricRepository
                .findByManagerIdAndMonth(mostImproved.getManagerId(), previousMonth);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("delta", mostImproved.getFinalScore()
                .subtract(prev.get().getFinalScore()).doubleValue());
            metadata.put("previousScore", prev.get().getFinalScore().doubleValue());
            metadata.put("currentScore", mostImproved.getFinalScore().doubleValue());
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

    private int calculateStreakByFinalScore(String managerId, String currentMonth) {
        int streak = 0;
        String month = currentMonth;

        while (true) {
            Optional<MonthlyMetric> metric = monthlyMetricRepository
                .findByManagerIdAndMonth(managerId, month);

            if (metric.isEmpty() ||
                metric.get().getFinalScore().compareTo(BigDecimal.valueOf(80)) <= 0) {
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

    @Transactional
    public BadgeAward awardManualBadge(String managerId, String badgeCode, String month, String awardedBy, String reason) {
        BadgeDefinition badge = badgeDefinitionRepository.findByCode(badgeCode)
            .orElseThrow(() -> new RuntimeException("Badge not found: " + badgeCode));

        Optional<BadgeAward> existing = badgeAwardRepository
            .findByManagerIdAndBadgeDefinitionIdAndMonth(managerId, badge.getId(), month);

        if (existing.isPresent()) {
            throw new RuntimeException("Badge already awarded to this manager for this month");
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("awardedBy", awardedBy);
        metadata.put("reason", reason);
        metadata.put("manual", true);

        BadgeAward award = BadgeAward.builder()
            .managerId(managerId)
            .badgeDefinitionId(badge.getId())
            .month(month)
            .metadata(metadata)
            .build();

        BadgeAward saved = badgeAwardRepository.save(award);
        log.info("Manual badge {} awarded to manager {} by {} for month {}", badgeCode, managerId, awardedBy, month);

        return saved;
    }

    public List<BadgeDefinition> getAllActiveBadges() {
        return badgeDefinitionRepository.findAll().stream()
            .filter(BadgeDefinition::getActive)
            .collect(Collectors.toList());
    }

    private record ImprovementRecord(MonthlyMetric current, MonthlyMetric previous, BigDecimal delta) {}
}

