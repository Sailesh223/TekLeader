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
  Divider,
  LinearProgress,
  keyframes,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  EmojiEvents as TrophyIcon,
  ViewList as ViewListIcon,
  AccountTree as TreeIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  AutoAwesome as SparkleIcon,
  Groups as GroupsIcon,
  Speed as SpeedIcon,
  WorkspacePremium as PremiumIcon,
  LocalFireDepartment as FireIcon,
  Bolt as BoltIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { bandColors } from '../theme';
import OrgTreeView from '../components/OrgTreeView';
import BadgeList from '../components/BadgeList';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

// ─── Keyframes ──────────────────────────────────────────────
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 8px rgba(0,150,136,0.3)); }
  50% { filter: drop-shadow(0 0 20px rgba(0,150,136,0.6)); }
`;

const slideUp = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

const xpFill = keyframes`
  0% { width: 0%; }
  100% { width: var(--target-width); }
`;

// ─── Band Config ─────────────────────────────────────────────
const BAND_CONFIG: Record<string, { color: string; glow: string; icon: string; gradient: string }> = {
  Gold: {
    color: '#FFD700',
    glow: '#FFAB00',
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
  },
  Silver: {
    color: '#78909C',
    glow: '#B0BEC5',
    icon: '🥈',
    gradient: 'linear-gradient(135deg, #B0BEC5 0%, #78909C 100%)',
  },
  Bronze: {
    color: '#FF8A65',
    glow: '#FFAB91',
    icon: '🥉',
    gradient: 'linear-gradient(135deg, #FFAB91 0%, #FF8A65 100%)',
  },
  'Ignition Zone': {
    color: '#EF5350',
    glow: '#E57373',
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)',
  },
};

const getBandConfig = (band: string) =>
  BAND_CONFIG[band] || { color: '#999', glow: '#aaa', icon: '⚪', gradient: 'linear-gradient(135deg, #999, #777)' };

// ─── Progress Ring Component ─────────────────────────────────
interface MiniRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  children?: React.ReactNode;
}

function MiniRing({ value, max, size = 80, strokeWidth = 6, color, children }: MiniRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min((value / max) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ─── Stat Card Component ─────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  glowColor: string;
  subtitle?: string;
  delay?: number;
}

function StatCard({ icon, label, value, color, glowColor, subtitle, delay = 0 }: StatCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: 'linear-gradient(160deg, #ffffff 0%, #f5f5f5 50%, #fafafa 100%)',
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 20px rgba(0,150,136,0.08)`,
        transition: 'all 0.4s ease',
        animation: `$${slideUp} $${0.5 + delay * 0.1}s ease-out`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          border: `1px solid ${color}50`,
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 30px rgba(0,0,0,0.2), 0 0 20px ${color}15`,
        },
      }}
    >
      {/* Top glow */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

      {/* Corner glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${color}15`,
            border: `1px solid ${color}30`,
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'rgba(0,0,0,0.5)',
              mb: 0.3,
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.8rem',
              color: color,
              lineHeight: 1,
              textShadow: `0 0 20px ${color}30`,
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.4)', mt: 0.3, fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// ─── Score Badge ─────────────────────────────────────────────
function ScoreBadge({ score, size = 'medium' }: { score: number; size?: 'small' | 'medium' | 'large' }) {
  const color = score >= 80 ? '#FFD700' : score >= 60 ? '#78909C' : score >= 40 ? '#FF8A65' : '#EF5350';
  const sizes = { small: { w: 44, h: 44, fs: '0.85rem' }, medium: { w: 56, h: 56, fs: '1.1rem' }, large: { w: 70, h: 70, fs: '1.4rem' } };
  const s = sizes[size];

  return (
    <Box
      sx={{
        width: s.w,
        height: s.h,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}15`,
        border: `2px solid ${color}40`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
        },
      }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: s.fs, color: color, zIndex: 1, textShadow: `0 0 12px ${color}40` }}>
        {score.toFixed(1)}
      </Typography>
    </Box>
  );
}

// ─── Utilization Bar ─────────────────────────────────────────
function UtilizationBar({ value, label }: { value: number; label?: string }) {
  const color = value >= 80 ? '#009688' : value >= 60 ? '#FFD700' : value >= 40 ? '#FF8A65' : '#EF5350';

  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ mb: 0.5 }}>
          <Typography sx={{ fontSize: '0.6rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', mb: 0.2 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: color, fontWeight: 800 }}>
            {value.toFixed(1)}%
          </Typography>
        </Box>
      )}
      <Box sx={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${Math.min(value, 100)}%`,
            borderRadius: 3,
            background: `linear-gradient(90deg, $${color}, $${color}CC)`,
            boxShadow: `0 0 8px ${color}40`,
            transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Team Member Row ─────────────────────────────────────────
function TeamMemberRow({ member, index }: { member: any; index: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.2,
        px: 1.5,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
        '&:hover': {
          background: 'rgba(0,191,165,0.05)',
        },
      }}
    >
      {/* Status indicator */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: member.isUtilizing ? '#00BFA5' : '#EF5350',
          boxShadow: member.isUtilizing ? '0 0 8px #00BFA560' : '0 0 8px #EF535060',
          animation: member.isUtilizing ? 'none' : `${pulse} 2s ease-in-out infinite`,
        }}
      />

      {/* Avatar */}
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: '0.75rem',
          fontWeight: 700,
          bgcolor: member.isUtilizing ? 'rgba(0,191,165,0.15)' : 'rgba(239,83,80,0.15)',
          color: member.isUtilizing ? '#00BFA5' : '#EF5350',
          border: `1px solid ${member.isUtilizing ? '#00BFA530' : '#EF535030'}`,
        }}
      >
        {member.name.charAt(0)}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#00695C',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {member.name}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.5)' }}>
          {member.department}
        </Typography>
      </Box>

      {/* 1:1s chip */}
      <Chip
        size="small"
        label={`${member.oneOnOnesCount} 1:1s`}
        sx={{
          height: 22,
          fontSize: '0.6rem',
          fontWeight: 700,
          background: member.oneOnOnesCount > 0 ? 'rgba(0,150,136,0.1)' : 'rgba(0,0,0,0.05)',
          color: member.oneOnOnesCount > 0 ? '#009688' : 'rgba(0,0,0,0.3)',
          border: `1px solid ${member.oneOnOnesCount > 0 ? '#00968820' : 'rgba(0,0,0,0.1)'}`,
        }}
      />

      {/* Status chip */}
      <Chip
        size="small"
        icon={
          member.isUtilizing ? (
            <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#00BFA5 !important' }} />
          ) : (
            <CancelIcon sx={{ fontSize: '14px !important', color: '#EF5350 !important' }} />
          )
        }
        label={member.isUtilizing ? 'Active' : 'Inactive'}
        sx={{
          height: 22,
          fontSize: '0.6rem',
          fontWeight: 700,
          background: member.isUtilizing ? 'rgba(0,191,165,0.1)' : 'rgba(239,83,80,0.1)',
          color: member.isUtilizing ? '#00BFA5' : '#EF5350',
          border: `1px solid ${member.isUtilizing ? '#00BFA520' : '#EF535020'}`,
        }}
      />
    </Box>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────
function LightSection({ children, accentColor = '#009688', delay = 0 }: { children: React.ReactNode; accentColor?: string; delay?: number }) {
  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)',
        border: `1px solid ${accentColor}30`,
        boxShadow: '0 8px 40px rgba(0,150,136,0.12)',
        animation: `$${slideUp} $${0.6 + delay * 0.1}s ease-out`,
        position: 'relative',
        mb: 3,
      }}
    >
      {/* Top glow bar */}
      <Box sx={{ height: 3, background: `linear-gradient(90deg, transparent, $${accentColor}, transparent)`, boxShadow: `0 0 15px $${accentColor}30` }} />
      {children}
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════
// INTERFACES
// ══════════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
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
      setAvailableMonths(Array.isArray(data.months) ? data.months : []);
    } catch (err) {
      console.error('Failed to load available months', err);
      setAvailableMonths([]);
    }
  };

  const handleAwardBadge = (manager: ManagerNode) => {
    setSelectedManager(manager);
    setSelectedBadge('PREMIUM_BADGE');
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
      if (response.ok && result.success) {
        alert('Premium Badge (Frame 5) awarded successfully! ✨🏆');
        handleCloseBadgeDialog();
        loadHierarchy();
      } else {
        alert(result.message || 'Failed to award badge.');
      }
    } catch (err) {
      console.error('Error awarding Premium Badge:', err);
      alert('Error awarding Premium Badge: ' + err);
    }
  };

  const totalManagers = hierarchy.reduce((sum, fh) => sum + fh.totalManagers, 0);
  const totalTeamMembers = hierarchy.reduce((sum, fh) => sum + fh.totalTeamMembers, 0);
  const avgScore = hierarchy.length > 0 ? hierarchy.reduce((sum, fh) => sum + fh.avgScore, 0) / hierarchy.length : 0;

  // ─── LOADING STATE ─────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, gap: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress size={60} sx={{ color: '#009688' }} />
          <Box
            sx={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(0,150,136,0.15)',
              borderTopColor: '#009688',
              animation: `${rotate} 2s linear infinite`,
            }}
          />
        </Box>
        <Typography sx={{ color: '#00695C', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
          Loading Hierarchy...
        </Typography>
      </Box>
    );
  }

  // ─── ERROR STATE ───────────────────────────────────────────
  if (error) {
    return (
      <LightSection accentColor="#EF5350">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2rem', mb: 1 }}>⚠️</Typography>
          <Typography sx={{ color: '#EF5350', fontWeight: 700, mb: 1 }}>{error}</Typography>
          <Button variant="outlined" sx={{ color: '#EF5350', borderColor: '#EF535040' }} onClick={loadHierarchy}>
            Retry
          </Button>
        </Box>
      </LightSection>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* ═══ HEADER ═══ */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, animation: `${slideUp} 0.4s ease-out` }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <ShieldIcon sx={{ fontSize: 36, color: '#009688', animation: `${glow} 3s ease-in-out infinite` }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #00695C 0%, #009688 50%, #26A69A 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${shimmer} 4s linear infinite`,
                letterSpacing: '1px',
              }}
            >
              Functional Head HQ
            </Typography>
          </Box>
          <Typography sx={{ color: '#00695C', fontWeight: 600, fontSize: '0.9rem', ml: 6.5 }}>
            Command your organization hierarchy, award badges & track performance
          </Typography>
        </Box>

        {/* View Toggle */}
        <Box
          sx={{
            p: 0.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
            border: '1px solid rgba(0,150,136,0.3)',
          }}
        >
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                color: 'rgba(0,0,0,0.6)',
                border: 'none',
                px: 2,
                py: 0.8,
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                '&.Mui-selected': {
                  color: '#009688',
                  background: 'rgba(0,150,136,0.15)',
                  borderRadius: '8px !important',
                  boxShadow: '0 0 15px rgba(0,191,165,0.15)',
                },
                '&:hover': {
                  background: 'rgba(0,191,165,0.08)',
                },
              },
            }}
          >
            <ToggleButton value="list">
              <ViewListIcon sx={{ mr: 0.8, fontSize: 18 }} />
              List
            </ToggleButton>
            <ToggleButton value="tree">
              <TreeIcon sx={{ mr: 0.8, fontSize: 18 }} />
              Tree
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ═══ STAT CARDS ═══ */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ fontSize: 24 }} />}
            label="Total Managers"
            value={totalManagers}
            color="#009688"
            glowColor="#26A69A"
            subtitle="Across all functional heads"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<GroupsIcon sx={{ fontSize: 24 }} />}
            label="Team Members"
            value={totalTeamMembers}
            color="#7C4DFF"
            glowColor="#B388FF"
            subtitle="Total headcount"
            delay={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon sx={{ fontSize: 24 }} />}
            label="Average Score"
            value={avgScore.toFixed(1)}
            color="#FFD700"
            glowColor="#FFAB00"
            subtitle="Organization-wide"
            delay={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ShieldIcon sx={{ fontSize: 24 }} />}
            label="Functional Heads"
            value={hierarchy.length}
            color="#E040FB"
            glowColor="#EA80FC"
            subtitle="Leadership count"
            delay={3}
          />
        </Grid>
      </Grid>

      {/* ═══ TREE VIEW ═══ */}
      {viewMode === 'tree' ? (
        <LightSection accentColor="#7C4DFF" delay={2}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(124,77,255,0.15)',
                  border: '1px solid rgba(124,77,255,0.3)',
                  fontSize: '1.1rem',
                }}
              >
                🌳
              </Box>
              <Typography sx={{ fontWeight: 800, color: '#00695C', fontSize: '1.1rem' }}>
                Organization Tree
              </Typography>
              <Chip
                size="small"
                label="INTERACTIVE"
                sx={{
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  height: 20,
                  background: 'rgba(124,77,255,0.15)',
                  color: '#B388FF',
                  border: '1px solid rgba(124,77,255,0.3)',
                  letterSpacing: '1px',
                }}
              />
            </Box>
            <OrgTreeView hierarchy={hierarchy} />
          </Box>
        </LightSection>
      ) : (
        <>
          {/* ═══ LIST VIEW — HIERARCHY ═══ */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, animation: `${slideUp} 0.8s ease-out` }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,150,136,0.15)',
                border: '1px solid rgba(0,150,136,0.3)',
                fontSize: '1.1rem',
              }}
            >
              🏰
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '1.2rem',
                background: 'linear-gradient(135deg, #009688 0%, #26A69A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Organization Hierarchy
            </Typography>
            <Chip
              size="small"
              label={`$${hierarchy.length} HEAD$${hierarchy.length !== 1 ? 'S' : ''}`}
              sx={{
                fontSize: '0.6rem',
                fontWeight: 800,
                height: 22,
                background: 'rgba(0,150,136,0.12)',
                color: '#009688',
                border: '1px solid rgba(0,150,136,0.25)',
                letterSpacing: '1px',
              }}
            />
          </Box>

          {hierarchy.map((fh, fhIndex) => (
            <LightSection key={fh.name} accentColor="#009688" delay={fhIndex + 3}>
              <Box sx={{ p: 3 }}>
                {/* ── Functional Head Header ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        background: 'linear-gradient(135deg, #009688 0%, #26A69A 100%)',
                        border: '2px solid rgba(0,150,136,0.3)',
                        boxShadow: '0 0 20px rgba(0,150,136,0.2)',
                      }}
                    >
                      {fh.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 900, fontSize: '1.2rem', color: '#00695C', letterSpacing: '0.3px' }}>
                        {fh.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', fontWeight: 500 }}>
                        Functional Head • {fh.directors.length} Director{fh.directors.length !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Quick stats pills */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {[
                      { label: 'Managers', value: fh.totalManagers, color: '#00BFA5', icon: '👤' },
                      { label: 'Members', value: fh.totalTeamMembers, color: '#7C4DFF', icon: '👥' },
                      { label: 'Avg Score', value: fh.avgScore.toFixed(1), color: '#FFD700', icon: '⚡' },
                    ].map((pill, i) => (
                      <Box
                        key={i}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          px: 1.5,
                          py: 0.6,
                          borderRadius: 2,
                          background: `${pill.color}10`,
                          border: `1px solid ${pill.color}20`,
                        }}
                      >
                        <Typography sx={{ fontSize: '0.8rem' }}>{pill.icon}</Typography>
                        <Box>
                          <Typography sx={{ fontSize: '0.55rem', color: 'rgba(0,0,0,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {pill.label}
                          </Typography>
                          <Typography sx={{ fontSize: '0.85rem', color: pill.color, fontWeight: 900, lineHeight: 1 }}>
                            {pill.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)', mb: 2 }} />

                {/* ── Directors ── */}
                {fh.directors.map((director, dirIndex) => (
                  <Accordion
                    key={director.id}
                    sx={{
                      mb: 1.5,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px !important',
                      overflow: 'hidden',
                      '&::before': { display: 'none' },
                      '&.Mui-expanded': {
                        border: '1px solid rgba(0,191,165,0.2)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(0,0,0,0.4)' }} />}
                      sx={{
                        '&:hover': { background: 'rgba(0,150,136,0.04)' },
                        '& .MuiAccordionSummary-content': { my: 1.5 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                        {/* Director Avatar */}
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={director.avatarUrl || undefined}
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: 'rgba(0,191,165,0.15)',
                              color: '#00BFA5',
                              fontWeight: 700,
                              border: '2px solid rgba(0,191,165,0.2)',
                            }}
                          >
                            {director.name.charAt(0)}
                          </Avatar>
                          {/* Role indicator */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: -2,
                              right: -2,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #00BFA5, #00E5FF)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid #1a1f3a',
                            }}
                          >
                            <StarIcon sx={{ fontSize: 9, color: '#fff' }} />
                          </Box>
                        </Box>

                        {/* Director Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#00695C' }}>
                            {director.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)' }}>
                            {director.email}
                          </Typography>
                        </Box>

                        {/* Director stats */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            size="small"
                            label={`${director.managers.length} mgrs`}
                            sx={{
                              height: 24,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              background: 'rgba(0,191,165,0.1)',
                              color: '#00BFA5',
                              border: '1px solid rgba(0,191,165,0.2)',
                            }}
                          />
                          <Chip
                            size="small"
                            label={`${director.totalTeamMembers} members`}
                            sx={{
                              height: 24,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              background: 'rgba(124,77,255,0.1)',
                              color: '#B388FF',
                              border: '1px solid rgba(124,77,255,0.2)',
                            }}
                          />
                          <ScoreBadge score={director.avgScore} size="small" />
                        </Box>
                      </Box>
                    </AccordionSummary>

                    <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Box sx={{ pl: 2, borderLeft: '2px solid rgba(0,191,165,0.1)' }}>
                        {/* ── Managers ── */}
                        {director.managers.map((manager, mgrIndex) => (
                          <Accordion
                            key={manager.id}
                            sx={{
                              mb: 1.5,
                              background: 'rgba(255,255,255,0.015)',
                              border: `1px solid ${getBandConfig(manager.classificationBand).color}15`,
                              borderRadius: '10px !important',
                              overflow: 'hidden',
                              '&::before': { display: 'none' },
                              '&.Mui-expanded': {
                                border: `1px solid ${getBandConfig(manager.classificationBand).color}30`,
                                boxShadow: `0 4px 20px ${getBandConfig(manager.classificationBand).color}10`,
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(0,0,0,0.4)' }} />}
                              sx={{
                                '&:hover': { background: `${getBandConfig(manager.classificationBand).color}05` },
                                '& .MuiAccordionSummary-content': { my: 1.2 },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                {/* Rank indicator */}
                                <Typography sx={{ fontSize: '1.2rem', width: 28, textAlign: 'center' }}>
                                  {getBandConfig(manager.classificationBand).icon}
                                </Typography>

                                {/* Manager Avatar */}
                                <Box sx={{ position: 'relative' }}>
                                  <Avatar
                                    src={manager.avatarUrl || undefined}
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      bgcolor: `${getBandConfig(manager.classificationBand).color}20`,
                                      color: getBandConfig(manager.classificationBand).color,
                                      fontWeight: 700,
                                      fontSize: '0.9rem',
                                      border: `2px solid ${getBandConfig(manager.classificationBand).color}30`,
                                    }}
                                  >
                                    {manager.displayName.charAt(0)}
                                  </Avatar>
                                </Box>

                                {/* Manager Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#00695C' }}>
                                      {manager.displayName}
                                    </Typography>
                                    {/* Band chip */}
                                    <Chip
                                      size="small"
                                      label={manager.classificationBand}
                                      sx={{
                                        height: 20,
                                        fontSize: '0.58rem',
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        background: `${getBandConfig(manager.classificationBand).color}15`,
                                        color: getBandConfig(manager.classificationBand).color,
                                        border: `1px solid ${getBandConfig(manager.classificationBand).color}30`,
                                      }}
                                    />
                                  </Box>
                                  <Typography sx={{ fontSize: '0.68rem', color: 'rgba(0,0,0,0.5)' }}>
                                    {manager.email}
                                  </Typography>
                                </Box>

                                {/* Manager Metrics */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {/* Utilization mini */}
                                  <Box sx={{ width: 80 }}>
                                    <UtilizationBar value={manager.utilization} label="Utilization" />
                                  </Box>

                                  {/* Headcount */}
                                  <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ fontSize: '0.55rem', color: 'rgba(0,0,0,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                      Team
                                    </Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#7C4DFF' }}>
                                      {manager.headcount}
                                    </Typography>
                                  </Box>

                                  {/* Score */}
                                  <ScoreBadge score={manager.finalScore} size="small" />
                                </Box>
                              </Box>
                            </AccordionSummary>

                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 1 }}>
                              {/* ── Manager Detail Panel ── */}
                              <Box
                                sx={{
                                  borderRadius: 3,
                                  background: 'linear-gradient(135deg, rgba(224,242,241,0.5) 0%, rgba(178,223,219,0.3) 100%)',
                                  border: '1px solid rgba(0,150,136,0.15)',
                                  overflow: 'hidden',
                                }}
                              >
                                {/* Badges Section */}
                                <Box sx={{ p: 2.5 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography sx={{ fontSize: '0.95rem' }}>🏅</Typography>
                                      <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#FFD700' }}>
                                        Badges & Achievements
                                      </Typography>
                                      {manager.badges.length > 0 && (
                                        <Chip
                                          size="small"
                                          label={manager.badges.length}
                                          sx={{
                                            height: 18,
                                            fontSize: '0.6rem',
                                            fontWeight: 800,
                                            background: 'rgba(255,215,0,0.15)',
                                            color: '#FFD700',
                                            border: '1px solid rgba(255,215,0,0.25)',
                                            minWidth: 24,
                                          }}
                                        />
                                      )}
                                    </Box>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      startIcon={<TrophyIcon sx={{ fontSize: '16px !important' }} />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAwardBadge(manager);
                                      }}
                                      sx={{
                                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                                        color: '#1a1a2e',
                                        fontWeight: 800,
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        px: 2,
                                        py: 0.6,
                                        borderRadius: 2,
                                        border: '1px solid rgba(255,215,0,0.5)',
                                        boxShadow: '0 4px 12px rgba(255,215,0,0.2)',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #FFA000 0%, #FFD700 100%)',
                                          boxShadow: '0 6px 20px rgba(255,215,0,0.3)',
                                          transform: 'translateY(-2px)',
                                        },
                                      }}
                                    >
                                      Award Badge
                                    </Button>
                                  </Box>

                                  {manager.badges.length > 0 ? (
                                    <Box
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        background: 'rgba(255,215,0,0.04)',
                                        border: '1px solid rgba(255,215,0,0.1)',
                                      }}
                                    >
                                      <BadgeList badges={manager.badges} size={48} spacing={1.5} />
                                    </Box>
                                  ) : (
                                    <Box
                                      sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px dashed rgba(255,255,255,0.08)',
                                        textAlign: 'center',
                                      }}
                                    >
                                      <Typography sx={{ fontSize: '1.5rem', mb: 0.5, opacity: 0.4 }}>🏅</Typography>
                                      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.35)', fontWeight: 600 }}>
                                        No badges earned yet — Award one!
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

                                {/* Team Members Section */}
                                <Box sx={{ p: 2.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography sx={{ fontSize: '0.95rem' }}>👥</Typography>
                                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#00BFA5' }}>
                                      Team Members
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={manager.teamMembers.length}
                                      sx={{
                                        height: 18,
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        background: 'rgba(0,191,165,0.12)',
                                        color: '#00BFA5',
                                        border: '1px solid rgba(0,191,165,0.2)',
                                        minWidth: 24,
                                      }}
                                    />

                                    {/* Active/Inactive count */}
                                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                      <Chip
                                        size="small"
                                        icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#00BFA5 !important' }} />}
                                        label={`${manager.teamMembers.filter((m) => m.isUtilizing).length} Active`}
                                        sx={{
                                          height: 20,
                                          fontSize: '0.58rem',
                                          fontWeight: 700,
                                          background: 'rgba(0,191,165,0.08)',
                                          color: '#00BFA5',
                                          border: '1px solid rgba(0,191,165,0.15)',
                                        }}
                                      />
                                      <Chip
                                        size="small"
                                        icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#EF5350 !important' }} />}
                                        label={`${manager.teamMembers.filter((m) => !m.isUtilizing).length} Inactive`}
                                        sx={{
                                          height: 20,
                                          fontSize: '0.58rem',
                                          fontWeight: 700,
                                          background: 'rgba(239,83,80,0.08)',
                                          color: '#EF5350',
                                          border: '1px solid rgba(239,83,80,0.15)',
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Team utilization bar */}
                                  <Box sx={{ mb: 2, px: 1 }}>
                                    <UtilizationBar value={manager.utilization} label="Team Utilization Rate" />
                                  </Box>

                                  {/* Member List */}
                                  <Box
                                    sx={{
                                      borderRadius: 2,
                                      background: 'rgba(0,0,0,0.1)',
                                      border: '1px solid rgba(255,255,255,0.03)',
                                      maxHeight: 300,
                                      overflow: 'auto',
                                      '&::-webkit-scrollbar': { width: 4 },
                                      '&::-webkit-scrollbar-track': { background: 'transparent' },
                                      '&::-webkit-scrollbar-thumb': { background: 'rgba(0,191,165,0.3)', borderRadius: 2 },
                                    }}
                                  >
                                    {manager.teamMembers.map((member, idx) => (
                                      <TeamMemberRow key={idx} member={member} index={idx} />
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </LightSection>
          ))}
        </>
      )}

      {/* ═══ AWARD BADGE DIALOG ═══ */}
      <Dialog
        open={badgeDialogOpen}
        onClose={handleCloseBadgeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(160deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)',
            border: '1px solid rgba(0,150,136,0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,150,136,0.15)',
          },
        }}
      >
        {/* Dialog glow bar */}
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, transparent, #009688, transparent)', boxShadow: '0 0 15px rgba(0,150,136,0.2)' }} />

        <DialogTitle sx={{ pt: 3, pb: 1, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,215,0,0.12)',
                border: '1px solid rgba(255,215,0,0.25)',
                animation: `${float} 3s ease-in-out infinite`,
              }}
            >
              <TrophyIcon sx={{ color: '#009688', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 900, color: '#00695C', fontSize: '1.1rem' }}>
                Award Premium Badge
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)' }}>
                Frame 5 • {selectedManager?.displayName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 2 }}>
          {/* Manager preview card */}
          {selectedManager && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2.5,
                background: 'rgba(255,215,0,0.06)',
                border: '1px solid rgba(255,215,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={selectedManager.avatarUrl || undefined}
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: `${getBandConfig(selectedManager.classificationBand).color}20`,
                  color: getBandConfig(selectedManager.classificationBand).color,
                  fontWeight: 700,
                  border: `2px solid ${getBandConfig(selectedManager.classificationBand).color}30`,
                }}
              >
                {selectedManager.displayName.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#00695C', fontSize: '0.9rem' }}>
                  {selectedManager.displayName}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)' }}>
                  {selectedManager.email}
                </Typography>
              </Box>
              <ScoreBadge score={selectedManager.finalScore} size="small" />
            </Box>
          )}

          {/* Info alert */}
          <Box
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: 'rgba(0,191,165,0.08)',
              border: '1px solid rgba(0,191,165,0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <SparkleIcon sx={{ color: '#009688', fontSize: 20, mt: 0.2 }} />
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(0,0,0,0.6)', lineHeight: 1.6 }}>
              As a Functional Head, you can award the exclusive <Box component="span" sx={{ color: '#009688', fontWeight: 700 }}>Premium Badge (Frame 5)</Box> to managers in your organization for outstanding performance.
            </Typography>
          </Box>

          {/* Month Select */}
          <FormControl
            fullWidth
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                color: '#00695C',
                '& fieldset': { borderColor: 'rgba(0,150,136,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(0,150,136,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#009688' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#009688' },
              '& .MuiSvgIcon-root': { color: 'rgba(0,0,0,0.4)' },
            }}
          >
            <InputLabel>Select Month</InputLabel>
            <Select
              value={badgeMonth}
              onChange={(e) => setBadgeMonth(e.target.value)}
              label="Select Month"
              MenuProps={{
                PaperProps: {
                  sx: {
                    background: '#ffffff',
                    border: '1px solid rgba(0,150,136,0.3)',
                    '& .MuiMenuItem-root': {
                      color: '#00695C',
                      fontSize: '0.85rem',
                      '&:hover': { background: 'rgba(0,150,136,0.08)' },
                      '&.Mui-selected': {
                        background: 'rgba(255,215,0,0.15)',
                        '&:hover': { background: 'rgba(255,215,0,0.2)' },
                      },
                    },
                  },
                },
              }}
            >
              {(availableMonths || []).map((month) => (
                <MenuItem key={month} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Reason TextField */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Award"
            value={badgeReason}
            onChange={(e) => setBadgeReason(e.target.value)}
            placeholder="Describe why this manager deserves the Premium Badge..."
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#00695C',
                fontSize: '0.88rem',
                '& fieldset': { borderColor: 'rgba(0,150,136,0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(0,150,136,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#009688' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(0,0,0,0.5)' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#009688' },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(0,0,0,0.3)' },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, gap: 1.5 }}>
          <Button
            onClick={handleCloseBadgeDialog}
            sx={{
              color: 'rgba(0,0,0,0.6)',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              px: 2.5,
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': {
                background: 'rgba(0,0,0,0.03)',
                borderColor: 'rgba(0,0,0,0.2)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitBadge}
            variant="contained"
            startIcon={
              <SparkleIcon
                sx={{
                  fontSize: '18px !important',
                  animation: `${sparkle} 2s ease-in-out infinite`,
                }}
              />
            }
            sx={{
              background: 'linear-gradient(135deg, #009688 0%, #00695C 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              px: 3,
              py: 1,
              borderRadius: 2,
              border: '1px solid rgba(255,215,0,0.5)',
              boxShadow: '0 4px 15px rgba(255,215,0,0.25)',
              position: 'relative',
              overflow: 'hidden',
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
                background: 'linear-gradient(135deg, #00695C 0%, #009688 100%)',
                boxShadow: '0 8px 25px rgba(0,150,136,0.35)',
                transform: 'translateY(-2px)',
              },
              '&:active': {
                transform: 'translateY(1px)',
                boxShadow: '0 2px 8px rgba(255,215,0,0.2)',
              },
            }}
          >
            Award Premium Badge ✨
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ EMPTY STATE ═══ */}
      {!loading && hierarchy.length === 0 && (
        <LightSection accentColor="#78909C">
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(120,144,156,0.1)',
                border: '2px solid rgba(120,144,156,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                animation: `${float} 4s ease-in-out infinite`,
              }}
            >
              <Typography sx={{ fontSize: '2rem' }}>🏰</Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#00695C',
                fontSize: '1.1rem',
                mb: 1,
              }}
            >
              No Hierarchy Data Available
            </Typography>
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: 'rgba(0,0,0,0.5)',
                maxWidth: 400,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              No organization data found for the selected month. Please ensure data has been uploaded
              or select a different month.
            </Typography>
          </Box>
        </LightSection>
      )}

      {/* ═══ BOTTOM SUMMARY BAR ═══ */}
      {!loading && hierarchy.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
            border: '1px solid rgba(0,150,136,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            flexWrap: 'wrap',
            animation: `${slideUp} 1.2s ease-out`,
          }}
        >
          {[
            {
              label: 'Functional Heads',
              value: hierarchy.length,
              icon: '🛡️',
              color: '#E040FB',
            },
            {
              label: 'Directors',
              value: hierarchy.reduce(
                (sum, fh) => sum + fh.directors.length,
                0
              ),
              icon: '⭐',
              color: '#00BFA5',
            },
            {
              label: 'Managers',
              value: totalManagers,
              icon: '👤',
              color: '#7C4DFF',
            },
            {
              label: 'Team Members',
              value: totalTeamMembers,
              icon: '👥',
              color: '#00E5FF',
            },
            {
              label: 'Avg Score',
              value: avgScore.toFixed(1),
              icon: '⚡',
              color: '#FFD700',
            },
          ].map((stat, i) => (
            <Box key={i} sx={{ textAlign: 'center', minWidth: 90 }}>
              <Typography sx={{ fontSize: '1.1rem', mb: 0.3 }}>
                {stat.icon}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  color: stat.color,
                  textShadow: `0 0 15px ${stat.color}30`,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  color: 'rgba(0,0,0,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}