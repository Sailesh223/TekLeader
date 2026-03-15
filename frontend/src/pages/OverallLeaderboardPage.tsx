import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Button,
} from '@mui/material';
import { EmojiEvents, Whatshot, TrendingUp } from '@mui/icons-material';
import { leaderboardApi } from '../api/client';
import { useStore } from '../store/useStore';

interface OverallEntry {
  managerId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  overallXP: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalMonths: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

// Exponential leveling helper functions
const calculateLevel = (xp: number): number => {
  if (xp <= 0) return 1;

  let level = 1;
  let xpRequired = 200;
  let accumulatedXP = 0;

  while (accumulatedXP + xpRequired <= xp) {
    accumulatedXP += xpRequired;
    level++;
    xpRequired *= 2;
  }

  return level;
};

const getXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.pow(2, i - 1) * 200;
  }
  return total;
};

const getLevelProgress = (currentXP: number): number => {
  const currentLevel = calculateLevel(currentXP);
  const xpForCurrentLevel = getXPForLevel(currentLevel);
  const xpForNextLevel = getXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  return (xpInCurrentLevel / xpNeededForLevel) * 100;
};

export default function OverallLeaderboardPage() {
  const { userInfo } = useStore();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<OverallEntry[]>([]);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadOverallLeaderboard();
  }, []);

  const loadOverallLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await leaderboardApi.getOverallLeaderboard();
      setLeaderboard(data);
    } catch (err: any) {
      setError('Failed to load overall leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Get entries to display: top 10 + current user if not in top 10
  const getDisplayedEntries = () => {
    if (showAll) {
      return leaderboard;
    }

    const topTen = leaderboard.slice(0, 10);

    if (!userInfo) {
      return topTen;
    }

    // Find current user in the list
    const currentUserIndex = leaderboard.findIndex(
      entry => entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
               entry.email.toLowerCase() === userInfo.email.toLowerCase()
    );

    // If user is not in top 10 and exists in the list, add them
    if (currentUserIndex >= 10) {
      return [...topTen, leaderboard[currentUserIndex]];
    }

    return topTen;
  };

  const displayedEntries = getDisplayedEntries();
  const hasMore = leaderboard.length > 10 && !showAll;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#2C3E50', mb: 1 }}>
          👑 Overall Leaderboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#7F8C8D' }}>
          All-Time Champions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Overall XP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Level</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Streak</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Avg Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Badges</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedEntries.map((entry, displayIndex) => {
                  const actualRank = leaderboard.findIndex(e => e.managerId === entry.managerId) + 1;
                  const isCurrentUser = userInfo && (
                    entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
                    entry.email.toLowerCase() === userInfo.email.toLowerCase()
                  );
                  const isOutsideTopTen = actualRank > 10 && isCurrentUser;

                  return (
                    <>
                      {isOutsideTopTen && (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="body2" sx={{ color: '#7F8C8D', fontStyle: 'italic' }}>
                              ... {actualRank - 11} more managers ...
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow
                        key={entry.managerId}
                        sx={{
                          '&:hover': { backgroundColor: '#F8F9FA' },
                          backgroundColor: isCurrentUser
                            ? 'rgba(0, 191, 165, 0.1)'
                            : actualRank <= 3 ? '#FFFBF0' : 'inherit',
                          border: isCurrentUser ? '2px solid #00BFA5' : 'none',
                        }}
                      >
                        <TableCell>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {getRankMedal(actualRank)}
                          </Typography>
                        </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={entry.avatarUrl} sx={{ width: 40, height: 40 }}>
                          {entry.displayName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {entry.displayName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.totalMonths} months active
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                          {entry.overallXP?.toFixed(0) || 0}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getLevelProgress(entry.overallXP || 0)}
                          sx={{ mt: 1, height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`Level ${calculateLevel(entry.overallXP || 0)}`}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Whatshot sx={{ color: entry.currentStreak > 0 ? '#FF6B6B' : '#BDC3C7' }} />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {entry.currentStreak || 0}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (Best: {entry.longestStreak || 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={entry.averageScore?.toFixed(2) || '0.00'}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        {entry.goldCount > 0 && (
                          <Chip label={`🥇 ${entry.goldCount}`} size="small" sx={{ backgroundColor: '#FFD700' }} />
                        )}
                        {entry.silverCount > 0 && (
                          <Chip label={`🥈 ${entry.silverCount}`} size="small" sx={{ backgroundColor: '#C0C0C0' }} />
                        )}
                        {entry.bronzeCount > 0 && (
                          <Chip label={`🥉 ${entry.bronzeCount}`} size="small" sx={{ backgroundColor: '#CD7F32' }} />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {hasMore && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setShowAll(true)}
                sx={{
                  borderColor: '#00BFA5',
                  color: '#00BFA5',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#00897B',
                    bgcolor: 'rgba(0, 191, 165, 0.1)',
                  },
                }}
              >
                Show All {leaderboard.length} Managers
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

