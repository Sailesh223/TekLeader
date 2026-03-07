import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceHistory } from '../api/client';

interface PerformanceChartsProps {
  history: PerformanceHistory[];
  totalManagers?: number;
}

export default function PerformanceCharts({ history, totalManagers }: PerformanceChartsProps) {
  // Prepare data for charts (reverse to show oldest to newest)
  const chartData = [...history].reverse().map((item) => ({
    month: item.month,
    rank: item.rank,
    rankDisplay: totalManagers ? `${item.rank}/${totalManagers}` : item.rank.toString(),
    score: item.finalScore,
    utilization: item.utilization,
    teamSize: item.teamSize,
    badgeCount: item.badges?.length || 0,
  }));

  // Get max rank for Y-axis domain (to show rank 1 at top)
  const maxRank = Math.max(...chartData.map(d => d.rank));

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Rank Trend */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
              📈 Rank Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRank" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00BFA5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis
                  dataKey="month"
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  reversed
                  domain={[1, maxRank]}
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #00BFA5',
                    borderRadius: '8px',
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          backgroundColor: '#fff',
                          border: '1px solid #00BFA5',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#00897B' }}>
                            {payload[0].payload.month}
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#00BFA5' }}>
                            Rank: {payload[0].payload.rankDisplay}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rank"
                  stroke="#00BFA5"
                  strokeWidth={3}
                  fill="url(#colorRank)"
                  fillOpacity={1}
                  dot={{ fill: '#00BFA5', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
              Rank 1 at top = Best performance
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Score Trend */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
              🎯 Score Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4DD0E1" stopOpacity={0.8} />
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
                  label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #4DD0E1',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4DD0E1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Utilization Trend */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
              💼 Utilization Trend
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#00897B" stopOpacity={0.8} />
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
                  label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #00BFA5',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="utilization" fill="url(#utilizationGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Badges Earned Trend */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
              🏅 Badges Earned Each Month
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorBadges" x1="0" y1="0" x2="0" y2="1">
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
                  label={{ value: 'Badges', angle: -90, position: 'insideLeft' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #FFD700',
                    borderRadius: '8px',
                  }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          backgroundColor: '#fff',
                          border: '1px solid #FFD700',
                          borderRadius: '8px',
                          padding: '8px 12px',
                        }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#00897B' }}>
                            {payload[0].payload.month}
                          </p>
                          <p style={{ margin: '4px 0 0 0', color: '#FFD700' }}>
                            Badges: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="badgeCount"
                  fill="url(#colorBadges)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <Typography variant="caption" sx={{ color: '#999', display: 'block', textAlign: 'center', mt: 1 }}>
              Total badges earned per month
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

