import { Box, LinearProgress } from '@mui/material';

interface ScoreProgressBarProps {
  score: number;
  maxScore: number;
  color?: string;
}

export default function ScoreProgressBar({ score, maxScore, color = '#00BFA5' }: ScoreProgressBarProps) {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <LinearProgress
        variant="determinate"
        value={Math.min(percentage, 100)}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(0, 191, 165, 0.1)',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          },
        }}
      />
    </Box>
  );
}

