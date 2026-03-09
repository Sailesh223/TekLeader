package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.BadgeDefinition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeDefinitionRepository extends MongoRepository<BadgeDefinition, String> {
    Optional<BadgeDefinition> findByCode(String code);
    List<BadgeDefinition> findByActiveTrue();
}

