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
  Avatar,
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
} from '@mui/icons-material';
import { useStore } from '../store/useStore';

const DRAWER_WIDTH = 260;

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
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/user/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/user/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/user/overall' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <AdminIcon />, path: '/admin' },
    { text: 'Upload Data', icon: <UploadIcon />, path: '/admin/upload' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/admin/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/admin/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/admin/overall' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const directorMenuItems = [
    { text: 'My Team', icon: <HierarchyIcon />, path: '/director' },
    { text: 'Monthly', icon: <LeaderboardIcon />, path: '/director/leaderboard' },
    { text: 'Seasonal', icon: <SeasonalIcon />, path: '/director/seasonal' },
    { text: 'Overall', icon: <OverallIcon />, path: '/director/overall' },
  ];

  const functionalHeadMenuItems = [
    { text: 'Organization', icon: <HierarchyIcon />, path: '/functional-head' },
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
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            TekLeader
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Lattice Utilization
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              p: 2,
              textAlign: 'center',
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 1,
                bgcolor: 'rgba(255,255,255,0.3)',
                fontSize: '1.5rem',
              }}
            >
              {userInfo?.displayName?.charAt(0).toUpperCase() || (isAdminPath ? 'A' : 'U')}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {userInfo?.displayName || (isAdminPath ? 'Admin User' : 'User')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {userInfo?.email || (isAdminPath ? 'jithu@gmail.com' : 'SSO User')}
            </Typography>
          </Box>
        </Box>

        <List sx={{ px: 2, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: 2,
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
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(255,255,255,0.15)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
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
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: 'white' }}>
              {isAdminPath ? 'Admin Dashboard' : 'User Dashboard'}
            </Typography>
            <IconButton sx={{ color: 'white', mr: 1 }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton sx={{ color: 'white' }}>
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

