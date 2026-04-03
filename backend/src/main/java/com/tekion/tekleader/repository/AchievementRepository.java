package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {

    List<Achievement> findByManagerIdOrderByUnlockedAtDesc(String managerId);

    Optional<Achievement> findByManagerIdAndAchievementType(String managerId, String achievementType);

    List<Achievement> findByAchievementTypeOrderByUnlockedAtDesc(String achievementType);
}

