import { Box, Typography, Chip } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import UserAvatar from '../UserAvatar';
import ScoreProgressBar from './ScoreProgressBar';

interface LeaderboardRowProps {
  rank: number;
  name: string;
  email: string;
  score: number;
  maxScore: number;
  scoreLabel?: string;
  badge?: string;
  badgeColor?: string;
  isCurrentUser?: boolean;
  onClick?: () => void;
}

export default function LeaderboardRow({
  rank,
  name,
  email,
  score,
  maxScore,
  scoreLabel = 'Score',
  badge,
  badgeColor,
  isCurrentUser = false,
  onClick,
}: LeaderboardRowProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        backgroundColor: isCurrentUser ? 'rgba(0, 191, 165, 0.08)' : 'transparent',
        border: isCurrentUser ? '2px solid #00BFA5' : '1px solid transparent',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: isCurrentUser ? 'rgba(0, 191, 165, 0.12)' : '#F8F9FA',
          transform: onClick ? 'translateX(4px)' : 'none',
        },
      }}
    >
      {/* Rank */}
      <Box
        sx={{
          minWidth: 50,
          height: 50,
          borderRadius: '50%',
          background: isCurrentUser
            ? 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)'
            : 'linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: isCurrentUser ? '#FFFFFF' : '#2C3E50',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        #{rank}
      </Box>

      {/* Avatar */}
      <UserAvatar
        name={name}
        email={email}
        sx={{
          width: 50,
          height: 50,
          border: '2px solid #E0E0E0',
        }}
      />

      {/* Name & Email */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: '#2C3E50',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
          }}
        >
          {email}
        </Typography>
      </Box>

      {/* Score & Progress */}
      <Box sx={{ minWidth: 200, display: { xs: 'none', md: 'block' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {scoreLabel}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2C3E50' }}>
            {score.toLocaleString()}
          </Typography>
        </Box>
        <ScoreProgressBar score={score} maxScore={maxScore} />
      </Box>

      {/* Badge */}
      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            backgroundColor: badgeColor || '#FFD700',
            color: '#2C3E50',
            fontWeight: 600,
            display: { xs: 'none', sm: 'flex' },
          }}
        />
      )}

      {/* Mobile Score */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'right' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50' }}>
          {score.toLocaleString()}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {scoreLabel}
        </Typography>
      </Box>
    </Box>
  );
}

