package com.tekion.tekleader.controller;

import com.tekion.tekleader.dto.BadgeAwardRequest;
import com.tekion.tekleader.entity.BadgeAward;
import com.tekion.tekleader.entity.BadgeDefinition;
import com.tekion.tekleader.service.BadgeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
@Tag(name = "Badge Management", description = "APIs for managing and awarding badges")
public class BadgeController {

    private final BadgeService badgeService;

    @PostMapping("/award")
    @Operation(summary = "Award badge manually", description = "Award a badge to a manager manually (for functional heads/directors)")
    public ResponseEntity<Map<String, Object>> awardBadge(@RequestBody BadgeAwardRequest request) {
        try {
            BadgeAward award = badgeService.awardManualBadge(
                request.getManagerId(),
                request.getBadgeCode(),
                request.getMonth(),
                request.getAwardedBy(),
                request.getReason()
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Badge awarded successfully",
                "award", award
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/available")
    @Operation(summary = "Get available badges", description = "Get all active badge definitions")
    public ResponseEntity<List<BadgeDefinition>> getAvailableBadges() {
        return ResponseEntity.ok(badgeService.getAllActiveBadges());
    }
}

