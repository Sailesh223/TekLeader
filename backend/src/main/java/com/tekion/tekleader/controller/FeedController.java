package com.tekion.tekleader.controller;

import com.tekion.tekleader.entity.FeedComment;
import com.tekion.tekleader.entity.FeedPost;
import com.tekion.tekleader.service.FeedService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<Page<FeedPost>> getFeed(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Fetching feed posts - page: {}, size: {}", page, size);
        Page<FeedPost> posts = feedService.getFeedPosts(page, size);
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<FeedPost> createPost(@RequestBody CreatePostRequest request) {
        log.info("Creating post for user: {}", request.getAuthorId());
        FeedPost post = feedService.createUserPost(
            request.getAuthorId(),
            request.getContent(),
            request.getMediaUrls()
        );
        return ResponseEntity.ok(post);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<FeedComment> addComment(
        @PathVariable String postId,
        @RequestBody AddCommentRequest request
    ) {
        log.info("Adding comment to post: {}", postId);
        FeedComment comment = feedService.addComment(postId, request.getAuthorId(), request.getContent());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<FeedComment>> getPostComments(@PathVariable String postId) {
        log.info("Fetching comments for post: {}", postId);
        List<FeedComment> comments = feedService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Void> toggleLike(
        @PathVariable String postId,
        @RequestBody LikeRequest request
    ) {
        log.info("Toggling like for post: {} by user: {}", postId, request.getUserId());
        feedService.toggleLike(postId, request.getUserId());
        return ResponseEntity.ok().build();
    }

    @Data
    public static class CreatePostRequest {
        private String authorId;
        private String content;
        private List<String> mediaUrls;
    }

    @Data
    public static class AddCommentRequest {
        private String authorId;
        private String content;
    }

    @Data
    public static class LikeRequest {
        private String userId;
    }
}

