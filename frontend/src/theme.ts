import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#00BFA5',
      dark: '#00897B',
      light: '#B2DFDB',
    },
    secondary: {
      main: '#2C3E50',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
    info: {
      main: '#2196F3',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 20px 25px rgba(0, 0, 0, 0.15)',
    ...Array(20).fill('0 20px 25px rgba(0, 0, 0, 0.15)'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export const bandColors = {
  Gold: {
    main: '#FFD54F',
    gradient: 'linear-gradient(135deg, #FFF59D 0%, #FFD54F 100%)',
  },
  Silver: {
    main: '#B0BEC5',
    gradient: 'linear-gradient(135deg, #CFD8DC 0%, #B0BEC5 100%)',
  },
  Bronze: {
    main: '#FFB74D',
    gradient: 'linear-gradient(135deg, #FFCC80 0%, #FFB74D 100%)',
  },
  'Ignition Zone': {
    main: '#EF5350',
    gradient: 'linear-gradient(135deg, #E57373 0%, #EF5350 100%)',
  },
};

