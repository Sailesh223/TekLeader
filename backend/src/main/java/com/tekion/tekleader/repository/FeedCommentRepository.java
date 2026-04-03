package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.FeedComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedCommentRepository extends MongoRepository<FeedComment, String> {

    List<FeedComment> findByPostIdOrderByCreatedAtAsc(String postId);

    Long countByPostId(String postId);
}

