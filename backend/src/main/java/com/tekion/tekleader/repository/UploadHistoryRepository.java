package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.UploadHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadHistoryRepository extends MongoRepository<UploadHistory, String> {
    List<UploadHistory> findByMonthOrderByUploadedAtDesc(String month);
    List<UploadHistory> findAllByOrderByUploadedAtDesc();
}

