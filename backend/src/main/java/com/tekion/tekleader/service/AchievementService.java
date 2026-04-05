package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.Achievement;
import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.event.AchievementUnlockedEvent;
import com.tekion.tekleader.repository.AchievementRepository;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    private final ManagerRepository managerRepository;
    private final FeedService feedService;
    private final NotificationService notificationService;
    private final KafkaTemplate<String, AchievementUnlockedEvent> kafkaTemplate;

    @Value("${tekleader.kafka.topics.achievement-unlocked}")
    private String achievementTopic;

    private static final BigDecimal GOLD_STREAK_THRESHOLD = BigDecimal.valueOf(90);
    private static final int GOLD_STREAK_MONTHS = 3;
    private static final BigDecimal SEASONAL_EXCELLENCE_THRESHOLD = BigDecimal.valueOf(95);

    public void checkAndAwardAchievements(String managerId, String currentMonth) {
        log.info("Checking achievements for manager {} in month {}", managerId, currentMonth);

        checkGoldStreakAchievement(managerId, currentMonth);
        checkSeasonalExcellenceAchievement(managerId, currentMonth);
    }

    private void checkGoldStreakAchievement(String managerId, String currentMonth) {
        Optional<Achievement> existing = achievementRepository.findByManagerIdAndAchievementType(managerId, "GOLD_STREAK");
        
        List<MonthlyMetric> recentMetrics = getRecentMetrics(managerId, currentMonth, GOLD_STREAK_MONTHS);
        
        if (recentMetrics.size() < GOLD_STREAK_MONTHS) {
            return;
        }

        boolean allGold = recentMetrics.stream()
            .allMatch(m -> "Gold".equalsIgnoreCase(m.getClassificationBand()));

        if (allGold && existing.isEmpty()) {
            unlockGoldStreakAchievement(managerId, recentMetrics);
        }
    }

    private void checkSeasonalExcellenceAchievement(String managerId, String currentMonth) {
        List<MonthlyMetric> seasonalMetrics = getSeasonalMetrics(managerId, currentMonth);
        
        if (seasonalMetrics.isEmpty()) {
            return;
        }

        BigDecimal averageScore = seasonalMetrics.stream()
            .map(MonthlyMetric::getFinalScore)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(seasonalMetrics.size()), 2, BigDecimal.ROUND_HALF_UP);

        if (averageScore.compareTo(SEASONAL_EXCELLENCE_THRESHOLD) >= 0) {
            Optional<Achievement> existing = achievementRepository.findByManagerIdAndAchievementType(managerId, "SEASONAL_EXCELLENCE");
            
            if (existing.isEmpty()) {
                unlockSeasonalExcellenceAchievement(managerId, seasonalMetrics, averageScore);
            }
        }
    }

    private void unlockGoldStreakAchievement(String managerId, List<MonthlyMetric> recentMetrics) {
        Manager manager = managerRepository.findById(managerId).orElse(null);
        if (manager == null) {
            return;
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("streakMonths", GOLD_STREAK_MONTHS);
        metadata.put("months", recentMetrics.stream()
            .map(MonthlyMetric::getMonth)
            .toArray(String[]::new));

        Achievement achievement = Achievement.builder()
            .managerId(managerId)
            .achievementType("GOLD_STREAK")
            .title("Gold Streak Champion")
            .description(String.format("Maintained Gold tier for %d consecutive months!", GOLD_STREAK_MONTHS))
            .iconKey("trophy-star")
            .color("#FFD700")
            .metadata(metadata)
            .unlockedAt(LocalDateTime.now())
            .build();

        Achievement saved = achievementRepository.save(achievement);
        log.info("Unlocked GOLD_STREAK achievement for manager {}", managerId);

        AchievementUnlockedEvent event = AchievementUnlockedEvent.builder()
            .achievementId(saved.getId())
            .managerId(managerId)
            .managerName(manager.getDisplayName())
            .achievementType("GOLD_STREAK")
            .title(achievement.getTitle())
            .description(achievement.getDescription())
            .metadata(metadata)
            .unlockedAt(saved.getUnlockedAt())
            .build();

        kafkaTemplate.send(achievementTopic, event);
        notificationService.createAchievementNotifications(event);
        feedService.createAchievementPost(managerId, "GOLD_STREAK", achievement.getTitle(), achievement.getDescription(), metadata);
    }

    private void unlockSeasonalExcellenceAchievement(String managerId, List<MonthlyMetric> seasonalMetrics, BigDecimal averageScore) {
        Manager manager = managerRepository.findById(managerId).orElse(null);
        if (manager == null) {
            return;
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("averageScore", averageScore.doubleValue());
        metadata.put("monthCount", seasonalMetrics.size());
        metadata.put("threshold", SEASONAL_EXCELLENCE_THRESHOLD.doubleValue());

        Achievement achievement = Achievement.builder()
            .managerId(managerId)
            .achievementType("SEASONAL_EXCELLENCE")
            .title("Seasonal Excellence")
            .description(String.format("Achieved exceptional average score of %.2f for the season!", averageScore))
            .iconKey("medal")
            .color("#7C4DFF")
            .metadata(metadata)
            .unlockedAt(LocalDateTime.now())
            .build();

        Achievement saved = achievementRepository.save(achievement);
        log.info("Unlocked SEASONAL_EXCELLENCE achievement for manager {}", managerId);

        AchievementUnlockedEvent event = AchievementUnlockedEvent.builder()
            .achievementId(saved.getId())
            .managerId(managerId)
            .managerName(manager.getDisplayName())
            .achievementType("SEASONAL_EXCELLENCE")
            .title(achievement.getTitle())
            .description(achievement.getDescription())
            .metadata(metadata)
            .unlockedAt(saved.getUnlockedAt())
            .build();

        kafkaTemplate.send(achievementTopic, event);
        notificationService.createAchievementNotifications(event);
        feedService.createAchievementPost(managerId, "SEASONAL_EXCELLENCE", achievement.getTitle(), achievement.getDescription(), metadata);
    }

    private List<MonthlyMetric> getRecentMetrics(String managerId, String currentMonth, int count) {
        List<MonthlyMetric> metrics = new ArrayList<>();
        String month = currentMonth;
        
        for (int i = 0; i < count; i++) {
            Optional<MonthlyMetric> metric = monthlyMetricRepository.findByManagerIdAndMonth(managerId, month);
            if (metric.isPresent()) {
                metrics.add(metric.get());
                month = getPreviousMonth(month);
            } else {
                break;
            }
        }
        
        return metrics;
    }

    private List<MonthlyMetric> getSeasonalMetrics(String managerId, String currentMonth) {
        String season = getSeason(currentMonth);
        List<MonthlyMetric> allMetrics = monthlyMetricRepository.findByManagerIdOrderByMonthDesc(managerId);
        
        return allMetrics.stream()
            .filter(m -> getSeason(m.getMonth()).equals(season))
            .toList();
    }

    private String getSeason(String month) {
        int monthNum = Integer.parseInt(month.substring(5, 7));
        if (monthNum >= 1 && monthNum <= 3) return "Q1";
        if (monthNum >= 4 && monthNum <= 6) return "Q2";
        if (monthNum >= 7 && monthNum <= 9) return "Q3";
        return "Q4";
    }

    private String getPreviousMonth(String month) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        return java.time.YearMonth.parse(month, formatter).minusMonths(1).format(formatter);
    }

    public List<Achievement> getManagerAchievements(String managerId) {
        return achievementRepository.findByManagerIdOrderByUnlockedAtDesc(managerId);
    }
}

