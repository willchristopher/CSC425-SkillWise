import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DemoNavigation from './components/DemoNavigation';

// Import all pages
import HomePage from './pages/HomePageSimple';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPageNew';
import GoalsPage from './pages/GoalsPageNew';
import ChallengesPage from './pages/ChallengesPageNew';
import ProgressPage from './pages/ProgressPageNew';
import LeaderboardPage from './pages/LeaderboardPageNew';
import PeerReviewPage from './pages/PeerReviewPageNew';
import ProfilePage from './pages/ProfilePageNew';
import AITutorPage from './pages/AITutorPageNew';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';

// Import layout components
// import Navbar from './components/layout/Navbar';
// import Footer from './components/layout/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
          <DemoNavigation />
          
          <main style={{ minHeight: '100vh' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/error" element={<ErrorPage />} />
              
              {/* Demo routes (no authentication required) */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/peer-review" element={<PeerReviewPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/ai-tutor" element={<AITutorPage />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          {/* Add Footer component when ready */}
          {/* <Footer /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}


export default App;