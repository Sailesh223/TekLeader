package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.repository.ManagerRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class XPService {
    
    private final ManagerRepository managerRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    
    public BigDecimal calculateMonthlyXP(BigDecimal finalScore, String classificationBand) {
        BigDecimal baseXP = finalScore;
        
        BigDecimal tierBonus = switch (classificationBand) {
            case "Gold" -> BigDecimal.valueOf(50);
            case "Silver" -> BigDecimal.valueOf(30);
            case "Bronze" -> BigDecimal.valueOf(10);
            default -> BigDecimal.ZERO;
        };
        
        return baseXP.add(tierBonus).setScale(2, RoundingMode.HALF_UP);
    }
    
    public void updateManagerXP(String managerId, String month, BigDecimal monthlyXP) {
        Optional<Manager> managerOpt = managerRepository.findById(managerId);
        if (managerOpt.isEmpty()) {
            log.warn("Manager not found: {}", managerId);
            return;
        }
        
        Manager manager = managerOpt.get();
        
        BigDecimal currentOverallXP = manager.getOverallXP() != null ? manager.getOverallXP() : BigDecimal.ZERO;
        manager.setOverallXP(currentOverallXP.add(monthlyXP));
        
        managerRepository.save(manager);
        log.info("Updated XP for manager {}: +{} monthly XP, total overall XP: {}", 
            managerId, monthlyXP, manager.getOverallXP());
    }
    
    public void recalculateSeasonalXP(String managerId, List<String> seasonMonths) {
        BigDecimal seasonalXP = BigDecimal.ZERO;
        
        for (String month : seasonMonths) {
            Optional<MonthlyMetric> metricOpt = monthlyMetricRepository.findByManagerIdAndMonth(managerId, month);
            if (metricOpt.isPresent()) {
                MonthlyMetric metric = metricOpt.get();
                BigDecimal monthlyXP = calculateMonthlyXP(metric.getFinalScore(), metric.getClassificationBand());
                seasonalXP = seasonalXP.add(monthlyXP);
            }
        }
        
        Optional<Manager> managerOpt = managerRepository.findById(managerId);
        if (managerOpt.isPresent()) {
            Manager manager = managerOpt.get();
            manager.setSeasonalXP(seasonalXP);
            managerRepository.save(manager);
            log.info("Recalculated seasonal XP for manager {}: {}", managerId, seasonalXP);
        }
    }
    
    public void updateStreak(String managerId, String currentMonth, BigDecimal finalScore) {
        Optional<Manager> managerOpt = managerRepository.findById(managerId);
        if (managerOpt.isEmpty()) {
            return;
        }

        Manager manager = managerOpt.get();

        if (finalScore.compareTo(BigDecimal.valueOf(80)) > 0) {
            Integer currentStreak = manager.getCurrentStreak() != null ? manager.getCurrentStreak() : 0;
            currentStreak++;
            manager.setCurrentStreak(currentStreak);

            Integer longestStreak = manager.getLongestStreak() != null ? manager.getLongestStreak() : 0;
            if (currentStreak > longestStreak) {
                manager.setLongestStreak(currentStreak);
            }
        } else {
            manager.setCurrentStreak(0);
        }

        managerRepository.save(manager);
        log.info("Updated streak for manager {}: current={}, longest={}",
            managerId, manager.getCurrentStreak(), manager.getLongestStreak());
    }

    /**
     * Calculate level from XP using exponential progression
     * Level 1: 0-200 XP
     * Level 2: 200-400 XP (total 600)
     * Level 3: 400-800 XP (total 1400)
     * Level 4: 800-1600 XP (total 3000)
     * Formula: Each level requires 2^(level-1) * 200 XP
     */
    public int calculateLevel(BigDecimal xp) {
        if (xp == null || xp.compareTo(BigDecimal.ZERO) <= 0) {
            return 1;
        }

        int level = 1;
        double totalXP = xp.doubleValue();
        double xpRequired = 200.0;
        double accumulatedXP = 0.0;

        while (accumulatedXP + xpRequired <= totalXP) {
            accumulatedXP += xpRequired;
            level++;
            xpRequired *= 2; // Double the XP required for next level
        }

        return level;
    }

    /**
     * Calculate XP required for a specific level
     */
    public double getXPRequiredForLevel(int level) {
        if (level <= 1) {
            return 0;
        }
        return Math.pow(2, level - 2) * 200;
    }

    /**
     * Calculate total XP accumulated up to the start of a level
     */
    public double getTotalXPForLevel(int level) {
        if (level <= 1) {
            return 0;
        }
        double total = 0;
        for (int i = 1; i < level; i++) {
            total += Math.pow(2, i - 1) * 200;
        }
        return total;
    }
}

