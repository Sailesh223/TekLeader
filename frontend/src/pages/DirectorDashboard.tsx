import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { bandColors } from '../theme';
import UserAvatar from '../components/UserAvatar';

const MotionCard = motion(Card);

interface DirectorHierarchy {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  managers: ManagerNode[];
  totalTeamMembers: number;
  avgScore: number;
}

interface ManagerNode {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  classificationBand: string;
  finalScore: number;
  utilization: number;
  headcount: number;
  teamMembers: TeamMemberNode[];
  badges: BadgeInfo[];
}

interface TeamMemberNode {
  name: string;
  department: string;
  isUtilizing: boolean;
  oneOnOnesCount: number;
}

interface BadgeInfo {
  code: string;
  name: string;
  iconKey: string;
  color: string;
}

export default function DirectorDashboard() {
  const { selectedMonth, userInfo } = useStore();
  const [hierarchy, setHierarchy] = useState<DirectorHierarchy | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const directorName = userInfo?.displayName || 'Unknown';

  useEffect(() => {
    if (selectedMonth && directorName) {
      loadHierarchy();
    }
  }, [selectedMonth, directorName]);

  const loadHierarchy = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/hierarchy/directors/${encodeURIComponent(directorName)}?month=${selectedMonth}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hierarchy');
      }

      const data = await response.json();
      setHierarchy(data);
    } catch (err) {
      console.error('Error loading hierarchy:', err);
      setError('Failed to load hierarchy data');
    } finally {
      setLoading(false);
    }
  };

  const getBandColor = (band: string) => {
    return bandColors[band as keyof typeof bandColors]?.main || '#999';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!hierarchy) {
    return <Alert severity="info">No data available</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B', mb: 3 }}>
        👔 Director Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Managers
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                {hierarchy.managers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Team Members
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                {hierarchy.totalTeamMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#FFD700' }}>
                {hierarchy.avgScore.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
        📊 Team Hierarchy
      </Typography>

      {hierarchy.managers.map((manager, index) => (
        <MotionCard
          key={manager.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          sx={{ mb: 2 }}
        >
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <UserAvatar
                  name={manager.displayName}
                  email={manager.email}
                  customAvatarUrl={manager.avatarUrl}
                  sx={{
                    width: 48,
                    height: 48,
                    border: `3px solid ${getBandColor(manager.classificationBand)}`,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {manager.displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {manager.email}
                  </Typography>
                </Box>
                <Chip
                  label={manager.classificationBand}
                  sx={{
                    bgcolor: getBandColor(manager.classificationBand),
                    color: '#fff',
                    fontWeight: 600,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#00BFA5', minWidth: 80 }}>
                  Score: {manager.finalScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                  {manager.headcount} members
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ pl: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#00897B' }}>
                  Badges
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {manager.badges.length > 0 ? (
                    manager.badges.map((badge) => (
                      <Chip
                        key={badge.code}
                        label={badge.name}
                        size="small"
                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                        sx={{ bgcolor: badge.color, color: '#fff' }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No badges yet
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#00897B' }}>
                  Team Members ({manager.teamMembers.length})
                </Typography>
                <List dense>
                  {manager.teamMembers.map((member, idx) => (
                    <ListItem key={idx}>
                      <ListItemAvatar>
                        {member.isUtilizing ? (
                          <CheckCircleIcon sx={{ color: '#4CAF50' }} />
                        ) : (
                          <CancelIcon sx={{ color: '#F44336' }} />
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={`${member.department} • ${member.oneOnOnesCount} 1:1s`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </AccordionDetails>
          </Accordion>
        </MotionCard>
      ))}
    </Box>
  );
}
