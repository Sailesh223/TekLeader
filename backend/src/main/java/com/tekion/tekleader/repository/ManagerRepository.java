package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.Manager;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ManagerRepository extends MongoRepository<Manager, String> {
    Optional<Manager> findByCanonicalName(String canonicalName);
    Optional<Manager> findByDisplayName(String displayName);
    boolean existsByCanonicalName(String canonicalName);
}

