import { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Collapse,
  IconButton,
  Grid,
  keyframes,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Circle as CircleIcon,
  AccountTree as TreeIcon,
} from '@mui/icons-material';

// ─── Keyframes ──────────────────────────────────────────────
const slideDown = keyframes`
  0% { opacity: 0; transform: translateY(-15px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideRight = keyframes`
  0% { opacity: 0; transform: translateX(-20px); }
  100% { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--glow-color); }
  50% { opacity: 0.7; box-shadow: 0 0 20px var(--glow-color); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

const growLine = keyframes`
  0% { height: 0; opacity: 0; }
  100% { height: 100%; opacity: 1; }
`;

const growWidth = keyframes`
  0% { width: 0; opacity: 0; }
  100% { width: 100%; opacity: 1; }
`;

const nodeAppear = keyframes`
  0% { opacity: 0; transform: scale(0.8) translateY(-10px); }
  60% { transform: scale(1.03) translateY(0); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
`;

const dotPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 1; }
`;

// ─── Types ──────────────────────────────────────────────────
interface TeamMemberNode {
  name: string;
  department: string;
  isUtilizing: boolean;
  oneOnOnesCount: number;
}

interface ManagerNode {
  id: string;
  displayName: string;
  email: string;
  classificationBand: string;
  finalScore: number;
  headcount: number;
  teamMembers: TeamMemberNode[];
}

interface DirectorNode {
  id: string;
  name: string;
  email: string;
  managers: ManagerNode[];
  totalTeamMembers: number;
  avgScore: number;
}

interface FunctionalHeadNode {
  name: string;
  directors: DirectorNode[];
  totalManagers: number;
  totalTeamMembers: number;
  avgScore: number;
}

interface OrgTreeViewProps {
  hierarchy: FunctionalHeadNode[];
}

// ─── Band Config ─────────────────────────────────────────────
const BAND_CONFIG: Record<string, { color: string; glow: string; icon: string; gradient: string; bg: string }> = {
  Gold: {
    color: '#FFD700',
    glow: '#FFAB00',
    icon: '🥇',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
    bg: 'rgba(255,215,0,0.08)',
  },
  Silver: {
    color: '#78909C',
    glow: '#B0BEC5',
    icon: '🥈',
    gradient: 'linear-gradient(135deg, #B0BEC5 0%, #78909C 100%)',
    bg: 'rgba(120,144,156,0.08)',
  },
  Bronze: {
    color: '#FF8A65',
    glow: '#FFAB91',
    icon: '🥉',
    gradient: 'linear-gradient(135deg, #FFAB91 0%, #FF8A65 100%)',
    bg: 'rgba(255,138,101,0.08)',
  },
  'Ignition Zone': {
    color: '#EF5350',
    glow: '#E57373',
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #EF5350 0%, #C62828 100%)',
    bg: 'rgba(239,83,80,0.08)',
  },
};

const getBandConfig = (band: string) =>
  BAND_CONFIG[band] || {
    color: '#999',
    glow: '#aaa',
    icon: '⚪',
    gradient: 'linear-gradient(135deg, #999, #777)',
    bg: 'rgba(153,153,153,0.08)',
  };

// ─── Neon Connector Line (Vertical) ─────────────────────────
function VerticalConnector({ color = '#00BFA5', height = 24 }: { color?: string; height?: number }) {
  return (
    <Box
      sx={{
        width: 2,
        height: height,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: `linear-gradient(180deg, $${color}80, $${color})`,
          boxShadow: `0 0 8px ${color}60`,
          animation: `${growLine} 0.5s ease-out`,
        }}
      />
      {/* Glowing dot at bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -3,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 10px ${color}`,
          animation: `${dotPulse} 2s ease-in-out infinite`,
        }}
      />
    </Box>
  );
}

// ─── Score Display ───────────────────────────────────────────
function ScoreDisplay({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 80 ? '#FFD700' : score >= 60 ? '#00BFA5' : score >= 40 ? '#FF8A65' : '#EF5350';
  const dims = { sm: { w: 40, h: 40, fs: '0.8rem' }, md: { w: 50, h: 50, fs: '1rem' }, lg: { w: 60, h: 60, fs: '1.2rem' } };
  const d = dims[size];

  return (
    <Box
      sx={{
        width: d.w,
        height: d.h,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}12`,
        border: `2px solid ${color}35`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
        },
      }}
    >
      <Typography sx={{ fontWeight: 900, fontSize: d.fs, color, zIndex: 1, textShadow: `0 0 10px ${color}30` }}>
        {score.toFixed(1)}
      </Typography>
    </Box>
  );
}

// ─── Utilization Mini Bar ────────────────────────────────────
function MiniUtilBar({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? (active / total) * 100 : 0;
  const color = pct >= 80 ? '#00BFA5' : pct >= 60 ? '#FFD700' : pct >= 40 ? '#FF8A65' : '#EF5350';

  return (
    <Tooltip title={`$${active}/$${total} active (${pct.toFixed(0)}%)`}>
      <Box sx={{ width: 60 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.2 }}>
          <Typography sx={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active
          </Typography>
          <Typography sx={{ fontSize: '0.55rem', color, fontWeight: 800 }}>
            {pct.toFixed(0)}%
          </Typography>
        </Box>
        <Box sx={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: 2,
              background: `linear-gradient(90deg, $${color}, $${color}AA)`,
              boxShadow: `0 0 6px ${color}40`,
              transition: 'width 1s ease',
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  );
}

// ─── Node Wrapper ────────────────────────────────────────────
interface NodeCardProps {
  children: React.ReactNode;
  accentColor: string;
  onClick?: (e?: React.MouseEvent) => void;
  isExpanded?: boolean;
  delay?: number;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

function NodeCard({ children, accentColor, onClick, isExpanded, delay = 0, variant = 'secondary' }: NodeCardProps) {
  const bgMap = {
    primary: `linear-gradient(135deg, rgba(0,150,136,0.08) 0%, rgba(0,105,92,0.12) 100%)`,
    secondary: `linear-gradient(135deg, rgba(0,191,165,0.06) 0%, rgba(0,150,136,0.1) 100%)`,
    tertiary: `linear-gradient(135deg, rgba(0,191,165,0.06) 0%, rgba(0,150,136,0.1) 100%)`,
  };

  return (
    <Box
      className="NodeCard"
      onClick={onClick}
      sx={{
        p: variant === 'primary' ? 3 : 2.5,
        borderRadius: 3,
        background: bgMap[variant],
        border: `1px solid $${accentColor}$${isExpanded ? '35' : '15'}`,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        animation: `$${nodeAppear} 0.5s ease-out $${delay * 0.08}s both`,
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        '&:hover': onClick
          ? {
              border: `1px solid ${accentColor}50`,
              boxShadow: `0 8px 30px $${accentColor}12, 0 0 20px $${accentColor}08`,
              transform: 'translateY(-3px)',
            }
          : {},
      }}
    >
      {/* Top accent line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isExpanded ? 3 : 2,
          background: `linear-gradient(90deg, transparent 10%, $${accentColor}$${isExpanded ? '' : '80'} 50%, transparent 90%)`,
          boxShadow: isExpanded ? `0 0 12px ${accentColor}40` : 'none',
          transition: 'all 0.3s ease',
        }}
      />

      {/* Corner glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}08 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {children}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function OrgTreeView({ hierarchy }: OrgTreeViewProps) {
  const [expandedFH, setExpandedFH] = useState<Set<string>>(new Set());
  const [expandedDirectors, setExpandedDirectors] = useState<Set<string>>(new Set());
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());

  const toggleFH = (name: string) => {
    const newSet = new Set(expandedFH);
    newSet.has(name) ? newSet.delete(name) : newSet.add(name);
    setExpandedFH(newSet);
  };

  const toggleDirector = (id: string) => {
    const newSet = new Set(expandedDirectors);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedDirectors(newSet);
  };

  const toggleManager = (id: string) => {
    const newSet = new Set(expandedManagers);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setExpandedManagers(newSet);
  };

  return (
    <Box
      sx={{
        p: 3,
        overflowX: 'auto',
        minHeight: 400,
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(0,191,165,0.3)', borderRadius: 3 },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 1400, mx: 'auto' }}>
        {hierarchy.map((fh, fhIndex) => {
          const fhExpanded = expandedFH.has(fh.name);

          return (
            <Box key={`fh-$${fhIndex}-$${fh.name}`}>
              {/* ── Functional Head Node ── */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
                <Box sx={{ minWidth: 420, maxWidth: 550 }}>
                  <NodeCard
                    accentColor="#7C4DFF"
                    onClick={() => toggleFH(fh.name)}
                    isExpanded={fhExpanded}
                    delay={fhIndex}
                    variant="primary"
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                      {/* Avatar */}
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          sx={{
                            width: 64,
                            height: 64,
                            fontWeight: 800,
                            fontSize: '1.4rem',
                            background: 'linear-gradient(135deg, #7C4DFF 0%, #E040FB 100%)',
                            border: '3px solid rgba(124,77,255,0.3)',
                            boxShadow: '0 0 20px rgba(124,77,255,0.2)',
                          }}
                        >
                          {fh.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        {/* Crown */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -4,
                            fontSize: '1rem',
                            animation: `${float} 3s ease-in-out infinite`,
                          }}
                        >
                          👑
                        </Box>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            color: '#B388FF',
                            mb: 0.3,
                          }}
                        >
                          Functional Head
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: '1.15rem',
                            color: '#000',
                            mb: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {fh.name}
                        </Typography>

                        {/* Stats row */}
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {[
                            { label: `${fh.totalManagers} Mgrs`, color: '#00BFA5' },
                            { label: `${fh.totalTeamMembers} Members`, color: '#7C4DFF' },
                            { label: `Score: ${fh.avgScore.toFixed(1)}`, color: '#FFD700' },
                          ].map((chip, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={chip.label}
                              sx={{
                                height: 22,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                background: `${chip.color}12`,
                                color: chip.color,
                                border: `1px solid ${chip.color}25`,
                                letterSpacing: '0.3px',
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Expand icon */}
                      <IconButton
                        size="small"
                        sx={{
                          color: '#B388FF',
                          background: 'rgba(124,77,255,0.1)',
                          border: '1px solid rgba(124,77,255,0.2)',
                          transition: 'all 0.3s ease',
                          transform: fhExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          '&:hover': { background: 'rgba(124,77,255,0.2)' },
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </NodeCard>
                </Box>
              </Box>

              {/* Connector from FH to Directors */}
              <Collapse in={fhExpanded} timeout={400} unmountOnExit>
                <VerticalConnector color="#7C4DFF" height={28} />

                {/* ── Directors Grid ── */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                    gap: 3,
                    px: 2,
                    mt: 0,
                  }}
                >
                  {fh.directors.map((director, dirIndex) => {
                    const directorKey = `dir-$${fhIndex}-$${dirIndex}-${director.id}`;
                    const dirExpanded = expandedDirectors.has(directorKey);

                    return (
                      <Box key={directorKey}>
                        {/* Director Node */}
                        <NodeCard
                          accentColor="#00BFA5"
                          onClick={(e: any) => {
                            e?.stopPropagation?.();
                            toggleDirector(directorKey);
                          }}
                          isExpanded={dirExpanded}
                          delay={dirIndex}
                          variant="secondary"
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Avatar */}
                            <Box sx={{ position: 'relative' }}>
                              <Avatar
                                sx={{
                                  width: 52,
                                  height: 52,
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  background: 'linear-gradient(135deg, #00BFA5 0%, #00E5FF 100%)',
                                  border: '2px solid rgba(0,191,165,0.3)',
                                  boxShadow: '0 0 15px rgba(0,191,165,0.15)',
                                }}
                              >
                                {director.name.substring(0, 2).toUpperCase()}
                              </Avatar>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #00BFA5, #00E5FF)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px solid #1a1f3a',
                                }}
                              >
                                <StarIcon sx={{ fontSize: 10, color: '#fff' }} />
                              </Box>
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                sx={{
                                  fontSize: '0.55rem',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  letterSpacing: '1.5px',
                                  color: '#00BFA5',
                                  mb: 0.2,
                                }}
                              >
                                Director
                              </Typography>
                              <Tooltip title={`${director.name} - ${director.email}`} arrow placement="top">
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.95rem',
                                    color: '#000',
                                  }}
                                >
                                  {director.name}
                                </Typography>
                              </Tooltip>
                              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.5)', mt: 0.2 }}>
                                {director.email}
                              </Typography>
                            </Box>

                            {/* Director stats */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Chip
                                size="small"
                                label={`${director.managers.length} mgrs`}
                                sx={{
                                  height: 22,
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  background: 'rgba(0,191,165,0.1)',
                                  color: '#00BFA5',
                                  border: '1px solid rgba(0,191,165,0.2)',
                                }}
                              />
                              <ScoreDisplay score={director.avgScore} size="sm" />
                              <IconButton
                                size="small"
                                sx={{
                                  color: '#00BFA5',
                                  background: 'rgba(0,191,165,0.08)',
                                  border: '1px solid rgba(0,191,165,0.15)',
                                  transform: dirExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { background: 'rgba(0,191,165,0.15)' },
                                }}
                              >
                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </NodeCard>

                        {/* ── Managers ── */}
                        <Collapse in={dirExpanded} timeout={400} unmountOnExit>
                          <Box
                            sx={{
                              mt: 0,
                              ml: 3,
                              pl: 3,
                              borderLeft: '2px solid rgba(0,191,165,0.2)',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              pt: 2,
                            }}
                          >
                            {director.managers.map((manager, mgrIndex) => {
                              const managerKey = `mgr-$${fhIndex}-$${dirIndex}-$${mgrIndex}-$${manager.id}`;
                              const mgrExpanded = expandedManagers.has(managerKey);
                              const band = getBandConfig(manager.classificationBand);

                              return (
                                <Box key={managerKey} sx={{ position: 'relative' }}>
                                  {/* Simple horizontal connector line */}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: -24,
                                      top: 30,
                                      width: 20,
                                      height: 2,
                                      background: `rgba(0,191,165,0.25)`,
                                      borderRadius: 1,
                                    }}
                                  />

                                  <NodeCard
                                    accentColor={band.color}
                                    onClick={(e: any) => {
                                      e?.stopPropagation?.();
                                      toggleManager(managerKey);
                                    }}
                                    isExpanded={mgrExpanded}
                                    delay={mgrIndex}
                                    variant="tertiary"
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      {/* Rank emoji */}
                                      <Typography sx={{ fontSize: '1.2rem', width: 24, textAlign: 'center' }}>
                                        {band.icon}
                                      </Typography>

                                      {/* Avatar */}
                                      <Avatar
                                        sx={{
                                          width: 42,
                                          height: 42,
                                          fontWeight: 700,
                                          fontSize: '0.9rem',
                                          background: `${band.color}18`,
                                          color: band.color,
                                          border: `2px solid ${band.color}30`,
                                        }}
                                      >
                                        {manager.displayName.charAt(0)}
                                      </Avatar>

                                      {/* Info - Name with Hover Details */}
                                      <Box
                                        sx={{
                                          flex: 1,
                                          minWidth: 0,
                                          position: 'relative',
                                        }}
                                      >
                                        {/* Name - Always Visible */}
                                        <Typography
                                          sx={{
                                            fontWeight: 700,
                                            fontSize: '0.85rem',
                                            color: '#000',
                                          }}
                                        >
                                          {manager.displayName}
                                        </Typography>

                                        {/* Details - Show on Hover */}
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.8,
                                            mt: 0.5,
                                            maxHeight: 0,
                                            opacity: 0,
                                            overflow: 'hidden',
                                            transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease-in-out, margin-top 0.35s ease',
                                            '.NodeCard:hover &': {
                                              maxHeight: '200px',
                                              opacity: 1,
                                              mt: 1,
                                            },
                                          }}
                                        >
                                          {/* Row 1: Email */}
                                          <Typography sx={{ fontSize: '0.68rem', color: '#00695C', fontWeight: 600 }}>
                                            📧 {manager.email}
                                          </Typography>

                                          {/* Row 2: Score, Band, Team */}
                                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontSize: '0.68rem', color: '#FFD700', fontWeight: 700 }}>
                                              ⭐ Score: {manager.finalScore.toFixed(1)}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.68rem', color: '#9C27B0', fontWeight: 700 }}>
                                              🏆 {manager.classificationBand}
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.68rem', color: '#7C4DFF', fontWeight: 700 }}>
                                              👥 Team: {manager.headcount}
                                            </Typography>
                                          </Box>

                                          {/* Row 3: Utilization & Active Members */}
                                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                            {(manager as any).utilization !== undefined && (
                                              <Typography sx={{ fontSize: '0.68rem', color: '#FF9800', fontWeight: 700 }}>
                                                📊 Utilization: {((manager as any).utilization * 100).toFixed(1)}%
                                              </Typography>
                                            )}
                                            <Typography sx={{ fontSize: '0.68rem', color: '#00BFA5', fontWeight: 700 }}>
                                              ✓ Active: {manager.teamMembers.filter((m) => m.isUtilizing).length}/{manager.teamMembers.length}
                                            </Typography>
                                          </Box>

                                          {/* Row 4: Badges (if available) */}
                                          {(manager as any).badges && (manager as any).badges.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(0,0,0,0.6)', fontWeight: 600 }}>
                                                �️ Badges:
                                              </Typography>
                                              {(manager as any).badges.map((badge: any, idx: number) => (
                                                <Chip
                                                  key={idx}
                                                  label={badge.name}
                                                  size="small"
                                                  sx={{
                                                    height: 18,
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    background: `${badge.color}20`,
                                                    color: badge.color,
                                                    border: `1px solid ${badge.color}40`,
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>

                                      {/* Expand Icon */}
                                      <IconButton
                                        size="small"
                                        sx={{
                                          color: band.color,
                                          background: `${band.color}10`,
                                          border: `1px solid ${band.color}15`,
                                          transform: mgrExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'all 0.3s ease',
                                          '&:hover': { background: `${band.color}20` },
                                        }}
                                      >
                                        <ExpandMoreIcon sx={{ fontSize: 16 }} />
                                      </IconButton>
                                    </Box>
                                  </NodeCard>

                                  {/* ── Team Members ── */}
                                  <Collapse in={mgrExpanded} timeout={400} unmountOnExit>
                                    <Box
                                      sx={{
                                        mt: 1.5,
                                        ml: 2,
                                        p: 2.5,
                                        borderRadius: 3,
                                        background: 'rgba(173, 170, 170, 0.15)',
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        animation: `${slideDown} 0.4s ease-out`,
                                      }}
                                    >
                                      {/* Team header */}
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography sx={{ fontSize: '0.9rem' }}>👥</Typography>
                                          <Typography
                                            sx={{
                                              fontWeight: 800,
                                              fontSize: '0.78rem',
                                              color: '#00BFA5',
                                              textTransform: 'uppercase',
                                              letterSpacing: '1.5px',
                                            }}
                                          >
                                            Team Members
                                          </Typography>
                                          <Chip
                                            size="small"
                                            label={manager.teamMembers.length}
                                            sx={{
                                              height: 18,
                                              minWidth: 24,
                                              fontSize: '0.6rem',
                                              fontWeight: 800,
                                              background: 'rgba(0,191,165,0.12)',
                                              color: '#00BFA5',
                                              border: '1px solid rgba(0,191,165,0.2)',
                                            }}
                                          />
                                        </Box>

                                        {/* Active / Inactive counts */}
                                        <Box sx={{ display: 'flex', gap: 1 }}>
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

                                      {/* Team Members Grid */}
                                      <Grid container spacing={1.5}>
                                        {manager.teamMembers.map((member, memIdx) => {
                                          const isActive = member.isUtilizing;
                                          const statusColor = isActive ? '#00BFA5' : '#FF9800';

                                          return (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={6}
                                              key={`mem-${fhIndex}-${dirIndex}-${mgrIndex}-${memIdx}`}
                                            >
                                              <Box
                                                className="member-card"
                                                sx={{
                                                  p: 1.5,
                                                  borderRadius: 2,
                                                  background: `linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}08 100%)`,
                                                  border: `1px solid ${statusColor}30`,
                                                  borderLeft: `3px solid ${statusColor}`,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 1.5,
                                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                  animation: `${slideRight} 0.3s ease-out ${memIdx * 0.04}s both`,
                                                  position: 'relative',
                                                  overflow: 'hidden',
                                                  minHeight: 56,
                                                  '&:hover': {
                                                    background: `linear-gradient(135deg, ${statusColor}25 0%, ${statusColor}15 100%)`,
                                                    borderColor: `${statusColor}50`,
                                                    transform: 'translateX(4px)',
                                                    boxShadow: `0 4px 20px ${statusColor}25`,
                                                  },
                                                  '&:hover .member-details': {
                                                    maxHeight: '60px',
                                                    opacity: 1,
                                                    mt: 0.6,
                                                  },
                                                }}
                                              >
                                                {/* Status dot */}
                                                <Box
                                                  sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: statusColor,
                                                    boxShadow: `0 0 8px ${statusColor}50`,
                                                    flexShrink: 0,
                                                    animation: isActive ? 'none' : `${pulse} 2s ease-in-out infinite`,
                                                    '--glow-color': statusColor,
                                                  } as any}
                                                />

                                                {/* Avatar */}
                                                <Avatar
                                                  sx={{
                                                    width: 32,
                                                    height: 32,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    bgcolor: `${statusColor}20`,
                                                    color: statusColor,
                                                    border: `2px solid ${statusColor}`,
                                                    flexShrink: 0,
                                                  }}
                                                >
                                                  {member.name.charAt(0)}
                                                </Avatar>

                                                {/* Info - Name with Hover Details */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                  {/* Name - Always Visible */}
                                                  <Typography
                                                    sx={{
                                                      fontWeight: 700,
                                                      fontSize: '0.78rem',
                                                      color: '#000',
                                                    }}
                                                  >
                                                    {member.name}
                                                  </Typography>

                                                  {/* Details - Show on Hover */}
                                                  <Box
                                                    className="member-details"
                                                    sx={{
                                                      display: 'flex',
                                                      gap: 1,
                                                      mt: 0.5,
                                                      flexWrap: 'wrap',
                                                      maxHeight: 0,
                                                      opacity: 0,
                                                      overflow: 'hidden',
                                                      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease-in-out, margin-top 0.35s ease',
                                                    }}
                                                  >
                                                    <Typography sx={{ fontSize: '0.65rem', color: '#00695C', fontWeight: 600 }}>
                                                      🏢 {member.department}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.65rem', color: statusColor, fontWeight: 700 }}>
                                                      {isActive ? '✓ Active' : '⚠ Inactive'}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.65rem', color: '#7C4DFF', fontWeight: 600 }}>
                                                      💬 {member.oneOnOnesCount} 1-on-1s
                                                    </Typography>
                                                  </Box>
                                                </Box>
                                              </Box>
                                            </Grid>
                                          );
                                        })}
                                      </Grid>

                                      {/* Team Summary Footer */}
                                      <Box
                                        sx={{
                                          mt: 2,
                                          pt: 1.5,
                                          borderTop: '1px solid rgba(255,255,255,0.04)',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                          {[
                                            {
                                              label: 'Utilization',
                                              value: `${manager.teamMembers.length > 0
                                                ? (
                                                    (manager.teamMembers.filter((m) => m.isUtilizing).length /
                                                      manager.teamMembers.length) *
                                                    100
                                                  ).toFixed(0)
                                                : 0}%`,
                                              color:
                                                manager.teamMembers.filter((m) => m.isUtilizing).length /
                                                  manager.teamMembers.length >=
                                                0.7
                                                  ? '#00BFA5'
                                                  : '#FF8A65',
                                            },
                                            {
                                              label: 'Total 1:1s',
                                              value: manager.teamMembers.reduce((s, m) => s + m.oneOnOnesCount, 0),
                                              color: '#B388FF',
                                            },
                                            {
                                              label: 'Score',
                                              value: manager.finalScore.toFixed(1),
                                              color: getBandConfig(manager.classificationBand).color,
                                            },
                                          ].map((stat, i) => (
                                            <Box key={i} sx={{ textAlign: 'center' }}>
                                              <Typography
                                                sx={{
                                                  fontSize: '0.5rem',
                                                  fontWeight: 700,
                                                  color: 'rgba(0, 0, 0, 0.25)',
                                                  textTransform: 'uppercase',
                                                  letterSpacing: '1px',
                                                  mb: 0.2,
                                                }}
                                              >
                                                {stat.label}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  fontWeight: 900,
                                                  fontSize: '0.9rem',
                                                  color: stat.color,
                                                  textShadow: `0 0 10px ${stat.color}25`,
                                                }}
                                              >
                                                {stat.value}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>

                                        {/* Health indicator */}
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.8,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 2,
                                            background:
                                              manager.finalScore >= 60
                                                ? 'rgba(0,191,165,0.08)'
                                                : 'rgba(239,83,80,0.08)',
                                            border: `1px solid ${
                                              manager.finalScore >= 60
                                                ? 'rgba(0,191,165,0.15)'
                                                : 'rgba(239,83,80,0.15)'
                                            }`,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              width: 6,
                                              height: 6,
                                              borderRadius: '50%',
                                              background:
                                                manager.finalScore >= 60 ? '#00BFA5' : '#EF5350',
                                              boxShadow: `0 0 6px ${
                                                manager.finalScore >= 60
                                                  ? 'rgba(0,191,165,0.5)'
                                                  : 'rgba(239,83,80,0.5)'
                                              }`,
                                            }}
                                          />
                                          <Typography
                                            sx={{
                                              fontSize: '0.6rem',
                                              fontWeight: 700,
                                              color:
                                                manager.finalScore >= 60 ? '#00BFA5' : '#EF5350',
                                              textTransform: 'uppercase',
                                              letterSpacing: '1px',
                                            }}
                                          >
                                            {manager.finalScore >= 80
                                              ? 'Excellent'
                                              : manager.finalScore >= 60
                                              ? 'Good'
                                              : manager.finalScore >= 40
                                              ? 'Average'
                                              : 'Needs Help'}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Collapse>
                                </Box>
                              );
                            })}

                            {/* Bottom dot on border */}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: -5,
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: '#00BFA5',
                                boxShadow: '0 0 10px rgba(0,191,165,0.5)',
                              }}
                            />
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}

        {/* ── Empty State ── */}
        {hierarchy.length === 0 && (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed rgba(255,255,255,0.08)',
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
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
              <TreeIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.2)' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)', fontSize: '1rem', mb: 0.5 }}>
              No Hierarchy Data
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>
              Upload data to visualize the organization tree
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}