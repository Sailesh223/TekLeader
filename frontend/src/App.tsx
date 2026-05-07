import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Security } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { theme } from './theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import OktaCallback from './pages/OktaCallback';
import UserDashboard from './pages/UserDashboard';
import PersonalDashboard from './pages/PersonalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadPage from './pages/UploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import DirectorDashboard from './pages/DirectorDashboard';
import FunctionalHeadDashboard from './pages/FunctionalHeadDashboard';
import SeasonalLeaderboardPage from './pages/SeasonalLeaderboardPage';
import OverallLeaderboardPage from './pages/OverallLeaderboardPage';
import FeedPage from './pages/FeedPage';
import oktaConfig from './config/oktaConfig';

const oktaAuth = new OktaAuth(oktaConfig);

function AppContent() {
  const navigate = useNavigate();

  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    console.log('🔵 restoreOriginalUri called with:', originalUri);
    // Default to /admin/leaderboard for Okta users
    const uri = toRelativeUrl(originalUri || '/admin/leaderboard', window.location.origin);
    console.log('🔵 Navigating to:', uri);
    navigate(uri, { replace: true });
  };

  return (
    <Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<OktaCallback />} />
          <Route path="/user" element={<Layout />}>
            <Route index element={<PersonalDashboard />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/director" element={<Layout />}>
            <Route index element={<DirectorDashboard />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
          </Route>
          <Route path="/functional-head" element={<Layout />}>
            <Route index element={<FunctionalHeadDashboard />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
          </Route>
          </Routes>
        </Security>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

