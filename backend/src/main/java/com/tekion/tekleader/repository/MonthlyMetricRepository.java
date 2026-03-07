package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.MonthlyMetric;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyMetricRepository extends MongoRepository<MonthlyMetric, String> {

    List<MonthlyMetric> findByMonth(String month);

    List<MonthlyMetric> findByMonthOrderByFinalScoreDesc(String month);

    Optional<MonthlyMetric> findByManagerIdAndMonth(String managerId, String month);

    List<MonthlyMetric> findByManagerIdOrderByMonthDesc(String managerId);

    @Query(value = "{}", fields = "{ 'month' : 1 }", sort = "{ 'month' : -1 }")
    List<MonthlyMetric> findDistinctMonths();

    List<MonthlyMetric> findByMonthOrderByFinalScoreDescUtilizationDescNotUtilisingAsc(String month);

    Long countByMonth(String month);

    void deleteByManagerIdAndMonth(String managerId, String month);

    void deleteByMonth(String month);

    @Query("{ 'month': ?0, $and: [ " +
           "{ $or: [ { $expr: { $eq: [?1, null] } }, { 'functionalHead': ?1 } ] }, " +
           "{ $or: [ { $expr: { $eq: [?2, null] } }, { 'classificationBand': ?2 } ] } " +
           "] }")
    List<MonthlyMetric> findFilteredMetrics(String month, String functionalHead, String band);
}

