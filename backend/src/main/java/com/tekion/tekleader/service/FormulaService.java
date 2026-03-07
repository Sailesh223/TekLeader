package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.FormulaConfig;
import com.tekion.tekleader.repository.FormulaConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FormulaService {

    private final FormulaConfigRepository formulaConfigRepository;

    public FormulaConfig getActiveFormula() {
        return formulaConfigRepository.findByActiveTrue()
            .orElseThrow(() -> new RuntimeException("No active formula configuration found"));
    }

    public List<FormulaConfig> getAllFormulas() {
        return formulaConfigRepository.findAll();
    }

    @Transactional
    public FormulaConfig createNewFormula(FormulaConfig newFormula) {
        // Validate weights sum to 1.0
        BigDecimal sum = newFormula.getUtilizationWeight()
            .add(newFormula.getTeamSizeWeight())
            .add(newFormula.getConsistencyWeight());
        
        if (sum.subtract(BigDecimal.ONE).abs().compareTo(new BigDecimal("0.01")) > 0) {
            throw new IllegalArgumentException("Weights must sum to 1.0 (current sum: " + sum + ")");
        }

        // Deactivate current active formula
        formulaConfigRepository.findByActiveTrue().ifPresent(current -> {
            current.setActive(false);
            formulaConfigRepository.save(current);
            log.info("Deactivated formula version {}", current.getVersion());
        });

        // Determine next version number
        List<FormulaConfig> allFormulas = formulaConfigRepository.findAll();
        int nextVersion = allFormulas.stream()
            .mapToInt(f -> f.getVersion() != null ? f.getVersion() : 0)
            .max()
            .orElse(0) + 1;

        // Create new formula
        newFormula.setVersion(nextVersion);
        newFormula.setActive(true);
        newFormula.setCreatedBy("admin");

        FormulaConfig saved = formulaConfigRepository.save(newFormula);
        log.info("Created and activated formula version {}", saved.getVersion());

        return saved;
    }
}

