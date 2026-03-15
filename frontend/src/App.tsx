import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<Layout />}>
            <Route index element={<PersonalDashboard />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
          </Route>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/director" element={<Layout />}>
            <Route index element={<DirectorDashboard />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
          </Route>
          <Route path="/functional-head" element={<Layout />}>
            <Route index element={<FunctionalHeadDashboard />} />
            <Route path="leaderboard" element={<UserDashboard />} />
            <Route path="seasonal" element={<SeasonalLeaderboardPage />} />
            <Route path="overall" element={<OverallLeaderboardPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

