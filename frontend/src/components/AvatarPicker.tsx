import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Tabs,
  Tab,
  Card,
  CardActionArea,
  CardContent,
  Alert
} from '@mui/material';
import {
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Male as MaleIcon,
  Female as FemaleIcon
} from '@mui/icons-material';
import {
  allPredefinedAvatars,
  AvatarSelection
} from '../utils/avatarGenerator';

interface AvatarPickerProps {
  open: boolean;
  onClose: () => void;
  onSave: (avatarId: string, avatarUrl: string) => void;
  currentAvatarId?: string;
  currentAvatarUrl?: string;
  userName: string;
}

export default function AvatarPicker({
  open,
  onClose,
  onSave,
  currentAvatarId,
  currentAvatarUrl,
  userName
}: AvatarPickerProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(currentAvatarId || '');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(currentAvatarUrl || '');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = (avatar: AvatarSelection) => {
    setSelectedAvatarId(avatar.id);
    setSelectedAvatarUrl(avatar.url);
    setUploadedImage(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUploadedImage(base64String);
        setSelectedAvatarId('custom');
        setSelectedAvatarUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedAvatarId && selectedAvatarUrl) {
      onSave(selectedAvatarId, selectedAvatarUrl);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset to current values on cancel
    setSelectedAvatarId(currentAvatarId || '');
    setSelectedAvatarUrl(currentAvatarUrl || '');
    setUploadedImage(null);
    onClose();
  };

  const renderAvatarGrid = (avatars: AvatarSelection[]) => (
    <Grid container spacing={2}>
      {avatars.map((avatar) => (
        <Grid item xs={6} sm={4} md={2.4} key={avatar.id}>
          <Card
            sx={{
              position: 'relative',
              cursor: 'pointer',
              border: selectedAvatarId === avatar.id ? '3px solid #00BFA5' : '2px solid transparent',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: 3,
              },
            }}
          >
            <CardActionArea onClick={() => handleAvatarSelect(avatar)}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar
                  src={avatar.url}
                  sx={{
                    width: 80,
                    height: 80,
                    margin: '0 auto',
                    mb: 1,
                  }}
                />
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#00897B' }}>
                  {avatar.name}
                </Typography>
              </Box>
              {selectedAvatarId === avatar.id && (
                <CheckIcon
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#00BFA5',
                    bgcolor: 'white',
                    borderRadius: '50%',
                  }}
                />
              )}
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#00897B' }}>
          Choose Your Avatar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select from predefined avatars or upload your own
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<MaleIcon />} label="Choose Avatar" />
          <Tab icon={<UploadIcon />} label="Upload Custom" />
        </Tabs>

        {/* All Avatars Tab */}
        {selectedTab === 0 && (
          <Box sx={{ py: 2 }}>
            {renderAvatarGrid(allPredefinedAvatars)}
          </Box>
        )}

        {/* Upload Custom Tab */}
        {selectedTab === 1 && (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {uploadedImage ? (
              <Box>
                <Avatar
                  src={uploadedImage}
                  sx={{
                    width: 150,
                    height: 150,
                    margin: '0 auto',
                    mb: 2,
                    border: '3px solid #00BFA5',
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Custom image uploaded successfully!
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: '#00897B', borderColor: '#00897B' }}
                >
                  Change Image
                </Button>
              </Box>
            ) : (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Upload your own profile picture (Max 2MB, JPG/PNG)
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bgcolor: '#00BFA5',
                    '&:hover': { bgcolor: '#00897B' },
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Upload Image
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} sx={{ color: '#666' }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!selectedAvatarId}
          sx={{
            bgcolor: '#00BFA5',
            '&:hover': { bgcolor: '#00897B' }
          }}
        >
          Save Avatar
        </Button>
      </DialogActions>
    </Dialog>
  );
}