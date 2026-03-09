package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.BadgeAward;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeAwardRepository extends MongoRepository<BadgeAward, String> {

    List<BadgeAward> findByManagerIdAndMonth(String managerId, String month);

    List<BadgeAward> findByManagerIdOrderByAwardedAtDesc(String managerId);

    List<BadgeAward> findByMonth(String month);

    Optional<BadgeAward> findByManagerIdAndBadgeDefinitionIdAndMonth(
        String managerId, String badgeDefinitionId, String month
    );

    @Query(value = "{ 'badgeDefinitionId': ?0 }", count = true)
    Long countDistinctManagerIdByBadgeDefinitionId(String badgeId);

    void deleteByManagerIdAndMonth(String managerId, String month);

    void deleteByMonth(String month);
}

