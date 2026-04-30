package com.tekion.tekleader.controller;

import com.tekion.tekleader.dto.HierarchyResponse;
import com.tekion.tekleader.service.HierarchyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hierarchy")
@RequiredArgsConstructor
@Tag(name = "Hierarchy Management", description = "APIs for organizational hierarchy views")
public class HierarchyController {

    private final HierarchyService hierarchyService;

    @GetMapping("/functional-heads")
    @Operation(summary = "Get functional head hierarchy", description = "Get complete organizational hierarchy for functional heads")
    public ResponseEntity<List<HierarchyResponse.FunctionalHeadNode>> getFunctionalHeadHierarchy(
        @RequestParam String month
    ) {
        List<HierarchyResponse.FunctionalHeadNode> hierarchy = hierarchyService.getFunctionalHeadHierarchy(month);
        return ResponseEntity.ok(hierarchy);
    }

    @GetMapping("/directors/{directorName}")
    @Operation(summary = "Get director hierarchy", description = "Get hierarchy for a specific director")
    public ResponseEntity<HierarchyResponse.DirectorNode> getDirectorHierarchy(
        @PathVariable String directorName,
        @RequestParam String month
    ) {
        HierarchyResponse.DirectorNode hierarchy = hierarchyService.getDirectorHierarchy(directorName, month);
        return ResponseEntity.ok(hierarchy);
    }

    @GetMapping("/directors/list")
    @Operation(summary = "Get list of all directors", description = "Get distinct list of all director names")
    public ResponseEntity<List<String>> getAllDirectors() {
        List<String> directors = hierarchyService.getAllDirectorNames();
        return ResponseEntity.ok(directors);
    }

    @GetMapping("/functional-heads/list")
    @Operation(summary = "Get list of all functional heads", description = "Get distinct list of all functional head names")
    public ResponseEntity<List<String>> getAllFunctionalHeads() {
        List<String> functionalHeads = hierarchyService.getAllFunctionalHeadNames();
        return ResponseEntity.ok(functionalHeads);
    }

    @GetMapping("/functional-heads/list/by-month")
    @Operation(
        summary = "Get functional heads for specific month",
        description = "Get date-aware list of functional heads that have data for the specified month. " +
                     "This ensures new functional heads only appear when filtering to their start month or later."
    )
    public ResponseEntity<List<String>> getFunctionalHeadsForMonth(@RequestParam String month) {
        List<String> functionalHeads = hierarchyService.getFunctionalHeadNamesForMonth(month);
        return ResponseEntity.ok(functionalHeads);
    }
}

