package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.FormulaConfig;
import com.tekion.tekleader.entity.MonthlyMetric;
import com.tekion.tekleader.repository.FormulaConfigRepository;
import com.tekion.tekleader.repository.MonthlyMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScoringService {
    
    private final FormulaConfigRepository formulaConfigRepository;
    private final MonthlyMetricRepository monthlyMetricRepository;
    
    public BigDecimal calculateTeamSizeScore(int headcount, Map<String, Integer> teamSizeMapping) {
        if (headcount >= 1 && headcount <= 3) {
            return BigDecimal.valueOf(teamSizeMapping.getOrDefault("1-3", 25));
        } else if (headcount >= 4 && headcount <= 6) {
            return BigDecimal.valueOf(teamSizeMapping.getOrDefault("4-6", 50));
        } else if (headcount >= 7 && headcount <= 10) {
            return BigDecimal.valueOf(teamSizeMapping.getOrDefault("7-10", 75));
        } else if (headcount > 10) {
            return BigDecimal.valueOf(teamSizeMapping.getOrDefault("10+", 100));
        }
        return BigDecimal.ZERO;
    }
    
    public BigDecimal calculateConsistencyScore(
        BigDecimal currentUtilization,
        BigDecimal previousUtilization,
        BigDecimal penaltyMultiplier
    ) {
        if (previousUtilization == null) {
            return BigDecimal.valueOf(50.0);
        }

        BigDecimal delta = currentUtilization.subtract(previousUtilization).abs();
        BigDecimal penalty = penaltyMultiplier.multiply(delta);
        BigDecimal rawScore = BigDecimal.valueOf(100.0).subtract(penalty);

        return rawScore.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100.0))
            .setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateMultiMonthConsistencyScore(
        String managerId,
        String currentMonth,
        BigDecimal currentUtilization,
        BigDecimal penaltyMultiplier,
        Integer monthsToConsider
    ) {
        if (monthsToConsider == null || monthsToConsider < 2) {
            monthsToConsider = 2;
        }

        List<BigDecimal> utilizationHistory = new ArrayList<>();
        utilizationHistory.add(currentUtilization);

        String month = currentMonth;
        for (int i = 1; i < monthsToConsider; i++) {
            month = getPreviousMonth(month);
            Optional<MonthlyMetric> metric = monthlyMetricRepository
                .findByManagerIdAndMonth(managerId, month);

            if (metric.isPresent()) {
                utilizationHistory.add(metric.get().getUtilization());
            } else {
                break;
            }
        }

        if (utilizationHistory.size() < 2) {
            return BigDecimal.valueOf(50.0);
        }

        BigDecimal totalPenalty = BigDecimal.ZERO;
        int comparisons = 0;

        for (int i = 0; i < utilizationHistory.size() - 1; i++) {
            BigDecimal delta = utilizationHistory.get(i).subtract(utilizationHistory.get(i + 1)).abs();
            totalPenalty = totalPenalty.add(delta);
            comparisons++;
        }

        BigDecimal avgDelta = totalPenalty.divide(BigDecimal.valueOf(comparisons), 2, RoundingMode.HALF_UP);
        BigDecimal penalty = penaltyMultiplier.multiply(avgDelta);
        BigDecimal rawScore = BigDecimal.valueOf(100.0).subtract(penalty);

        return rawScore.max(BigDecimal.ZERO).min(BigDecimal.valueOf(100.0))
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    public BigDecimal calculateFinalScore(
        BigDecimal utilization,
        BigDecimal teamSizeScore,
        BigDecimal consistencyScore,
        FormulaConfig formula
    ) {
        BigDecimal utilizationComponent = utilization.multiply(formula.getUtilizationWeight());
        BigDecimal teamSizeComponent = teamSizeScore.multiply(formula.getTeamSizeWeight());
        BigDecimal consistencyComponent = consistencyScore.multiply(formula.getConsistencyWeight());
        
        return utilizationComponent
            .add(teamSizeComponent)
            .add(consistencyComponent)
            .setScale(2, RoundingMode.HALF_UP);
    }
    
    public String classifyManager(BigDecimal finalScore, Map<String, Object> thresholds) {
        double score = finalScore.doubleValue();
        
        if (score >= 90) return "Gold";
        if (score >= 60) return "Silver";
        if (score >= 30) return "Bronze";
        return "Ignition Zone";
    }
    
    public FormulaConfig getActiveFormula() {
        return formulaConfigRepository.findByActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active formula configuration found"));
    }
    
    public BigDecimal getPreviousMonthUtilization(String managerId, String currentMonth) {
        String previousMonth = getPreviousMonth(currentMonth);
        Optional<MonthlyMetric> prevMetric = monthlyMetricRepository
            .findByManagerIdAndMonth(managerId, previousMonth);

        return prevMetric.map(MonthlyMetric::getUtilization).orElse(null);
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
}

