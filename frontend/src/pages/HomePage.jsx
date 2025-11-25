import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Feedback',
      description: 'Get intelligent, personalized feedback on your coding challenges and projects',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: '🎯',
      title: 'Goal Tracking',
      description: 'Set learning goals and track your progress with detailed analytics',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: '👥',
      title: 'Peer Reviews',
      description: 'Learn from your peers through collaborative code reviews and feedback',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: '⚡',
      title: 'Interactive Challenges',
      description: 'Practice with hands-on coding challenges tailored to your skill level',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: '🏆',
      title: 'Gamification',
      description: 'Earn points, achievements, and climb the leaderboard as you learn',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Visualize your learning journey with detailed progress reports',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkillWise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your AI-powered learning companion for skill development. Learn, practice, and grow with personalized feedback and collaborative learning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              <Link
                to="/about"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to accelerate your learning journey and achieve your goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-700 font-medium">Learning Challenges</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-700 font-medium">Active Learners</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-700 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are already improving their skills with SkillWise
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isAuthenticated ? 'Continue Learning' : 'Start Learning Today'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;