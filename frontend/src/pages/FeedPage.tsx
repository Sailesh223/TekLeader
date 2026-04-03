import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { feedApi, FeedPost, FeedComment } from '../api/client';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from '../utils/dateUtils';
import { bandColors } from '../theme';

export default function FeedPage() {
  const { userInfo } = useStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, FeedComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  //Arrange
  const fetchPosts = async (pageNum: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await feedApi.getFeed(pageNum, 20);
      if (pageNum === 0) {
        setPosts(response.content);
      } else {
        setPosts(prev => [...prev, ...response.content]);
      }
      setHasMore(pageNum < response.totalPages - 1);
    } catch (err) {
      console.error('Failed to fetch feed:', err);
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(0);
  }, []);

  //Act
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const handleCreatePost = async () => {
    if (!userInfo || !newPostContent.trim()) return;

    try {
      setSubmitting(true);
      await feedApi.createPost({
        authorId: userInfo.id || userInfo.email,
        content: newPostContent,
      });
      setNewPostContent('');
      setCreatePostOpen(false);
      await fetchPosts(0);
      setPage(0);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (!userInfo) return;

    try {
      await feedApi.toggleLike(postId, userInfo.email);
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const currentLikes = post.likes || [];
          const currentLikeCount = post.likeCount || 0;
          const isLiked = currentLikes.includes(userInfo.email);
          return {
            ...post,
            likes: isLiked
              ? currentLikes.filter(id => id !== userInfo.email)
              : [...currentLikes, userInfo.email],
            likeCount: isLiked ? currentLikeCount - 1 : currentLikeCount + 1,
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
    } else {
      setSelectedPost(postId);
      if (!comments[postId]) {
        try {
          const postComments = await feedApi.getPostComments(postId);
          setComments(prev => ({ ...prev, [postId]: postComments }));
        } catch (err) {
          console.error('Failed to fetch comments:', err);
        }
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!userInfo || !commentText[postId]?.trim()) return;

    try {
      const newComment = await feedApi.addComment(postId, {
        authorId: userInfo.email,
        content: commentText[postId],
      });
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post
      ));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'BADGE_AWARD':
        return <TrophyIcon sx={{ color: '#FFD700', fontSize: 32 }} />;
      case 'ACHIEVEMENT':
        return <StarIcon sx={{ color: '#00BFA5', fontSize: 32 }} />;
      default:
        return null;
    }
  };

  const getPostChipColor = (type: string) => {
    switch (type) {
      case 'BADGE_AWARD':
        return { bgcolor: '#FFD700', color: '#000' };
      case 'ACHIEVEMENT':
        return { bgcolor: '#00BFA5', color: '#fff' };
      default:
        return { bgcolor: '#E0E0E0', color: '#000' };
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2D3748', fontFamily: "'Orbitron', sans-serif" }}>
          TekLeader Feed
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreatePostOpen(true)}
          sx={{
            bgcolor: '#00BFA5',
            '&:hover': { bgcolor: '#00897B' },
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Create Post
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Posts */}
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              sx={{
                mb: 2,
                borderRadius: 3,
                background: post.isPinned
                  ? 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,255,255,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(224,247,244,0.95) 100%)',
                backdropFilter: 'blur(10px)',
                boxShadow: post.isPinned
                  ? '0 4px 20px rgba(255,215,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.05)',
                border: post.isPinned ? '2px solid #FFD700' : 'none',
              }}
            >
              <CardHeader
                avatar={
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={post.authorAvatar}
                      sx={{ bgcolor: bandColors.Gold.main, width: 48, height: 48 }}
                    >
                      {post.authorName.charAt(0).toUpperCase()}
                    </Avatar>
                    {post.type !== 'USER_POST' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -4,
                          right: -4,
                          bgcolor: 'white',
                          borderRadius: '50%',
                          p: 0.5,
                          display: 'flex',
                        }}
                      >
                        {getPostIcon(post.type)}
                      </Box>
                    )}
                  </Box>
                }
                action={
                  post.isPinned && (
                    <Chip
                      icon={<PinIcon />}
                      label="Pinned"
                      size="small"
                      sx={{ bgcolor: '#FFD700', color: '#000', fontWeight: 600 }}
                    />
                  )
                }
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#2D3748' }}>
                      {post.authorName}
                    </Typography>
                    {post.metadata?.rank && (
                      <Chip
                        label={`#${post.metadata.rank}`}
                        size="small"
                        sx={{
                          bgcolor: '#7C4DFF',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          fontWeight: 600
                        }}
                      />
                    )}
                    {post.metadata?.tier && (
                      <Chip
                        label={post.metadata.tier}
                        size="small"
                        sx={{
                          bgcolor: post.metadata.tier === 'Gold' ? '#FFD700' :
                                   post.metadata.tier === 'Silver' ? '#C0C0C0' :
                                   post.metadata.tier === 'Bronze' ? '#CD7F32' : '#999',
                          color: post.metadata.tier === 'Gold' ? '#000' : '#FFF',
                          fontSize: '0.7rem',
                          height: 20,
                          fontWeight: 600
                        }}
                      />
                    )}
                    {post.type !== 'USER_POST' && (
                      <Chip
                        label={post.type === 'BADGE_AWARD' ? 'Badge Awarded' : 'Achievement'}
                        size="small"
                        sx={{ ...getPostChipColor(post.type), fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>
                }
                subheader={
                  <Typography variant="caption" sx={{ color: '#718096' }}>
                    {formatDistanceToNow(post.createdAt)}
                  </Typography>
                }
              />
              <CardContent>
                <Typography variant="body1" sx={{ color: '#2D3748', mb: 2, whiteSpace: 'pre-wrap' }}>
                  {post.content}
                </Typography>

                {/* Media */}
                {post.mediaUrls && post.mediaUrls.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {post.mediaUrls.map((url, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={url}
                        alt="Post media"
                        sx={{
                          maxWidth: '100%',
                          borderRadius: 2,
                          maxHeight: 400,
                          objectFit: 'cover',
                        }}
                      />
                    ))}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    size="small"
                    startIcon={
                      (post.likes || []).includes(userInfo?.email || '') ? (
                        <FavoriteIcon sx={{ color: '#FF4081' }} />
                      ) : (
                        <FavoriteBorderIcon />
                      )
                    }
                    onClick={() => handleToggleLike(post.id)}
                    sx={{ color: '#718096', textTransform: 'none' }}
                  >
                    {post.likeCount || 0}
                  </Button>
                  <Button
                    size="small"
                    startIcon={<CommentIcon />}
                    onClick={() => handleToggleComments(post.id)}
                    sx={{ color: '#718096', textTransform: 'none' }}
                  >
                    {post.commentCount || 0}
                  </Button>
                </Box>

                {/* Comments Section */}
                {selectedPost === post.id && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
                    <List sx={{ p: 0 }}>
                      {comments[post.id]?.map(comment => (
                        <ListItem key={comment.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                          <ListItemAvatar>
                            <Avatar
                              src={comment.authorAvatar}
                              sx={{ width: 32, height: 32, bgcolor: bandColors.Silver.main }}
                            >
                              {comment.authorName.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
                                {comment.authorName}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" sx={{ color: '#4A5568' }}>
                                  {comment.content}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#A0AEC0' }}>
                                  {formatDistanceToNow(comment.createdAt)}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>

                    {/* Add Comment */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Write a comment..."
                        value={commentText[post.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyPress={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        }}
                      />
                      <IconButton
                        color="primary"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading & Load More */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress sx={{ color: '#00BFA5' }} />
        </Box>
      )}

      {!loading && hasMore && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            sx={{
              borderColor: '#00BFA5',
              color: '#00BFA5',
              '&:hover': { borderColor: '#00897B', bgcolor: 'rgba(0,191,165,0.05)' },
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Load More
          </Button>
        </Box>
      )}

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onClose={() => setCreatePostOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#2D3748' }}>Create a Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share your thoughts, achievements, or updates..."
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePostOpen(false)} sx={{ color: '#718096' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreatePost}
            disabled={!newPostContent.trim() || submitting}
            variant="contained"
            sx={{
              bgcolor: '#00BFA5',
              '&:hover': { bgcolor: '#00897B' },
              textTransform: 'none',
            }}
          >
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


