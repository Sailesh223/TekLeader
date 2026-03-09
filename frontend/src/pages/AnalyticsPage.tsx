import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { leaderboardApi } from '../api/client';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalManagers: 0,
    avgScore: 0,
    goldCount: 0,
    silverCount: 0,
    bronzeCount: 0,
    ignitionCount: 0,
  });
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [bandTrendData, setBandTrendData] = useState<any[]>([]);
  const [scoreTrendData, setScoreTrendData] = useState<any[]>([]);
  const [badgeTrendData, setBadgeTrendData] = useState<any[]>([]);

  useEffect(() => {
    loadMonths();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      loadAnalytics();
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (availableMonths.length > 0) {
      loadHistoricalData();
    }
  }, [availableMonths]);

  const loadMonths = async () => {
    try {
      const response = await leaderboardApi.getAvailableMonths();
      setAvailableMonths(response.months);
      if (response.latestMonth) {
        setSelectedMonth(response.latestMonth);
      }
    } catch (error) {
      console.error('Failed to load months:', error);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const historicalBandData: any[] = [];
      const historicalScoreData: any[] = [];
      const historicalBadgeData: any[] = [];

      // Load data for each month
      for (const month of availableMonths) {
        const response = await leaderboardApi.getLeaderboard(month, 'all', 'all', '', 0, 1000);
        const managers = response.managers;

        const goldCount = managers.filter(m => m.classificationBand === 'Gold').length;
        const silverCount = managers.filter(m => m.classificationBand === 'Silver').length;
        const bronzeCount = managers.filter(m => m.classificationBand === 'Bronze').length;
        const ignitionCount = managers.filter(m => m.classificationBand === 'Ignition Zone').length;
        const avgScore = managers.reduce((sum, m) => sum + m.finalScore, 0) / managers.length;
        const totalBadges = managers.reduce((sum, m) => sum + (m.badges?.length || 0), 0);

        historicalBandData.push({
          month,
          Gold: goldCount,
          Silver: silverCount,
          Bronze: bronzeCount,
          'Ignition Zone': ignitionCount,
        });

        historicalScoreData.push({
          month,
          avgScore: Math.round(avgScore * 100) / 100,
        });

        historicalBadgeData.push({
          month,
          totalBadges,
        });
      }

      setBandTrendData(historicalBandData);
      setScoreTrendData(historicalScoreData);
      setBadgeTrendData(historicalBadgeData);
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await leaderboardApi.getLeaderboard(selectedMonth, 'all', 'all', '', 0, 1000);

      const managers = response.managers;
      const totalManagers = managers.length;
      const avgScore = managers.reduce((sum, m) => sum + m.finalScore, 0) / totalManagers;

      const goldCount = managers.filter(m => m.classificationBand === 'Gold').length;
      const silverCount = managers.filter(m => m.classificationBand === 'Silver').length;
      const bronzeCount = managers.filter(m => m.classificationBand === 'Bronze').length;
      const ignitionCount = managers.filter(m => m.classificationBand === 'Ignition Zone').length;

      setStats({
        totalManagers,
        avgScore: Math.round(avgScore * 100) / 100,
        goldCount,
        silverCount,
        bronzeCount,
        ignitionCount,
      });

      // Prepare utilization distribution data
      const utilizationRanges = [
        { range: '0-20%', count: 0, color: '#EF5350' },
        { range: '21-40%', count: 0, color: '#FFB74D' },
        { range: '41-60%', count: 0, color: '#FFD54F' },
        { range: '61-80%', count: 0, color: '#66BB6A' },
        { range: '81-100%', count: 0, color: '#26A69A' },
      ];

      managers.forEach(m => {
        const util = m.utilization;
        if (util <= 20) utilizationRanges[0].count++;
        else if (util <= 40) utilizationRanges[1].count++;
        else if (util <= 60) utilizationRanges[2].count++;
        else if (util <= 80) utilizationRanges[3].count++;
        else utilizationRanges[4].count++;
      });

      setUtilizationData(utilizationRanges.filter(r => r.count > 0));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Managers',
      value: stats.totalManagers,
      icon: <PeopleIcon sx={{ fontSize: 48, color: '#00BFA5' }} />,
      color: '#00BFA5',
    },
    {
      title: 'Average Score',
      value: stats.avgScore.toFixed(2),
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: '#00897B' }} />,
      color: '#00897B',
    },
    {
      title: 'Gold Band',
      value: stats.goldCount,
      icon: <TrophyIcon sx={{ fontSize: 48, color: '#FFD54F' }} />,
      color: '#FFD54F',
    },
    {
      title: 'Silver Band',
      value: stats.silverCount,
      icon: <TrophyIcon sx={{ fontSize: 48, color: '#B0BEC5' }} />,
      color: '#B0BEC5',
    },
    {
      title: 'Bronze Band',
      value: stats.bronzeCount,
      icon: <TrophyIcon sx={{ fontSize: 48, color: '#FFB74D' }} />,
      color: '#FFB74D',
    },
    {
      title: 'Ignition Zone',
      value: stats.ignitionCount,
      icon: <TimelineIcon sx={{ fontSize: 48, color: '#EF5350' }} />,
      color: '#EF5350',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#00BFA5' }}>
        Analytics Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#00897B', fontWeight: 500 }}>
        View detailed analytics and performance trends
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            label="Select Month"
          >
            {availableMonths.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.2) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `2px solid ${card.color}40`,
                  borderRadius: 3,
                  boxShadow: `0 4px 20px ${card.color}20`,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: card.color, mb: 1 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2C3E50', fontWeight: 500 }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analytics Charts */}
      {!loading && stats.totalManagers > 0 && (
        <Grid container spacing={3} sx={{ mt: 4 }}>
          {/* Band Distribution Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                  📊 Band Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <defs>
                      <radialGradient id="pieGoldGradient">
                        <stop offset="0%" stopColor="#FFF59D" stopOpacity={1} />
                        <stop offset="100%" stopColor="#FFD54F" stopOpacity={0.9} />
                      </radialGradient>
                      <radialGradient id="pieSilverGradient">
                        <stop offset="0%" stopColor="#CFD8DC" stopOpacity={1} />
                        <stop offset="100%" stopColor="#B0BEC5" stopOpacity={0.9} />
                      </radialGradient>
                      <radialGradient id="pieBronzeGradient">
                        <stop offset="0%" stopColor="#FFCC80" stopOpacity={1} />
                        <stop offset="100%" stopColor="#FFB74D" stopOpacity={0.9} />
                      </radialGradient>
                      <radialGradient id="pieIgnitionGradient">
                        <stop offset="0%" stopColor="#EF9A9A" stopOpacity={1} />
                        <stop offset="100%" stopColor="#EF5350" stopOpacity={0.9} />
                      </radialGradient>
                    </defs>
                    <Pie
                      data={[
                        { name: 'Gold', value: stats.goldCount, gradient: 'url(#pieGoldGradient)' },
                        { name: 'Silver', value: stats.silverCount, gradient: 'url(#pieSilverGradient)' },
                        { name: 'Bronze', value: stats.bronzeCount, gradient: 'url(#pieBronzeGradient)' },
                        { name: 'Ignition Zone', value: stats.ignitionCount, gradient: 'url(#pieIgnitionGradient)' },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Gold', value: stats.goldCount, gradient: 'url(#pieGoldGradient)' },
                        { name: 'Silver', value: stats.silverCount, gradient: 'url(#pieSilverGradient)' },
                        { name: 'Bronze', value: stats.bronzeCount, gradient: 'url(#pieBronzeGradient)' },
                        { name: 'Ignition Zone', value: stats.ignitionCount, gradient: 'url(#pieIgnitionGradient)' },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.gradient} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Band Count Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                  📈 Manager Count by Band
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { band: 'Gold', count: stats.goldCount },
                      { band: 'Silver', count: stats.silverCount },
                      { band: 'Bronze', count: stats.bronzeCount },
                      { band: 'Ignition', count: stats.ignitionCount },
                    ]}
                  >
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFF59D" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#FFD54F" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="silverGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#CFD8DC" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#B0BEC5" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="bronzeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFCC80" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#FFB74D" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="ignitionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF9A9A" stopOpacity={0.9} />
                        <stop offset="95%" stopColor="#EF5350" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                    <XAxis dataKey="band" stroke="#666" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #00BFA5',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      <Cell fill="url(#goldGradient)" />
                      <Cell fill="url(#silverGradient)" />
                      <Cell fill="url(#bronzeGradient)" />
                      <Cell fill="url(#ignitionGradient)" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Utilization Distribution Chart */}
          {utilizationData.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                    💼 Utilization Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={utilizationData}>
                      <defs>
                        <linearGradient id="utilGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFCDD2" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#EF5350" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="utilGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFE0B2" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#FFB74D" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="utilGradient3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFF9C4" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#FFD54F" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="utilGradient4" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A5D6A7" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#66BB6A" stopOpacity={0.8} />
                        </linearGradient>
                        <linearGradient id="utilGradient5" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#80CBC4" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#26A69A" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="range"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Utilization Range', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Number of Managers', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #00BFA5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#utilGradient${index + 1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
                    Higher utilization (teal/green) indicates better team engagement
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Band Distribution Trend Over Time */}
          {bandTrendData.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                    📊 Band Distribution Trend Across Months
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={bandTrendData}>
                      <defs>
                        <linearGradient id="areaGoldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFC107" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FFC107" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="areaSilverGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="areaBronzeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="areaIgnitionGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E91E63" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#E91E63" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Number of Managers', angle: -90, position: 'insideLeft' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #00BFA5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="Gold"
                        stroke="#FFC107"
                        strokeWidth={3}
                        fill="url(#areaGoldGradient)"
                        dot={{ fill: '#FFC107', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Silver"
                        stroke="#2196F3"
                        strokeWidth={3}
                        fill="url(#areaSilverGradient)"
                        dot={{ fill: '#2196F3', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Bronze"
                        stroke="#4CAF50"
                        strokeWidth={3}
                        fill="url(#areaBronzeGradient)"
                        dot={{ fill: '#4CAF50', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Ignition Zone"
                        stroke="#E91E63"
                        strokeWidth={3}
                        fill="url(#areaIgnitionGradient)"
                        dot={{ fill: '#E91E63', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
                    Track how the number of managers in each band changes over time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Score Trend Over Time */}
          {scoreTrendData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                    📈 Average Score Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={scoreTrendData}>
                      <defs>
                        <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4DD0E1" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Average Score', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #00BFA5',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,191,165,0.2)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="avgScore"
                        stroke="#00BFA5"
                        strokeWidth={4}
                        fill="url(#scoreAreaGradient)"
                        dot={{ fill: '#00BFA5', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
                    Organization-wide average score across months
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Badge Distribution Trend */}
          {badgeTrendData.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
                    🏅 Total Badges Awarded Each Month
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={badgeTrendData}>
                      <defs>
                        <linearGradient id="badgeBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD700" stopOpacity={0.9} />
                          <stop offset="95%" stopColor="#FFA500" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                      <XAxis
                        dataKey="month"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'Total Badges', angle: -90, position: 'insideLeft' }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '2px solid #FFD700',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(255,215,0,0.2)',
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div style={{
                                backgroundColor: '#fff',
                                border: '2px solid #FFD700',
                                borderRadius: '8px',
                                padding: '8px 12px',
                              }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#FF8F00' }}>
                                  {payload[0].payload.month}
                                </p>
                                <p style={{ margin: '4px 0 0 0', color: '#FFA500' }}>
                                  Total Badges: {payload[0].value}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="totalBadges" fill="url(#badgeBarGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
                    Total badges awarded across all managers per month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

