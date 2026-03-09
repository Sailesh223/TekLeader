import { Box, Typography, Paper, Avatar, Chip } from '@mui/material';
import { AccountTree as TreeIcon } from '@mui/icons-material';
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
  const getBandColor = (band: string) => {
    return bandColors[band as keyof typeof bandColors]?.main || '#999';
  };

  return (
    <Box sx={{ p: 3, overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 800 }}>
        {hierarchy.map((fh) => (
          <Box key={fh.name} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Functional Head */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                bgcolor: '#00897B',
                color: 'white',
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                🎯 {fh.name}
              </Typography>
              <Typography variant="body2">
                {fh.totalManagers} Managers • {fh.totalTeamMembers} Team Members • Avg: {fh.avgScore.toFixed(1)}
              </Typography>
            </Paper>

            {/* Directors */}
            <Box sx={{ display: 'flex', gap: 3, pl: 4, flexWrap: 'wrap' }}>
              {fh.directors.map((director) => (
                <Box key={director.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 300px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 2, height: 40, bgcolor: '#00897B' }} />
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.5,
                        bgcolor: '#00BFA5',
                        color: 'white',
                        borderRadius: 2,
                        flex: 1,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        📊 {director.name}
                      </Typography>
                      <Typography variant="caption">
                        {director.managers.length} Managers • Score: {director.avgScore.toFixed(1)}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Managers */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 4 }}>
                    {director.managers.map((manager) => (
                      <Box key={manager.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 2, height: 30, bgcolor: '#00BFA5' }} />
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flex: 1,
                            borderLeft: `4px solid ${getBandColor(manager.classificationBand)}`,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: getBandColor(manager.classificationBand),
                              fontSize: '0.875rem',
                            }}
                          >
                            {manager.displayName.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {manager.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {manager.headcount} members • Score: {manager.finalScore.toFixed(1)}
                            </Typography>
                          </Box>
                          <Chip
                            label={manager.classificationBand}
                            size="small"
                            sx={{
                              bgcolor: getBandColor(manager.classificationBand),
                              color: '#fff',
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                        </Paper>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

