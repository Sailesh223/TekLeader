package com.tekion.tekleader.service;

import com.tekion.tekleader.entity.FeedComment;
import com.tekion.tekleader.entity.FeedPost;
import com.tekion.tekleader.entity.Manager;
import com.tekion.tekleader.event.BadgeAwardedEvent;
import com.tekion.tekleader.event.FeedPostCreatedEvent;
import com.tekion.tekleader.repository.FeedCommentRepository;
import com.tekion.tekleader.repository.FeedPostRepository;
import com.tekion.tekleader.repository.ManagerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedService {

    private final FeedPostRepository feedPostRepository;
    private final FeedCommentRepository feedCommentRepository;
    private final ManagerRepository managerRepository;
    private final KafkaTemplate<String, FeedPostCreatedEvent> kafkaTemplate;

    @Value("${tekleader.kafka.topics.feed-post-created}")
    private String feedPostTopic;

    public FeedPost createUserPost(String authorId, String content, List<String> mediaUrls) {
        Manager author = managerRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        FeedPost post = FeedPost.builder()
            .type("USER_POST")
            .authorId(authorId)
            .authorName(author.getDisplayName())
            .content(content)
            .mediaUrls(mediaUrls != null ? mediaUrls : new ArrayList<>())
            .visibility("PUBLIC")
            .likeCount(0)
            .commentCount(0)
            .isPinned(false)
            .createdAt(LocalDateTime.now())
            .build();

        FeedPost saved = feedPostRepository.save(post);

        FeedPostCreatedEvent event = FeedPostCreatedEvent.builder()
            .postId(saved.getId())
            .type(saved.getType())
            .authorId(saved.getAuthorId())
            .authorName(saved.getAuthorName())
            .content(saved.getContent())
            .createdAt(saved.getCreatedAt())
            .build();

        kafkaTemplate.send(feedPostTopic, event);

        return saved;
    }

    public void createBadgeAwardPost(BadgeAwardedEvent event) {
        log.info("Creating feed post for badge award: {}", event.getBadgeName());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("badgeCode", event.getBadgeCode());
        metadata.put("badgeName", event.getBadgeName());
        metadata.put("month", event.getMonth());
        metadata.put("awardedBy", event.getAwardedBy());
        metadata.put("reason", event.getReason());
        metadata.put("isPremium", event.isPremium());

        String content = String.format("%s has been awarded the '%s' badge for %s! %s",
            event.getManagerName(),
            event.getBadgeName(),
            event.getMonth(),
            event.isPremium() ? "🌟 Premium Badge!" : "");

        FeedPost post = FeedPost.builder()
            .type("BADGE_AWARD")
            .authorId(event.getManagerId())
            .authorName(event.getManagerName())
            .content(content)
            .metadata(metadata)
            .visibility("PUBLIC")
            .likeCount(0)
            .commentCount(0)
            .isPinned(event.isPremium())
            .createdAt(LocalDateTime.now())
            .build();

        feedPostRepository.save(post);
        log.info("Created feed post for badge award");
    }

    public void createAchievementPost(String managerId, String achievementType, String title, String description, Map<String, Object> metadata) {
        Manager manager = managerRepository.findById(managerId).orElse(null);
        if (manager == null) {
            log.warn("Manager not found: {}", managerId);
            return;
        }

        Map<String, Object> postMetadata = new HashMap<>();
        postMetadata.put("achievementType", achievementType);
        postMetadata.putAll(metadata);

        String content = String.format("🌟 %s unlocked an achievement: '%s' - %s",
            manager.getDisplayName(), title, description);

        FeedPost post = FeedPost.builder()
            .type("ACHIEVEMENT")
            .authorId(managerId)
            .authorName(manager.getDisplayName())
            .content(content)
            .metadata(postMetadata)
            .visibility("PUBLIC")
            .likeCount(0)
            .commentCount(0)
            .isPinned(true)
            .createdAt(LocalDateTime.now())
            .build();

        feedPostRepository.save(post);
    }

    public Page<FeedPost> getFeedPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return feedPostRepository.findByVisibilityInOrderByCreatedAtDesc(Arrays.asList("PUBLIC"), pageable);
    }

    public FeedComment addComment(String postId, String authorId, String content) {
        Manager author = managerRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Manager not found"));

        FeedComment comment = FeedComment.builder()
            .postId(postId)
            .authorId(authorId)
            .authorName(author.getDisplayName())
            .content(content)
            .createdAt(LocalDateTime.now())
            .build();

        FeedComment saved = feedCommentRepository.save(comment);

        feedPostRepository.findById(postId).ifPresent(post -> {
            post.setCommentCount(post.getCommentCount() + 1);
            feedPostRepository.save(post);
        });

        return saved;
    }

    public List<FeedComment> getPostComments(String postId) {
        return feedCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public void toggleLike(String postId, String userId) {
        feedPostRepository.findById(postId).ifPresent(post -> {
            List<String> likedBy = post.getLikes();
            if (likedBy.contains(userId)) {
                likedBy.remove(userId);
                post.setLikeCount(post.getLikeCount() - 1);
            } else {
                likedBy.add(userId);
                post.setLikeCount(post.getLikeCount() + 1);
            }
            post.setLikes(likedBy);
            feedPostRepository.save(post);
        });
    }
}

