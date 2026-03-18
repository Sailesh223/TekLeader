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
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { EmojiEvents, TrendingUp, CalendarMonth } from '@mui/icons-material';
import { leaderboardApi } from '../api/client';
import { useStore } from '../store/useStore';

interface SeasonalEntry {
  managerId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  averageScore: number;
  seasonalXP: number;
  monthsActive: number;
  bestBand: string;
}

export default function SeasonalLeaderboardPage() {
  const { userInfo } = useStore();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<SeasonalEntry[]>([]);
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadAvailableSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      loadSeasonalLeaderboard(selectedSeason);
    }
  }, [selectedSeason]);

  const loadAvailableSeasons = async () => {
    setLoading(true);
    setError('');
    try {
      const seasonsData = await leaderboardApi.getAvailableSeasons();
      setAvailableSeasons(seasonsData.seasons);
      setSelectedSeason(seasonsData.latestSeason);
    } catch (err: any) {
      setError('Failed to load available seasons');
      console.error(err);
      setLoading(false);
    }
  };

  const loadSeasonalLeaderboard = async (season: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await leaderboardApi.getSeasonalLeaderboard(season);
      setLeaderboard(data);
    } catch (err: any) {
      setError('Failed to load seasonal leaderboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band: string) => {
    switch (band) {
      case 'Gold': return '#FFD700';
      case 'Silver': return '#C0C0C0';
      case 'Bronze': return '#CD7F32';
      default: return '#95A5A6';
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

  // Find current user's rank
  const currentUserRank = userInfo ? leaderboard.findIndex(
    entry => entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
             entry.email.toLowerCase() === userInfo.email.toLowerCase()
  ) + 1 : -1;

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
          🏆 Seasonal Leaderboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#7F8C8D' }}>
          Quarterly Performance Rankings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Season Selector */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <CalendarMonth sx={{ color: '#00BFA5', fontSize: 32 }} />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="season-select-label">Select Season</InputLabel>
          <Select
            labelId="season-select-label"
            id="season-select"
            value={selectedSeason}
            label="Select Season"
            onChange={(e) => setSelectedSeason(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00BFA5',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00897B',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00BFA5',
              },
            }}
          >
            {availableSeasons.map((season) => (
              <MenuItem key={season} value={season}>
                {season}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Avg Score</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Seasonal XP</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Months Active</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Best Band</TableCell>
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
                          <TableCell colSpan={6} sx={{ textAlign: 'center', py: 2 }}>
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
                            {entry.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={entry.averageScore.toFixed(2)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1" sx={{ fontWeight: 600, color: '#00BFA5' }}>
                        {entry.seasonalXP?.toFixed(0) || 0} XP
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{entry.monthsActive}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={entry.bestBand}
                        sx={{
                          backgroundColor: getBandColor(entry.bestBand),
                          color: '#000',
                          fontWeight: 600,
                        }}
                        size="small"
                      />
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

