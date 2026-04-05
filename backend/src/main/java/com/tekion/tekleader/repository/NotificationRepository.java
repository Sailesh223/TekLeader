package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdAndIsReadOrderByCreatedAtDesc(String userId, Boolean isRead);

    Long countByUserIdAndIsRead(String userId, Boolean isRead);

    List<Notification> findTop20ByUserIdOrderByCreatedAtDesc(String userId);
}

