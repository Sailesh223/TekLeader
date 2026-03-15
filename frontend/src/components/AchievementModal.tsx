import { Dialog, DialogContent, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LevelUpAnimation, StreakAnimation, MPLAnimation } from './RiveAnimation';

interface AchievementModalProps {
  open: boolean;
  onClose: () => void;
  type: 'levelup' | 'streak' | 'badge' | 'mpl';
  title?: string;
  message?: string;
}

export default function AchievementModal({
  open,
  onClose,
  type,
  title,
  message,
}: AchievementModalProps) {
  const getAnimation = () => {
    switch (type) {
      case 'levelup':
        return <LevelUpAnimation />;
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          overflow: 'visible',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'white',
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ textAlign: 'center', py: 4 }}>
        <Box sx={{ mb: 2 }}>
          {getAnimation()}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          {title || getDefaultTitle()}
        </Typography>

        {message && (
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            {message}
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

