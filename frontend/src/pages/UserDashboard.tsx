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

const GamifiedCard = ({ children, delay = 0, ...props }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <Card
      {...props}
      sx={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.3) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(0, 191, 165, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 191, 165, 0.15)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #00BFA5 0%, #00897B 100%)',
        },
        ...props.sx,
      }}
    >
      {children}
    </Card>
  </motion.div>
);

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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#00897B', mb: 3 }}>
        🏆 Leaderboard
      </Typography>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <FormControl
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.3)' },
                '&:hover fieldset': { borderColor: '#00BFA5' },
                '&.Mui-focused fieldset': { borderColor: '#00BFA5', borderWidth: 2 },
              },
              '& .MuiInputLabel-root': { color: '#00897B' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#00BFA5' },
            }}
          >
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
          <FormControl
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.3)' },
                '&:hover fieldset': { borderColor: '#00BFA5' },
                '&.Mui-focused fieldset': { borderColor: '#00BFA5', borderWidth: 2 },
              },
              '& .MuiInputLabel-root': { color: '#00897B' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#00BFA5' },
            }}
          >
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
          <FormControl
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.3)' },
                '&:hover fieldset': { borderColor: '#00BFA5' },
                '&.Mui-focused fieldset': { borderColor: '#00BFA5', borderWidth: 2 },
              },
              '& .MuiInputLabel-root': { color: '#00897B' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#00BFA5' },
            }}
          >
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
            placeholder="Search Manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
                borderRadius: 2,
                '& fieldset': { borderColor: 'rgba(0, 191, 165, 0.3)' },
                '&:hover fieldset': { borderColor: '#00BFA5' },
                '&.Mui-focused fieldset': { borderColor: '#00BFA5', borderWidth: 2 },
              },
            }}
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
            <GamifiedCard delay={0.1}>
              <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 191, 165, 0.15) 0%, transparent 70%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#00897B', mb: 1, fontWeight: 500 }}>
                  Total Managers
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                  {managers.length}
                </Typography>
              </CardContent>
            </GamifiedCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <GamifiedCard delay={0.2}>
              <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#00897B', mb: 1, fontWeight: 500 }}>
                  Average Score
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#FFD700' }}>
                  {statistics.averageFinalScore?.toFixed(1) || '0.0'}
                </Typography>
              </CardContent>
            </GamifiedCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <GamifiedCard delay={0.3}>
              <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 191, 165, 0.15) 0%, transparent 70%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#00897B', mb: 1, fontWeight: 500 }}>
                  Avg Utilization
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                  {statistics.averageUtilization?.toFixed(1) || '0.0'}%
                </Typography>
              </CardContent>
            </GamifiedCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <GamifiedCard delay={0.4}>
              <CardContent sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#00897B', mb: 1, fontWeight: 500 }}>
                  🥇 Gold Achievers
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: '#FFD700' }}>
                  {statistics.bandDistribution?.Gold || 0}
                </Typography>
              </CardContent>
            </GamifiedCard>
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
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.2) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(0, 191, 165, 0.3)',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 20px rgba(0, 191, 165, 0.1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${getBandColor(manager.classificationBand)} 0%, ${getBandColor(manager.classificationBand)}88 100%)`,
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 32px ${getBandColor(manager.classificationBand)}30`,
                        border: `2px solid ${getBandColor(manager.classificationBand)}`,
                      },
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                              {getRankMedal(manager.rank) || `#${manager.rank}`}
                            </Typography>
                            {manager.rankChange !== null && manager.rankChange !== 0 && (
                              <Chip
                                label={manager.rankChange > 0 ? `↑${manager.rankChange}` : `↓${Math.abs(manager.rankChange)}`}
                                size="small"
                                sx={{
                                  bgcolor: manager.rankChange > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                  color: manager.rankChange > 0 ? '#4CAF50' : '#F44336',
                                  fontWeight: 600,
                                  border: `1px solid ${manager.rankChange > 0 ? '#4CAF50' : '#F44336'}`,
                                }}
                              />
                            )}
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: getBandColor(manager.classificationBand),
                                width: 48,
                                height: 48,
                                fontSize: '1.25rem',
                                fontWeight: 700,
                              }}
                            >
                              {manager.manager.displayName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: '#2C3E50' }}>
                                {manager.manager.displayName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#00897B' }}>
                                {manager.functionalHead}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Chip
                            label={manager.classificationBand}
                            sx={{
                              background: `linear-gradient(135deg, ${getBandColor(manager.classificationBand)} 0%, ${getBandColor(manager.classificationBand)}CC 100%)`,
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              px: 1,
                              border: `1px solid ${getBandColor(manager.classificationBand)}`,
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#00897B', mb: 0.5, fontWeight: 500 }}>
                              Final Score
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00BFA5', mb: 1 }}>
                              {manager.finalScore.toFixed(1)}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={manager.finalScore}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: 'rgba(0, 191, 165, 0.15)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #00BFA5 0%, #00897B 100%)',
                                  borderRadius: 4,
                                  boxShadow: '0 2px 8px rgba(0, 191, 165, 0.3)',
                                },
                              }}
                            />
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={2}>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#00897B', mb: 0.5, fontWeight: 500 }}>
                              Utilization
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                              {manager.utilization.toFixed(1)}%
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={1}>
                          <Box>
                            <Typography variant="body2" sx={{ color: '#00897B', mb: 0.5, fontWeight: 500 }}>
                              Team Size
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                              {manager.headcount}
                            </Typography>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={1}>
                          <IconButton
                            onClick={() => toggleExpand(manager.manager.id)}
                            sx={{
                              color: '#00BFA5',
                              transform: expandedManager === manager.manager.id ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.3s',
                              '&:hover': {
                                bgcolor: 'rgba(0, 191, 165, 0.1)',
                              },
                            }}
                          >
                            <ExpandMoreIcon />
                          </IconButton>
                        </Grid>
                      </Grid>

                      <Collapse in={expandedManager === manager.manager.id} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(0, 191, 165, 0.2)' }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 3,
                                  background: 'rgba(0, 191, 165, 0.05)',
                                  border: '1px solid rgba(0, 191, 165, 0.2)',
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00BFA5', mb: 2 }}>
                                  📊 Score Breakdown
                                </Typography>
                                <Table size="small">
                                  <TableBody>
                                    <TableRow sx={{ '& td': { border: 'none', color: '#2C3E50' } }}>
                                      <TableCell>Utilization (70%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.utilization.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right" sx={{ color: '#00BFA5 !important', fontWeight: 600 }}>
                                        {(manager.utilization * 0.7).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow sx={{ '& td': { border: 'none', color: '#2C3E50' } }}>
                                      <TableCell>Team Size Score (20%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.teamSizeScore.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right" sx={{ color: '#00BFA5 !important', fontWeight: 600 }}>
                                        {(manager.teamSizeScore * 0.2).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow sx={{ '& td': { border: 'none', color: '#2C3E50' } }}>
                                      <TableCell>Consistency Score (10%)</TableCell>
                                      <TableCell align="right">
                                        <strong>{manager.consistencyScore.toFixed(2)}</strong>
                                      </TableCell>
                                      <TableCell align="right" sx={{ color: '#00BFA5 !important', fontWeight: 600 }}>
                                        {(manager.consistencyScore * 0.1).toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                    <TableRow sx={{ '& td': { border: 'none', borderTop: '2px solid rgba(0, 191, 165, 0.3)', pt: 1 } }}>
                                      <TableCell sx={{ fontWeight: 700, color: '#00897B !important' }}>Final Score</TableCell>
                                      <TableCell />
                                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#00BFA5 !important' }}>
                                        {manager.finalScore.toFixed(2)}
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 3,
                                  background: 'rgba(0, 191, 165, 0.05)',
                                  border: '1px solid rgba(0, 191, 165, 0.2)',
                                  borderRadius: 2,
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#00BFA5', mb: 2 }}>
                                  👥 Team Metrics
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <PeopleIcon sx={{ color: '#00BFA5' }} />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ color: '#00897B', fontWeight: 500 }}>
                                        Total Headcount
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                                        {manager.headcount}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon sx={{ color: '#00BFA5' }} />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ color: '#00897B', fontWeight: 500 }}>
                                        1:1s Participated
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                                        {manager.oneOnOnes}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CancelIcon sx={{ color: '#F44336' }} />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" sx={{ color: '#00897B', fontWeight: 500 }}>
                                        Not Utilizing
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50' }}>
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

