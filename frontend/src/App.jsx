import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPageModern from './pages/LoginPageModern';
import SignupPage from './pages/SignupPage';
import DashboardPageModern from './pages/DashboardPageModern';
import GoalsPageModern from './pages/GoalsPageModern';
import ChallengesPageModern from './pages/ChallengesPageModern';
import ProgressPageModern from './pages/ProgressPageModern';
import LeaderboardPage from './pages/LeaderboardPage';
import PeerReviewPage from './pages/PeerReviewPage';
import ProfilePage from './pages/ProfilePage';
import AITutorPageModern from './pages/AITutorPageModern';
import NotFoundPage from './pages/NotFoundPage';
import ErrorPage from './pages/ErrorPage';
import ErrorTestPage from './pages/ErrorTestPage';

// Import layout components
// import Navbar from './components/layout/Navbar';
// import Footer from './components/layout/Footer';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Add Navbar component */}
          {/* <Navbar /> */}
          
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPageModern />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/error-test" element={<ErrorTestPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardPageModern />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <GoalsPageModern />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/challenges" 
                element={
                  <ProtectedRoute>
                    <ChallengesPageModern />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/progress" 
                element={
                  <ProtectedRoute>
                    <ProgressPageModern />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaderboard" 
                element={
                  <ProtectedRoute>
                    <LeaderboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/peer-review" 
                element={
                  <ProtectedRoute>
                    <PeerReviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-tutor" 
                element={
                  <ProtectedRoute>
                    <AITutorPageModern />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          {/* Add Footer component */}
          {/* <Footer /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;