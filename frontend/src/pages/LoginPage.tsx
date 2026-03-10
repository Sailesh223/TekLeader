import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useStore } from '../store/useStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUserInfo } = useStore();
  const [loginMode, setLoginMode] = useState<'admin' | 'user' | 'director' | 'functional-head'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [directors, setDirectors] = useState<string[]>([]);
  const [functionalHeads, setFunctionalHeads] = useState<string[]>([]);
  const [selectedDirector, setSelectedDirector] = useState('');
  const [selectedFunctionalHead, setSelectedFunctionalHead] = useState('');

  useEffect(() => {
    // Fetch directors and functional heads on component mount
    const fetchLists = async () => {
      try {
        const [directorsRes, fhRes] = await Promise.all([
          fetch('/api/hierarchy/directors/list'),
          fetch('/api/hierarchy/functional-heads/list'),
        ]);

        if (directorsRes.ok) {
          const directorsData = await directorsRes.json();
          setDirectors(directorsData);
        }

        if (fhRes.ok) {
          const fhData = await fhRes.json();
          setFunctionalHeads(fhData);
        }
      } catch (err) {
        console.error('Failed to fetch lists:', err);
      }
    };

    fetchLists();
  }, []);

  const handleAdminLogin = () => {
    setError('');

    if (email === 'jithu@gmail.com' && password === 'Jithu564@') {
      setUserInfo({
        email: 'jithu@gmail.com',
        displayName: 'Admin',
        isAdmin: true,
      });
      navigate('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleDirectorLogin = () => {
    setError('');

    if (!selectedDirector) {
      setError('Please select a director');
      return;
    }

    setUserInfo({
      email: '',
      displayName: selectedDirector,
      isAdmin: false,
    });
    navigate('/director');
  };

  const handleFunctionalHeadLogin = () => {
    setError('');

    if (!selectedFunctionalHead) {
      setError('Please select a functional head');
      return;
    }

    setUserInfo({
      email: '',
      displayName: selectedFunctionalHead,
      isAdmin: false,
    });
    navigate('/functional-head');
  };

  const handleUserLogin = () => {
    setError('');

    if (!email || email.trim() === '') {
      setError('Please enter your name');
      return;
    }

    // Use the entered name as displayName
    const displayName = email.trim();

    setUserInfo({
      email: '', // No email for regular users
      displayName,
      isAdmin: false,
    });
    navigate('/user');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 50%, #004D40 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Decorative */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.15)',
            filter: 'blur(60px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(0, 191, 165, 0.3)',
            filter: 'blur(50px)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', px: 4 }}>
          <BusinessIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            TekLeader
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
            Lattice Utilization Leaderboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7, maxWidth: 400, mx: 'auto' }}>
            Track manager performance, team utilization, and drive excellence across your organization
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            p: 5,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
            {loginMode === 'admin' && 'Admin Login'}
            {loginMode === 'user' && 'User Login'}
            {loginMode === 'director' && 'Director Login'}
            {loginMode === 'functional-head' && 'Functional Head Login'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loginMode === 'admin' && 'Sign in to access admin dashboard'}
            {loginMode === 'user' && 'Sign in with your SSO credentials'}
            {loginMode === 'director' && 'Sign in to view your team hierarchy'}
            {loginMode === 'functional-head' && 'Sign in to view organization hierarchy'}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 4 }}>
          <Button
            variant={loginMode === 'user' ? 'contained' : 'text'}
            onClick={() => setLoginMode('user')}
            sx={{
              py: 1.5,
              borderRadius: 2,
              ...(loginMode === 'user' && {
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
              }),
            }}
          >
            User
          </Button>
          <Button
            variant={loginMode === 'admin' ? 'contained' : 'text'}
            onClick={() => setLoginMode('admin')}
            sx={{
              py: 1.5,
              borderRadius: 2,
              ...(loginMode === 'admin' && {
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
              }),
            }}
          >
            Admin
          </Button>
          <Button
            variant={loginMode === 'director' ? 'contained' : 'text'}
            onClick={() => setLoginMode('director')}
            sx={{
              py: 1.5,
              borderRadius: 2,
              ...(loginMode === 'director' && {
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
              }),
            }}
          >
            Director
          </Button>
          <Button
            variant={loginMode === 'functional-head' ? 'contained' : 'text'}
            onClick={() => setLoginMode('functional-head')}
            sx={{
              py: 1.5,
              borderRadius: 2,
              ...(loginMode === 'functional-head' && {
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
              }),
            }}
          >
            Functional Head
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loginMode === 'admin' ? (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
            <TextField
              fullWidth
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F5F7FA',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#00BFA5' },
                  '&.Mui-focused fieldset': { borderColor: '#00BFA5' },
                },
              }}
              required
            />
            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F5F7FA',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#00BFA5' },
                  '&.Mui-focused fieldset': { borderColor: '#00BFA5' },
                },
              }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                py: 1.8,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                boxShadow: '0 4px 15px rgba(0, 191, 165, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
                  boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)',
                },
              }}
            >
              Login
            </Button>
          </Box>
        ) : loginMode === 'director' ? (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleDirectorLogin(); }}>
            <FormControl
              fullWidth
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F5F7FA',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#00BFA5' },
                  '&.Mui-focused fieldset': { borderColor: '#00BFA5' },
                },
              }}
            >
              <InputLabel>Select Director</InputLabel>
              <Select
                value={selectedDirector}
                onChange={(e) => setSelectedDirector(e.target.value)}
                label="Select Director"
                required
              >
                {directors.map((director) => (
                  <MenuItem key={director} value={director}>
                    {director}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                py: 1.8,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                boxShadow: '0 4px 15px rgba(0, 191, 165, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
                  boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1 }} />
              Login
            </Button>
          </Box>
        ) : loginMode === 'functional-head' ? (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFunctionalHeadLogin(); }}>
            <FormControl
              fullWidth
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F5F7FA',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#00BFA5' },
                  '&.Mui-focused fieldset': { borderColor: '#00BFA5' },
                },
              }}
            >
              <InputLabel>Select Functional Head</InputLabel>
              <Select
                value={selectedFunctionalHead}
                onChange={(e) => setSelectedFunctionalHead(e.target.value)}
                label="Select Functional Head"
                required
              >
                {functionalHeads.map((fh) => (
                  <MenuItem key={fh} value={fh}>
                    {fh}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                py: 1.8,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                boxShadow: '0 4px 15px rgba(0, 191, 165, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
                  boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1 }} />
              Login
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleUserLogin(); }}>
            <TextField
              fullWidth
              placeholder="Enter your name (e.g., Abhinav Chourasia)"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#F5F7FA',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#00BFA5' },
                  '&.Mui-focused fieldset': { borderColor: '#00BFA5' },
                },
              }}
              required
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{
                py: 1.8,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 1,
                boxShadow: '0 4px 15px rgba(0, 191, 165, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00897B 0%, #004D40 100%)',
                  boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1 }} />
              Login
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
          © 2026 Tekion. All rights reserved.
        </Typography>
        </Card>
      </Box>
    </Box>
  );
}

