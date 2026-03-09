import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { uploadApi, UploadResponse } from '../api/client';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [month, setMonth] = useState('');
  const [uploadMode, setUploadMode] = useState('overwrite');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !month) {
      setError('Please select a file and month');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadApi.uploadMonthlyData(selectedFile, month, uploadMode);
      setUploadResult(result);
      if (result.status === 'SUCCESS') {
        setSelectedFile(null);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);

      const errorMessage = err.response?.data?.message
        || err.message
        || 'Upload failed. Please try again.';

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push(monthStr);
    }
    return options;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
        Upload Monthly Data
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Upload Excel files containing manager utilization data
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Month</InputLabel>
              <Select
                value={month}
                label="Select Month"
                onChange={(e) => setMonth(e.target.value)}
              >
                {generateMonthOptions().map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Upload Mode
            </Typography>
            <RadioGroup
              value={uploadMode}
              onChange={(e) => setUploadMode(e.target.value)}
              sx={{ mb: 3 }}
            >
              <FormControlLabel
                value="overwrite"
                control={<Radio />}
                label="Overwrite - Replace existing data for this month"
              />
              <FormControlLabel
                value="skip"
                control={<Radio />}
                label="Skip - Only add new managers, skip existing ones"
              />
            </RadioGroup>

            <Box
              sx={{
                border: '2px dashed',
                borderColor: 'primary.main',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'primary.light',
                  opacity: 0.8,
                },
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile ? selectedFile.name : 'Click to select Excel file'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported format: .xlsx (Max 10MB)
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUpload}
            disabled={!selectedFile || !month || uploading}
            startIcon={<UploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Upload and Process'}
          </Button>

          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {uploadResult && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Chip
                label={uploadResult.status}
                color={
                  uploadResult.status === 'SUCCESS'
                    ? 'success'
                    : uploadResult.status === 'PARTIAL'
                    ? 'warning'
                    : 'error'
                }
              />
              <Typography variant="h6">Upload Results</Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Records Processed</TableCell>
                    <TableCell align="right">{uploadResult.summary.recordsProcessed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Records Created</TableCell>
                    <TableCell align="right">{uploadResult.summary.recordsCreated}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Records Updated</TableCell>
                    <TableCell align="right">{uploadResult.summary.recordsUpdated}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Records Skipped</TableCell>
                    <TableCell align="right">{uploadResult.summary.recordsSkipped}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Records Failed</TableCell>
                    <TableCell align="right">{uploadResult.summary.recordsFailed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Processing Time</TableCell>
                    <TableCell align="right">{uploadResult.processingTimeMs}ms</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Errors ({uploadResult.errors.length})
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Column</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Message</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uploadResult.errors.slice(0, 10).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.column}</TableCell>
                          <TableCell>{error.value}</TableCell>
                          <TableCell>{error.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {uploadResult.errors.length > 10 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Showing first 10 of {uploadResult.errors.length} errors
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

