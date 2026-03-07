import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { leaderboardApi, ManagerEntry } from '../api/client';
import { useStore } from '../store/useStore';
import { bandColors } from '../theme';
import {
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  FitnessCenter as DumbbellIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const badgeIcons: Record<string, any> = {
  trophy: TrophyIcon,
  star: StarIcon,
  'trending-up': TrendingUpIcon,
  dumbbell: DumbbellIcon,
};

export default function UserDashboard() {
  const { selectedMonth, availableMonths, setSelectedMonth, setAvailableMonths } = useStore();
  const [managers, setManagers] = useState<ManagerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [functionalHead, setFunctionalHead] = useState('all');
  const [band, setBand] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedManager, setExpandedManager] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadAvailableMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadLeaderboard();
    }
  }, [selectedMonth, functionalHead, band, search]);

  const loadAvailableMonths = async () => {
    try {
      const data = await leaderboardApi.getAvailableMonths();
      setAvailableMonths(data.months);
      if (data.latestMonth) {
        setSelectedMonth(data.latestMonth);
      }
    } catch (err) {
      setError('Failed to load available months');
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedMonth) return;

    setLoading(true);
    setError(null);

    try {
      const data = await leaderboardApi.getLeaderboard({
        month: selectedMonth,
        functionalHead,
        band,
        search,
        page: 0,
        size: 100,
      });
      setManagers(data.managers);
      setStatistics(data.statistics);
    } catch (err) {
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band: string) => {
    return bandColors[band as keyof typeof bandColors]?.main || '#999';
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getBadgeIcon = (iconKey: string) => {
    const IconComponent = badgeIcons[iconKey] || StarIcon;
    return IconComponent;
  };

  const toggleExpand = (managerId: string) => {
    setExpandedManager(expandedManager === managerId ? null : managerId);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Leaderboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth || ''}
              label="Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Functional Head</InputLabel>
            <Select
              value={functionalHead}
              label="Functional Head"
              onChange={(e) => setFunctionalHead(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Kunal Bhattacharya">Kunal Bhattacharya</MenuItem>
              <MenuItem value="Teza Mukkavilli">Teza Mukkavilli</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Classification Band</InputLabel>
            <Select
              value={band}
              label="Classification Band"
              onChange={(e) => setBand(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
              <MenuItem value="Silver">Silver</MenuItem>
              <MenuItem value="Bronze">Bronze</MenuItem>
              <MenuItem value="Ignition Zone">Ignition Zone</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Manager"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
          />
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {statistics && !loading && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Managers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                  {managers.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Average Final Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'primary.main' }}>
                  {statistics.averageFinalScore?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Average Utilization
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                  {statistics.averageUtilization?.toFixed(1) || '0.0'}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Gold Band Achievers
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#FFD700' }}>
                  {statistics.bandDistribution?.Gold || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && managers.length === 0 && (
        <Alert severity="info">No data available for the selected filters.</Alert>
      )}

      <AnimatePresence>
        {!loading && managers.length > 0 && (
          <Grid container spacing={2}>
            {managers.map((manager, index) => (
              <Grid item xs={12} key={manager.manager.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    sx={{
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                              {getRankMedal(manager.rank) || `#${manager.rank}`}
                            </Typography>
                            {manager.rankChange !== null && manager.rankChange !== 0 && (
                              <Chip
                                label={manager.rankChange > 0 ? `+${manager.rankChange}` : manager.rankChange}
                                size="small"
                                color={manager.rankChange > 0 ? 'success' : 'error'}
                              />
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {manager.manager.displayName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {manager.manager.displayName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {manager.functionalHead}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Chip
                            label={manager.classificationBand}
                            sx={{
                              bgcolor: getBandColor(manager.classificationBand),
                              color: '#fff',
                              fontWeight: 600,
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Final Score
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {manager.finalScore.toFixed(2)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={manager.finalScore}
                              sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Utilization
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {manager.utilization.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={1}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Team Size
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {manager.headcount}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={1}>
                          <IconButton
                            onClick={() => toggleExpand(manager.manager.id)}
                            sx={{
                              transform: expandedManager === manager.manager.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Grid>
                      </Grid>

                      <Collapse in={expandedManager === manager.manager.id} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Score Breakdown
                                </Typography>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>Utilization (70%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.utilization.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right">
                                        {(manager.utilization * 0.7).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Team Size Score (20%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.teamSizeScore.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right">
                                        {(manager.teamSizeScore * 0.2).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell>Consistency Score (10%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.consistencyScore.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right">
                                        {(manager.consistencyScore * 0.1).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 700 }}>Final Score</TableCell>
                                      <TableCell />
                                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                        {manager.finalScore.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Team Metrics
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PeopleIcon color="primary" />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Total Headcount
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {manager.headcount}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        1:1s Participated
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {manager.oneOnOnes}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CancelIcon color="error" />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        Not Utilizing
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {manager.notUtilising}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>

                            {manager.badges.length > 0 && (
                              <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Badges Earned
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                    {manager.badges.map((badge) => {
                                      const IconComponent = getBadgeIcon(badge.iconKey);
                                      return (
                                        <Chip
                                          key={badge.id}
                                          icon={<IconComponent />}
                                          label={badge.name}
                                          sx={{
                                            bgcolor: badge.color,
                                            color: '#fff',
                                          }}
                                        />
                                      );
                                    })}
                                  </Box>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </AnimatePresence>
    </Box>
  );
}

