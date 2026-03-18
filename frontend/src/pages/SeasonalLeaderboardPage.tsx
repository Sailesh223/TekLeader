import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { leaderboardApi } from '../api/client';
import { useStore } from '../store/useStore';
import LeaderboardPodium from '../components/leaderboard/LeaderboardPodium';
import LeaderboardListCard from '../components/leaderboard/LeaderboardListCard';

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
      case 'Silver': return '#A0D0E0';
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

  // Prepare data for podium (top 3)
  const topThree = leaderboard.slice(0, 3).map((entry, index) => {
    const isCurrentUser = userInfo && (
      entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
      entry.email.toLowerCase() === userInfo.email.toLowerCase()
    );

    return {
      name: entry.displayName,
      email: entry.email,
      score: entry.seasonalXP,
      badge: entry.bestBand !== 'Unranked' ? entry.bestBand : undefined,
      isCurrentUser,
    };
  });

  // Prepare data for list (rank 4+)
  const remainingEntries = (showAll ? leaderboard : leaderboard.slice(0, 20))
    .slice(3)
    .map((entry, index) => {
      const rank = index + 4;
      const isCurrentUser = userInfo && (
        entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
        entry.email.toLowerCase() === userInfo.email.toLowerCase()
      );

      return {
        rank,
        name: entry.displayName,
        email: entry.email,
        score: entry.seasonalXP,
        badge: entry.bestBand !== 'Unranked' ? entry.bestBand : undefined,
        badgeColor: getBandColor(entry.bestBand),
        isCurrentUser,
      };
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2C3E50', mb: 1 }}>
          🏆 Seasonal Leaderboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#7F8C8D', fontWeight: 400 }}>
          Quarterly Performance Rankings
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Season Selector */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel id="season-select-label">Select Season</InputLabel>
          <Select
            labelId="season-select-label"
            id="season-select"
            value={selectedSeason}
            label="Select Season"
            onChange={(e) => setSelectedSeason(e.target.value)}
            sx={{
              borderRadius: 2,
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

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <LeaderboardPodium
          topThree={topThree}
          scoreLabel="Seasonal XP"
          title="🏆 Top Performers"
        />
      )}

      {/* Remaining Rankings */}
      {remainingEntries.length > 0 && (
        <LeaderboardListCard
          entries={remainingEntries}
          scoreLabel="Seasonal XP"
          showAll={showAll}
          onToggleShowAll={() => setShowAll(!showAll)}
        />
      )}
    </Container>
  );
}

