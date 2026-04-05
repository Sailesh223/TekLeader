package com.tekion.tekleader.repository;

import com.tekion.tekleader.entity.FeedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedPostRepository extends MongoRepository<FeedPost, String> {

    Page<FeedPost> findByVisibilityOrderByCreatedAtDesc(String visibility, Pageable pageable);

    Page<FeedPost> findByVisibilityInOrderByCreatedAtDesc(List<String> visibilities, Pageable pageable);

    List<FeedPost> findByAuthorIdOrderByCreatedAtDesc(String authorId);

    Page<FeedPost> findByTypeOrderByCreatedAtDesc(String type, Pageable pageable);
}

