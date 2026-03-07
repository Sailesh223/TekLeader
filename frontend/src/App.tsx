import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/user" element={<Layout />}>
            <Route index element={<UserDashboard />} />
            <Route path="leaderboard" element={<UserDashboard />} />
          </Route>
          <Route path="/admin" element={<Layout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="leaderboard" element={<UserDashboard />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

