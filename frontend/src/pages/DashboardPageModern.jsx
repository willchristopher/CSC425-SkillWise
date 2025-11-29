import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Badge, Loading, Alert } from '../components/ui';

const DashboardPageModern = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    challengesCompleted: 0,
    currentStreak: 0,
    totalPoints: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadDashboardData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        goalsCompleted: 12,
        challengesCompleted: 34,
        currentStreak: 7,
        totalPoints: 2840
      });
      
      setRecentActivity([
        { id: 1, type: 'challenge', title: 'JavaScript Array Methods', time: '2 hours ago', status: 'completed' },
        { id: 2, type: 'goal', title: 'Complete React Tutorial', time: '1 day ago', status: 'in-progress' },
        { id: 3, type: 'ai-session', title: 'AI Tutor Session: CSS Grid', time: '2 days ago', status: 'completed' },
      ]);
      
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', active: true },
    { path: '/ai-tutor', label: 'AI Tutor', icon: '🤖' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/challenges', label: 'Challenges', icon: '🚀' },
    { path: '/progress', label: 'Progress', icon: '📈' },
    { path: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  ];

  const quickActions = [
    { 
      path: '/ai-tutor', 
      label: 'Ask AI Tutor', 
      icon: '🤖', 
      description: 'Get instant help',
      variant: 'primary'
    },
    { 
      path: '/goals', 
      label: 'Set New Goal', 
      icon: '🎯', 
      description: 'Plan your learning',
      variant: 'secondary'
    },
    { 
      path: '/challenges', 
      label: 'Take Challenge', 
      icon: '🚀', 
      description: 'Test your skills',
      variant: 'success'
    },
    { 
      path: '/peer-review', 
      label: 'Peer Review', 
      icon: '👥', 
      description: 'Help others learn',
      variant: 'info'
    },
  ];

  if (!user) {
    return (
      <div className="main-content flex items-center justify-center">
        <Loading variant="spinner" size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="nav-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="text-2xl font-bold text-primary-600">
                SkillWise
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                    item.active 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.firstName || user?.first_name || 'User'}</span>!
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || user?.first_name || 'User'}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Continue your learning journey and achieve your goals.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Badge variant="success" size="lg">
                🔥 {stats.currentStreak} day streak
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.totalPoints.toLocaleString()}</div>
              <div className="stats-label">Total Points</div>
              <Badge variant="primary" size="sm" className="mt-2">+120 this week</Badge>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.goalsCompleted}</div>
              <div className="stats-label">Goals Completed</div>
              <Badge variant="success" size="sm" className="mt-2">+2 this month</Badge>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.challengesCompleted}</div>
              <div className="stats-label">Challenges Done</div>
              <Badge variant="info" size="sm" className="mt-2">+5 this week</Badge>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body className="stats-card">
              <div className="stats-number">{stats.currentStreak}</div>
              <div className="stats-label">Day Streak</div>
              <Badge variant="warning" size="sm" className="mt-2">Keep it up!</Badge>
            </Card.Body>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-600">Jump into your learning</p>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} interactive>
                  <Card.Body className="text-center p-6">
                    <div className="text-3xl mb-3">{action.icon}</div>
                    <h3 className="font-medium text-gray-900 mb-1">{action.label}</h3>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <Button 
                      as={Link} 
                      to={action.path} 
                      variant={action.variant} 
                      size="sm"
                      className="w-full"
                    >
                      Start Now
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Card.Body>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </Card.Header>
              <Card.Body>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loading variant="dots" text="Loading activity..." />
                  </div>
                ) : recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {activity.type === 'challenge' && '🚀'}
                            {activity.type === 'goal' && '🎯'}
                            {activity.type === 'ai-session' && '🤖'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600">{activity.time}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={activity.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {activity.status === 'completed' ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-gray-600 mb-2">No recent activity</p>
                    <p className="text-sm text-gray-500">Start learning to see your progress here</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* AI Tutor Highlight & Tips */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
              <Card.Header>
                <h3 className="text-lg font-semibold text-primary-900">🤖 AI Tutor</h3>
              </Card.Header>
              <Card.Body>
                <p className="text-primary-800 mb-4">
                  Get instant help with your studies! Our AI tutor is available 24/7 to answer questions and provide explanations.
                </p>
                <Button 
                  as={Link} 
                  to="/ai-tutor" 
                  variant="primary" 
                  className="w-full"
                >
                  Start AI Session
                </Button>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900">💡 Learning Tips</h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">Set daily learning goals to maintain momentum</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">Practice regularly with coding challenges</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">Use the AI tutor for instant feedback</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPageModern;