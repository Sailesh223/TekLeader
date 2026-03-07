package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.FormulaConfig;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormulaConfigRepository extends MongoRepository<FormulaConfig, String> {
    Optional<FormulaConfig> findByActiveTrue();
    Optional<FormulaConfig> findByVersion(Integer version);
}

