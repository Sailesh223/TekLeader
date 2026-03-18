import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { formulaApi, FormulaConfig } from '../api/client';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formula, setFormula] = useState<FormulaConfig>({
    utilizationWeight: 0.7,
    teamSizeWeight: 0.2,
    consistencyWeight: 0.1,
    consistencyPenaltyMultiplier: 2.0,
    tierSameScore: 100,
    tierOneLevelDownScore: 80,
    tierTwoLevelsDownScore: 50,
    tierThreeLevelsDownScore: 30,
    seasonalPeriodType: 'QUARTERLY',
    seasonalCustomMonths: 3,
    teamSizeMapping: {
      '1-3': 25,
      '4-6': 50,
      '7-10': 75,
      '10+': 100,
    },
  });

  useEffect(() => {
    loadCurrentFormula();
  }, []);

  const loadCurrentFormula = async () => {
    setLoading(true);
    try {
      const data = await formulaApi.getCurrentFormula();
      setFormula(data);
    } catch (err: any) {
      setError('Failed to load current formula configuration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    // Validate weights sum to 1
    const sum = formula.utilizationWeight + formula.teamSizeWeight + formula.consistencyWeight;
    if (Math.abs(sum - 1.0) > 0.01) {
      setError('Weights must sum to 1.0 (100%)');
      return;
    }

    setSaving(true);
    try {
      await formulaApi.updateFormula(formula);
      setSuccess('Formula configuration updated successfully! Changes will apply to future uploads.');
      await loadCurrentFormula();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update formula configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleWeightChange = (field: keyof FormulaConfig, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormula({ ...formula, [field]: numValue });
  };

  const handleTeamSizeMappingChange = (key: keyof FormulaConfig['teamSizeMapping'], value: string) => {
    const numValue = parseInt(value) || 0;
    setFormula({
      ...formula,
      teamSizeMapping: {
        ...formula.teamSizeMapping,
        [key]: numValue,
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const weightsSum = formula.utilizationWeight + formula.teamSizeWeight + formula.consistencyWeight;
  const isValidSum = Math.abs(weightsSum - 1.0) < 0.01;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#00BFA5' }}>
        Formula Settings
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#00897B', fontWeight: 500 }}>
        Configure the scoring formula weights and parameters
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(178, 223, 219, 0.2) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid rgba(0, 191, 165, 0.3)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 191, 165, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2C3E50', mb: 3 }}>
            Score Calculation Weights
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Utilization Weight"
                type="number"
                value={formula.utilizationWeight}
                onChange={(e) => handleWeightChange('utilizationWeight', e.target.value)}
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                helperText="Weight for utilization percentage (0-1)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Team Size Weight"
                type="number"
                value={formula.teamSizeWeight}
                onChange={(e) => handleWeightChange('teamSizeWeight', e.target.value)}
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                helperText="Weight for team size score (0-1)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Consistency Weight"
                type="number"
                value={formula.consistencyWeight}
                onChange={(e) => handleWeightChange('consistencyWeight', e.target.value)}
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                helperText="Weight for consistency score (0-1)"
              />
            </Grid>

            <Grid item xs={12}>
              <Alert severity={isValidSum ? 'success' : 'warning'}>
                Current weights sum: {weightsSum.toFixed(2)} {isValidSum ? '✓' : '(must equal 1.0)'}
              </Alert>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2C3E50', mb: 3 }}>
            Team Size Mapping
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="1-3 Members"
                type="number"
                value={formula.teamSizeMapping['1-3']}
                onChange={(e) => handleTeamSizeMappingChange('1-3', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score for small teams"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="4-6 Members"
                type="number"
                value={formula.teamSizeMapping['4-6']}
                onChange={(e) => handleTeamSizeMappingChange('4-6', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score for medium teams"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="7-10 Members"
                type="number"
                value={formula.teamSizeMapping['7-10']}
                onChange={(e) => handleTeamSizeMappingChange('7-10', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score for large teams"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="10+ Members"
                type="number"
                value={formula.teamSizeMapping['10+']}
                onChange={(e) => handleTeamSizeMappingChange('10+', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score for very large teams"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2C3E50', mb: 3 }}>
            Tier-Based Consistency Scoring
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Consistency score is now based on tier changes between months instead of utilization percentage changes.
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Same Tier Score"
                type="number"
                value={formula.tierSameScore}
                onChange={(e) => handleWeightChange('tierSameScore', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score when staying in the same tier"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="One Tier Down Score"
                type="number"
                value={formula.tierOneLevelDownScore}
                onChange={(e) => handleWeightChange('tierOneLevelDownScore', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score when dropping 1 tier (e.g., Gold → Silver)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Two Tiers Down Score"
                type="number"
                value={formula.tierTwoLevelsDownScore}
                onChange={(e) => handleWeightChange('tierTwoLevelsDownScore', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score when dropping 2 tiers (e.g., Gold → Bronze)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Three Tiers Down Score"
                type="number"
                value={formula.tierThreeLevelsDownScore}
                onChange={(e) => handleWeightChange('tierThreeLevelsDownScore', e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Score when dropping 3 tiers (e.g., Gold → Ignition Zone)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2C3E50', mb: 3 }}>
            Seasonal Leaderboard Configuration
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Seasonal Period Type</InputLabel>
                <Select
                  value={formula.seasonalPeriodType || 'QUARTERLY'}
                  onChange={(e) => setFormula({ ...formula, seasonalPeriodType: e.target.value })}
                  label="Seasonal Period Type"
                >
                  <MenuItem value="MONTHLY">Monthly (1 month)</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly (3 months)</MenuItem>
                  <MenuItem value="SEMI_ANNUALLY">Semi-Annually (6 months)</MenuItem>
                  <MenuItem value="ANNUALLY">Annually (12 months)</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formula.seasonalPeriodType === 'CUSTOM' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Custom Months"
                  type="number"
                  value={formula.seasonalCustomMonths}
                  onChange={(e) => handleWeightChange('seasonalCustomMonths', e.target.value)}
                  inputProps={{ min: 1, max: 12 }}
                  helperText="Number of months in a season"
                />
              </Grid>
            )}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !isValidSum}
              sx={{
                background: 'linear-gradient(135deg, #00BFA5 0%, #00897B 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                },
                px: 4,
              }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

