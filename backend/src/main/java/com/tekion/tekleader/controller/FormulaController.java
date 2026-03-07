package com.tekion.tekleader.controller;

import com.tekion.tekleader.entity.FormulaConfig;
import com.tekion.tekleader.service.FormulaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/formula")
@RequiredArgsConstructor
@Tag(name = "Formula Management", description = "APIs for managing scoring formula configuration")
public class FormulaController {

    private final FormulaService formulaService;

    @GetMapping("/current")
    @Operation(summary = "Get current formula", description = "Get the currently active formula configuration")
    public ResponseEntity<FormulaConfig> getCurrentFormula() {
        FormulaConfig formula = formulaService.getActiveFormula();
        return ResponseEntity.ok(formula);
    }

    @PostMapping
    @Operation(summary = "Create new formula", description = "Create a new formula version and set it as active")
    public ResponseEntity<Map<String, Object>> createFormula(@RequestBody FormulaConfig newFormula) {
        FormulaConfig created = formulaService.createNewFormula(newFormula);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "version", created.getVersion(),
            "message", "Formula version " + created.getVersion() + " created successfully. It will apply to future uploads.",
            "formula", created
        ));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all formulas", description = "Get all formula versions")
    public ResponseEntity<Map<String, Object>> getAllFormulas() {
        return ResponseEntity.ok(Map.of(
            "formulas", formulaService.getAllFormulas()
        ));
    }
}

