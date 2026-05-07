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
  Lock as LockIcon,
} from '@mui/icons-material';
import { useRive } from '@rive-app/react-canvas';
import { useOktaAuth } from '@okta/okta-react';
import { useStore } from '../store/useStore';

function RiveAnimationSection() {
  const { rive, RiveComponent } = useRive({
    src: '/19489-36629-happy-meeple.riv',
    artboard: 'Artboard',
    stateMachines: 'Meeples', // Correct state machine name from Rive marketplace
    autoplay: true,
    onLoad: () => {
      console.log('✅ Rive animation loaded with interactive state machine');
    },
  });

  // Log rive instance for debugging
  useEffect(() => {
    if (rive) {
      console.log('🎨 Rive instance:', rive);
      console.log('📊 Available state machines:', rive.stateMachineNames);
      console.log('🎭 Available artboards:', rive.artboardNames);
    }
  }, [rive]);

  return (
    <Box
      sx={{
        flex: 2, // Balanced ratio - slightly left of center (1.5:1 ratio)
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexDirection: 'column',
        p: 0,
        background: 'radial-gradient(ellipse at center, #FFFFFF 0%, #F5F5F5 30%, #ECECEC 60%, #e0dede 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Tekion Logo at Top Left */}
      <Box
        sx={{
          position: 'absolute',
          top: 32,
          left: 40,
          zIndex: 10,
        }}
      >
        <img
          src="https://media.licdn.com/dms/image/v2/C5622AQGYuaZJu_FvbQ/feedshare-shrink_800/feedshare-shrink_800/0/1642346871207?e=2147483647&v=beta&t=-SwXfx6quNnav_rArAHPx4hn-IDAf9twjqSIAXz-MlA"
          alt="Tekion Logo"
          style={{
            height: '64px',
            width: 'auto',
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
          }}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& canvas': {
            cursor: 'pointer',
          },
        }}
      >
        <RiveComponent
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Box>
    </Box>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUserInfo } = useStore();
  const { oktaAuth } = useOktaAuth();
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

  const handleDirectorLogin = async () => {
    setError('');

    if (!selectedDirector) {
      setError('Please select a director');
      return;
    }

    try {
      const response = await fetch(`/api/manager/info?displayName=${encodeURIComponent(selectedDirector)}`);

      if (response.ok) {
        const managerInfo = await response.json();
        setUserInfo({
          id: managerInfo.id,
          email: managerInfo.email || '',
          displayName: managerInfo.displayName,
          isAdmin: false,
        });
        navigate('/director');
      } else {
        setUserInfo({
          id: undefined,
          email: '',
          displayName: selectedDirector,
          isAdmin: false,
        });
        navigate('/director');
      }
    } catch (err) {
      console.error('Failed to fetch director info:', err);
      setUserInfo({
        id: undefined,
        email: '',
        displayName: selectedDirector,
        isAdmin: false,
      });
      navigate('/director');
    }
  };

  const handleFunctionalHeadLogin = async () => {
    setError('');

    if (!selectedFunctionalHead) {
      setError('Please select a functional head');
      return;
    }

    try {
      const response = await fetch(`/api/manager/info?displayName=${encodeURIComponent(selectedFunctionalHead)}`);

      if (response.ok) {
        const managerInfo = await response.json();
        setUserInfo({
          id: managerInfo.id,
          email: managerInfo.email || '',
          displayName: managerInfo.displayName,
          isAdmin: false,
        });
        navigate('/functional-head');
      } else {
        setUserInfo({
          id: undefined,
          email: '',
          displayName: selectedFunctionalHead,
          isAdmin: false,
        });
        navigate('/functional-head');
      }
    } catch (err) {
      console.error('Failed to fetch functional head info:', err);
      setUserInfo({
        id: undefined,
        email: '',
        displayName: selectedFunctionalHead,
        isAdmin: false,
      });
      navigate('/functional-head');
    }
  };

  const handleUserLogin = async () => {
    setError('');

    if (!email || email.trim() === '') {
      setError('Please enter your name');
      return;
    }

    // Use the entered name as displayName
    const displayName = email.trim();

    try {
      //Arrange
      const response = await fetch(`/api/manager/info?displayName=${encodeURIComponent(displayName)}`);

      if (response.ok) {
        //Act
        const managerInfo = await response.json();
        setUserInfo({
          id: managerInfo.id,
          email: managerInfo.email || '',
          displayName: managerInfo.displayName,
          isAdmin: false,
        });
        //Assert
        navigate('/user');
      } else {
        setError('Manager not found in the system. Please check the name.');
      }
    } catch (err) {
      console.error('Failed to fetch manager info:', err);
      setError('Failed to fetch manager information. Please try again.');
    }
  };

  const handleOktaLogin = async () => {
    try {
      console.log('🔵 Initiating Okta login...');
      await oktaAuth.signInWithRedirect();
    } catch (error) {
      console.error('❌ Okta login failed:', error);
      setError('Failed to initiate Okta login. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left Side - Rive Animation */}
      <RiveAnimationSection />

      {/* Right Side - Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'linear-gradient(135deg, #0B1220 0%, #12CFC3 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(56, 200, 244, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(103, 221, 248, 0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Card
          sx={{
            maxWidth: 460,
            width: '100%',
            p: 5,
            background: 'rgba(248, 250, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(11, 18, 32, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 25px 70px rgba(11, 18, 32, 0.5)',
              transform: 'translateY(-2px)',
            },
          }}
        >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#0B1220',
              mb: 1,
              fontSize: '1.5rem',
              letterSpacing: '-0.5px',
            }}
          >
            {loginMode === 'admin' && 'Admin Login'}
            {loginMode === 'user' && 'User Login'}
            {loginMode === 'director' && 'Director Login'}
            {loginMode === 'functional-head' && 'Functional Head Login'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#0B1220',
              opacity: 0.7,
              fontSize: '0.875rem',
            }}
          >
            {loginMode === 'admin' && 'Access admin dashboard'}
            {loginMode === 'user' && 'Sign in with your credentials'}
            {loginMode === 'director' && 'View your team hierarchy'}
            {loginMode === 'functional-head' && 'View organization hierarchy'}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 4 }}>
          <Button
            variant={loginMode === 'user' ? 'contained' : 'outlined'}
            onClick={() => setLoginMode('user')}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.813rem',
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(loginMode === 'user' ? {
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                color: '#F8FAFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                },
              } : {
                borderColor: 'rgba(11, 18, 32, 0.2)',
                color: '#0B1220',
                '&:hover': {
                  borderColor: '#12CFC3',
                  background: 'rgba(18, 207, 195, 0.05)',
                },
              }),
            }}
          >
            User
          </Button>
          <Button
            variant={loginMode === 'admin' ? 'contained' : 'outlined'}
            onClick={() => setLoginMode('admin')}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.813rem',
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(loginMode === 'admin' ? {
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                color: '#F8FAFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                },
              } : {
                borderColor: 'rgba(11, 18, 32, 0.2)',
                color: '#0B1220',
                '&:hover': {
                  borderColor: '#12CFC3',
                  background: 'rgba(18, 207, 195, 0.05)',
                },
              }),
            }}
          >
            Admin
          </Button>
          <Button
            variant={loginMode === 'director' ? 'contained' : 'outlined'}
            onClick={() => setLoginMode('director')}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.813rem',
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(loginMode === 'director' ? {
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                color: '#F8FAFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                },
              } : {
                borderColor: 'rgba(11, 18, 32, 0.2)',
                color: '#0B1220',
                '&:hover': {
                  borderColor: '#12CFC3',
                  background: 'rgba(18, 207, 195, 0.05)',
                },
              }),
            }}
          >
            Director
          </Button>
          <Button
            variant={loginMode === 'functional-head' ? 'contained' : 'outlined'}
            onClick={() => setLoginMode('functional-head')}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontSize: '0.813rem',
              fontWeight: 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              ...(loginMode === 'functional-head' ? {
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                color: '#F8FAFF',
                border: 'none',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                },
              } : {
                borderColor: 'rgba(11, 18, 32, 0.2)',
                color: '#0B1220',
                '&:hover': {
                  borderColor: '#12CFC3',
                  background: 'rgba(18, 207, 195, 0.05)',
                },
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
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': { borderColor: 'rgba(11, 18, 32, 0.15)' },
                  '&:hover fieldset': { borderColor: '#12CFC3' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#12CFC3',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
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
                mb: 3.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': { borderColor: 'rgba(11, 18, 32, 0.15)' },
                  '&:hover fieldset': { borderColor: '#12CFC3' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#12CFC3',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
                },
              }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                py: 1.75,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.5px',
                color: '#F8FAFF',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                  transform: 'translateY(-1px)',
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
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': { borderColor: 'rgba(11, 18, 32, 0.15)' },
                  '&:hover fieldset': { borderColor: '#12CFC3' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#12CFC3',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#12CFC3',
                  },
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
                  <MenuItem key={director} value={director} sx={{ fontSize: '0.875rem' }}>
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
                py: 1.5,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.5px',
                color: '#F8FAFF',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
              Login
            </Button>
          </Box>
        ) : loginMode === 'functional-head' ? (
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleFunctionalHeadLogin(); }}>
            <FormControl
              fullWidth
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': { borderColor: 'rgba(11, 18, 32, 0.15)' },
                  '&:hover fieldset': { borderColor: '#12CFC3' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#12CFC3',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '0.875rem',
                  '&.Mui-focused': {
                    color: '#12CFC3',
                  },
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
                  <MenuItem key={fh} value={fh} sx={{ fontSize: '0.875rem' }}>
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
                py: 1.5,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.5px',
                color: '#F8FAFF',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
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
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  backgroundColor: 'rgba(248, 250, 255, 0.5)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& fieldset': { borderColor: 'rgba(11, 18, 32, 0.15)' },
                  '&:hover fieldset': { borderColor: '#12CFC3' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#12CFC3',
                    borderWidth: '2px',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#FFFFFF',
                  },
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
                py: 1.5,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #12CFC3 0%, #0DB7AE 100%)',
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.5px',
                color: '#F8FAFF',
                boxShadow: '0 4px 12px rgba(18, 207, 195, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0DB7AE 0%, #12CFC3 100%)',
                  boxShadow: '0 6px 16px rgba(18, 207, 195, 0.4)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <LoginIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
              Login
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 3, borderColor: 'rgba(11, 18, 32, 0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(11, 18, 32, 0.4)', px: 2 }}>
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleOktaLogin}
          sx={{
            py: 1.5,
            borderRadius: 2.5,
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '0.5px',
            borderColor: '#0B1220',
            color: '#0B1220',
            borderWidth: '2px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderWidth: '2px',
              borderColor: '#12CFC3',
              background: 'rgba(18, 207, 195, 0.05)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <LockIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
          Sign in with Okta SSO
        </Button>

        <Divider sx={{ my: 4, borderColor: 'rgba(11, 18, 32, 0.1)' }} />

        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            display: 'block',
            color: '#0B1220',
            opacity: 0.5,
            fontSize: '0.75rem',
          }}
        >
          © 2026 Tekion. All rights reserved.
        </Typography>
        </Card>
      </Box>
    </Box>
  );
}

