import { Box, Typography, Card, CardContent, keyframes } from '@mui/material';
import { EmojiEvents, Star, Whatshot, TrendingUp } from '@mui/icons-material';
import UserAvatar from '../UserAvatar';

interface PodiumCardProps {
  rank: 1 | 2 | 3;
  name: string;
  email: string;
  score: number;
  scoreLabel?: string;
  badge?: string;
  isCurrentUser?: boolean;
}

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
`;

export default function PodiumCard({
  rank,
  name,
  email,
  score,
  scoreLabel = 'Score',
  badge,
  isCurrentUser = false,
}: PodiumCardProps) {
  const isWinner = rank === 1;
  const cardHeight = isWinner ? 300 : 260;
  const avatarSize = isWinner ? 110 : 85;

  const getRankColor = () => {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #E8F4F8 0%, #B8DCE8 50%, #A0D0E0 100%)';
    return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 50%, #8B4513 100%)';
  };

  const getCardGradient = () => {
    if (rank === 1) return 'linear-gradient(135deg, #FFF9E6 0%, #FFE5B4 50%, #FFD700 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #E8F4F8 0%, #D0E8F0 30%, #B8DCE8 60%, #A0D0E0 100%)';
    return 'linear-gradient(135deg, #FFF5E6 0%, #FFE4C4 50%, #DEB887 100%)';
  };

  const getRankIcon = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    return '🥉';
  };

  const getRankLabel = () => {
    if (rank === 1) return 'Gold';
    if (rank === 2) return 'Silver';
    return 'Bronze';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        mt: isWinner ? 0 : 4,
        animation: isWinner ? `${float} 3s ease-in-out infinite` : 'none',
      }}
    >
      {/* Sparkle Effects for Winner - Cool SVG particles */}
      {isWinner && (
        <>
          {/* Top Left Sparkle */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              left: '10%',
              width: 20,
              height: 20,
              animation: `${sparkle} 2s ease-in-out infinite`,
              animationDelay: '0s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#gold1)" />
              <defs>
                <linearGradient id="gold1" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
              </defs>
            </svg>
          </Box>

          {/* Top Right Sparkle */}
          <Box
            sx={{
              position: 'absolute',
              top: -30,
              right: '10%',
              width: 18,
              height: 18,
              animation: `${sparkle} 2s ease-in-out infinite`,
              animationDelay: '1s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" fill="url(#gold2)" />
              <path d="M12 2V6M12 18V22M22 12H18M6 12H2M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="url(#gold2)" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="gold2" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FF6B35" />
                </linearGradient>
              </defs>
            </svg>
          </Box>

          {/* Left Side Particle */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: -25,
              width: 16,
              height: 16,
              animation: `${sparkle} 2.5s ease-in-out infinite`,
              animationDelay: '0.5s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" fill="url(#gold3)" opacity="0.8" />
              <defs>
                <linearGradient id="gold3" x1="2" y1="2" x2="22" y2="22">
                  <stop offset="0%" stopColor="#FFD700" />
                  <stop offset="100%" stopColor="#FFED4E" />
                </linearGradient>
              </defs>
            </svg>
          </Box>

          {/* Right Side Particle */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: -25,
              width: 16,
              height: 16,
              animation: `${sparkle} 2.5s ease-in-out infinite`,
              animationDelay: '1.5s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" fill="url(#gold4)" opacity="0.8" />
              <defs>
                <linearGradient id="gold4" x1="1" y1="2" x2="23" y2="23">
                  <stop offset="0%" stopColor="#FFA500" />
                  <stop offset="100%" stopColor="#FFD700" />
                </linearGradient>
              </defs>
            </svg>
          </Box>
        </>
      )}

      {/* Rank Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: -25,
          zIndex: 2,
          width: isWinner ? 70 : 60,
          height: isWinner ? 70 : 60,
          borderRadius: '50%',
          background: getRankColor(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isWinner
            ? '0 8px 20px rgba(255, 215, 0, 0.5)'
            : '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: isWinner ? '2rem' : '1.5rem',
          animation: isWinner ? `${pulse} 2s ease-in-out infinite, ${glow} 2s ease-in-out infinite` : rank === 2 ? `${pulse} 3s ease-in-out infinite` : 'none',
          border: isWinner ? '3px solid #FFF' : '2px solid #FFF',
        }}
      >
        {getRankIcon()}
      </Box>

      {/* Card */}
      <Card
        sx={{
          width: '100%',
          maxWidth: isWinner ? 280 : 240,
          height: cardHeight,
          background: isCurrentUser
            ? 'linear-gradient(135deg, rgba(0, 191, 165, 0.2) 0%, rgba(0, 137, 123, 0.1) 100%)'
            : getCardGradient(),
          border: isCurrentUser
            ? '3px solid #00BFA5'
            : isWinner
            ? '3px solid #FFD700'
            : rank === 2
            ? '3px solid #A0D0E0'
            : '3px solid #CD7F32',
          borderRadius: 4,
          boxShadow: isWinner
            ? '0 12px 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)'
            : rank === 2
            ? '0 8px 30px rgba(160, 208, 224, 0.5), 0 4px 15px rgba(184, 220, 232, 0.3)'
            : '0 8px 30px rgba(205, 127, 50, 0.3)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': isWinner ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: `${shimmer} 3s infinite`,
          } : {},
          '&:hover': {
            transform: isWinner ? 'translateY(-12px) scale(1.02)' : 'translateY(-8px) scale(1.02)',
            boxShadow: isWinner
              ? '0 16px 50px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.3)'
              : rank === 2
              ? '0 12px 40px rgba(160, 208, 224, 0.6), 0 6px 20px rgba(184, 220, 232, 0.4)'
              : '0 12px 40px rgba(205, 127, 50, 0.5)',
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            pt: 5,
            position: 'relative',
          }}
        >
          {/* Crown for Winner */}
          {isWinner && (
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                fontSize: '2.5rem',
                animation: `${rotate} 20s linear infinite`,
                filter: 'drop-shadow(0 4px 8px rgba(255, 215, 0, 0.5))',
              }}
            >
              👑
            </Box>
          )}

          {/* Avatar */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <UserAvatar
              name={name}
              email={email}
              sx={{
                width: avatarSize,
                height: avatarSize,
                border: isWinner
                  ? '5px solid #FFD700'
                  : rank === 2
                  ? '4px solid #C0C0C0'
                  : '4px solid #CD7F32',
                boxShadow: isWinner
                  ? '0 8px 24px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)'
                  : '0 4px 12px rgba(0,0,0,0.2)',
                animation: isWinner ? `${pulse} 2s ease-in-out infinite` : 'none',
              }}
            />
            {/* Fire icon for winner */}
            {isWinner && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%)',
                  borderRadius: '50%',
                  width: 35,
                  height: 35,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)',
                  animation: `${pulse} 1.5s ease-in-out infinite`,
                }}
              >
                <Whatshot sx={{ fontSize: 20, color: '#FFF' }} />
              </Box>
            )}
            {/* Trending icon for 2nd place */}
            {rank === 2 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -5,
                  background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 191, 165, 0.4)',
                }}
              >
                <TrendingUp sx={{ fontSize: 18, color: '#FFF' }} />
              </Box>
            )}
          </Box>

          {/* Name */}
          <Typography
            variant={isWinner ? 'h6' : 'body1'}
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 0.5,
              color: '#2C3E50',
              textShadow: isWinner ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {name}
          </Typography>

          {/* Score */}
          <Typography
            variant={isWinner ? 'h3' : 'h5'}
            sx={{
              fontWeight: 900,
              background: getRankColor(),
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '-0.5px',
            }}
          >
            {score.toLocaleString()}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {scoreLabel}
          </Typography>

          {/* Badge - Always show rank-based label for podium positions */}
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              background: isWinner
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : rank === 2
                ? 'linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%)'
                : 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            <Star sx={{ fontSize: 16, color: '#FFF' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#FFF' }}>
              {getRankLabel()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

