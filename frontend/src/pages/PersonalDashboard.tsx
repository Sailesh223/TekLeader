import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  LinearProgress,
  Paper,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { managerApi, leaderboardApi, ManagerHistoryResponse } from '../api/client';
import { useStore } from '../store/useStore';
import { bandColors } from '../theme';
import PerformanceCharts from '../components/PerformanceCharts';
import TeamMemberFilters from '../components/TeamMemberFilters';
import { exportTeamMembersToCSV } from '../utils/exportUtils';

const MotionCard = motion(Card);

export default function PersonalDashboard() {
  const { userInfo } = useStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ManagerHistoryResponse | null>(null);
  const [totalManagers, setTotalManagers] = useState<number>(0);
  const [utilizationFilter, setUtilizationFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    if (userInfo?.displayName) {
      loadHistory();
    }
  }, [userInfo]);

  const loadHistory = async () => {
    if (!userInfo?.displayName) return;

    setLoading(true);
    setError(null);

    try {
      const response = await managerApi.getHistory(userInfo.displayName);
      setData(response);

      // Get total managers count from the latest month
      if (response.history.length > 0) {
        const latestMonth = response.history[0].month;
        const leaderboardResponse = await leaderboardApi.getLeaderboard(latestMonth, 'all', 'all', '', 0, 1000);
        setTotalManagers(leaderboardResponse.totalElements);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your performance history');
    } finally {
      setLoading(false);
    }
  };

  // Filter team members - MUST be before any conditional returns
  const filteredTeamMembers = useMemo(() => {
    if (!data?.teamMembers) return [];

    return data.teamMembers.filter((member) => {
      // Utilization filter
      if (utilizationFilter === 'utilizing' && !member.isUtilizing) return false;
      if (utilizationFilter === 'not-utilizing' && member.isUtilizing) return false;

      // Department filter
      if (departmentFilter !== 'all' && member.department !== departmentFilter) return false;

      return true;
    });
  }, [data?.teamMembers, utilizationFilter, departmentFilter]);

  // Get unique departments - MUST be before any conditional returns
  const departments = useMemo(() => {
    if (!data?.teamMembers) return [];
    return Array.from(new Set(data.teamMembers.map((m) => m.department))).sort();
  }, [data?.teamMembers]);

  const handleExportCSV = () => {
    if (filteredTeamMembers && data?.manager) {
      exportTeamMembersToCSV(filteredTeamMembers, data.manager.displayName);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} sx={{ color: '#00BFA5' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data) return null;

  const { manager, history, summary, allBadges, teamMembers } = data;
  const latestPerformance = history[0];

  const getBandColor = (band: string) => {
    return bandColors[band as keyof typeof bandColors]?.main || '#999';
  };

  const getTrendIcon = () => {
    if (summary.trend === 'improving') return <TrendingUpIcon sx={{ color: '#4CAF50' }} />;
    if (summary.trend === 'declining') return <TrendingDownIcon sx={{ color: '#F44336' }} />;
    return <TimelineIcon sx={{ color: '#FF9800' }} />;
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto 16px',
            bgcolor: '#00BFA5',
            fontSize: '2.5rem',
            fontWeight: 700,
          }}
        >
          {manager.displayName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#00897B', mb: 1 }}>
          Welcome back, {manager.displayName}! 👋
        </Typography>
        <Typography variant="h6" sx={{ color: '#00BFA5', fontWeight: 500 }}>
          {summary.motivationalMessage}
        </Typography>
      </Box>

      {/* Current Performance Card */}
      {latestPerformance && (
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${getBandColor(latestPerformance.classificationBand)}15 0%, rgba(255, 255, 255, 0.98) 100%)`,
            border: `3px solid ${getBandColor(latestPerformance.classificationBand)}`,
            borderRadius: 3,
            boxShadow: `0 8px 32px ${getBandColor(latestPerformance.classificationBand)}30`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: '#00BFA5', mb: 1 }}>
                  #{latestPerformance.rank}
                </Typography>
                <Typography variant="body1" sx={{ color: '#00897B', fontWeight: 500 }}>
                  Current Rank
                </Typography>
                {latestPerformance.rankChange !== null && latestPerformance.rankChange !== 0 && (
                  <Chip
                    label={`${latestPerformance.rankChange > 0 ? '↑' : '↓'} ${Math.abs(latestPerformance.rankChange)} ranks`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: latestPerformance.rankChange > 0 ? '#4CAF5020' : '#F4433620',
                      color: latestPerformance.rankChange > 0 ? '#4CAF50' : '#F44336',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Typography variant="h2" sx={{ fontWeight: 700, color: '#FFD700', mb: 1 }}>
                  {latestPerformance.finalScore.toFixed(1)}
                </Typography>
                <Typography variant="body1" sx={{ color: '#00897B', fontWeight: 500 }}>
                  Final Score
                </Typography>
                {summary.scoreChange !== 0 && (
                  <Chip
                    label={`${summary.scoreChange > 0 ? '+' : ''}${summary.scoreChange.toFixed(1)} pts`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: summary.scoreChange > 0 ? '#4CAF5020' : '#F4433620',
                      color: summary.scoreChange > 0 ? '#4CAF50' : '#F44336',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Chip
                  label={latestPerformance.classificationBand}
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    py: 3,
                    px: 2,
                    bgcolor: getBandColor(latestPerformance.classificationBand),
                    color: '#fff',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#00897B', fontWeight: 500, mt: 2 }}>
                  {latestPerformance.month}
                </Typography>
              </Grid>

              <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  {getTrendIcon()}
                  <Typography variant="h6" sx={{ ml: 1, fontWeight: 600, color: '#00897B', textTransform: 'capitalize' }}>
                    {summary.trend}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {summary.consecutiveImprovements > 0 && `${summary.consecutiveImprovements} months improving`}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </MotionCard>
      )}

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)',
              border: '2px solid #FFD70040',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <TrophyIcon sx={{ fontSize: 48, color: '#FFD700', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B' }}>
                #{summary.bestRank}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Best Rank
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                {summary.bestRankMonth}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            sx={{
              background: 'linear-gradient(135deg, rgba(0, 191, 165, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)',
              border: '2px solid #00BFA540',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <TimelineIcon sx={{ fontSize: 48, color: '#00BFA5', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B' }}>
                {summary.averageScore.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Average Score
              </Typography>
              <Typography variant="caption" sx={{ color: '#999' }}>
                Over {summary.totalMonths} months
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)',
              border: '2px solid #4CAF5040',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B' }}>
                {summary.averageUtilization.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Avg Utilization
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)',
              border: '2px solid #FF980040',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 48, color: '#FF9800', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B' }}>
                {summary.totalBadges}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                Badges Earned
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Performance History */}
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 3 }}>
        📊 Performance History
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {history.map((perf, index) => (
          <Grid item xs={12} key={perf.month}>
            <MotionCard
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.1) 100%)',
                border: '2px solid rgba(0, 191, 165, 0.2)',
                borderRadius: 2,
                '&:hover': {
                  border: '2px solid #00BFA5',
                  boxShadow: '0 4px 20px rgba(0, 191, 165, 0.2)',
                },
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#00897B' }}>
                      {perf.month}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={1}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                        #{perf.rank}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>Rank</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFD700' }}>
                        {perf.finalScore.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>Score</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#666' }}>Utilization</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={perf.utilization}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: perf.utilization >= 80 ? '#4CAF50' : perf.utilization >= 60 ? '#FF9800' : '#F44336',
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#00897B', fontWeight: 600 }}>
                        {perf.utilization.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Chip
                      label={perf.classificationBand}
                      size="small"
                      sx={{
                        bgcolor: getBandColor(perf.classificationBand),
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {perf.badges.map((badge) => (
                        <Chip
                          key={badge.id}
                          label={badge.code}
                          size="small"
                          icon={<StarIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            bgcolor: badge.color || '#FF9800',
                            color: '#fff',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Performance Analytics */}
      {history && history.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 3 }}>
            📊 Performance Analytics
          </Typography>
          <PerformanceCharts history={history} totalManagers={totalManagers} />
        </>
      )}

      {/* Team Members Section */}
      {teamMembers && teamMembers.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 32 }} />
              Your Team ({teamMembers.length} members)
            </Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                bgcolor: '#00BFA5',
                '&:hover': { bgcolor: '#00897B' },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Export CSV
            </Button>
          </Box>

          <TeamMemberFilters
            utilizationFilter={utilizationFilter}
            departmentFilter={departmentFilter}
            departments={departments}
            onUtilizationFilterChange={setUtilizationFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            totalCount={teamMembers.length}
            filteredCount={filteredTeamMembers.length}
          />

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {filteredTeamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  sx={{
                    background: member.isUtilizing
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)'
                      : 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 255, 255, 0.98) 100%)',
                    border: member.isUtilizing ? '2px solid #4CAF5040' : '2px solid #FF980040',
                    borderRadius: 2,
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: member.isUtilizing ? '#4CAF50' : '#FF9800',
                          mr: 1.5,
                        }}
                      >
                        {member.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#00897B' }}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {member.department}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          1:1s Participated
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: member.participated1on1 ? '#4CAF50' : '#FF9800' }}>
                          {member.oneOnOnesCount} / {member.oneOnOnesSetUp}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={member.oneOnOnesSetUp > 0 ? (member.oneOnOnesCount / member.oneOnOnesSetUp) * 100 : 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#E0E0E0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: member.participated1on1 ? '#4CAF50' : '#FF9800',
                          },
                        }}
                      />
                      <Chip
                        label={member.isUtilizing ? '✓ Utilizing' : '⚠ Not Utilizing'}
                        size="small"
                        sx={{
                          mt: 1,
                          bgcolor: member.isUtilizing ? '#4CAF5020' : '#FF980020',
                          color: member.isUtilizing ? '#4CAF50' : '#FF9800',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Badges Showcase */}
      {allBadges.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 3 }}>
            🏅 Your Badges ({allBadges.length})
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {allBadges.map((badge) => (
              <Grid item xs={6} sm={4} md={3} key={badge.id}>
                <MotionCard
                  whileHover={{ scale: 1.05 }}
                  sx={{
                    background: `linear-gradient(135deg, ${badge.color}20 0%, rgba(255, 255, 255, 0.98) 100%)`,
                    border: `2px solid ${badge.color}40`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <CardContent>
                    <StarIcon sx={{ fontSize: 48, color: badge.color, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#00897B' }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {badge.month}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}

