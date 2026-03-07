package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.TeamMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends MongoRepository<TeamMember, String> {
    
    List<TeamMember> findByManagerIdAndMonth(String managerId, String month);
    
    List<TeamMember> findByManagerId(String managerId);
    
    Optional<TeamMember> findByManagerIdAndMonthAndCanonicalName(String managerId, String month, String canonicalName);
    
    void deleteByMonth(String month);
    
    long countByManagerIdAndMonth(String managerId, String month);
}

