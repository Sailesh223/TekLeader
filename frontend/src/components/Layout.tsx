import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Leaderboard as LeaderboardIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/leaderboard')}
          >
            TekLeader
          </Typography>
          <Button
            color="inherit"
            startIcon={<LeaderboardIcon />}
            onClick={() => navigate('/leaderboard')}
            sx={{
              mr: 2,
              backgroundColor: location.pathname === '/leaderboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Leaderboard
          </Button>
          <Button
            color="inherit"
            startIcon={<AdminIcon />}
            onClick={() => navigate('/admin')}
            sx={{
              backgroundColor: location.pathname.startsWith('/admin') ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}
          >
            Admin
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

