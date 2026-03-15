package com.tekion.tekleader.service;

import com.tekion.tekleader.dto.LeaderboardResponse;
import com.tekion.tekleader.entity.BadgeAward;
import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.entity.FormulaConfig;
import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.repository.BadgeAwardRepository;
import com.tekion.tekleader.repository.BadgeDefinitionRepository;
import com.tekion.tekleader.repository.FormulaConfigRepository;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
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
    private final FormulaConfigRepository formulaConfigRepository;
    private final XPService xpService;
    private final ScoringService scoringService;
    
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

        // ALWAYS sort by rank to ensure correct order
        allMetrics.sort(Comparator.comparingInt(MonthlyMetric::getRank));

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

        // Recalculate XP and streaks for all managers after deletion
        recalculateAllManagerXPAndStreaks();

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

        // Reset all manager XP and streaks to zero after deleting all data
        List<Manager> allManagers = managerRepository.findAll();
        for (Manager manager : allManagers) {
            manager.setOverallXP(BigDecimal.ZERO);
            manager.setSeasonalXP(BigDecimal.ZERO);
            manager.setCurrentStreak(0);
            manager.setLongestStreak(0);
        }
        managerRepository.saveAll(allManagers);

        log.info("Deleted {} metrics and {} badges, reset XP and streaks for {} managers",
                 metricsCount, badgesCount, allManagers.size());

        return Map.of(
            "status", "SUCCESS",
            "deletedMetrics", metricsCount,
            "deletedBadges", badgesCount,
            "resetManagers", allManagers.size()
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

    public List<Map<String, Object>> getSeasonalLeaderboard(String season) {
        FormulaConfig formula = formulaConfigRepository.findByActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active formula found"));

        // If no season specified, use the latest available season
        if (season == null || season.isEmpty()) {
            Map<String, Object> seasons = getAvailableSeasons();
            season = (String) seasons.get("latestSeason");
        }

        List<String> seasonMonths = getSeasonMonthsFromSeasonKey(season, formula);
        Map<String, SeasonalStats> managerStats = new HashMap<>();

        List<MonthlyMetric> seasonMetrics = monthlyMetricRepository.findByMonthIn(seasonMonths);

        for (MonthlyMetric metric : seasonMetrics) {
            managerStats.computeIfAbsent(metric.getManagerId(), k -> new SeasonalStats())
                .addMetric(metric);
        }

        return managerStats.entrySet().stream()
            .map(entry -> {
                Manager manager = managerRepository.findById(entry.getKey()).orElse(null);
                if (manager == null) return null;

                SeasonalStats stats = entry.getValue();

                // Calculate seasonal XP for this specific season
                BigDecimal seasonalXP = seasonMetrics.stream()
                    .filter(m -> m.getManagerId().equals(entry.getKey()))
                    .map(m -> xpService.calculateMonthlyXP(m.getFinalScore(), m.getClassificationBand()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                Map<String, Object> leaderboardEntry = new HashMap<>();
                leaderboardEntry.put("managerId", entry.getKey());
                leaderboardEntry.put("displayName", manager.getDisplayName());
                leaderboardEntry.put("email", manager.getEmail());
                leaderboardEntry.put("avatarUrl", manager.getAvatarUrl());
                leaderboardEntry.put("averageScore", stats.getAverageScore());
                leaderboardEntry.put("seasonalXP", seasonalXP);
                leaderboardEntry.put("monthsActive", stats.getMonthCount());
                leaderboardEntry.put("bestBand", stats.getBestBand());

                return leaderboardEntry;
            })
            .filter(Objects::nonNull)
            .sorted((a, b) -> ((BigDecimal) b.get("seasonalXP")).compareTo((BigDecimal) a.get("seasonalXP")))
            .collect(Collectors.toList());
    }

    public Map<String, Object> getAvailableSeasons() {
        FormulaConfig formula = formulaConfigRepository.findByActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active formula found"));

        List<String> allMonths = getAvailableMonths();
        if (allMonths.isEmpty()) {
            return Map.of("seasons", List.of(), "latestSeason", "");
        }

        int monthsInSeason = getSeasonalMonthCount(formula);
        Set<String> seasons = new LinkedHashSet<>();

        for (String month : allMonths) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
                LocalDate date = LocalDate.parse(month + "-01");

                int startMonth = getSeasonStartMonth(date, monthsInSeason);
                LocalDate seasonStart = LocalDate.of(date.getYear(), startMonth, 1);
                if (date.getMonthValue() < startMonth) {
                    seasonStart = seasonStart.minusYears(1);
                }

                // Create season key: "2026-Q1" or "2025-Q4"
                String seasonKey = formatSeasonKey(seasonStart, monthsInSeason, formula);
                seasons.add(seasonKey);
            } catch (Exception e) {
                log.error("Error parsing month: {}", month, e);
            }
        }

        List<String> seasonList = new ArrayList<>(seasons);
        Collections.sort(seasonList, Collections.reverseOrder());

        return Map.of(
            "seasons", seasonList,
            "latestSeason", seasonList.isEmpty() ? "" : seasonList.get(0)
        );
    }

    private String formatSeasonKey(LocalDate seasonStart, int monthsInSeason, FormulaConfig formula) {
        String periodType = formula.getSeasonalPeriodType();
        if (periodType == null) periodType = "QUARTERLY";

        int year = seasonStart.getYear();
        int month = seasonStart.getMonthValue();

        return switch (periodType) {
            case "QUARTERLY" -> {
                int quarter = ((month - 1) / 3) + 1;
                yield year + "-Q" + quarter;
            }
            case "SEMI_ANNUALLY" -> {
                int half = ((month - 1) / 6) + 1;
                yield year + "-H" + half;
            }
            case "ANNUALLY" -> year + "-Y1";
            case "MONTHLY" -> seasonStart.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            case "CUSTOM" -> {
                int period = ((month - 1) / monthsInSeason) + 1;
                yield year + "-S" + period;
            }
            default -> year + "-Q" + (((month - 1) / 3) + 1);
        };
    }

    private List<String> getSeasonMonthsFromSeasonKey(String seasonKey, FormulaConfig formula) {
        List<String> months = new ArrayList<>();

        try {
            // Parse season key like "2026-Q1", "2025-Q4", etc.
            String[] parts = seasonKey.split("-");
            int year = Integer.parseInt(parts[0]);
            String periodPart = parts[1];

            int monthsInSeason = getSeasonalMonthCount(formula);
            int startMonth;

            if (periodPart.startsWith("Q")) {
                int quarter = Integer.parseInt(periodPart.substring(1));
                startMonth = (quarter - 1) * 3 + 1;
            } else if (periodPart.startsWith("H")) {
                int half = Integer.parseInt(periodPart.substring(1));
                startMonth = (half - 1) * 6 + 1;
            } else if (periodPart.startsWith("Y")) {
                startMonth = 1;
            } else if (periodPart.startsWith("S")) {
                int period = Integer.parseInt(periodPart.substring(1));
                startMonth = (period - 1) * monthsInSeason + 1;
            } else {
                // Monthly format "yyyy-MM"
                return List.of(seasonKey);
            }

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            LocalDate seasonStart = LocalDate.of(year, startMonth, 1);

            for (int i = 0; i < monthsInSeason; i++) {
                LocalDate monthDate = seasonStart.plusMonths(i);
                months.add(monthDate.format(formatter));
            }
        } catch (Exception e) {
            log.error("Error parsing season key: {}", seasonKey, e);
        }

        return months;
    }

    public List<Map<String, Object>> getOverallLeaderboard() {
        List<Manager> managers = managerRepository.findAll();

        return managers.stream()
            .map(manager -> {
                List<MonthlyMetric> allMetrics = monthlyMetricRepository.findByManagerId(manager.getId());
                if (allMetrics.isEmpty()) return null;

                Map<String, Object> entry = new HashMap<>();
                entry.put("managerId", manager.getId());
                entry.put("displayName", manager.getDisplayName());
                entry.put("email", manager.getEmail());
                entry.put("avatarUrl", manager.getAvatarUrl());
                entry.put("overallXP", manager.getOverallXP());
                entry.put("currentStreak", manager.getCurrentStreak());
                entry.put("longestStreak", manager.getLongestStreak());

                BigDecimal avgScore = allMetrics.stream()
                    .map(MonthlyMetric::getFinalScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(allMetrics.size()), 2, RoundingMode.HALF_UP);

                entry.put("averageScore", avgScore);
                entry.put("totalMonths", allMetrics.size());

                Map<String, Long> bandCounts = allMetrics.stream()
                    .collect(Collectors.groupingBy(MonthlyMetric::getClassificationBand, Collectors.counting()));
                entry.put("goldCount", bandCounts.getOrDefault("Gold", 0L));
                entry.put("silverCount", bandCounts.getOrDefault("Silver", 0L));
                entry.put("bronzeCount", bandCounts.getOrDefault("Bronze", 0L));

                return entry;
            })
            .filter(Objects::nonNull)
            .sorted((a, b) -> ((BigDecimal) b.get("overallXP")).compareTo((BigDecimal) a.get("overallXP")))
            .collect(Collectors.toList());
    }

    private List<String> getSeasonMonths(String currentMonth, FormulaConfig formula) {
        List<String> months = new ArrayList<>();

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            LocalDate current = LocalDate.parse(currentMonth + "-01");

            int monthsToInclude = getSeasonalMonthCount(formula);
            int startMonth = getSeasonStartMonth(current, monthsToInclude);

            LocalDate seasonStart = LocalDate.of(current.getYear(), startMonth, 1);
            if (current.getMonthValue() < startMonth) {
                seasonStart = seasonStart.minusYears(1);
            }

            for (int i = 0; i < monthsToInclude; i++) {
                LocalDate monthDate = seasonStart.plusMonths(i);
                if (!monthDate.isAfter(current)) {
                    months.add(monthDate.format(formatter));
                }
            }
        } catch (Exception e) {
            log.error("Error calculating season months", e);
            months.add(currentMonth);
        }

        return months;
    }

    private int getSeasonalMonthCount(FormulaConfig formula) {
        String periodType = formula.getSeasonalPeriodType();
        if (periodType == null) periodType = "QUARTERLY";

        return switch (periodType) {
            case "MONTHLY" -> 1;
            case "QUARTERLY" -> 3;
            case "SEMI_ANNUALLY" -> 6;
            case "ANNUALLY" -> 12;
            case "CUSTOM" -> formula.getSeasonalCustomMonths() != null ? formula.getSeasonalCustomMonths() : 3;
            default -> 3;
        };
    }

    private int getSeasonStartMonth(LocalDate current, int monthsInSeason) {
        int currentMonth = current.getMonthValue();
        return ((currentMonth - 1) / monthsInSeason) * monthsInSeason + 1;
    }

    private static class SeasonalStats {
        private BigDecimal totalScore = BigDecimal.ZERO;
        private int monthCount = 0;
        private final Map<String, Integer> bandCounts = new HashMap<>();

        void addMetric(MonthlyMetric metric) {
            totalScore = totalScore.add(metric.getFinalScore());
            monthCount++;
            bandCounts.merge(metric.getClassificationBand(), 1, Integer::sum);
        }

        BigDecimal getAverageScore() {
            if (monthCount == 0) return BigDecimal.ZERO;
            return totalScore.divide(BigDecimal.valueOf(monthCount), 2, RoundingMode.HALF_UP);
        }

        int getMonthCount() {
            return monthCount;
        }

        String getBestBand() {
            return bandCounts.entrySet().stream()
                .max(Comparator.comparingInt(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("Bronze");
        }
    }

    private void recalculateAllManagerXPAndStreaks() {
        log.info("Recalculating XP and streaks for all managers");

        try {
            List<Manager> allManagers = managerRepository.findAll();
            FormulaConfig formula = scoringService.getActiveFormula();

            for (Manager manager : allManagers) {
                // Recalculate overall XP
                BigDecimal overallXP = BigDecimal.ZERO;
                List<MonthlyMetric> allMetrics = monthlyMetricRepository.findByManagerId(manager.getId());

                for (MonthlyMetric metric : allMetrics) {
                    BigDecimal monthlyXP = xpService.calculateMonthlyXP(metric.getFinalScore(), metric.getClassificationBand());
                    overallXP = overallXP.add(monthlyXP);
                }

                manager.setOverallXP(overallXP);

                // Recalculate seasonal XP
                List<String> seasonMonths = getSeasonMonthsForLatest(formula);
                BigDecimal seasonalXP = BigDecimal.ZERO;

                for (String month : seasonMonths) {
                    Optional<MonthlyMetric> metricOpt = monthlyMetricRepository.findByManagerIdAndMonth(manager.getId(), month);
                    if (metricOpt.isPresent()) {
                        MonthlyMetric metric = metricOpt.get();
                        BigDecimal monthlyXP = xpService.calculateMonthlyXP(metric.getFinalScore(), metric.getClassificationBand());
                        seasonalXP = seasonalXP.add(monthlyXP);
                    }
                }

                manager.setSeasonalXP(seasonalXP);

                // Recalculate streaks
                List<String> sortedMonths = allMetrics.stream()
                    .map(MonthlyMetric::getMonth)
                    .sorted()
                    .collect(Collectors.toList());

                int currentStreak = 0;
                int longestStreak = 0;
                int tempStreak = 0;

                for (int i = 0; i < sortedMonths.size(); i++) {
                    tempStreak++;
                    if (tempStreak > longestStreak) {
                        longestStreak = tempStreak;
                    }

                    // Check if this is the latest month (current streak)
                    if (i == sortedMonths.size() - 1) {
                        currentStreak = tempStreak;
                    }

                    // Check if next month is consecutive
                    if (i < sortedMonths.size() - 1) {
                        if (!isConsecutiveMonth(sortedMonths.get(i), sortedMonths.get(i + 1))) {
                            tempStreak = 0;
                        }
                    }
                }

                manager.setCurrentStreak(currentStreak);
                manager.setLongestStreak(longestStreak);

                managerRepository.save(manager);
                log.info("Updated manager {}: overallXP={}, seasonalXP={}, currentStreak={}, longestStreak={}",
                    manager.getDisplayName(), overallXP, seasonalXP, currentStreak, longestStreak);
            }

            log.info("Completed XP and streak recalculation for {} managers", allManagers.size());
        } catch (Exception e) {
            log.error("Error recalculating XP and streaks", e);
        }
    }

    private List<String> getSeasonMonthsForLatest(FormulaConfig formula) {
        List<String> allMonths = monthlyMetricRepository.findDistinctMonths().stream()
            .map(MonthlyMetric::getMonth)
            .distinct()
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());

        if (allMonths.isEmpty()) {
            return Collections.emptyList();
        }

        String latestMonth = allMonths.get(0);
        return getSeasonMonths(latestMonth, formula);
    }



    private boolean isConsecutiveMonth(String month1, String month2) {
        try {
            LocalDate date1 = LocalDate.parse(month1 + "-01");
            LocalDate date2 = LocalDate.parse(month2 + "-01");
            return date1.plusMonths(1).equals(date2);
        } catch (Exception e) {
            return false;
        }
    }
}

