import { Dialog, Box, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { MonitorLevelUpAnimation, StreakAnimation, MPLAnimation } from './RiveAnimation';
import GameControllerAnimation from './GameControllerAnimation';

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  type: 'levelup' | 'streak' | 'badge' | 'mpl' | 'seasonal';
  title?: string;
  message?: string;
  xp?: number;
  level?: number;
  progress?: number;
  xpToNext?: number;
  avatarUrl?: string;
  displayName?: string;
}

export default function AchievementModal({
  open,
  onClose,
  type,
  title,
  message,
  xp = 0,
  level = 1,
  progress = 0,
  xpToNext = 0,
  avatarUrl = '',
  displayName = '',
}: AchievementModalProps) {
  const getAnimation = () => {
    switch (type) {
      case 'levelup':
        return (
          <Box sx={{
            background: 'rgba(102, 126, 234, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: 2.5,
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Level Text at Top with Retro Animation */}
            <Typography
              sx={{
                fontSize: '1.8rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #f4f8fe 0%, #e3ebfa 25%, #c7cbe7 50%, #92aef4 75%, #b498b7 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                textShadow: 'none',
                letterSpacing: '0.1em',
                mb: 1,
                mt: 2,
                animation: 'gradientPulse 3s ease-in-out infinite, float 3s ease-in-out infinite',
                '@keyframes gradientPulse': {
                  '0%, 100%': {
                    backgroundPosition: '0% 50%',
                    filter: 'brightness(1)',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                    filter: 'brightness(1.3)',
                  },
                },
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-8px)' },
                },
              }}
            >
              LEVEL {level}
            </Typography>

            {/* Current XP Score */}
            <Typography
              variant="h4"
              sx={{
                color: '#FFD700',
                fontWeight: 900,
                textAlign: 'center',
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                textShadow: '0 0 10px rgba(255,215,0,0.6), 2px 2px 0px rgba(0,0,0,0.5)',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              {xp.toFixed(0)} XP
            </Typography>

            {/* Rive Animation - Console */}
            <Box sx={{
              width: '350px',
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              '& > div': {
                width: '100%',
                height: '100%',
              }
            }}>
              <MonitorLevelUpAnimation level={level} />
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', px: 1 }}>
              <Box sx={{
                width: '100%',
                height: 14,
                bgcolor: 'rgba(0,0,0,0.4)',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 1,
                border: '2px solid rgba(255,255,255,0.3)',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}>
                <Box sx={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #FF1493, #FFD700, #FF1493)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 10px rgba(255,215,0,0.5)',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                  },
                }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  letterSpacing: '0.05em',
                }}
              >
                {xpToNext} XP → LVL {level + 1}
              </Typography>
            </Box>
          </Box>
        );
      case 'seasonal':
        return (
          <Box sx={{
            background: 'rgba(0, 191, 165, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            padding: 2.5,
            maxWidth: '400px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Level Text at Top with Retro Animation */}
            <Typography
              sx={{
                fontSize: '1.8rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #f4f8fe 0%, #e3ebfa 25%, #c7cbe7 50%, #92aef4 75%, #b498b7 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                textShadow: 'none',
                letterSpacing: '0.1em',
                mb: 1,
                mt: 2,
                animation: 'gradientPulse 3s ease-in-out infinite, float 3s ease-in-out infinite',
                '@keyframes gradientPulse': {
                  '0%, 100%': {
                    backgroundPosition: '0% 50%',
                    filter: 'brightness(1)',
                  },
                  '50%': {
                    backgroundPosition: '100% 50%',
                    filter: 'brightness(1.3)',
                  },
                },
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-8px)' },
                },
              }}
            >
              LEVEL {level}
            </Typography>

            {/* Current XP Score */}
            <Typography
              variant="h4"
              sx={{
                color: '#00E5FF',
                fontWeight: 900,
                textAlign: 'center',
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                textShadow: '0 0 10px rgba(0,229,255,0.6), 2px 2px 0px rgba(0,0,0,0.5)',
                letterSpacing: '0.05em',
                mb: 2,
              }}
            >
              {xp.toFixed(0)} XP
            </Typography>

            {/* Rive Animation - Game Controller */}
            <Box sx={{
              width: '350px',
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              '& > div': {
                width: '100%',
                height: '100%',
              }
            }}>
              <GameControllerAnimation level={level} />
            </Box>

            {/* Progress Bar */}
            <Box sx={{ width: '100%', px: 1 }}>
              <Box sx={{
                width: '100%',
                height: 14,
                bgcolor: 'rgba(0,0,0,0.4)',
                borderRadius: 2,
                overflow: 'hidden',
                mb: 1,
                border: '2px solid rgba(255,255,255,0.3)',
                position: 'relative',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
              }}>
                <Box sx={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00BFA5, #00E5FF, #00BFA5)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                  transition: 'width 0.5s ease',
                  boxShadow: '0 0 10px rgba(0,191,165,0.5)',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' },
                  },
                }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  letterSpacing: '0.05em',
                }}
              >
                {xpToNext} XP → LVL {level + 1}
              </Typography>
            </Box>
          </Box>
        );
      case 'streak':
        return <StreakAnimation />;
      case 'mpl':
        return <MPLAnimation />;
      default:
        return null;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'levelup':
        return '🎉 Level Up!';
      case 'seasonal':
        return '🎮 Seasonal Level Up!';
      case 'streak':
        return '🔥 Streak Achievement!';
      case 'badge':
        return '🏆 Badge Earned!';
      case 'mpl':
        return '⭐ MPL Achievement!';
      default:
        return 'Achievement Unlocked!';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          },
          timeout: 300,
        },
      }}
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
        },
      }}
      TransitionProps={{
        timeout: {
          enter: 300,
          exit: 200,
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.5)',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.7)',
          },
          zIndex: 100,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {getAnimation()}
      </Box>
    </Dialog>
  );
}

