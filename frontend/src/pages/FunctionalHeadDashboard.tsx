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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  ViewList as ViewListIcon,
  AccountTree as TreeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { bandColors } from '../theme';
import OrgTreeView from '../components/OrgTreeView';
import BadgeList from '../components/BadgeList';

const MotionCard = motion(Card);

interface FunctionalHeadNode {
  name: string;
  directors: DirectorNode[];
  totalManagers: number;
  totalTeamMembers: number;
  avgScore: number;
}

interface DirectorNode {
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

interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  iconKey: string;
  color: string;
}

export default function FunctionalHeadDashboard() {
  const { selectedMonth, userInfo } = useStore();
  const [hierarchy, setHierarchy] = useState<FunctionalHeadNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<ManagerNode | null>(null);
  const [availableBadges, setAvailableBadges] = useState<BadgeDefinition[]>([]);
  const [selectedBadge, setSelectedBadge] = useState('');
  const [badgeReason, setBadgeReason] = useState('');
  const [badgeMonth, setBadgeMonth] = useState(selectedMonth || '');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const functionalHeadName = userInfo?.displayName || 'Unknown';

  useEffect(() => {
    if (selectedMonth) {
      loadHierarchy();
      loadAvailableBadges();
      loadAvailableMonths();
      setBadgeMonth(selectedMonth);
    }
  }, [selectedMonth]);

  const loadHierarchy = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hierarchy/functional-heads?month=${selectedMonth}`);
      const data = await response.json();
      setHierarchy(data);
    } catch (err) {
      setError('Failed to load hierarchy data');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBadges = async () => {
    try {
      const response = await fetch('/api/badges/available');
      const data = await response.json();
      const premiumBadge = data.filter((badge: BadgeDefinition) => badge.code === 'PREMIUM_BADGE');
      setAvailableBadges(premiumBadge);
    } catch (err) {
      console.error('Failed to load badges', err);
    }
  };

  const loadAvailableMonths = async () => {
    try {
      const response = await fetch('/api/months');
      const data = await response.json();
      // API returns { months: [...], latestMonth: "..." }
      setAvailableMonths(Array.isArray(data.months) ? data.months : []);
    } catch (err) {
      console.error('Failed to load available months', err);
      setAvailableMonths([]);
    }
  };

  const handleAwardBadge = (manager: ManagerNode) => {
    setSelectedManager(manager);
    setSelectedBadge('PREMIUM_BADGE'); // Auto-select Premium Badge for functional heads
    setBadgeDialogOpen(true);
  };

  const handleCloseBadgeDialog = () => {
    setBadgeDialogOpen(false);
    setSelectedManager(null);
    setSelectedBadge('');
    setBadgeReason('');
    setBadgeMonth(selectedMonth);
  };

  const handleSubmitBadge = async () => {
    if (!selectedManager) return;

    console.log('🎯 Awarding Premium Badge:', {
      managerId: selectedManager.id,
      month: badgeMonth,
      functionalHeadName: functionalHeadName,
      reason: badgeReason || 'Outstanding performance',
    });

    try {
      const response = await fetch('/api/badges/award-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: selectedManager.id,
          month: badgeMonth,
          functionalHeadName: functionalHeadName,
          reason: badgeReason || 'Outstanding performance',
        }),
      });

      const result = await response.json();
      console.log('📥 Response:', result);

      if (response.ok && result.success) {
        alert('Premium Badge (Frame 5) awarded successfully! ✨🏆');
        handleCloseBadgeDialog();
        loadHierarchy();
      } else {
        alert(result.message || 'Failed to award badge. You can only award Premium Badge to managers in your organization.');
      }
    } catch (err) {
      console.error('❌ Error awarding Premium Badge:', err);
      alert('Error awarding Premium Badge: ' + err);
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

  const totalManagers = hierarchy.reduce((sum, fh) => sum + fh.totalManagers, 0);
  const totalTeamMembers = hierarchy.reduce((sum, fh) => sum + fh.totalTeamMembers, 0);
  const avgScore = hierarchy.length > 0
    ? hierarchy.reduce((sum, fh) => sum + fh.avgScore, 0) / hierarchy.length
    : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#00897B' }}>
          🎯 Functional Head Dashboard
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="list">
            <ViewListIcon sx={{ mr: 1 }} />
            List View
          </ToggleButton>
          <ToggleButton value="tree">
            <TreeIcon sx={{ mr: 1 }} />
            Tree View
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Managers
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                {totalManagers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Team Members
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                {totalTeamMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Average Score
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#FFD700' }}>
                {avgScore.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Functional Heads
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                {hierarchy.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {viewMode === 'tree' ? (
        <OrgTreeView hierarchy={hierarchy} />
      ) : (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
            🌳 Organization Hierarchy
          </Typography>

          {hierarchy.map((fh, fhIndex) => (
        <MotionCard
          key={fh.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: fhIndex * 0.1 }}
          sx={{ mb: 3 }}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#00897B', mb: 2 }}>
              {fh.name}
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Managers: <strong>{fh.totalManagers}</strong>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Team Members: <strong>{fh.totalTeamMembers}</strong>
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Avg Score: <strong>{fh.avgScore.toFixed(1)}</strong>
                </Typography>
              </Grid>
            </Grid>

            {fh.directors.map((director, dirIndex) => (
              <Accordion key={director.id} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Avatar src={director.avatarUrl || undefined} sx={{ bgcolor: '#00897B' }}>
                      {director.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        📊 {director.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {director.email}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {director.managers.length} managers • {director.totalTeamMembers} members
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFD700' }}>
                      {director.avgScore.toFixed(1)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 4 }}>
                    {director.managers.map((manager, mgrIndex) => (
                      <Accordion key={manager.id} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Avatar
                              src={manager.avatarUrl || undefined}
                              sx={{ bgcolor: getBandColor(manager.classificationBand) }}
                            >
                              {manager.displayName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {manager.displayName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {manager.email}
                              </Typography>
                            </Box>
                            <Chip
                              label={manager.classificationBand}
                              size="small"
                              sx={{
                                bgcolor: getBandColor(manager.classificationBand),
                                color: '#fff',
                                fontWeight: 600,
                              }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#00BFA5' }}>
                              {manager.finalScore.toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {manager.headcount} members
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box sx={{ pl: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#00897B' }}>
                                Badges
                              </Typography>
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<TrophyIcon />}
                                onClick={() => handleAwardBadge(manager)}
                                sx={{ bgcolor: '#00897B' }}
                              >
                                Award Badge
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                              {manager.badges.length > 0 ? (
                                <BadgeList badges={manager.badges} size={48} spacing={1.5} />
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
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </MotionCard>
      ))}
        </>
      )}

      <Dialog open={badgeDialogOpen} onClose={handleCloseBadgeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>🏆 Award Premium Badge (Frame 5) to {selectedManager?.displayName}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            As a Functional Head, you can only award the Premium Badge (Frame 5) to managers in your organization.
          </Alert>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={badgeMonth}
              onChange={(e) => setBadgeMonth(e.target.value)}
              label="Select Month"
            >
              {(availableMonths || []).map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Award"
            value={badgeReason}
            onChange={(e) => setBadgeReason(e.target.value)}
            placeholder="Describe why this manager deserves the Premium Badge..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBadgeDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitBadge}
            variant="contained"
            sx={{
              bgcolor: '#FFD700',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#FFC700' }
            }}
          >
            Award Premium Badge ✨
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

