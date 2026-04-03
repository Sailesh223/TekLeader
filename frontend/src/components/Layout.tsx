import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Leaderboard as LeaderboardIcon,
  AdminPanelSettings as AdminIcon,
  CloudUpload as UploadIcon,
  Analytics as AnalyticsIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  AccountTree as HierarchyIcon,
  EmojiEvents as TrophyIcon,
  CalendarMonth as SeasonalIcon,
  Whatshot as OverallIcon,
  DynamicFeed as FeedIcon,
} from '@mui/icons-material';
import { useStore } from '../store/useStore';
import UserAvatar from './UserAvatar';
import NotificationDropdown from './NotificationDropdown';

const DRAWER_WIDTH = 200;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useStore();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isDirectorPath = location.pathname.startsWith('/director');
  const isFunctionalHeadPath = location.pathname.startsWith('/functional-head');

  const handleLogout = () => {
    navigate('/login');
  };

  const userMenuItems = [
    { text: 'My Dashboard', icon: <AnalyticsIcon />, path: '/user' },
    { text: 'Feed', icon: <FeedIcon />, path: '/user/feed' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/user/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/user/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/user/overall' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <AdminIcon />, path: '/admin' },
    { text: 'Feed', icon: <FeedIcon />, path: '/admin/feed' },
    { text: 'Upload Data', icon: <UploadIcon />, path: '/admin/upload' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/admin/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/admin/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/admin/overall' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const directorMenuItems = [
    { text: 'My Team', icon: <HierarchyIcon />, path: '/director' },
    { text: 'Feed', icon: <FeedIcon />, path: '/director/feed' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/director/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/director/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/director/overall' },
  ];

  const functionalHeadMenuItems = [
    { text: 'Organization', icon: <HierarchyIcon />, path: '/functional-head' },
    { text: 'Feed', icon: <FeedIcon />, path: '/functional-head/feed' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/functional-head/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/functional-head/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/functional-head/overall' },
  ];

  const menuItems = isAdminPath
    ? adminMenuItems
    : isDirectorPath
    ? directorMenuItems
    : isFunctionalHeadPath
    ? functionalHeadMenuItems
    : userMenuItems;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #00BFA5 0%, #00897B 100%)',
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        {/* Tekion Logo Header */}
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <img
            src="https://media.licdn.com/dms/image/v2/C5622AQGYuaZJu_FvbQ/feedshare-shrink_800/feedshare-shrink_800/0/1642346871207?e=2147483647&v=beta&t=-SwXfx6quNnav_rArAHPx4hn-IDAf9twjqSIAXz-MlA"
            alt="Tekion Logo"
            style={{
              height: '38px',
              width: 'auto',
              filter: 'brightness(0) invert(1)', // Make logo white
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ px: 1.5, py: 2 }}>
          <Box
            sx={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 1.5,
              textAlign: 'center',
            }}
          >
            <UserAvatar
              name={userInfo?.displayName || (isAdminPath ? 'Admin User' : 'User')}
              email={userInfo?.email}
              sx={{
                width: 48,
                height: 48,
                mx: 'auto',
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.3)',
                fontSize: '1.25rem',
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {userInfo?.displayName || (isAdminPath ? 'Admin User' : 'User')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
              {userInfo?.email || (isAdminPath ? 'jithu@gmail.com' : 'SSO User')}
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 1.5, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.75 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  '&.Mui-selected': {
                    background: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                    },
                  },
                  '&:hover': {
                    background: 'rgba(255,255,255,0.15)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ px: 1.5, py: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              '&:hover': {
                background: 'rgba(255,255,255,0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 36 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
            borderBottom: '2px solid rgba(0, 191, 165, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 191, 165, 0.2)',
            top: 0,
            zIndex: 1100,
          }}
        >
          <Toolbar>
            <Typography
              variant="body1"
              sx={{
                flexGrow: 1,
                fontWeight: 600,
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: '1.5px',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E0F7F4 50%, #B2EBF2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                textTransform: 'uppercase',
                opacity: 0.95,
              }}
            >
              Performance Progress Perseverance
            </Typography>
            {userInfo && <NotificationDropdown userId={userInfo.id || userInfo.email || userInfo.displayName} />}
            <IconButton sx={{ color: 'white' }} onClick={() => navigate('/user/settings')}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            background: 'linear-gradient(135deg, #F5F7FA 0%, #E8F5F3 100%)',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

