import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import LeaderboardRow from './LeaderboardRow';

interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  score: number;
  badge?: string;
  badgeColor?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardListCardProps {
  entries: LeaderboardEntry[];
  scoreLabel?: string;
  showAll?: boolean;
  onToggleShowAll?: () => void;
  onRowClick?: (entry: LeaderboardEntry) => void;
}

export default function LeaderboardListCard({
  entries,
  scoreLabel = 'Score',
  showAll = false,
  onToggleShowAll,
  onRowClick,
}: LeaderboardListCardProps) {
  if (entries.length === 0) {
    return (
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: '#FFFFFF',
        }}
      >
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No additional rankings to display
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const maxScore = entries.length > 0 ? Math.max(...entries.map((e) => e.score)) : 1;
  const displayedEntries = showAll ? entries : entries.slice(0, 7);

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#2C3E50',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #E0E0E0',
          }}
        >
          Rankings
        </Typography>

        {/* Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {displayedEntries.map((entry) => (
            <LeaderboardRow
              key={entry.rank}
              rank={entry.rank}
              name={entry.name}
              email={entry.email}
              score={entry.score}
              maxScore={maxScore}
              scoreLabel={scoreLabel}
              badge={entry.badge}
              badgeColor={entry.badgeColor}
              isCurrentUser={entry.isCurrentUser}
              onClick={onRowClick ? () => onRowClick(entry) : undefined}
            />
          ))}
        </Box>

        {/* Show More/Less Button */}
        {entries.length > 7 && onToggleShowAll && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={onToggleShowAll}
              endIcon={showAll ? <ExpandLess /> : <ExpandMore />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#00BFA5',
                color: '#00BFA5',
                '&:hover': {
                  borderColor: '#00897B',
                  backgroundColor: 'rgba(0, 191, 165, 0.08)',
                },
              }}
            >
              {showAll ? 'Show Less' : `Show All (${entries.length})`}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

