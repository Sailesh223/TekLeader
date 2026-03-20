import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  keyframes,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Leaderboard as LeaderboardIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  DeleteForever as DeleteIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  AutoAwesome as SparkleIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import { leaderboardApi } from '../api/client';

// --- Keyframe Animations ---
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(1deg); }
  75% { transform: translateY(4px) rotate(-1deg); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.08); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const slideUp = keyframes`
  0% { opacity: 0; transform: translateY(40px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

const xpFill = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

// --- Shield Badge Component ---
interface ShieldBadgeProps {
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  rankLevel: number;
}

function ShieldBadge({ icon, gradient, borderColor, shadowColor }: ShieldBadgeProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${float} 4s ease-in-out infinite`,
      }}
    >
      {/* Outer glow ring */}
      <Box
        sx={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${shadowColor}40 0%, transparent 70%)`,
          animation: `${pulse} 3s ease-in-out infinite`,
        }}
      />

      {/* Shield shape */}
      <Box
        sx={{
          position: 'relative',
          width: 100,
          height: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: gradient,
            clipPath:
              'polygon(50% 0%, 95% 12%, 100% 45%, 85% 78%, 50% 100%, 15% 78%, 0% 45%, 5% 12%)',
            filter: `drop-shadow(0 6px 12px ${shadowColor}60)`,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 4,
            background: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 60%)`,
            clipPath:
              'polygon(50% 0%, 95% 12%, 100% 45%, 85% 78%, 50% 100%, 15% 78%, 0% 45%, 5% 12%)',
          },
        }}
      >
        {/* Inner border shield */}
        <Box
          sx={{
            position: 'absolute',
            inset: 6,
            border: `3px solid ${borderColor}`,
            clipPath:
              'polygon(50% 0%, 95% 12%, 100% 45%, 85% 78%, 50% 100%, 15% 78%, 0% 45%, 5% 12%)',
            opacity: 0.5,
          }}
        />

        {/* Icon */}
        <Box sx={{ position: 'relative', zIndex: 2, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
          {icon}
        </Box>
      </Box>

      {/* Corner sparkles */}
      <SparkleIcon
        sx={{
          position: 'absolute',
          top: -5,
          right: -10,
          fontSize: 18,
          color: '#FFD700',
          animation: `${sparkle} 2.5s ease-in-out infinite 0.5s`,
        }}
      />
      <SparkleIcon
        sx={{
          position: 'absolute',
          top: 10,
          left: -12,
          fontSize: 14,
          color: borderColor,
          animation: `${sparkle} 3s ease-in-out infinite 1s`,
        }}
      />
    </Box>
  );
}

// --- XP Progress Bar Component ---
interface XPBarProps {
  label: string;
  value: number;
  color: string;
  glowColor: string;
}

function XPBar({ label, value, color, glowColor }: XPBarProps) {
  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, color: '#fff', fontSize: '0.75rem' }}
        >
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 10,
          borderRadius: 5,
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${Math.min((value / 1000) * 100, 100)}%`,
            borderRadius: 5,
            background: `linear-gradient(90deg, ${color}, ${glowColor})`,
            boxShadow: `0 0 12px ${glowColor}80`,
            animation: `${xpFill} 1.5s ease-out`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: `${shimmer} 2s linear infinite`,
            },
          }}
        />
      </Box>
    </Box>
  );
}

// --- Rank Badge Chip ---
interface RankChipProps {
  rank: string;
  color: string;
}

function RankChip({ rank, color }: RankChipProps) {
  return (
    <Chip
      icon={<PremiumIcon sx={{ color: `${color} !important`, fontSize: 16 }} />}
      label={rank}
      size="small"
      sx={{
        fontWeight: 800,
        fontSize: '0.7rem',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        background: `${color}20`,
        color: color,
        border: `2px solid ${color}60`,
        backdropFilter: 'blur(10px)',
        '& .MuiChip-icon': { ml: 0.5 },
      }}
    />
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'month' | 'all'>('month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAvailableMonths();
  }, []);

  const loadAvailableMonths = async () => {
    try {
      const data = await leaderboardApi.getAvailableMonths();
      setAvailableMonths(data.months);
      if (data.months.length > 0) {
        setSelectedMonth(data.months[0]);
      }
    } catch (err) {
      console.error('Failed to load months:', err);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteMode('month');
    setError('');
    setSuccess('');
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      if (deleteMode === 'all') {
        result = await leaderboardApi.deleteAllData();
        setSuccess(`Successfully deleted ${result.deletedMetrics} metrics and ${result.deletedBadges} badges`);
      } else {
        result = await leaderboardApi.deleteDataByMonth(selectedMonth);
        setSuccess(`Successfully deleted ${result.deletedMetrics} metrics and ${result.deletedBadges} badges for ${selectedMonth}`);
      }

      await loadAvailableMonths();

      setTimeout(() => {
        handleCloseDeleteDialog();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete data');
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Upload Data',
      description: 'Upload monthly Excel files with manager utilization data to power the leaderboard',
      icon: <UploadIcon sx={{ fontSize: 42 }} />,
      action: () => navigate('/admin/upload'),
      buttonText: '⚔️ Upload Quest',
      rank: 'Gold Rank',
      rankLevel: 3,
      xpLabel: 'FILES UPLOADED',
      xpValue: 847,
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 40%, #FF8F00 100%)',
      cardBg: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      accentColor: '#FFD700',
      borderColor: '#FFA000',
      shadowColor: '#FFD700',
      glowColor: '#FFAB00',
      buttonGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
      buttonTextColor: '#1a1a2e',
      headerBg: 'linear-gradient(135deg, #FFD700 0%, #FFA000 50%, #FF8F00 100%)',
    },
    {
      title: 'View Leaderboard',
      description: 'Battle it out! See who tops the rankings and claim your throne on the leaderboard',
      icon: <LeaderboardIcon sx={{ fontSize: 42 }} />,
      action: () => navigate('/admin/leaderboard'),
      buttonText: '🏆 View Rankings',
      rank: 'Legendary',
      rankLevel: 4,
      xpLabel: 'ACTIVE CHAMPIONS',
      xpValue: 562,
      gradient: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 40%, #536DFE 100%)',
      cardBg: 'linear-gradient(160deg, #1a1a2e 0%, #1e1233 50%, #2d1b69 100%)',
      accentColor: '#E040FB',
      borderColor: '#7C4DFF',
      shadowColor: '#E040FB',
      glowColor: '#B388FF',
      buttonGradient: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 100%)',
      buttonTextColor: '#fff',
      headerBg: 'linear-gradient(135deg, #E040FB 0%, #7C4DFF 50%, #536DFE 100%)',
    },
    {
      title: 'Analytics',
      description: 'Dive deep into performance trends, stats & insights across all battle seasons',
      icon: <AnalyticsIcon sx={{ fontSize: 42 }} />,
      action: () => navigate('/admin/analytics'),
      buttonText: 'Explore Stats',
      rank: 'Diamond',
      rankLevel: 3,
      xpLabel: 'INSIGHTS GENERATED',
      xpValue: 720,
      gradient: 'linear-gradient(135deg, #00E5FF 0%, #00B0FF 40%, #2979FF 100%)',
      cardBg: 'linear-gradient(160deg, #0a1628 0%, #0d253f 50%, #0a3d62 100%)',
      accentColor: '#00E5FF',
      borderColor: '#00B0FF',
      shadowColor: '#00E5FF',
      glowColor: '#40C4FF',
      buttonGradient: 'linear-gradient(135deg, #00E5FF 0%, #00B0FF 100%)',
      buttonTextColor: '#0a1628',
      headerBg: 'linear-gradient(135deg, #00E5FF 0%, #00B0FF 50%, #2979FF 100%)',
    },
    {
      title: 'Settings',
      description: 'Configure formula weights, badge rules, classification bands & scoring criteria',
      icon: <SettingsIcon sx={{ fontSize: 42 }} />,
      action: () => navigate('/admin/settings'),
      buttonText: '⚙️ Configure',
      rank: 'Platinum',
      rankLevel: 2,
      xpLabel: 'RULES CONFIGURED',
      xpValue: 385,
      gradient: 'linear-gradient(135deg, #B0BEC5 0%, #78909C 40%, #546E7A 100%)',
      cardBg: 'linear-gradient(160deg, #1a1a2e 0%, #1c2331 50%, #2c3e50 100%)',
      accentColor: '#B0BEC5',
      borderColor: '#78909C',
      shadowColor: '#B0BEC5',
      glowColor: '#CFD8DC',
      buttonGradient: 'linear-gradient(135deg, #B0BEC5 0%, #78909C 100%)',
      buttonTextColor: '#1a1a2e',
      headerBg: 'linear-gradient(135deg, #B0BEC5 0%, #90A4AE 50%, #78909C 100%)',
    },
    {
      title: 'Data Management',
      description: 'Wield the power to purge data by month or unleash total database annihilation',
      icon: <DeleteIcon sx={{ fontSize: 42 }} />,
      action: handleOpenDeleteDialog,
      buttonText: 'Manage Data',
      rank: 'Danger Zone',
      rankLevel: 1,
      xpLabel: 'RECORDS MANAGED',
      xpValue: 193,
      gradient: 'linear-gradient(135deg, #FF1744 0%, #D50000 40%, #B71C1C 100%)',
      cardBg: 'linear-gradient(160deg, #1a1a2e 0%, #2d1320 50%, #4a0e0e 100%)',
      accentColor: '#FF1744',
      borderColor: '#D50000',
      shadowColor: '#FF1744',
      glowColor: '#FF5252',
      buttonGradient: 'linear-gradient(135deg, #FF1744 0%, #D50000 100%)',
      buttonTextColor: '#fff',
      headerBg: 'linear-gradient(135deg, #FF1744 0%, #D50000 50%, #B71C1C 100%)',
    },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        py: 5,
        px: { xs: 2, md: 5 },
      }}
    >
      {/* ===== HEADER ===== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          mb: 6,
          animation: `${slideUp} 0.8s ease-out`,
        }}
      >
        {/* Crown icon */}
        <Box sx={{ mb: 1 }}>
          <TrophyIcon
            sx={{
              fontSize: 56,
              color: '#FF8F00',
              filter: 'drop-shadow(0 0 15px rgba(255,165,0,0.4))',
              animation: `${pulse} 3s ease-in-out infinite`,
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: '2px',
            background: 'linear-gradient(135deg, #00695C 0%, #00897B 30%, #00BFA5 60%, #00695C 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: `${shimmer} 3s linear infinite`,
            textTransform: 'uppercase',
            mb: 1,
          }}
        >
          ⚡ Command Center ⚡
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#00897B',
            fontWeight: 500,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
          }}
        >
          Lattice Utilization Gamification HQ
        </Typography>

        {/* Decorative line */}
        <Box
          sx={{
            mt: 3,
            mx: 'auto',
            width: 200,
            height: 3,
            borderRadius: 2,
            background: 'linear-gradient(90deg, transparent, #00BFA5, transparent)',
          }}
        />
      </Box>

      {/* ===== CARDS GRID ===== */}
      <Grid container spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                background: card.cardBg,
                border: `2px solid ${card.accentColor}30`,
                borderRadius: 4,
                animation: `${slideUp} ${0.6 + index * 0.15}s ease-out`,
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-12px) scale(1.03)',
                  border: `2px solid ${card.accentColor}80`,
                  boxShadow: `
                    0 0 30px ${card.shadowColor}30,
                    0 20px 60px ${card.shadowColor}20,
                    inset 0 1px 0 ${card.accentColor}20
                  `,
                  '& .card-header-bar': {
                    height: 8,
                  },
                  '& .shield-container': {
                    transform: 'scale(1.1)',
                  },
                  '& .card-glow': {
                    opacity: 0.15,
                  },
                },
              }}
              onClick={card.action}
            >
              {/* Background glow */}
              <Box
                className="card-glow"
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${card.shadowColor}30 0%, transparent 70%)`,
                  opacity: 0.08,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }}
              />

              {/* Diagonal accent stripe */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: 100,
                  height: 100,
                  background: card.headerBg,
                  clipPath: 'polygon(100% 0%, 0% 0%, 100% 100%)',
                  opacity: 0.15,
                }}
              />

              {/* Top gradient bar */}
              <Box
                className="card-header-bar"
                sx={{
                  height: 5,
                  background: card.headerBg,
                  transition: 'height 0.3s ease',
                  boxShadow: `0 2px 10px ${card.shadowColor}40`,
                }}
              />

              <CardContent sx={{ flexGrow: 1, p: 3, pt: 3 }}>
                {/* Rank chip + Stars row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <RankChip rank={card.rank} color={card.accentColor} />
                  <Box sx={{ display: 'flex', gap: 0.3 }}>
                    {[...Array(card.rankLevel)].map((_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          fontSize: 16,
                          color: card.accentColor,
                          filter: `drop-shadow(0 0 4px ${card.shadowColor}80)`,
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Shield Badge */}
                <Box
                  className="shield-container"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 3,
                    transition: 'transform 0.4s ease',
                  }}
                >
                  <ShieldBadge
                    icon={card.icon}
                    gradient={card.gradient}
                    borderColor={card.borderColor}
                    shadowColor={card.shadowColor}
                    rankLevel={card.rankLevel}
                  />
                </Box>

                {/* Title */}
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: '#fff',
                    textAlign: 'center',
                    mb: 1,
                    letterSpacing: '0.5px',
                    textShadow: `0 2px 8px ${card.shadowColor}40`,
                  }}
                >
                  {card.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.55)',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    fontSize: '0.82rem',
                    px: 1,
                  }}
                >
                  {card.description}
                </Typography>

                {/* XP Bar */}
                <XPBar
                  label={card.xpLabel}
                  value={card.xpValue}
                  color={card.accentColor}
                  glowColor={card.glowColor}
                />
              </CardContent>

              {/* Action Button */}
              <CardActions sx={{ p: 3, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    card.action();
                  }}
                  sx={{
                    py: 1.5,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    borderRadius: 3,
                    background: card.buttonGradient,
                    color: card.buttonTextColor,
                    border: `2px solid ${card.borderColor}60`,
                    boxShadow: `0 4px 15px ${card.shadowColor}30`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                      backgroundSize: '200% 100%',
                      animation: `${shimmer} 3s linear infinite`,
                    },
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 8px 25px ${card.shadowColor}50`,
                      background: card.buttonGradient,
                    },
                    '&:active': {
                      transform: 'translateY(1px)',
                      boxShadow: `0 2px 8px ${card.shadowColor}30`,
                    },
                  }}
                >
                  {card.buttonText}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Data
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 3, mt: 1 }}>
            <InputLabel>Delete Mode</InputLabel>
            <Select
              value={deleteMode}
              label="Delete Mode"
              onChange={(e) => setDeleteMode(e.target.value as 'month' | 'all')}
              disabled={loading}
            >
              <MenuItem value="month">Delete by Month</MenuItem>
              <MenuItem value="all">Delete All Data</MenuItem>
            </Select>
          </FormControl>

          {deleteMode === 'month' && (
            <FormControl fullWidth>
              <InputLabel>Select Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Select Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={loading || availableMonths.length === 0}
              >
                {availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {deleteMode === 'all' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              ⚠️ This will permanently delete ALL metrics and badges from the database. This action cannot be undone!
            </Alert>
          )}

          {deleteMode === 'month' && selectedMonth && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will delete all metrics and badges for {selectedMonth}. This action cannot be undone!
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading || (deleteMode === 'month' && !selectedMonth)}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

