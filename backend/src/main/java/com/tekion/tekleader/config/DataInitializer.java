package com.tekion.tekleader.config;

import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.entity.FormulaConfig;
import com.tekion.tekleader.repository.BadgeDefinitionRepository;
import com.tekion.tekleader.repository.FormulaConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final FormulaConfigRepository formulaConfigRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;

    @Override
    public void run(String... args) {
        log.info("Initializing database with default data...");
        
        initializeFormulaConfig();
        initializeBadgeDefinitions();
        
        log.info("Database initialization completed");
    }

    private void initializeFormulaConfig() {
        if (formulaConfigRepository.findByActiveTrue().isPresent()) {
            log.info("Active formula configuration already exists, skipping initialization");
            return;
        }

        log.info("Creating default formula configuration...");

        Map<String, Integer> teamSizeMapping = new HashMap<>();
        teamSizeMapping.put("1-3", 25);
        teamSizeMapping.put("4-6", 50);
        teamSizeMapping.put("7-10", 75);
        teamSizeMapping.put("10+", 100);

        Map<String, Object> classificationThresholds = new HashMap<>();
        Map<String, Integer> gold = new HashMap<>();
        gold.put("min", 90);
        gold.put("max", 100);
        classificationThresholds.put("Gold", gold);

        Map<String, Integer> silver = new HashMap<>();
        silver.put("min", 60);
        silver.put("max", 89);
        classificationThresholds.put("Silver", silver);

        Map<String, Integer> bronze = new HashMap<>();
        bronze.put("min", 30);
        bronze.put("max", 59);
        classificationThresholds.put("Bronze", bronze);

        Map<String, Integer> ignitionZone = new HashMap<>();
        ignitionZone.put("min", 0);
        ignitionZone.put("max", 29);
        classificationThresholds.put("Ignition Zone", ignitionZone);

        FormulaConfig formulaConfig = FormulaConfig.builder()
                .version(1)
                .utilizationWeight(new BigDecimal("0.70"))
                .teamSizeWeight(new BigDecimal("0.20"))
                .consistencyWeight(new BigDecimal("0.10"))
                .teamSizeMapping(teamSizeMapping)
                .classificationThresholds(classificationThresholds)
                .consistencyPenaltyMultiplier(new BigDecimal("2.0"))
                .consistencyMonthsToConsider(3)
                .tierSameScore(100)
                .tierOneLevelDownScore(80)
                .tierTwoLevelsDownScore(50)
                .tierThreeLevelsDownScore(30)
                .seasonalPeriodType("QUARTERLY")
                .seasonalCustomMonths(3)
                .active(true)
                .createdBy("system")
                .build();

        formulaConfigRepository.save(formulaConfig);
        log.info("Default formula configuration created successfully");
    }

    private void initializeBadgeDefinitions() {
        log.info("Checking badge definitions...");

        BadgeDefinition streakStar = BadgeDefinition.builder()
                .code("STREAK_STAR")
                .name("Streak Star")
                .description("2+ consecutive months with >80% utilization")
                .iconKey("frame1")
                .color("#FFD86B")
                .active(true)
                .build();

        BadgeDefinition oneOnOneChampion = BadgeDefinition.builder()
                .code("ONE_ON_ONE_CHAMPION")
                .name("1:1 Champion")
                .description("100% utilization in the previous month")
                .iconKey("frame2")
                .color("#F2C94C")
                .active(true)
                .build();

        BadgeDefinition mostImproved = BadgeDefinition.builder()
                .code("MOST_IMPROVED")
                .name("Most Improved")
                .description("Highest month-on-month improvement")
                .iconKey("frame3")
                .color("#FFD86B")
                .active(true)
                .build();

        BadgeDefinition heavyLifter = BadgeDefinition.builder()
                .code("HEAVY_LIFTER")
                .name("Heavy Lifter")
                .description("Team size ≥5 with >80% utilization")
                .iconKey("frame4")
                .color("#C9971A")
                .active(true)
                .build();

        BadgeDefinition premiumBadge = BadgeDefinition.builder()
                .code("PREMIUM_BADGE")
                .name("Premium Badge")
                .description("Awarded by Functional Head for exceptional performance")
                .iconKey("frame5")
                .color("#8AC4FF")
                .active(true)
                .build();

        // Save or update each badge definition
        saveOrUpdateBadge(streakStar);
        saveOrUpdateBadge(oneOnOneChampion);
        saveOrUpdateBadge(mostImproved);
        saveOrUpdateBadge(heavyLifter);
        saveOrUpdateBadge(premiumBadge);

        log.info("Default badge definitions created successfully");
    }

    private void saveOrUpdateBadge(BadgeDefinition badge) {
        badgeDefinitionRepository.findByCode(badge.getCode())
            .ifPresentOrElse(
                existing -> log.debug("Badge definition {} already exists", badge.getCode()),
                () -> {
                    badgeDefinitionRepository.save(badge);
                    log.info("Created badge definition: {}", badge.getCode());
                }
            );
    }
}

