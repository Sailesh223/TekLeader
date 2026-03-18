import { Box, Typography, keyframes } from '@mui/material';
import PodiumCard from './PodiumCard';

interface PodiumEntry {
  name: string;
  email: string;
  score: number;
  badge?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardPodiumProps {
  topThree: PodiumEntry[];
  scoreLabel?: string;
  title?: string;
}

// Animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const dotFlow = keyframes`
  0% { transform: translateY(0) translateX(0); }
  100% { transform: translateY(20px) translateX(10px); }
`;

const floatParticle = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
  50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
`;

export default function LeaderboardPodium({
  topThree,
  scoreLabel = 'Score',
  title = 'Top Performers',
}: LeaderboardPodiumProps) {
  // Ensure we have exactly 3 entries (fill with empty if needed)
  const [first, second, third] = topThree;

  if (!first) return null;

  return (
    <Box
      sx={{
        // Base: Dominant teal gradient foundation
        background: `
          linear-gradient(135deg, #12CFC3 0%, #0FC7BC 25%, #0DB7AE 50%, #5DEEE6 100%)
        `,
        borderRadius: 4,
        p: 4,
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(18, 207, 195, 0.3), 0 0 60px rgba(93, 238, 230, 0.2)',

        // Secondary layer: Soft cyan/blue/periwinkle mesh for depth
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 50% 60%, rgba(103, 221, 248, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(56, 200, 244, 0.35) 0%, transparent 45%),
            radial-gradient(ellipse at 20% 80%, rgba(200, 246, 255, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse at 60% 90%, rgba(217, 228, 255, 0.25) 0%, transparent 35%),
            linear-gradient(to bottom, transparent 60%, rgba(248, 250, 255, 0.4) 100%)
          `,
          pointerEvents: 'none',
          zIndex: 1,
        },

        // Accent layer: Subtle warm atmospheric tints in upper area
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 0% 0%, rgba(74, 86, 120, 0.12) 0%, transparent 30%),
            radial-gradient(ellipse at 50% 0%, rgba(141, 123, 130, 0.1) 0%, transparent 25%),
            radial-gradient(ellipse at 100% 0%, rgba(165, 172, 108, 0.12) 0%, transparent 30%)
          `,
          pointerEvents: 'none',
          zIndex: 2,
        },
      }}
    >
      {/* Dotted overlay - Enhanced white tech grid */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle, rgba(255, 255, 255, 0.5) 1.5px, transparent 1.5px),
            radial-gradient(circle, rgba(255, 255, 255, 0.6) 2px, transparent 2px)
          `,
          backgroundSize: '25px 25px, 50px 50px',
          backgroundPosition: '0 0, 25px 25px',
          opacity: 0.35,
          animation: `${dotFlow} 20s linear infinite`,
          pointerEvents: 'none',
          zIndex: 3,
          // More visible in lower half
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,1) 100%)',
        }}
      />

      {/* Floating Particles - Cool SVG Effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 40,
          height: 40,
          animation: `${floatParticle} 4s ease-in-out infinite`,
          animationDelay: '0s',
          opacity: 0.6,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="8" fill="url(#cyan1)" opacity="0.3" />
          <circle cx="12" cy="12" r="4" fill="url(#cyan1)" />
          <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="url(#cyan1)" opacity="0.8" />
          <defs>
            <linearGradient id="cyan1" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stopColor="#67DDF8" />
              <stop offset="100%" stopColor="#38C8F4" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          width: 35,
          height: 35,
          animation: `${floatParticle} 5s ease-in-out infinite`,
          animationDelay: '1s',
          opacity: 0.5,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="url(#lime1)" opacity="0.7" />
          <circle cx="12" cy="12" r="3" fill="url(#lime1)" />
          <defs>
            <linearGradient id="lime1" x1="2" y1="2" x2="22" y2="22">
              <stop offset="0%" stopColor="#A6B06A" />
              <stop offset="100%" stopColor="#D9E4D4" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          width: 38,
          height: 38,
          animation: `${floatParticle} 4.5s ease-in-out infinite`,
          animationDelay: '2s',
          opacity: 0.55,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="url(#mauve1)" strokeWidth="2" opacity="0.4" />
          <circle cx="12" cy="12" r="6" stroke="url(#mauve1)" strokeWidth="2" opacity="0.6" />
          <circle cx="12" cy="12" r="2" fill="url(#mauve1)" />
          <path d="M12 4V8M12 16V20M20 12H16M8 12H4" stroke="url(#mauve1)" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="mauve1" x1="4" y1="4" x2="20" y2="20">
              <stop offset="0%" stopColor="#9B7A7A" />
              <stop offset="100%" stopColor="#D9E4FF" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '10%',
          width: 36,
          height: 36,
          animation: `${floatParticle} 5.5s ease-in-out infinite`,
          animationDelay: '0.5s',
          opacity: 0.5,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 15,10 23,10 17,15 19,23 12,18 5,23 7,15 1,10 9,10" fill="url(#navy1)" opacity="0.7" />
          <circle cx="12" cy="12" r="4" fill="url(#navy1)" opacity="0.5" />
          <defs>
            <linearGradient id="navy1" x1="1" y1="2" x2="23" y2="23">
              <stop offset="0%" stopColor="#4A5678" />
              <stop offset="100%" stopColor="#67DDF8" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      {/* Title */}
      {title && (
        <Typography
          variant="h3"
          sx={{
            textAlign: 'center',
            color: '#FFFFFF',
            fontWeight: 900,
            mb: 5,
            textShadow: '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '1px',
            position: 'relative',
            zIndex: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 4,
              background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
              borderRadius: 2,
            },
          }}
        >
          {title}
        </Typography>
      )}

      {/* Podium Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 3,
          alignItems: 'end',
          justifyItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Rank 2 - Left */}
        {second && (
          <Box sx={{ order: { xs: 2, md: 1 }, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PodiumCard
              rank={2}
              name={second.name}
              email={second.email}
              score={second.score}
              scoreLabel={scoreLabel}
              badge={second.badge}
              isCurrentUser={second.isCurrentUser}
            />
          </Box>
        )}

        {/* Rank 1 - Center */}
        <Box sx={{ order: { xs: 1, md: 2 }, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <PodiumCard
            rank={1}
            name={first.name}
            email={first.email}
            score={first.score}
            scoreLabel={scoreLabel}
            badge={first.badge}
            isCurrentUser={first.isCurrentUser}
          />
        </Box>

        {/* Rank 3 - Right */}
        {third && (
          <Box sx={{ order: { xs: 3, md: 3 }, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PodiumCard
              rank={3}
              name={third.name}
              email={third.email}
              score={third.score}
              scoreLabel={scoreLabel}
              badge={third.badge}
              isCurrentUser={third.isCurrentUser}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

