import { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { notificationApi, Notification } from '../api/client';
import { useStore } from '../store/useStore';
import { formatDistanceToNow } from '../utils/dateUtils';

interface NotificationDropdownProps {
  userId: string;
}

export default function NotificationDropdown({ userId }: NotificationDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = Boolean(anchorEl);

  //Arrange
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notifs, count] = await Promise.all([
        notificationApi.getUserNotifications(userId),
        notificationApi.getUnreadCount(userId),
      ]);
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  //Act
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(userId);
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BADGE_AWARDED':
        return <TrophyIcon sx={{ color: '#FFD700' }} />;
      case 'ACHIEVEMENT_UNLOCKED':
        return <StarIcon sx={{ color: '#00BFA5' }} />;
      default:
        return <NotificationsIcon sx={{ color: '#7C4DFF' }} />;
    }
  };

  return (
    <>
      <IconButton onClick={handleClick} sx={{ color: 'white', mr: 1 }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(224,247,244,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,191,165,0.2)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Button size="small" onClick={handleMarkAllAsRead} sx={{ color: '#00BFA5' }}>
                Mark all read
              </Button>
            )}
          </Box>
          <Divider />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} sx={{ color: '#00BFA5' }} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 450, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(0,191,165,0.08)',
                    '&:hover': { bgcolor: 'rgba(0,191,165,0.12)' },
                    cursor: 'pointer',
                  }}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'rgba(0,191,165,0.1)' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2D3748' }}>
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Chip label="NEW" size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#00BFA5', color: 'white' }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ color: '#4A5568', mt: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#718096', mt: 0.5, display: 'block' }}>
                          {formatDistanceToNow(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}

