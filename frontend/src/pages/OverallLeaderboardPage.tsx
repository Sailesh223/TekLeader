import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { leaderboardApi } from '../api/client';
import { useStore } from '../store/useStore';
import LeaderboardPodium from '../components/leaderboard/LeaderboardPodium';
import LeaderboardListCard from '../components/leaderboard/LeaderboardListCard';

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

  const getBandColor = (band: string) => {
    if (band === 'Gold') return '#FFD700';
    if (band === 'Silver') return '#A0D0E0';
    if (band === 'Bronze') return '#CD7F32';
    return '#95A5A6';
  };

  const getClassificationBand = (entry: OverallEntry): string => {
    if (entry.goldCount > 0) return 'Gold';
    if (entry.silverCount > 0) return 'Silver';
    if (entry.bronzeCount > 0) return 'Bronze';
    return 'Unranked';
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

  // Prepare data for podium (top 3)
  const topThree = leaderboard.slice(0, 3).map((entry, index) => {
    const isCurrentUser = userInfo && (
      entry.displayName.toLowerCase() === userInfo.displayName.toLowerCase() ||
      entry.email.toLowerCase() === userInfo.email.toLowerCase()
    );
    const band = getClassificationBand(entry);

    return {
      name: entry.displayName,
      email: entry.email,
      score: entry.overallXP,
      badge: band !== 'Unranked' ? band : undefined,
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
      const band = getClassificationBand(entry);

      return {
        rank,
        name: entry.displayName,
        email: entry.email,
        score: entry.overallXP,
        badge: band !== 'Unranked' ? band : undefined,
        badgeColor: getBandColor(band),
        isCurrentUser,
      };
    });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, color: '#2C3E50', mb: 1 }}>
          👑 Overall Leaderboard
        </Typography>
        <Typography variant="h6" sx={{ color: '#7F8C8D', fontWeight: 400 }}>
          All-Time Champions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <LeaderboardPodium
          topThree={topThree}
          scoreLabel="Overall XP"
          title="🏆 Top Performers"
        />
      )}

      {/* Remaining Rankings */}
      {remainingEntries.length > 0 && (
        <LeaderboardListCard
          entries={remainingEntries}
          scoreLabel="Overall XP"
          showAll={showAll}
          onToggleShowAll={() => setShowAll(!showAll)}
        />
      )}
    </Container>
  );
}

