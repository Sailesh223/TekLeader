import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Collapse, IconButton, Grid } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { bandColors } from '../theme';

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

export default function OrgTreeView({ hierarchy }: OrgTreeViewProps) {
  const [expandedFH, setExpandedFH] = useState<Set<string>>(new Set());
  const [expandedDirectors, setExpandedDirectors] = useState<Set<string>>(new Set());
  const [expandedManagers, setExpandedManagers] = useState<Set<string>>(new Set());

  const getBandColor = (band: string) => {
    return bandColors[band as keyof typeof bandColors]?.main || '#999';
  };

  const toggleFH = (name: string) => {
    const newSet = new Set(expandedFH);
    if (newSet.has(name)) {
      newSet.delete(name);
    } else {
      newSet.add(name);
    }
    setExpandedFH(newSet);
  };

  const toggleDirector = (id: string) => {
    const newSet = new Set(expandedDirectors);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDirectors(newSet);
  };

  const toggleManager = (id: string) => {
    const newSet = new Set(expandedManagers);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedManagers(newSet);
  };

  return (
    <Box sx={{ p: 3, overflowX: 'auto', bgcolor: '#FAFAFA', minHeight: '100vh' }}>
      {/* Mind Map Style Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 1400, mx: 'auto' }}>
        {hierarchy.map((fh, fhIndex) => (
          <Box key={`fh-${fhIndex}-${fh.name}`}>
            {/* Functional Head - Central Node */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: 4,
                  cursor: 'pointer',
                  minWidth: 350,
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                  },
                  transition: 'all 0.3s',
                  '&::after': expandedFH.has(fh.name) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: -20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 2,
                    height: 20,
                    bgcolor: '#667eea',
                  } : {},
                }}
                onClick={() => toggleFH(fh.name)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '1.75rem',
                      fontWeight: 700,
                      border: '3px solid rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {fh.name.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, textTransform: 'uppercase', fontWeight: 600, letterSpacing: 1 }}>
                      Functional Head
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {fh.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${fh.totalManagers} Managers`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`${fh.totalTeamMembers} Members`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                      <Chip
                        label={`Score: ${fh.avgScore.toFixed(1)}`}
                        size="small"
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.25)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                  <IconButton sx={{ color: 'white' }}>
                    {expandedFH.has(fh.name) ? <ExpandMoreIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
                  </IconButton>
                </Box>
              </Paper>
            </Box>

            {/* Directors - Mind Map Branches */}
            <Collapse in={expandedFH.has(fh.name)} timeout="auto" unmountOnExit>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 4,
                mt: 2,
                px: 4,
              }}>
                {fh.directors.map((director, dirIndex) => {
                  const directorKey = `dir-${fhIndex}-${dirIndex}-${director.id}`;
                  const isExpanded = expandedDirectors.has(directorKey);

                  return (
                    <Box key={directorKey}>
                      {/* Director Node */}
                      <Paper
                        elevation={3}
                        sx={{
                          p: 2.5,
                          bgcolor: 'white',
                          border: '2px solid #00BFA5',
                          borderRadius: 3,
                          cursor: 'pointer',
                          position: 'relative',
                          '&:hover': {
                            borderColor: '#00897B',
                            boxShadow: '0 6px 20px rgba(0, 191, 165, 0.25)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 2,
                            height: 20,
                            bgcolor: '#00BFA5',
                          },
                          '&::after': isExpanded ? {
                            content: '""',
                            position: 'absolute',
                            bottom: -20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 2,
                            height: 20,
                            bgcolor: '#00BFA5',
                          } : {},
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDirector(directorKey);
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: '#00BFA5',
                              fontSize: '1.25rem',
                              fontWeight: 700,
                              border: '3px solid rgba(0, 191, 165, 0.2)',
                            }}
                          >
                            {director.name.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ color: '#7F8C8D', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 0.5 }}>
                              Director
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C3E50', mb: 0.5 }}>
                              {director.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={`${director.managers.length} Managers`}
                                size="small"
                                sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                              />
                              <Chip
                                label={`Score: ${director.avgScore.toFixed(1)}`}
                                size="small"
                                sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                              />
                            </Box>
                          </Box>
                          <IconButton size="small" sx={{ color: '#00BFA5' }}>
                            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                          </IconButton>
                        </Box>
                      </Paper>

                      {/* Managers - Nested Cards */}
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{
                          mt: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          pl: 3,
                          borderLeft: '2px dashed #00BFA5',
                        }}>
                          {director.managers.map((manager, mgrIndex) => {
                            const managerKey = `mgr-${fhIndex}-${dirIndex}-${mgrIndex}-${manager.id}`;
                            const isMgrExpanded = expandedManagers.has(managerKey);

                            return (
                              <Box key={managerKey}>
                                <Paper
                                  elevation={2}
                                  sx={{
                                    p: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    bgcolor: 'white',
                                    border: `2px solid ${getBandColor(manager.classificationBand)}`,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    ml: 2,
                                    '&:hover': {
                                      boxShadow: `0 4px 16px ${getBandColor(manager.classificationBand)}40`,
                                      transform: 'translateX(4px)',
                                    },
                                    transition: 'all 0.3s',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      left: -18,
                                      top: '50%',
                                      width: 16,
                                      height: 2,
                                      bgcolor: '#00BFA5',
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleManager(managerKey);
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 48,
                                      height: 48,
                                      bgcolor: getBandColor(manager.classificationBand),
                                      fontSize: '1.1rem',
                                      fontWeight: 700,
                                      border: '3px solid white',
                                      boxShadow: `0 2px 8px ${getBandColor(manager.classificationBand)}40`,
                                    }}
                                  >
                                    {manager.displayName.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#7F8C8D', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem' }}>
                                      Manager
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2C3E50' }}>
                                      {manager.displayName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      {manager.email}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                    <Chip
                                      label={manager.classificationBand}
                                      size="small"
                                      sx={{
                                        bgcolor: getBandColor(manager.classificationBand),
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                    <Chip
                                      label={`${manager.finalScore.toFixed(1)}`}
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(0, 191, 165, 0.1)',
                                        color: '#00897B',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                      }}
                                    />
                                    <Chip
                                      label={`${manager.headcount} members`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                    />
                                    <IconButton size="small" sx={{ color: getBandColor(manager.classificationBand) }}>
                                      {isMgrExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                                    </IconButton>
                                  </Box>
                                </Paper>

                                {/* Team Members - Leaf Nodes */}
                                <Collapse in={isMgrExpanded} timeout="auto" unmountOnExit>
                                  <Box sx={{ mt: 2, ml: 4 }}>
                                    <Paper
                                      elevation={0}
                                      sx={{
                                        p: 2,
                                        bgcolor: '#F8F9FA',
                                        border: '1px dashed #BDC3C7',
                                        borderRadius: 2
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#7F8C8D', mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        👥 Team Members ({manager.teamMembers.length})
                                      </Typography>
                                      <Grid container spacing={1.5}>
                                        {manager.teamMembers.map((member, memIdx) => (
                                          <Grid item xs={12} sm={6} key={`mem-${fhIndex}-${dirIndex}-${mgrIndex}-${memIdx}`}>
                                            <Paper
                                              elevation={1}
                                              sx={{
                                                p: 1.5,
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                border: `1px solid ${member.isUtilizing ? '#4CAF50' : '#F44336'}`,
                                                borderLeft: `4px solid ${member.isUtilizing ? '#4CAF50' : '#F44336'}`,
                                                '&:hover': {
                                                  boxShadow: `0 2px 8px ${member.isUtilizing ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                                                  transform: 'translateX(2px)',
                                                },
                                                transition: 'all 0.2s',
                                              }}
                                            >
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                  sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: member.isUtilizing ? '#4CAF50' : '#F44336',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                  }}
                                                >
                                                  {member.name.charAt(0)}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#2C3E50' }} noWrap>
                                                    {member.name}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }} noWrap>
                                                    {member.department}
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                    <Chip
                                                      label={member.isUtilizing ? '✓ Active' : '✗ Inactive'}
                                                      size="small"
                                                      sx={{
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        bgcolor: member.isUtilizing ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                                                        color: member.isUtilizing ? '#2E7D32' : '#C62828',
                                                        fontWeight: 700,
                                                      }}
                                                    />
                                                    <Chip
                                                      label={`${member.oneOnOnesCount} 1:1s`}
                                                      size="small"
                                                      sx={{
                                                        height: 18,
                                                        fontSize: '0.65rem',
                                                        bgcolor: 'rgba(33, 150, 243, 0.15)',
                                                        color: '#1565C0',
                                                        fontWeight: 700,
                                                      }}
                                                    />
                                                  </Box>
                                                </Box>
                                              </Box>
                                            </Paper>
                                          </Grid>
                                        ))}
                                      </Grid>
                                    </Paper>
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
              </Box>
            </Collapse>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

