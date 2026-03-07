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
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Leaderboard as LeaderboardIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  DeleteForever as DeleteIcon,
} from '@mui/icons-material';
import { leaderboardApi } from '../api/client';

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
      description: 'Upload monthly Excel files with manager utilization data',
      icon: <UploadIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      action: () => navigate('/admin/upload'),
      buttonText: 'Upload',
    },
    {
      title: 'View Leaderboard',
      description: 'View and manage leaderboard data for all months',
      icon: <LeaderboardIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      action: () => navigate('/leaderboard'),
      buttonText: 'View',
    },
    {
      title: 'Data Management',
      description: 'Remove data by month or clear entire database',
      icon: <DeleteIcon sx={{ fontSize: 48, color: 'error.main' }} />,
      action: handleOpenDeleteDialog,
      buttonText: 'Manage Data',
      buttonColor: 'error' as const,
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and trends across months',
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      action: () => {},
      buttonText: 'Coming Soon',
      disabled: true,
    },
    {
      title: 'Settings',
      description: 'Configure formula weights, badges, and classification bands',
      icon: <SettingsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      action: () => {},
      buttonText: 'Coming Soon',
      disabled: true,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#00BFA5' }}>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#00897B', fontWeight: 500 }}>
        Manage leaderboard data, upload files, and configure system settings
      </Typography>

      <Grid container spacing={3}>
        {adminCards.map((card, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.2) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(0, 191, 165, 0.3)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 191, 165, 0.1)',
                '&:hover': {
                  transform: card.disabled ? 'none' : 'translateY(-4px)',
                  boxShadow: card.disabled ? '0 4px 20px rgba(0, 191, 165, 0.1)' : '0 12px 32px rgba(0, 191, 165, 0.25)',
                  border: card.disabled ? '2px solid rgba(0, 191, 165, 0.3)' : '2px solid #00BFA5',
                },
                opacity: card.disabled ? 0.6 : 1,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ mb: 2 }}>{card.icon}</Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#2C3E50' }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#00897B' }}>
                  {card.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  onClick={card.action}
                  disabled={card.disabled}
                  color={(card as any).buttonColor || 'primary'}
                  fullWidth
                  sx={{
                    background: (card as any).buttonColor === 'error'
                      ? 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
                      : 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                    '&:hover': {
                      background: (card as any).buttonColor === 'error'
                        ? 'linear-gradient(135deg, #D32F2F 0%, #C62828 100%)'
                        : 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
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

