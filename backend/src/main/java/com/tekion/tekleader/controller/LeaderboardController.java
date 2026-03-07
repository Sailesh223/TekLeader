package com.tekion.tekleader.controller;

import com.tekion.tekleader.dto.LeaderboardResponse;
import com.tekion.tekleader.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Leaderboard and manager data APIs")
@CrossOrigin(origins = "*")
public class LeaderboardController {
    
    private final LeaderboardService leaderboardService;
    
    @GetMapping("/leaderboard")
    @Operation(summary = "Get leaderboard", description = "Fetch leaderboard for a specific month with filters")
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
        @RequestParam String month,
        @RequestParam(defaultValue = "all") String functionalHead,
        @RequestParam(defaultValue = "all") String band,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        LeaderboardResponse response = leaderboardService.getLeaderboard(
            month, functionalHead, band, search, page, size
        );
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/months")
    @Operation(summary = "Get available months", description = "Get list of all months with data")
    public ResponseEntity<Map<String, Object>> getAvailableMonths() {
        List<String> months = leaderboardService.getAvailableMonths();
        String latestMonth = months.isEmpty() ? "" : months.get(0);
        return ResponseEntity.ok(Map.of(
            "months", months,
            "latestMonth", latestMonth
        ));
    }

    @DeleteMapping("/data")
    @Operation(summary = "Delete data by month", description = "Delete all metrics and badges for a specific month")
    public ResponseEntity<Map<String, Object>> deleteDataByMonth(@RequestParam String month) {
        Map<String, Object> result = leaderboardService.deleteDataByMonth(month);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/data/all")
    @Operation(summary = "Delete all data", description = "Delete all metrics and badges from the database")
    public ResponseEntity<Map<String, Object>> deleteAllData() {
        Map<String, Object> result = leaderboardService.deleteAllData();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/recalculate-ranks/{month}")
    @Operation(summary = "Recalculate rankings", description = "Recalculate rankings for a specific month based on final score")
    public ResponseEntity<Map<String, String>> recalculateRanks(@PathVariable String month) {
        leaderboardService.recalculateRankings(month);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Rankings recalculated successfully for " + month);
        return ResponseEntity.ok(response);
    }
}

