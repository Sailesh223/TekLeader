package com.tekion.tekleader.controller;

import com.tekion.tekleader.entity.Achievement;
import com.tekion.tekleader.service.AchievementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AchievementController {

    private final AchievementService achievementService;

    @GetMapping("/{managerId}")
    public ResponseEntity<List<Achievement>> getManagerAchievements(@PathVariable String managerId) {
        log.info("Fetching achievements for manager: {}", managerId);
        List<Achievement> achievements = achievementService.getManagerAchievements(managerId);
        return ResponseEntity.ok(achievements);
    }
}

